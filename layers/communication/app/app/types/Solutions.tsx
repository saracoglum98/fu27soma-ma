export type Solution = {
  uuid: string;
  name: string;
  req_customer: string;
  req_business: string;
  result_initial?: Record<string, any>;
  result_final?: Record<string, any>;
  result_analysis?: Record<string, any>;
  sysml?: Record<string, any>;
  knowledge?: string[];
};

export interface SolutionCreate {
  name: string;
}

export interface SolutionUpdate {
  name: string;
  req_customer: string;
  req_business: string;
}

export interface SolutionDisplayResponse extends Solution {
  solution_space: string;
  table: { [key: string]: string[] };
}