export type Solution = {
  uuid: string;
  name: string;
  req_customer: string;
  req_business: string;
  runtime?: number;
  data?: Record<string, any>;
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