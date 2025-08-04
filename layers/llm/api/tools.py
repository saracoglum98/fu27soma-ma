import re
import httpx


async def generate_kpi_analyst_schema(num_of_solutions: int):
    """Generate schema for KPI analyst by fetching qualitative and quantitative KPIs.
    
    Args:
        num_of_solutions: Number of solutions to generate analysis for
        
    Returns:
        dict: A schema matching the required format for KPI analysis
    """
    qualitative_kpis = []
    quantitative_kpis = []

    # Make HTTP requests to fetch KPIs
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Fetch qualitative KPIs
        response = await client.get("http://knowledge-api:10000/kpi/qualitative")
        if response.status_code == 200:
            data = response.json()["data"]
            qualitative_kpis = [kpi["value"] for kpi in data]

        # Fetch quantitative KPIs
        response = await client.get("http://knowledge-api:10000/kpi/quantitative")
        if response.status_code == 200:
            data = response.json()["data"]
            quantitative_kpis = [kpi["value"] for kpi in data]

    # Combine all KPIs
    kpis = qualitative_kpis + quantitative_kpis
    
    # Generate the schema structure
    schema = {
        "type": "object",
        "properties": {
            "kpi_analysis": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "solution_index": {
                            "type": "integer",
                            "minimum": 1,
                            "description": "Index of the solution being analyzed"
                        },
                        "ratings": {
                            "type": "object",
                            "properties": {
                                kpi: {
                                    "type": "object",
                                    "properties": {
                                        "rating": {
                                            "type": "string",
                                            "enum": ["low", "medium", "high"],
                                            "description": "Rating level for KPI"
                                        },
                                        "direction": {
                                            "type": "string",
                                            "enum": ["high_is_better", "low_is_better"],
                                            "description": "Whether high or low values are better for this KPI"
                                        }
                                    },
                                    "required": ["rating", "direction"],
                                    "description": "Object containing rating and direction for the KPI"
                                } for kpi in kpis
                            },
                            "required": kpis,
                            "description": "Map of KPI names to their rating levels"
                        }
                    },
                    "required": ["solution_index", "ratings"]
                },
                "minItems": num_of_solutions,
                "maxItems": num_of_solutions,
                "description": "Array of KPI analyses for each solution"
            }
        },
        "required": ["kpi_analysis"]
    }
    
    return schema



def clean_llm_response(response: str) -> str:
    """Remove thinking/reasoning blocks from LLM response."""
    # Remove <think> or <thinking> blocks
    response = re.sub(r'<think(?:ing)?>[^<]*</think(?:ing)?>', '', response, flags=re.DOTALL)
    # Clean up any extra newlines that might have been left
    response = re.sub(r'\n{3,}', '\n\n', response.strip())
    return response