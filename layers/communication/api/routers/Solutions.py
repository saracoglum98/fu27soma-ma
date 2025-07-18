from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import List
from schemas.Solutions import SolutionsR, SolutionsC, SolutionsU
from connections import my_db
import uuid

router = APIRouter(
    prefix="/solutions",
    tags=["solutions"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", name="Read all", response_model=List[SolutionsR])
async def solutions_read_all():
    try:
        conn = my_db()
        cur = conn.cursor()
        cur.execute("SELECT uuid, name, req_customer, req_business, results FROM solutions")
        solutions = cur.fetchall()
        cur.close()
        conn.close()
        
        return [
            {
                "uuid": str(solution["uuid"]),
                "name": solution["name"],
                "req_customer": solution["req_customer"],
                "req_business": solution["req_business"],
                "results": solution["results"] if solution["results"] else []
            }
            for solution in solutions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{uuid}", name="Read single", response_model=SolutionsR)
async def solution_read_one(uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        cur.execute("SELECT uuid, name, req_customer, req_business, results FROM solutions WHERE uuid = %s", (uuid,))
        solution = cur.fetchone()
        cur.close()
        conn.close()

        if solution is None:
            raise HTTPException(status_code=404, detail="Solution not found")
        
        return {
            "uuid": str(solution["uuid"]),
            "name": solution["name"],
            "req_customer": solution["req_customer"],
            "req_business": solution["req_business"],
            "results": solution["results"] if solution["results"] else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{solution_space_uuid}", name="Create", response_model=SolutionsR, status_code=status.HTTP_201_CREATED)
async def solution_create(solution_space_uuid: str, solution: SolutionsC):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the solution space exists
        cur.execute("SELECT uuid FROM solution_spaces WHERE uuid = %s", (solution_space_uuid,))
        if cur.fetchone() is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Solution space not found")
        
        new_uuid = str(uuid.uuid4())
        
        cur.execute(
            """
            INSERT INTO solutions (uuid, name, solution_space, req_customer, req_business)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING uuid, name, req_customer, req_business, results
            """,
            (new_uuid, solution.name, solution_space_uuid, "", "")  # Initialize with empty inputs
        )
        created_solution = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "uuid": str(created_solution["uuid"]),
            "name": created_solution["name"],
            "req_customer": created_solution["req_customer"],
            "req_business": created_solution["req_business"],
            "results": created_solution["results"] if created_solution["results"] else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{uuid}", name="Delete", status_code=status.HTTP_200_OK)
async def solution_delete(uuid: str):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the solution exists
        cur.execute("SELECT uuid FROM solutions WHERE uuid = %s", (uuid,))
        if cur.fetchone() is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Solution not found")
        
        # Delete the solution
        cur.execute("DELETE FROM solutions WHERE uuid = %s", (uuid,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{uuid}", name="Update", response_model=SolutionsR)
async def solution_update(uuid: str, solution: SolutionsU):
    try:
        conn = my_db()
        cur = conn.cursor()
        
        # First check if the solution exists
        cur.execute("SELECT uuid FROM solutions WHERE uuid = %s", (uuid,))
        if cur.fetchone() is None:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Solution not found")
        
        # Update the solution
        cur.execute(
            """
            UPDATE solutions 
            SET name = %s, req_customer = %s, req_business = %s
            WHERE uuid = %s
            RETURNING uuid, name, req_customer, req_business, results
            """,
            (solution.name, solution.req_customer, solution.req_business, uuid)
        )
        updated_solution = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "uuid": str(updated_solution["uuid"]),
            "name": updated_solution["name"],
            "req_customer": updated_solution["req_customer"],
            "req_business": updated_solution["req_business"],
            "results": updated_solution["results"] if updated_solution["results"] else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
