from fastapi import APIRouter, UploadFile, HTTPException
from schemas.Common import CommonResponse
from markitdown import MarkItDown
from io import BytesIO
import os
import traceback
import sys
import httpx
import json
import asyncio
from typing import Optional, List
from connections import my_qdrant
from dotenv import load_dotenv
import re
from connections import my_db

load_dotenv()


router = APIRouter(
    prefix="/tools",
    tags=["tools"],
    responses={404: {"description": "Not found"}},
)


def clean_llm_response(response: str) -> str:
    """Remove thinking/reasoning blocks from LLM response."""
    # Remove <think> or <thinking> blocks
    response = re.sub(r'<think(?:ing)?>[^<]*</think(?:ing)?>', '', response, flags=re.DOTALL)
    # Clean up any extra newlines that might have been left
    response = re.sub(r'\n{3,}', '\n\n', response.strip())
    return response

@router.post("/convert", name="Convert", response_model=CommonResponse)
async def convert(file: UploadFile):
    try:
        # Read file content
        file_content = await file.read()

        # Create a temporary URL-like string for the file
        temp_url = f"memory://{file.filename}"

        # Initialize MarkItDown
        md = MarkItDown(enable_plugins=False)

        # Convert file content
        result = md.convert_bytes(file_content, mime_type=file.content_type)

        return {"data": result.text_content}

    except Exception as e:
        print(
            f"Error in {__file__}:{traceback.extract_tb(sys.exc_info()[2])[-1].lineno}:"
        )
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sysml-expert/{solution_uuid}", name="SysML Expert", response_model=CommonResponse)
async def sysml_expert(solution_uuid: str):
    try:
        # Get Qdrant client
        qdrant_client = my_qdrant()

        # Fetch solution details from the knowledge API
        async with httpx.AsyncClient(timeout=10.0) as client:
            print(f"Fetching solution details for UUID: {solution_uuid}")
            response = await client.get(
                f"http://knowledge-api:10000/solutions/{solution_uuid}/display"
            )
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Solution not found")
            solution = response.json()

            # Get document UUIDs from solution.knowledge
            document_uuids = solution.get("knowledge", [])
            if not document_uuids:
                print("Warning: No document UUIDs found in solution.knowledge")

        # Fetch relevant documents from Qdrant
        context_documents = []
        for doc_id in document_uuids:
            try:
                # Fetch the document by its ID
                result = qdrant_client.retrieve(
                    collection_name=os.getenv("QDRANT_DEFAULT_COLLECTION"),
                    ids=[doc_id],
                )
                if result:
                    # Extract the text content from the payload
                    doc_content = result[0].payload.get("text", "")
                    context_documents.append(doc_content)
            except Exception as e:
                print(f"Error fetching document {doc_id}: {str(e)}")
                continue

        # Fetch all documents from the second collection
        second_collection = os.getenv("QDRANT_SYSML_COLLECTION")
        if second_collection:
            offset = None
            while True:
                try:
                    # Get batch of documents using scroll
                    results, offset = qdrant_client.scroll(
                        collection_name=second_collection,
                        limit=100,  # Fetch in batches of 100
                        offset=offset
                    )
                    
                    # Process the batch
                    for point in results:
                        doc_content = point.payload.get("text", "")
                        if doc_content:
                            context_documents.append(doc_content)
                    
                    # If no more results, break the loop
                    if not offset:
                        break
                        
                except Exception as e:
                    print(f"Error fetching documents from second collection: {str(e)}")
                    print(traceback.format_exc())
                    break

        # Combine all context documents
        context = "\n\n---\n\n".join(context_documents)
        print('here')
        # OpenAI-compatible endpoint configuration
        api_endpoint = "http://host.docker.internal:1234/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer dummy-token",
        }

        # Prepare solution data for LLM
        # Fetch result_final from database
        conn = my_db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT result_final
                    FROM solutions
                    WHERE uuid = %s
                    """,
                    (solution_uuid,)
                )
                result = cur.fetchone()
                print(result['result_final'])
                result_data = result['result_final'] if result is not None else {}
        finally:
            conn.close()

        # Fetch agent configuration
        async with httpx.AsyncClient(timeout=10.0) as agent_client:
            print("Fetching agent configuration for 'sysml-expert'")
            agent_response = await agent_client.get(
                "http://management-api:10020/agents/sysml-expert"
            )
            if agent_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Agent 'sysml-expert' not found")
            agent_config = agent_response.json()

        # Prepare the user prompt with context
        user_prompt = agent_config["prompt_user"]
        
        # Replace placeholders if they exist
        if "%context%" in user_prompt:
            user_prompt = user_prompt.replace("%context%", context)
        if "%result_data%" in user_prompt:
            user_prompt = user_prompt.replace("%result_data%", json.dumps(result_data, indent=2))

        payload = {
            "model": "expert",
            "messages": [
                {
                    "role": "system",
                    "content": agent_config["prompt_system"]
                },
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": json.loads(agent_config["output_schema"])
            },
            "temperature": agent_config["temperature"],
        }

        print(f"Making request to OpenAI-compatible endpoint: {api_endpoint}")
        print(f"Payload: {json.dumps(payload, indent=2)}")

        async with httpx.AsyncClient(timeout=int(os.getenv("MODEL_TIMEOUT"))) as llm_client:
            llm_response = await llm_client.post(
                api_endpoint, json=payload, headers=headers
            )
            print(f"Response status: {llm_response.status_code}")
            print(f"Response body: {llm_response.text}")

            if llm_response.status_code != 200:
                raise HTTPException(
                    status_code=llm_response.status_code,
                    detail=f"LLM request failed: {llm_response.text}",
                )

            llm_data = llm_response.json()
            content = llm_data["choices"][0]["message"]["content"]
            cleaned_content = clean_llm_response(content)
            
            # Clean and parse JSON content
            try:
                # First try to parse it as JSON
                if isinstance(cleaned_content, str):
                    content_json = json.loads(cleaned_content)
                else:
                    content_json = cleaned_content
                
                # Convert to a clean JSON string without escapes
                clean_json = json.dumps(content_json, ensure_ascii=False, separators=(',', ':'))
            except json.JSONDecodeError:
                # If it's not valid JSON, store as a simple string
                clean_json = json.dumps({"content": cleaned_content}, ensure_ascii=False, separators=(',', ':'))
            
            # Update solution in database
            conn = my_db()
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        UPDATE solutions
                        SET sysml = %s::jsonb
                        WHERE uuid = %s
                        """,
                        (clean_json, solution_uuid)
                    )
                conn.commit()
            finally:
                conn.close()
            
            return {"data": clean_json}

    except Exception as e:
        print(f"Error in sysml endpoint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ma-solver/{solution_uuid}/{num_of_solutions}", name="ma-solver", response_model=CommonResponse)
async def ma_solver(solution_uuid: str, num_of_solutions: int):
    try:
        # Get Qdrant client
        qdrant_client = my_qdrant()

        # Fetch solution details from the knowledge API
        async with httpx.AsyncClient(timeout=10.0) as client:
            print(f"Fetching solution details for UUID: {solution_uuid}")
            response = await client.get(
                f"http://knowledge-api:10000/solutions/{solution_uuid}/display"
            )
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Solution not found")
            solution = response.json()
            
            print(solution)

            # Get document UUIDs from solution.knowledge
            document_uuids = solution.get("knowledge", [])
            if not document_uuids:
                print("Warning: No document UUIDs found in solution.knowledge")

        # Fetch relevant documents from Qdrant
        context_documents = []
        for doc_id in document_uuids:
            try:
                # Fetch the document by its ID
                result = qdrant_client.retrieve(
                    collection_name=os.getenv("QDRANT_DEFAULT_COLLECTION"),
                    ids=[doc_id],
                )
                if result:
                    # Extract the text content from the payload
                    doc_content = result[0].payload.get("text", "")
                    context_documents.append(doc_content)
            except Exception as e:
                print(f"Error fetching document {doc_id}: {str(e)}")
                continue

        # Combine all context documents
        context = "\n\n---\n\n".join(context_documents)

        # Prepare solution data for LLM
        solution_data = {
            "name": solution["name"],
            "num_solutions": num_of_solutions,
            "solution_space": solution["solution_space"],
            "table": solution["table"],
            "req_customer": solution["req_customer"],
            "req_business": solution["req_business"]
        }

        # OpenAI-compatible endpoint configuration
        api_endpoint = "http://host.docker.internal:1234/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer dummy-token",
        }

        # Prepare the chat completion request with context and solution data
        # Fetch agent configuration
        async with httpx.AsyncClient(timeout=10.0) as agent_client:
            print("Fetching agent configuration for 'expert'")
            agent_response = await agent_client.get(
                "http://management-api:10020/agents/ma-solver"
            )
            if agent_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Agent 'expert' not found")
            agent_config = agent_response.json()

        # Prepare the user prompt with context
        user_prompt = agent_config["prompt_user"]
        
        # Replace placeholders if they exist
        if "%context%" in user_prompt:
            user_prompt = user_prompt.replace("%context%", context)
        if "%solution_data%" in user_prompt:
            user_prompt = user_prompt.replace("%solution_data%", json.dumps(solution_data, indent=2))

        payload = {
            "model": "expert",
            "messages": [
                {
                    "role": "system",
                    "content": agent_config["prompt_system"]
                },
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": json.loads(agent_config["output_schema"])
            },
            "temperature": agent_config["temperature"],
        }

        print(f"Making request to OpenAI-compatible endpoint: {api_endpoint}")
        print(f"Payload: {json.dumps(payload, indent=2)}")

        async with httpx.AsyncClient(timeout=int(os.getenv("MODEL_TIMEOUT"))) as llm_client:
            llm_response = await llm_client.post(
                api_endpoint, json=payload, headers=headers
            )
            print(f"Response status: {llm_response.status_code}")
            print(f"Response body: {llm_response.text}")

            if llm_response.status_code != 200:
                raise HTTPException(
                    status_code=llm_response.status_code,
                    detail=f"LLM request failed: {llm_response.text}",
                )

            llm_data = llm_response.json()
            content = llm_data["choices"][0]["message"]["content"]
            cleaned_content = clean_llm_response(content)
            
            # Clean and parse JSON content
            try:
                # First try to parse it as JSON
                if isinstance(cleaned_content, str):
                    content_json = json.loads(cleaned_content)
                else:
                    content_json = cleaned_content
                
                # Convert to a clean JSON string without escapes
                clean_json = json.dumps(content_json, ensure_ascii=False, separators=(',', ':'))
            except json.JSONDecodeError:
                # If it's not valid JSON, store as a simple string
                clean_json = json.dumps({"content": cleaned_content}, ensure_ascii=False, separators=(',', ':'))
            
            # Update solution in database
            conn = my_db()
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        UPDATE solutions
                        SET result_initial = %s::jsonb
                        WHERE uuid = %s
                        """,
                        (clean_json, solution_uuid)
                    )
                conn.commit()
            finally:
                conn.close()
            
            return {"data": cleaned_content}

    except Exception as e:
        print(f"Error in solve endpoint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ma-optimizer/{solution_uuid}/{prompt}", name="ma-optimizer", response_model=CommonResponse)
async def ma_optimizer(solution_uuid: str, prompt: str):
    try:
        # Get Qdrant client
        qdrant_client = my_qdrant()

        # Fetch solution details from the knowledge API
        async with httpx.AsyncClient(timeout=10.0) as client:
            print(f"Fetching solution details for UUID: {solution_uuid}")
            response = await client.get(
                f"http://knowledge-api:10000/solutions/{solution_uuid}/display"
            )
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Solution not found")
            solution = response.json()

            # Get document UUIDs from solution.knowledge
            document_uuids = solution.get("knowledge", [])
            if not document_uuids:
                print("Warning: No document UUIDs found in solution.knowledge")

        # Fetch relevant documents from Qdrant
        context_documents = []
        for doc_id in document_uuids:
            try:
                # Fetch the document by its ID
                result = qdrant_client.retrieve(
                    collection_name=os.getenv("QDRANT_DEFAULT_COLLECTION"),
                    ids=[doc_id],
                )
                if result:
                    # Extract the text content from the payload
                    doc_content = result[0].payload.get("text", "")
                    context_documents.append(doc_content)
            except Exception as e:
                print(f"Error fetching document {doc_id}: {str(e)}")
                continue

        # Combine all context documents
        context = "\n\n---\n\n".join(context_documents)

        # Prepare solution data for LLM
        solution_data = {
            "name": solution["name"],
            "solution_space": solution["solution_space"],
            "table": solution["table"],
            "req_customer": solution["req_customer"],
            "req_business": solution["req_business"],
            "result_initial": solution.get("result_initial", {}),  # Include initial results
            "prompt": prompt  # Include the optimization prompt
        }

        # OpenAI-compatible endpoint configuration
        api_endpoint = "http://host.docker.internal:1234/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer dummy-token",
        }

        # Fetch agent configuration
        async with httpx.AsyncClient(timeout=10.0) as agent_client:
            print("Fetching agent configuration for 'ma-optimizer'")
            agent_response = await agent_client.get(
                "http://management-api:10020/agents/ma-optimizer"
            )
            if agent_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Agent 'ma-optimizer' not found")
            agent_config = agent_response.json()

        # Prepare the user prompt with context
        user_prompt = agent_config["prompt_user"]
        
        # Replace placeholders if they exist
        if "%context%" in user_prompt:
            user_prompt = user_prompt.replace("%context%", context)
        if "%solution_data%" in user_prompt:
            user_prompt = user_prompt.replace("%solution_data%", json.dumps(solution_data, indent=2))
        if "%user_prompt%" in user_prompt:
            user_prompt = user_prompt.replace("%user_prompt%", prompt)

        payload = {
            "model": "expert",
            "messages": [
                {
                    "role": "system",
                    "content": agent_config["prompt_system"]
                },
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": json.loads(agent_config["output_schema"])
            },
            "temperature": agent_config["temperature"],
        }

        print(f"Making request to OpenAI-compatible endpoint: {api_endpoint}")
        print(f"Payload: {json.dumps(payload, indent=2)}")

        async with httpx.AsyncClient(timeout=int(os.getenv("MODEL_TIMEOUT"))) as llm_client:
            llm_response = await llm_client.post(
                api_endpoint, json=payload, headers=headers
            )
            print(f"Response status: {llm_response.status_code}")
            print(f"Response body: {llm_response.text}")

            if llm_response.status_code != 200:
                raise HTTPException(
                    status_code=llm_response.status_code,
                    detail=f"LLM request failed: {llm_response.text}",
                )

            llm_data = llm_response.json()
            content = llm_data["choices"][0]["message"]["content"]
            cleaned_content = clean_llm_response(content)
            
            # Clean and parse JSON content
            try:
                # First try to parse it as JSON
                if isinstance(cleaned_content, str):
                    content_json = json.loads(cleaned_content)
                else:
                    content_json = cleaned_content
                
                # Convert to a clean JSON string without escapes
                clean_json = json.dumps(content_json, ensure_ascii=False, separators=(',', ':'))
            except json.JSONDecodeError:
                # If it's not valid JSON, store as a simple string
                clean_json = json.dumps({"content": cleaned_content}, ensure_ascii=False, separators=(',', ':'))
            
            # Update solution in database
            conn = my_db()
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        UPDATE solutions
                        SET result_final = %s::jsonb
                        WHERE uuid = %s
                        """,
                        (clean_json, solution_uuid)
                    )
                conn.commit()
            finally:
                conn.close()
            
            return {"data": cleaned_content}

    except Exception as e:
        print(f"Error in optimizer endpoint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
