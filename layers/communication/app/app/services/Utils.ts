import { CommonResponse } from '../types/CommonResponse';

const API_URL = `http://${process.env.NEXT_PUBLIC_HOST}:10010/utils`;

/**
 * Converts a file to text using the utils convert endpoint
 * @param file The file to convert
 * @returns The converted text content
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
