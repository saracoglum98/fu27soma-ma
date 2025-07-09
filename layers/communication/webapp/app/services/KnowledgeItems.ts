import { KnowledgeItems } from "../types/KnowledgeItems";

const API_BASE_URL = "http://localhost:8000/knowledge_items";

export async function getAllKnowledgeItems(): Promise<KnowledgeItems[]> {
  try {
    console.log('Fetching from:', API_BASE_URL);
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch knowledge items:', error);
    throw error;
  }
}

export async function createKnowledgeItem(name: string): Promise<KnowledgeItems> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function uploadKnowledgeItem(uuid: string, file: File): Promise<KnowledgeItems> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload/${uuid}`, {
    method: "PUT",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function deleteKnowledgeItem(uuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${uuid}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
