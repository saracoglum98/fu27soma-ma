export interface Solution {
    uuid: string;
    name: string;
    req_customer?: string;
    req_business?: string;
    results?: string[];
}

export interface SolutionCreate {
    name: string;
}

export interface SolutionUpdate {
    name: string;
    req_customer: string;
    req_business: string;
}