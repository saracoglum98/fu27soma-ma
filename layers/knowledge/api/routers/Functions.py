from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import List
from schemas.Functions import FunctionsR, FunctionsCU
from connections import my_db
import uuid

router = APIRouter(
    prefix="/functions",
    tags=["functions"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", name="Read all", response_model=List[FunctionsR])
async def functions_read_all():
    try:
        conn = my_db()
        cur = conn.cursor()
        cur.execute("SELECT uuid, name, knowledge, options FROM functions")
        functions = cur.fetchall()
        cur.close()
        conn.close()
        
        return [
            {
                "uuid": str(option["uuid"]),
                "name": option["name"],
                "knowledge": option["knowledge"] if option["knowledge"] else [],
                "options": option["options"] if option["options"] else []
            }
            for option in functions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{uuid}", name="Read single", response_model=FunctionsR)
async def function_read_one(uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        cur.execute("SELECT uuid, name, knowledge, options FROM functions WHERE uuid = %s", (uuid,))
        option = cur.fetchone()
        cur.close()
        conn.close()

        if option is None:
            raise HTTPException(status_code=404, detail="Option not found")
        
        return {
            "uuid": str(option["uuid"]),
            "name": option["name"],
            "knowledge": option["knowledge"] if option["knowledge"] else [],
            "options": option["options"] if option["options"] else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{uuid}", name="Update", response_model=FunctionsR)
async def function_update(uuid: str, option: FunctionsCU):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the option exists
        cur.execute("SELECT uuid FROM functions WHERE uuid = %s", (uuid,))
        if cur.fetchone() is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Option not found")
        
        # Update the option
        cur.execute(
            """
            UPDATE functions 
            SET name = %s
            WHERE uuid = %s
            RETURNING uuid, name, knowledge
            """,
            (option.name, uuid)
        )
        updated_option = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "uuid": str(updated_option["uuid"]),
            "name": updated_option["name"],
            "knowledge": updated_option["knowledge"] if updated_option["knowledge"] else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{uuid}", name="Delete")
async def function_delete(uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the option exists
        cur.execute("SELECT uuid FROM functions WHERE uuid = %s", (uuid,))
        if cur.fetchone() is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Option not found")
        
        # Delete the option
        cur.execute("DELETE FROM functions WHERE uuid = %s", (uuid,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", name="Create", response_model=FunctionsR)
async def function_create(option: FunctionsCU):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        new_uuid = str(uuid.uuid4())
        
        cur.execute(
            """
            INSERT INTO functions (uuid, name)
            VALUES (%s, %s)
            RETURNING uuid, name, knowledge
            """,
            (new_uuid, option.name)
        )
        created_option = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "uuid": str(created_option["uuid"]),
            "name": created_option["name"],
            "knowledge": created_option["knowledge"] if created_option["knowledge"] else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/attach/option/{function_uuid}/{option_uuid}", name="Attach Option", response_model=FunctionsR)
async def function_attach_option(function_uuid: str, option_uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the function exists
        cur.execute("SELECT uuid, name, knowledge, options FROM functions WHERE uuid = %s", (function_uuid,))
        function = cur.fetchone()
        
        if function is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Function not found")
        
        # Get current options array or initialize empty array if None
        current_options = function["options"] if function["options"] else []
        
        # Check if option_uuid already exists in the array
        if option_uuid not in current_options:
            # Add the new option_uuid to the array
            current_options.append(option_uuid)
            
            # Update the function with new options array
            cur.execute(
                """
                UPDATE functions 
                SET options = %s
                WHERE uuid = %s
                RETURNING uuid, name, knowledge, options
                """,
                (current_options, function_uuid)
            )
            updated_function = cur.fetchone()
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                "uuid": str(updated_function["uuid"]),
                "name": updated_function["name"],
                "knowledge": updated_function["knowledge"] if updated_function["knowledge"] else [],
                "options": updated_function["options"] if updated_function["options"] else []
            }
        else:
            # Option already exists, return current state
            cur.close()
            conn.close()
            return {
                "uuid": str(function["uuid"]),
                "name": function["name"],
                "knowledge": function["knowledge"] if function["knowledge"] else [],
                "options": current_options
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/detach/option/{function_uuid}/{option_uuid}", name="Detach Option", response_model=FunctionsR)
async def function_detach_option(function_uuid: str, option_uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the function exists
        cur.execute("SELECT uuid, name, knowledge, options FROM functions WHERE uuid = %s", (function_uuid,))
        function = cur.fetchone()
        
        if function is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Function not found")
        
        # Get current options array or initialize empty array if None
        current_options = function["options"] if function["options"] else []
        
        # Check if option_uuid exists in the array
        if option_uuid in current_options:
            # Remove the option_uuid from the array
            current_options.remove(option_uuid)
            
            # Update the function with new options array
            cur.execute(
                """
                UPDATE functions 
                SET options = %s
                WHERE uuid = %s
                RETURNING uuid, name, knowledge, options
                """,
                (current_options, function_uuid)
            )
            updated_function = cur.fetchone()
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                "uuid": str(updated_function["uuid"]),
                "name": updated_function["name"],
                "knowledge": updated_function["knowledge"] if updated_function["knowledge"] else [],
                "options": updated_function["options"] if updated_function["options"] else []
            }
        else:
            # Option doesn't exist in array, return current state
            cur.close()
            conn.close()
            return {
                "uuid": str(function["uuid"]),
                "name": function["name"],
                "knowledge": function["knowledge"] if function["knowledge"] else [],
                "options": current_options
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/attach/knowledge/{function_uuid}/{knowledge_uuid}", name="Attach Knowledge", response_model=FunctionsR)
async def function_attach_knowledge(function_uuid: str, knowledge_uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the function exists
        cur.execute("SELECT uuid, name, knowledge, options FROM functions WHERE uuid = %s", (function_uuid,))
        function = cur.fetchone()
        
        if function is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Function not found")
        
        # Get current knowledge array or initialize empty array if None
        current_knowledge = function["knowledge"] if function["knowledge"] else []
        
        # Check if knowledge_uuid already exists in the array
        if knowledge_uuid not in current_knowledge:
            # Add the new knowledge_uuid to the array
            current_knowledge.append(knowledge_uuid)
            
            # Update the function with new knowledge array
            cur.execute(
                """
                UPDATE functions 
                SET knowledge = %s
                WHERE uuid = %s
                RETURNING uuid, name, knowledge, options
                """,
                (current_knowledge, function_uuid)
            )
            updated_function = cur.fetchone()
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                "uuid": str(updated_function["uuid"]),
                "name": updated_function["name"],
                "knowledge": updated_function["knowledge"] if updated_function["knowledge"] else [],
                "options": updated_function["options"] if updated_function["options"] else []
            }
        else:
            # Knowledge already exists, return current state
            cur.close()
            conn.close()
            return {
                "uuid": str(function["uuid"]),
                "name": function["name"],
                "knowledge": current_knowledge,
                "options": function["options"] if function["options"] else []
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/detach/knowledge/{function_uuid}/{knowledge_uuid}", name="Detach Knowledge", response_model=FunctionsR)
async def function_detach_knowledge(function_uuid: str, knowledge_uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the function exists
        cur.execute("SELECT uuid, name, knowledge, options FROM functions WHERE uuid = %s", (function_uuid,))
        function = cur.fetchone()
        
        if function is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Function not found")
        
        # Get current knowledge array or initialize empty array if None
        current_knowledge = function["knowledge"] if function["knowledge"] else []
        
        # Check if knowledge_uuid exists in the array
        if knowledge_uuid in current_knowledge:
            # Remove the knowledge_uuid from the array
            current_knowledge.remove(knowledge_uuid)
            
            # Update the function with new knowledge array
            cur.execute(
                """
                UPDATE functions 
                SET knowledge = %s
                WHERE uuid = %s
                RETURNING uuid, name, knowledge, options
                """,
                (current_knowledge, function_uuid)
            )
            updated_function = cur.fetchone()
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                "uuid": str(updated_function["uuid"]),
                "name": updated_function["name"],
                "knowledge": updated_function["knowledge"] if updated_function["knowledge"] else [],
                "options": updated_function["options"] if updated_function["options"] else []
            }
        else:
            # Knowledge doesn't exist in array, return current state
            cur.close()
            conn.close()
            return {
                "uuid": str(function["uuid"]),
                "name": function["name"],
                "knowledge": current_knowledge,
                "options": function["options"] if function["options"] else []
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))