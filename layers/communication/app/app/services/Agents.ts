import { Agent, AgentUpdate } from "../types/Agents";

const API_URL = "http://localhost:10020/agents";

export const getAllAgents = async (): Promise<Agent[]> => {
  const response = await fetch(`${API_URL}`);
  if (!response.ok) {
    throw new Error("Failed to fetch agents");
  }
  return response.json();
};

export const getAgentByName = async (name: string): Promise<Agent> => {
  const response = await fetch(`${API_URL}/${name}`);
  if (!response.ok) {
    throw new Error("Failed to fetch agent");
  }
  return response.json();
};

export const updateAgentByName = async (name: string, agent: AgentUpdate): Promise<Agent> => {
  const response = await fetch(`${API_URL}/${name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agent),
  });
  if (!response.ok) {
    throw new Error("Failed to update agent");
  }
  return response.json();
};
