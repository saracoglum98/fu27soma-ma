from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import List
from schemas.Options import OptionsR, OptionsCU
from connections import my_db
import uuid

router = APIRouter(
    prefix="/options",
    tags=["options"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", name="Read all", response_model=List[OptionsR])
async def options_read_all():
    try:
        conn = my_db()
        cur = conn.cursor()
        cur.execute("SELECT uuid, name, knowledge FROM options")
        options = cur.fetchall()
        cur.close()
        conn.close()
        
        return [
            {
                "uuid": str(option["uuid"]),
                "name": option["name"],
                "knowledge": option["knowledge"] if option["knowledge"] else []
            }
            for option in options
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{uuid}", name="Read single", response_model=OptionsR)
async def option_read_one(uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        cur.execute("SELECT uuid, name, knowledge FROM options WHERE uuid = %s", (uuid,))
        option = cur.fetchone()
        cur.close()
        conn.close()

        if option is None:
            raise HTTPException(status_code=404, detail="Option not found")
        
        return {
            "uuid": str(option["uuid"]),
            "name": option["name"],
            "knowledge": option["knowledge"] if option["knowledge"] else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{uuid}", name="Update", response_model=OptionsR)
async def option_update(uuid: str, option: OptionsCU):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the option exists
        cur.execute("SELECT uuid FROM options WHERE uuid = %s", (uuid,))
        if cur.fetchone() is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Option not found")
        
        # Update the option
        cur.execute(
            """
            UPDATE options 
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
async def option_delete(uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the option exists
        cur.execute("SELECT uuid FROM options WHERE uuid = %s", (uuid,))
        if cur.fetchone() is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Option not found")
        
        # Delete the option
        cur.execute("DELETE FROM options WHERE uuid = %s", (uuid,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", name="Create", response_model=OptionsR)
async def option_create(option: OptionsCU):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        new_uuid = str(uuid.uuid4())
        
        cur.execute(
            """
            INSERT INTO options (uuid, name)
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

@router.put("/attach/knowledge/{option_uuid}/{knowledge_uuid}", name="Attach Knowledge", response_model=OptionsR)
async def option_attach_knowledge(option_uuid: str, knowledge_uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the option exists
        cur.execute("SELECT uuid, name, knowledge FROM options WHERE uuid = %s", (option_uuid,))
        option = cur.fetchone()
        
        if option is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Option not found")
        
        # Get current knowledge array or initialize empty array if None
        current_knowledge = option["knowledge"] if option["knowledge"] else []
        
        # Check if knowledge_uuid already exists in the array
        if knowledge_uuid not in current_knowledge:
            # Add the new knowledge_uuid to the array
            current_knowledge.append(knowledge_uuid)
            
            # Update the option with new knowledge array
            cur.execute(
                """
                UPDATE options 
                SET knowledge = %s
                WHERE uuid = %s
                RETURNING uuid, name, knowledge
                """,
                (current_knowledge, option_uuid)
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
        else:
            # Knowledge already exists, return current state
            cur.close()
            conn.close()
            return {
                "uuid": str(option["uuid"]),
                "name": option["name"],
                "knowledge": current_knowledge
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/detach/knowledge/{option_uuid}/{knowledge_uuid}", name="Detach Knowledge", response_model=OptionsR)
async def option_detach_knowledge(option_uuid: str, knowledge_uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the option exists
        cur.execute("SELECT uuid, name, knowledge FROM options WHERE uuid = %s", (option_uuid,))
        option = cur.fetchone()
        
        if option is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Option not found")
        
        # Get current knowledge array or initialize empty array if None
        current_knowledge = option["knowledge"] if option["knowledge"] else []
        
        # Check if knowledge_uuid exists in the array
        if knowledge_uuid in current_knowledge:
            # Remove the knowledge_uuid from the array
            current_knowledge.remove(knowledge_uuid)
            
            # Update the option with new knowledge array
            cur.execute(
                """
                UPDATE options 
                SET knowledge = %s
                WHERE uuid = %s
                RETURNING uuid, name, knowledge
                """,
                (current_knowledge, option_uuid)
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
        else:
            # Knowledge doesn't exist in array, return current state
            cur.close()
            conn.close()
            return {
                "uuid": str(option["uuid"]),
                "name": option["name"],
                "knowledge": current_knowledge
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))