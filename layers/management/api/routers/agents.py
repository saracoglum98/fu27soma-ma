from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID
from pydantic import BaseModel
from connections import my_db
from schemas.Agents import AgentsR, AgentsU

router = APIRouter(
    prefix="/agents",
    tags=["agents"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", name="Get All Agents", response_model=List[AgentsR])
def get_all_agents():
    query = "SELECT * FROM agents"
    try:
        conn = my_db()
        cursor = conn.cursor()
        cursor.execute(query)
        agents = cursor.fetchall()
        cursor.close()
        conn.close()
        return agents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{name}", name="Get Agent by Name", response_model=AgentsR)
def get_agent_by_name(name: str):
    query = "SELECT * FROM agents WHERE name = %s"
    try:
        conn = my_db()
        cursor = conn.cursor()
        cursor.execute(query, (name,))
        agent = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent with name {name} not found")
        return agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{name}", name="Update Agent by Name", response_model=AgentsR)
def update_agent_by_name(name: str, agent: AgentsU):
    query = """
        UPDATE agents 
        SET prompt_system = %s, prompt_user = %s, temperature = %s, output_schema = %s
        WHERE name = %s 
        RETURNING *
    """
    try:
        conn = my_db()
        cursor = conn.cursor()
        cursor.execute(query, (
            agent.prompt_system,
            agent.prompt_user,
            agent.temperature,
            agent.output_schema,
            name
        ))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Agent with name {name} not found")
            
        updated_agent = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        return updated_agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))