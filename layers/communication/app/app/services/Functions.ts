import { Function } from "../types/Functions";

const API_URL = "http://localhost:10000/functions";

export const getAllFunctions = async (): Promise<Function[]> => {
  const response = await fetch(`${API_URL}`);
  if (!response.ok) {
    throw new Error("Failed to fetch functions");
  }
  return response.json();
};

export const getFunction = async (uuid: string): Promise<Function> => {
  const response = await fetch(`${API_URL}/${uuid}`);
  if (!response.ok) {
    throw new Error("Failed to fetch function");
  }
  return response.json();
};

export const createFunction = async (name: string): Promise<Function> => {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Failed to create function");
  }
  return response.json();
};

export const updateFunction = async (uuid: string, name: string): Promise<Function> => {
  const response = await fetch(`${API_URL}/${uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Failed to update function");
  }
  return response.json();
};

export const deleteFunction = async (uuid: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${uuid}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete function");
  }
};

export const attachOption = async (functionUuid: string, optionUuid: string): Promise<Function> => {
  const response = await fetch(`${API_URL}/attach/option/${functionUuid}/${optionUuid}`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Failed to attach option");
  }
  return response.json();
};

export const detachOption = async (functionUuid: string, optionUuid: string): Promise<Function> => {
  const response = await fetch(`${API_URL}/detach/option/${functionUuid}/${optionUuid}`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Failed to detach option");
  }
  return response.json();
};
