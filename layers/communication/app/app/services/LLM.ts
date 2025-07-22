import { CommonResponse } from '../types/CommonResponse';

const API_URL = "http://localhost:10010/tools";

/**
 * Converts a file to text using the document conversion endpoint
 * @param file The file to convert
 * @returns The extracted text content
 */
export const convertFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/convert`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to convert file');
  }

  const result: CommonResponse = await response.json();
  return result.data;
};

/**
 * Analyzes an option using SysML context and LLM
 * @param optionUuid The UUID of the option to analyze
 * @returns The LLM analysis result
 */
export const analyzeSysML = async (optionUuid: string): Promise<string> => {
  const response = await fetch(`${API_URL}/sysml/${optionUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to analyze SysML');
  }

  const result: CommonResponse = await response.json();
  return result.data;
};
