export interface Solution {
    uuid: string;
    name: string;
    req_customer?: string;
    req_business?: string;
    results?: string[];
    knowledge?: string[];
}

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