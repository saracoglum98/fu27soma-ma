export interface Agent {
  uuid: string;
  name: string;
  model: string;
  temperature: number;
  prompt_system: string;
  prompt_user: string;
  output_schema: string;
}

export interface AgentUpdate {
  temperature: number;
  prompt_system: string;
  prompt_user: string;
  output_schema: string;
} 