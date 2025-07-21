import { Option } from "../types/Options";

const API_URL = "http://localhost:10000/options";

export const getAllOptions = async (): Promise<Option[]> => {
  const response = await fetch(`${API_URL}`);
  if (!response.ok) {
    throw new Error("Failed to fetch options");
  }
  return response.json();
};

export const getOption = async (uuid: string): Promise<Option> => {
  const response = await fetch(`${API_URL}/${uuid}`);
  if (!response.ok) {
    throw new Error("Failed to fetch option");
  }
  return response.json();
};

export const createOption = async (name: string): Promise<Option> => {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Failed to create option");
  }
  return response.json();
};

export const updateOption = async (uuid: string, name: string): Promise<Option> => {
  const response = await fetch(`${API_URL}/${uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Failed to update option");
  }
  return response.json();
};

export const deleteOption = async (uuid: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${uuid}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete option");
  }
};

export const attachKnowledge = async (optionUuid: string, knowledgeUuid: string): Promise<Option> => {
  const response = await fetch(`${API_URL}/attach/knowledge/${optionUuid}/${knowledgeUuid}`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Failed to attach knowledge");
  }
  return response.json();
};

export const detachKnowledge = async (optionUuid: string, knowledgeUuid: string): Promise<Option> => {
  const response = await fetch(`${API_URL}/detach/knowledge/${optionUuid}/${knowledgeUuid}`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Failed to detach knowledge");
  }
  return response.json();
};
