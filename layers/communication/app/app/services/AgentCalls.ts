import { CommonResponse } from '../types/CommonResponse';

const API_URL = "http://localhost:10010/agent-calls";

/**
 * Analyzes a solution using KPI Analyst agent
 * @param solutionUuid The UUID of the solution to analyze
 * @returns The KPI analysis result
 */
export const analyzeKPI = async (solutionUuid: string, type: 'initial' | 'final' = 'initial'): Promise<string> => {
  const response = await fetch(`${API_URL}/kpi-analyst/${solutionUuid}/${type}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to analyze KPIs');
  }

  const result: CommonResponse = await response.json();
  return result.data;
};

/**
 * Analyzes a solution using SysML Expert agent
 * @param solutionUuid The UUID of the solution to analyze
 * @returns The SysML analysis result
 */
export const analyzeSysML = async (solutionUuid: string): Promise<string> => {
  const response = await fetch(`${API_URL}/sysml-expert/${solutionUuid}`, {
    method: 'GET',
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

/**
 * Analyzes a solution using MA Solver agent
 * @param solutionUuid The UUID of the solution to analyze
 * @param numOfSolutions Number of solutions to generate
 * @returns The initial solution analysis result
 */
export const solveSolution = async (solutionUuid: string, numOfSolutions: number): Promise<string> => {
  const response = await fetch(`${API_URL}/ma-solver/${solutionUuid}/${numOfSolutions}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to analyze solution');
  }

  const result: CommonResponse = await response.json();
  return result.data;
};

/**
 * Optimizes a solution using MA Optimizer agent
 * @param solutionUuid The UUID of the solution to optimize
 * @param prompt The optimization prompt/instructions
 * @returns The optimized solution result
 */
export const optimizeSolution = async (solutionUuid: string, prompt: string): Promise<string> => {
  const response = await fetch(`${API_URL}/ma-optimizer/${solutionUuid}/${prompt}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to optimize solution');
  }

  const result: CommonResponse = await response.json();
  return result.data;
};
