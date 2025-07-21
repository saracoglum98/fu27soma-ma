import { Solution } from "../types/Solutions";

const API_URL = "http://localhost:10000/solutions";

export async function getAllSolutions(): Promise<Solution[]> {
  const response = await fetch(`${API_URL}/`);
  if (!response.ok) {
    throw new Error("Failed to fetch solutions");
  }
  return response.json();
}

export async function getSolution(uuid: string): Promise<Solution> {
  const response = await fetch(`${API_URL}/${uuid}`);
  if (!response.ok) {
    throw new Error("Solution not found");
  }
  return response.json();
}

export async function createSolution(solutionSpaceUuid: string, solution: Pick<Solution, "name">): Promise<Solution> {
  const response = await fetch(`${API_URL}/${solutionSpaceUuid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(solution),
  });
  if (!response.ok) {
    throw new Error("Failed to create solution");
  }
  return response.json();
}

export async function updateSolution(
  uuid: string, 
  solution: Pick<Solution, "name" | "req_customer" | "req_business">
): Promise<Solution> {
  const response = await fetch(`${API_URL}/${uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(solution),
  });
  if (!response.ok) {
    throw new Error("Failed to update solution");
  }
  return response.json();
}

export async function deleteSolution(uuid: string): Promise<void> {
  const response = await fetch(`${API_URL}/${uuid}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete solution");
  }
}
