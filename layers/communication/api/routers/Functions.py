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
        cur.execute("SELECT uuid, name, knowledge FROM functions")
        functions = cur.fetchall()
        cur.close()
        conn.close()
        
        return [
            {
                "uuid": str(option["uuid"]),
                "name": option["name"],
                "knowledge": option["knowledge"] if option["knowledge"] else []
            }
            for option in functions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{uuid}", name="Read single", response_model=FunctionsR)
async def option_read_one(uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        cur.execute("SELECT uuid, name, knowledge FROM functions WHERE uuid = %s", (uuid,))
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

@router.put("/{uuid}", name="Update", response_model=FunctionsR)
async def option_update(uuid: str, option: FunctionsCU):
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
            SET name = %s, knowledge = %s
            WHERE uuid = %s
            RETURNING uuid, name, knowledge
            """,
            (option.name, option.knowledge, uuid)
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

@router.delete("/{uuid}", name="Delete", status_code=status.HTTP_200_OK)
async def option_delete(uuid: str):
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

@router.post("/", name="Create", response_model=FunctionsR, status_code=status.HTTP_201_CREATED)
async def option_create(option: FunctionsCU):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        new_uuid = str(uuid.uuid4())
        
        cur.execute(
            """
            INSERT INTO functions (uuid, name, knowledge)
            VALUES (%s, %s, %s)
            RETURNING uuid, name, knowledge
            """,
            (new_uuid, option.name, option.knowledge)
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