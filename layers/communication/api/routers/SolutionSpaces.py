from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import List
from schemas.SolutionSpaces import SolutionSpacesR, SolutionSpacesCU
from connections import my_db
import uuid

router = APIRouter(
    prefix="/solution_spaces",
    tags=["solution_spaces"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", name="Read all", response_model=List[SolutionSpacesR])
async def solution_spaces_read_all():
    try:
        conn = my_db()
        cur = conn.cursor()
        cur.execute("SELECT uuid, name, functions FROM solution_spaces")
        solution_spaces = cur.fetchall()
        cur.close()
        conn.close()
        
        return [
            {
                "uuid": str(solution_space["uuid"]),
                "name": solution_space["name"],
                "functions": solution_space["functions"] if solution_space["functions"] else []
            }
            for solution_space in solution_spaces
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{uuid}", name="Read single", response_model=SolutionSpacesR)
async def solution_space_read_one(uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        cur.execute("SELECT uuid, name, functions FROM solution_spaces WHERE uuid = %s", (uuid,))
        solution_space = cur.fetchone()
        cur.close()
        conn.close()

        if solution_space is None:
            raise HTTPException(status_code=404, detail="Solution space not found")
        
        return {
            "uuid": str(solution_space["uuid"]),
            "name": solution_space["name"],
            "functions": solution_space["functions"] if solution_space["functions"] else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{uuid}", name="Update", response_model=SolutionSpacesR)
async def solution_space_update(uuid: str, solution_space: SolutionSpacesCU):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the option exists
        cur.execute("SELECT uuid FROM solution_spaces WHERE uuid = %s", (uuid,))
        if cur.fetchone() is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Solution space not found")
        
        # Update the option
        cur.execute(
            """
            UPDATE solution_spaces 
            SET name = %s, functions = %s
            WHERE uuid = %s
            RETURNING uuid, name, functions
            """,
            (solution_space.name, solution_space.functions, uuid)
        )
        updated_solution_space = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "uuid": str(updated_solution_space["uuid"]),
            "name": updated_solution_space["name"],
            "functions": updated_solution_space["functions"] if updated_solution_space["functions"] else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{uuid}", name="Delete", status_code=status.HTTP_200_OK)
async def solution_space_delete(uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the option exists
        cur.execute("SELECT uuid FROM solution_spaces WHERE uuid = %s", (uuid,))
        if cur.fetchone() is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Solution space not found")
        
        # Delete the option
        cur.execute("DELETE FROM solution_spaces WHERE uuid = %s", (uuid,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", name="Create", response_model=SolutionSpacesR, status_code=status.HTTP_201_CREATED)
async def solution_space_create(solution_space: SolutionSpacesCU):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        new_uuid = str(uuid.uuid4())
        
        cur.execute(
            """
            INSERT INTO solution_spaces (uuid, name, functions)
            VALUES (%s, %s, %s)
            RETURNING uuid, name, functions
            """,
            (new_uuid, solution_space.name, solution_space.functions)
        )
        created_solution_space = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "uuid": str(created_solution_space["uuid"]),
            "name": created_solution_space["name"],
            "functions": created_solution_space["functions"] if created_solution_space["functions"] else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))