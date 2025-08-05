import re
import httpx


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
                    }
                },
                "quantitative_analysis": {
                    "type": "array",
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
                    }
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