import { SolutionSpace } from "../types/SolutionSpaces";

const API_URL = "http://localhost:10000/solution_spaces";

export const getAllSolutionSpaces = async (): Promise<SolutionSpace[]> => {
  const response = await fetch(`${API_URL}`);
  if (!response.ok) {
    throw new Error("Failed to fetch solution spaces");
  }
  return response.json();
};

export const getSolutionSpace = async (uuid: string): Promise<SolutionSpace> => {
  const response = await fetch(`${API_URL}/${uuid}`);
  if (!response.ok) {
    throw new Error("Failed to fetch solution space");
  }
  return response.json();
};

export const createSolutionSpace = async (name: string): Promise<SolutionSpace> => {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Failed to create solution space");
  }
  return response.json();
};

export const updateSolutionSpace = async (uuid: string, name: string): Promise<SolutionSpace> => {
  const response = await fetch(`${API_URL}/${uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Failed to update solution space");
  }
  return response.json();
};

export const deleteSolutionSpace = async (uuid: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${uuid}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete solution space");
  }
};

export const attachFunction = async (solutionSpaceUuid: string, functionUuid: string): Promise<SolutionSpace> => {
  const response = await fetch(`${API_URL}/attach/function/${solutionSpaceUuid}/${functionUuid}`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Failed to attach function");
  }
  return response.json();
};

export const detachFunction = async (solutionSpaceUuid: string, functionUuid: string): Promise<SolutionSpace> => {
  const response = await fetch(`${API_URL}/detach/function/${solutionSpaceUuid}/${functionUuid}`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Failed to detach function");
  }
  return response.json();
};
