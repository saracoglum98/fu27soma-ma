import { CommonResponse } from '../types/CommonResponse';

const API_URL = "http://localhost:10000/views";

type DashboardStats = {
  knowledge_items: number;
  kpis: number;
  options: number;
  functions: number;
  solution_spaces: number;
  solutions: number;
};

/**
 * Fetches dashboard statistics including counts of various entities
 * @returns Dashboard data containing counts of knowledge items, KPIs, options, functions, solution spaces, and solutions
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch(`${API_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: CommonResponse<DashboardStats> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw new Error(`Failed to fetch dashboard statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
