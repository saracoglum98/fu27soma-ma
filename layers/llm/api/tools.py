import re
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()


async def get_agent_schema(agent_name: str):
    async with httpx.AsyncClient(timeout=180.0) as agent_client:
        agent_response = await agent_client.get(
            "http://management-api:10020/agents/{}".format(agent_name)
        )
        if agent_response.status_code == 404:
            raise HTTPException(status_code=404, detail="Agent 'kpi-analyst' not found")
        agent_config = agent_response.json()
    return agent_config

async def call_agent(agent_name: str, prompt: str):
    agent_config = await get_agent_schema(agent_name)
    
    match agent_name:
        case "kpi-analyst":
            model_name = "kpi-analyst"
        case "sysml-expert":
            model_name = "sysml-expert"
        case "ma-solver":
            model_name = "ma"
        case "ma-optimizer":
            model_name = "ma"
    
    api_endpoint = "http://{}:1234/v1/chat/completions".format(os.getenv("NEXT_PUBLIC_HOST"))
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer dummy-token",}   
    
    payload = {
            "model": model_name,
            "messages": [
                {
                    "role": "system",
                    "content": agent_config["prompt_system"]
                },
                {"role": "user", "content": prompt}
            ],
        }
    
    async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                api_endpoint,
                headers=headers,
                json=payload,
                timeout=180.0
        )
    
    return agent_config

async def generate_kpi_analyst_schema(kpis: list, num_of_solutions: int):
    """Generate schema for KPI analyst based on input KPIs.
    
    Args:
        kpis: List of KPI objects containing type, key, and value
        
    Returns:
        dict: A schema matching the required format for KPI analysis
        
    Raises:
        ValueError: If kpis is not a list or if required fields are missing
    """
    if not isinstance(kpis, list):
        raise ValueError(f"Expected kpis to be a list, got {type(kpis)}")
        
    # Validate KPI structure
    for kpi in kpis:
        if not isinstance(kpi, dict):
            raise ValueError(f"Expected KPI to be a dict, got {type(kpi)}")
        if "type" not in kpi or "key" not in kpi:
            raise ValueError(f"KPI missing required fields 'type' or 'key': {kpi}")
        if kpi["type"] not in ["qualitative", "quantitative"]:
            raise ValueError(f"Invalid KPI type '{kpi['type']}'. Must be 'qualitative' or 'quantitative'")
    schema = {
        "type": "array",
        "minItems": num_of_solutions,
        "maxItems": num_of_solutions,
        "items": {
            "type": "object",
            "properties": {
                "solution_id": {
                    "type": "integer",
                    "minimum": 1
                },
                "qualitative_analysis": {
                    "type": "array",
                    "minItems": len([kpi for kpi in kpis if kpi["type"] == "qualitative"]),
                    "maxItems": len([kpi for kpi in kpis if kpi["type"] == "qualitative"]),
                    "items": {
                        "type": "object",
                        "properties": {
                            "kpi": {
                                "type": "string",
                                "enum": [kpi["key"] for kpi in kpis if kpi["type"] == "qualitative"]
                            },
                            "assessment": {
                                "type": "string",
                                "enum": ["low", "medium", "high"]
                            },
                            "rationale": {
                                "type": "string",
                                "description": "Brief explanation of the analysis"
                            }
                        },
                        "required": ["kpi", "assessment", "rationale"]
                    },
                    "uniqueItems": True
                },
                "quantitative_analysis": {
                    "type": "array",
                    "minItems": len([kpi for kpi in kpis if kpi["type"] == "quantitative"]),
                    "maxItems": len([kpi for kpi in kpis if kpi["type"] == "quantitative"]),
                    "items": {
                        "type": "object",
                        "properties": {
                            "kpi": {
                                "type": "string",
                                "enum": [kpi["key"] for kpi in kpis if kpi["type"] == "quantitative"]
                            },
                            "assessment": {
                                "type": "string",
                                "enum": ["hit", "miss"]
                            },
                            "rationale": {
                                "type": "string",
                                "description": "Brief explanation of the analysis"
                            }
                        },
                        "required": ["kpi", "assessment", "rationale"]
                    },
                    "uniqueItems": True
                }
            },
            "required": ["solution_id", "qualitative_analysis", "quantitative_analysis"]
        }
    }
    
    return schema



def clean_llm_response(response: str) -> str:
    """Remove thinking/reasoning blocks from LLM response."""
    # Remove <think> or <thinking> blocks
    response = re.sub(r'<think(?:ing)?>[^<]*</think(?:ing)?>', '', response, flags=re.DOTALL)
    # Clean up any extra newlines that might have been left
    response = re.sub(r'\n{3,}', '\n\n', response.strip())
    return response