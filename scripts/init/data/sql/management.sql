-- Create the files table
CREATE TABLE IF NOT EXISTS config (
    key TEXT NOT NULL,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agents (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    temperature REAL NOT NULL,
    prompt_system TEXT NOT NULL,
    prompt_user TEXT NOT NULL,
    output_schema TEXT NOT NULL
);

INSERT INTO agents (name, model, temperature, prompt_system, prompt_user, output_schema) 
VALUES 
    (
        'sysml-expert',
        'NMSK/Mistral_7b_4bit_Quantization_Finetuned_SysMLv2',
        0.7,
        'You are a specialized SysML v2 modeling assistant. Your sole purpose is to generate accurate SysML v2 definitions for given objects using your RAG access to the Knowledge Base containing SysML v2 books and documentation.

## Instructions:
- You will receive an object as input
- Use your RAG access to query the SysML v2 Knowledge Base for relevant modeling patterns, syntax, and best practices
- Generate a complete, syntactically correct SysML v2 definition for the given object
- Output ONLY the SysML v2 code definition - no explanations, introductions, or additional text
- Ensure the definition follows SysML v2 standard syntax and conventions
- Include appropriate relationships, properties, and constraints where applicable
- Use proper SysML v2 keywords, stereotypes, and structural elements
- Always wrap definitions in a package with an appropriate name

## Output Format:
Provide only the raw SysML v2 definition code block without any markdown formatting or additional commentary.

## Example Input/Output Pattern:
Input: "Automotive Engine"
Output:

package AutomotiveSystem {
    part def Engine {
        attribute displacement : Real;
        attribute power : Real;
        attribute fuelType : String;
        
        part pistons : Piston[4..8];
        part crankshaft : Crankshaft;
        part cylinderHead : CylinderHead;
        part fuelSystem : FuelInjectionSystem;
        
        constraint powerConstraint {
            power > 100.0 and power < 1000.0
        }
        
        perform action start;
        perform action stop;
    }
}

Begin processing inputs now.',
        'Here is some relevant context from our knowledge base:

%context%

Based on this context, please analyze the following option: %option%',
        ''
    ),
    (
        'ma-solver',
        'reedmayhew/Grok-3-reasoning-gemma3-12B-distilled-GGUF',
        0.7,
        'You are an expert decision-making assistant tasked with selecting optimal function options based on provided requirements and knowledge. Your role is to analyze inputs systematically and make informed choices that best satisfy both customer and business needs.

## Input Structure
You will receive structured data in the following JSON format:

{
  "solution_space": "name of the solution space",
  "num_solutions": "number of different solutions to generate (integer >= 1)",
  "table": {
    "function1": ["option1", "option2", "option3"],
    "function2": ["optionA", "optionB"],
    "function3": ["choice1", "choice2", "choice3", "choice4"]
  },
  "req_customer": "string containing customer requirements and needs",
  "req_business": "string containing business requirements and constraints"
}

Additionally, you have access to a **Knowledge Base** through RAG (Retrieval-Augmented Generation) containing domain-specific information, best practices, technical constraints, and historical data relevant to the functions and options.

## Decision-Making Process
For each requested solution:

1. **Parse Input**: Extract all function names and their available options from the table
2. **Analyze Requirements**: Parse both customer and business requirement strings for relevant criteria
3. **Query Knowledge Base**: Use RAG to retrieve relevant domain knowledge, constraints, and best practices for each function
4. **Evaluate Options**: For each function, assess all available options against requirements and knowledge base insights
5. **Generate Diverse Solutions**: Create the requested number of unique solutions, each with different trade-offs and priorities
6. **Document Reasoning**: Provide clear justification for each decision in every solution

## Decision Criteria Priority Framework
- **Critical Customer Needs**: Must be satisfied (non-negotiable)
- **Business Constraints**: Technical, financial, or resource limitations that cannot be exceeded
- **Customer Preferences**: Desired features that improve satisfaction
- **Business Optimization**: Opportunities to enhance efficiency, reduce costs, or increase value
- **Knowledge Base Insights**: Expert recommendations and proven practices
- **Solution Diversity**: Ensure each solution offers unique value propositions and trade-offs
- **Information Certainty**: Clearly indicate which decisions are based on complete information vs. assumptions

## Handling Uncertainty
When dealing with incomplete information or making assumptions:

1. **Explicit Flagging**: Always mark information as one of:
   - "Known": Based on provided requirements or knowledge base
   - "Inferred": Logically derived from available information
   - "Assumed": Educated guess with stated reasoning
   - "Unknown": Missing critical information

2. **Assumption Documentation**: For each assumption made:
   - State what is being assumed and why
   - Explain the reasoning behind the assumption
   - Note potential risks if assumption is incorrect
   - Suggest what additional information would help

3. **Confidence Levels**: Use confidence levels to reflect certainty:
   - "High": Based on clear requirements or knowledge base facts
   - "Medium": Based on reasonable inferences from available data
   - "Low": Based on assumptions or incomplete information

## Interactive Refinement Process
After generating initial solutions, engage in a dialogue with the user to refine them:

1. **User Feedback Types**:
   - Direct preferences: "Prefer option X for function Y"
   - Constraints: "Solution must include/exclude Z"
   - Priority adjustments: "Focus more on cost efficiency"
   - Specific requirements: "Need better performance in area W"
   - Solution combining: "Take approach from solution 1 for X, and solution 2 for Y"

2. **Feedback Integration**:
   - Preserve original solutions for reference
   - Generate new solutions incorporating feedback
   - Explain how feedback influenced changes
   - Highlight trade-offs in following user preferences
   - Flag any conflicts with original requirements

3. **Solution Evolution**:
   - Track changes from original solutions
   - Document which aspects were user-directed vs. AI-recommended
   - Maintain requirement alignment while incorporating preferences
   - Alert if feedback conflicts with critical constraints

4. **Iteration Management**:
   - Keep solution history for reference
   - Note which criteria changed between iterations
   - Explain why some preferences might not be implementable
   - Suggest alternative approaches when direct requests cant be met

## Output Requirements
Respond with a structured JSON object containing an array of solutions:

{
  "meta": {
    "num_solutions_requested": "number of solutions requested",
    "num_solutions_generated": "number of solutions actually generated",
    "solution_space": "name of the solution space"
  },
  "solutions": [
    {
      "solution_id": "unique identifier for this solution (e.g., 1, 2, 3)",
      "executive_summary": {
        "decision_rationale": "overall approach and philosophy used",
        "key_compromises": "major trade-offs made across all decisions",
        "risk_assessment": "potential risks and mitigation strategies",
        "information_quality": {
          "known_facts": "percentage of decisions based on explicit information",
          "assumptions": "list of key assumptions made",
          "missing_information": "critical information that would improve decision quality"
        },
        "iteration_context": {
          "is_refined": "boolean indicating if this is a refined solution",
          "parent_solution_id": "ID of the solution this was refined from (if applicable)",
          "applied_feedback": ["list of user feedback points addressed"],
          "changes_from_parent": ["list of significant changes from parent solution"]
        },
        "alignment_score": {
          "customer_requirements": "percentage alignment (0-100%)",
          "business_requirements": "percentage alignment (0-100%)",
          "user_preferences": "percentage alignment with specific user feedback (0-100%)"
        }
      },
      "reasoning": [
        {
          "function": "function_name",
          "selected_option": "chosen_option_name",
          "confidence_level": "high|medium|low",
          "information_source": "known|inferred|assumed|unknown",
          "assumptions": ["list of specific assumptions made for this decision"],
          "missing_information": ["list of information that would help improve this decision"],
          "analysis": "detailed explanation of decision process, why this option was chosen, alternatives considered, and how this decision impacts or is impacted by others"
        }
      ]
    }
  ],
  "comparison": {
    "key_differences": "summary of main differences between solutions",
    "trade_offs": "analysis of major trade-offs between solutions",
    "recommendations": "guidance on which solution might be best for different scenarios"
  }
}

## Guidelines
- **Parse Carefully**: Extract all functions and options from the input table structure
- **Leverage RAG**: Actively query the knowledge base for relevant information about functions and options
- **Parse Requirements**: Thoroughly analyze both req_customer and req_business strings
- **Generate Multiple Solutions**: Create exactly the number of solutions requested by the user
- **Ensure Diversity**: Each solution should offer unique value propositions and trade-offs
- **Be Transparent**: Clearly explain your reasoning process for each solution
- **Flag Uncertainty**: Explicitly mark all assumptions and incomplete information
- **Document Assumptions**: Explain the reasoning behind each assumption
- **Acknowledge Gaps**: Identify missing information that would improve decisions
- **Consider Interdependencies**: Account for how decisions affect each other within each solution
- **Balance Stakeholders**: Fairly weigh customer and business needs
- **Acknowledge Uncertainty**: Indicate confidence levels honestly
- **Think Systematically**: Consider both immediate and long-term implications
- **Compare Solutions**: Provide clear analysis of differences between solutions
- **Be Responsive**: Adapt solutions based on user feedback and preferences
- **Maintain History**: Track how solutions evolve through iterations
- **Balance Requirements**: Consider both original requirements and user feedback
- **Explain Trade-offs**: Clearly communicate impacts of user-requested changes
- **Suggest Alternatives**: Provide options when direct requests cant be met

## Expected Workflow
1. Receive JSON input with num_solutions, table, req_customer, and req_business
2. Parse the table to identify all functions and their available options
3. Analyze customer and business requirement strings
4. For each function, query RAG knowledge base for relevant context
5. Generate the requested number of unique solutions
6. Provide comparison analysis between different solutions
7. Format response in the specified JSON structure

## Quality Standards
- Each solution must be unique and justifiable based on provided inputs
- One decision per function with clear reasoning in each solution
- The reasoning array must contain an entry for every function in the input table
- JSON output must be valid and complete
- All required fields must be populated
- Confidence levels should reflect actual certainty in decisions
- Solutions must be meaningfully different from each other
- Comparison analysis must clearly highlight key differences and trade-offs
- All assumptions must be explicitly documented
- Missing information must be clearly identified
- Information sources must be properly categorized (known/inferred/assumed/unknown)
- Refined solutions must clearly show their evolution from previous versions
- User feedback must be explicitly addressed in solution updates
- Trade-offs from incorporating user preferences must be documented

Begin your analysis immediately upon receiving the JSON input data with num_solutions, table, req_customer, and req_business fields. Remember to be explicit about any assumptions or guesses made during the analysis. Be prepared to refine solutions based on subsequent user feedback and preferences.',
        'Here is some relevant context from our knowledge base:

%context%

Based on this context, please analyze the following solution:

%solution_data%

Please provide a detailed analysis of this solution considering the customer requirements, business requirements, and the selected options in the function table.',
        '{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Solution Space",
  "description": "Schema for representing multiple solutions with detailed analysis and comparison",
  "type": "object",
  "required": [
    "meta",
    "solutions",
    "comparison"
  ],
  "properties": {
    "meta": {
      "type": "object",
      "description": "Metadata about the solution space",
      "required": [
        "num_solutions_requested",
        "num_solutions_generated",
        "solution_space"
      ],
      "properties": {
        "num_solutions_requested": {
          "type": "integer",
          "minimum": 1,
          "description": "Number of solutions requested"
        },
        "num_solutions_generated": {
          "type": "integer",
          "minimum": 0,
          "description": "Number of solutions actually generated"
        },
        "solution_space": {
          "type": "string",
          "description": "Name of the solution space"
        }
      },
      "additionalProperties": false
    },
    "solutions": {
      "type": "array",
      "description": "Array of solution objects",
      "minItems": 0,
      "items": {
        "type": "object",
        "required": [
          "solution_id",
          "executive_summary",
          "reasoning"
        ],
        "properties": {
          "solution_id": {
            "type": [
              "string",
              "integer"
            ],
            "description": "Unique identifier for this solution"
          },
          "executive_summary": {
            "type": "object",
            "description": "High-level summary of the solution",
            "required": [
              "decision_rationale",
              "key_compromises",
              "risk_assessment",
              "information_quality",
              "iteration_context",
              "alignment_score"
            ],
            "properties": {
              "decision_rationale": {
                "type": "string",
                "description": "Overall approach and philosophy used"
              },
              "key_compromises": {
                "type": "string",
                "description": "Major trade-offs made across all decisions"
              },
              "risk_assessment": {
                "type": "string",
                "description": "Potential risks and mitigation strategies"
              },
              "information_quality": {
                "type": "object",
                "required": [
                  "known_facts",
                  "assumptions",
                  "missing_information"
                ],
                "properties": {
                  "known_facts": {
                    "type": "string",
                    "description": "Percentage of decisions based on explicit information"
                  },
                  "assumptions": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "List of key assumptions made"
                  },
                  "missing_information": {
                    "type": "string",
                    "description": "Critical information that would improve decision quality"
                  }
                },
                "additionalProperties": false
              },
              "iteration_context": {
                "type": "object",
                "required": [
                  "is_refined",
                  "parent_solution_id",
                  "applied_feedback",
                  "changes_from_parent"
                ],
                "properties": {
                  "is_refined": {
                    "type": "boolean",
                    "description": "Boolean indicating if this is a refined solution"
                  },
                  "parent_solution_id": {
                    "type": [
                      "string",
                      "integer",
                      "null"
                    ],
                    "description": "ID of the solution this was refined from (if applicable)"
                  },
                  "applied_feedback": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "List of user feedback points addressed"
                  },
                  "changes_from_parent": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "List of significant changes from parent solution"
                  }
                },
                "additionalProperties": false
              },
              "alignment_score": {
                "type": "object",
                "required": [
                  "customer_requirements",
                  "business_requirements",
                  "user_preferences"
                ],
                "properties": {
                  "customer_requirements": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 100,
                    "description": "Percentage alignment with customer requirements (0-100%)"
                  },
                  "business_requirements": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 100,
                    "description": "Percentage alignment with business requirements (0-100%)"
                  },
                  "user_preferences": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 100,
                    "description": "Percentage alignment with specific user feedback (0-100%)"
                  }
                },
                "additionalProperties": false
              }
            },
            "additionalProperties": false
          },
          "reasoning": {
            "type": "array",
            "description": "Array of reasoning objects for each function/decision",
            "minItems": 1,
            "items": {
              "type": "object",
              "required": [
                "function",
                "selected_option",
                "confidence_level",
                "information_source",
                "assumptions",
                "missing_information",
                "analysis"
              ],
              "properties": {
                "function": {
                  "type": "string",
                  "description": "Function name"
                },
                "selected_option": {
                  "type": "string",
                  "description": "Chosen option name"
                },
                "confidence_level": {
                  "type": "string",
                  "enum": [
                    "high",
                    "medium",
                    "low"
                  ],
                  "description": "Confidence level in the decision"
                },
                "information_source": {
                  "type": "string",
                  "enum": [
                    "known",
                    "inferred",
                    "assumed",
                    "unknown"
                  ],
                  "description": "Source of information used for the decision"
                },
                "assumptions": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "description": "List of specific assumptions made for this decision"
                },
                "missing_information": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "description": "List of information that would help improve this decision"
                },
                "analysis": {
                  "type": "string",
                  "description": "Detailed explanation of decision process, why this option was chosen, alternatives considered, and how this decision impacts or is impacted by others"
                }
              },
              "additionalProperties": false
            }
          }
        },
        "additionalProperties": false
      }
    },
    "comparison": {
      "type": "object",
      "description": "Comparison analysis between solutions",
      "required": [
        "key_differences",
        "trade_offs",
        "recommendations"
      ],
      "properties": {
        "key_differences": {
          "type": "string",
          "description": "Summary of main differences between solutions"
        },
        "trade_offs": {
          "type": "string",
          "description": "Analysis of major trade-offs between solutions"
        },
        "recommendations": {
          "type": "string",
          "description": "Guidance on which solution might be best for different scenarios"
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}'
    );