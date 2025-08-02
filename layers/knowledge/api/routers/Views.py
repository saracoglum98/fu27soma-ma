from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import List
from schemas.Common import CommonResponse
from connections import my_db
import uuid

router = APIRouter(
    prefix="/views",
    tags=["views"],
    responses={404: {"description": "Not found"}},
)

@router.get("/dashboard", name="Dashboard View", response_model=CommonResponse)
async def dashboard():
    try:
        # Get database connection
        conn = my_db()
        
        # Create a cursor
        cursor = conn.cursor()
        
        # Get count of knowledge items
        cursor.execute("SELECT COUNT(*) FROM knowledge_items")
        knowledge_items_count = cursor.fetchone()['count']
        
        # Get count of KPIs
        cursor.execute("SELECT COUNT(*) FROM kpis")
        kpis_count = cursor.fetchone()['count']
        
        # Get count of options
        cursor.execute("SELECT COUNT(*) FROM options")
        options_count = cursor.fetchone()['count']
        
        # Get count of functions
        cursor.execute("SELECT COUNT(*) FROM functions")
        functions_count = cursor.fetchone()['count']
        
        # Get count of solution spaces
        cursor.execute("SELECT COUNT(*) FROM solution_spaces")
        solution_spaces_count = cursor.fetchone()['count']
        
        # Get count of solutions
        cursor.execute("SELECT COUNT(*) FROM solutions")
        solutions_count = cursor.fetchone()['count']
        
        # Close cursor and connection
        cursor.close()
        conn.close()
        
        # Format response
        response = {
            "knowledge_items": knowledge_items_count,
            "kpis": kpis_count,
            "options": options_count,
            "functions": functions_count,
            "solution_spaces": solution_spaces_count,
            "solutions": solutions_count
        }
        
        return {"data": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))