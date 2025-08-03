interface Report {
    comparison: Comparison;
    solutions: Solution[];
}

interface Comparison {
    key_differences: string;
    trade_offs: string;
    recommendations: string;
}

interface Solution {
    executive_summary: ExecutiveSummary;
    reasoning: Reasoning[];
}

interface ExecutiveSummary {
    decision_rationale: string;
    key_compromises: string;
    risk_assessment: string;
    alignment_score: {
        customer_requirements: number;
        business_requirements: number;
    }
}

interface Reasoning {
    function: string;
    option: string;
    confidence_level: string;
    assumptions: string;
    analysis: string;
}
