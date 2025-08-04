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
from tools import generate_kpi_analyst_schema, clean_llm_response

load_dotenv()


router = APIRouter(
    prefix="/agent-calls",
    tags=["agent-calls"],
    responses={404: {"description": "Not found"}},
)

@router.get("/kpi-analyst/{solution_uuid}", name="KPI Analyst", response_model=CommonResponse)
async def kpi_analyst(solution_uuid: str):
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

            # Get the number of solutions
            num_of_solutions = len(solution["result_initial"]["solutions"])
            if num_of_solutions < 1:
                raise HTTPException(status_code=400, detail="Solution has no functions to analyze")

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
        solution_data = solution["result_initial"]["solutions"]

        # Fetch KPIs for the prompt
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Fetch qualitative KPIs
            qual_response = await client.get("http://knowledge-api:10000/kpi/qualitative")
            quant_response = await client.get("http://knowledge-api:10000/kpi/quantitative")
            
            kpis = []
            if qual_response.status_code == 200:
                data = qual_response.json()["data"]
                kpis.extend([kpi["value"] for kpi in data])
            if quant_response.status_code == 200:
                data = quant_response.json()["data"]
                kpis.extend([kpi["value"] for kpi in data])

        # OpenAI-compatible endpoint configuration
        api_endpoint = "http://host.docker.internal:1234/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer dummy-token",
        }

        # Fetch agent configuration
        async with httpx.AsyncClient(timeout=10.0) as agent_client:
            print("Fetching agent configuration for kpi-analyst")
            agent_response = await agent_client.get(
                "http://management-api:10020/agents/kpi-analyst"
            )
            if agent_response.status_code == 404:
                raise HTTPException(status_code=404, detail="Agent 'kpi-analyst' not found")
            agent_config = agent_response.json()

        # Prepare the user prompt with context
        user_prompt = agent_config["prompt_user"]
        
        # Replace placeholders if they exist
        if "%context%" in user_prompt:
            user_prompt = user_prompt.replace("%context%", context)
        if "%solution_data%" in user_prompt:
            user_prompt = user_prompt.replace("%solution_data%", json.dumps(solution_data, indent=2))
        if "%kpis%" in user_prompt:
            user_prompt = user_prompt.replace("%kpis%", json.dumps(kpis, indent=2))

        # Generate schema for validation
        schema = await generate_kpi_analyst_schema(num_of_solutions)

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
                "json_schema": {"schema": schema}
            }
        }

        # Make the request to the LLM
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                api_endpoint,
                headers=headers,
                json=payload,
                timeout=60.0
            )
            
            if response.status_code != 200:
                print(response.text)
                raise HTTPException(
                    status_code=500,
                    detail=f"LLM request failed with status {response.status_code}"
                )

            # Parse and clean the response
            llm_response = response.json()
            if "choices" not in llm_response or not llm_response["choices"]:
                raise HTTPException(
                    status_code=500,
                    detail="Invalid response format from LLM"
                )

            # Clean and parse the response
            content = llm_response["choices"][0]["message"]["content"]
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
            
            # Update the solution in the database with the analysis results
            db = my_db()
            try:
                with db.cursor() as cur:
                    query = """
                        UPDATE solutions 
                        SET result_analysis = %s::jsonb 
                        WHERE uuid = %s::uuid
                        RETURNING uuid
                    """
                    cur.execute(query, (clean_json, solution_uuid))
                    result = cur.fetchone()
                    db.commit()
                    
                    if not result:
                        raise HTTPException(
                            status_code=404,
                            detail="Solution not found"
                        )
            except Exception as e:
                db.rollback()
                print(f"Database error: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to update solution analysis in database: {str(e)}"
                )
            finally:
                db.close()

            return {"data": content_json}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in kpi-analyst endpoint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sysml-expert/{solution_uuid}", name="SysML Expert", response_model=CommonResponse)
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


@router.get("/ma-solver/{solution_uuid}/{num_of_solutions}", name="ma-solver", response_model=CommonResponse)
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


@router.get("/ma-optimizer/{solution_uuid}/{prompt}", name="ma-optimizer", response_model=CommonResponse)
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
