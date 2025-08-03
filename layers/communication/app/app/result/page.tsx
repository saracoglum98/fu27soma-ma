'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Solution } from '../types/Solutions';
import { getSolution } from '../services/Solutions';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface ReasoningItem {
  function: string;
  option: string;
  analysis: string;
  assumptions: string;
  confidence_level: string;
}

interface ExecutiveSummary {
  alignment_score: {
    business_requirements: number;
    customer_requirements: number;
  };
  key_compromises: string;
  risk_assessment: string;
  decision_rationale: string;
}

interface SolutionData {
  meta: {
    solution_space: string;
    num_solutions_generated: number;
    num_solutions_requested: number;
  };
  solutions: {
    reasoning: ReasoningItem[];
    executive_summary: ExecutiveSummary;
  }[];
  comparison: {
    trade_offs: string;
    key_differences: string;
    recommendations: string;
  };
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams.get('uuid');
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolution = async () => {
      if (!uuid) {
        setError('No solution UUID provided');
        setLoading(false);
        return;
      }

      try {
        const data = await getSolution(uuid);
        setSolution(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch solution');
        console.error('Error fetching solution:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [uuid]);

  if (loading) {
    return <div>Loading result...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!solution?.data) {
    return <div>No data available for this solution</div>;
  }

  const data = solution.data as SolutionData;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {data.meta.solution_space} Solutions
        </h1>
      </div>

      {/* Comparison Section */}
      <Card>
        <CardHeader>
          <CardTitle>Solution Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Trade-offs</h3>
            <p>{data.comparison.trade_offs}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Key Differences</h3>
            <p>{data.comparison.key_differences}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Recommendations</h3>
            <p>{data.comparison.recommendations}</p>
          </div>
        </CardContent>
      </Card>

      {/* Solutions Tabs */}
      <Tabs defaultValue="solution-0" className="w-full">
        <TabsList className="w-full">
          {data.solutions.map((_, index) => (
            <TabsTrigger key={index} value={`solution-${index}`} className="flex-1">
              Solution {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {data.solutions.map((solution, index) => (
          <TabsContent key={index} value={`solution-${index}`}>
            {/* Executive Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Business Requirements</h4>
                    <p>{solution.executive_summary.alignment_score.business_requirements}%</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Customer Requirements</h4>
                    <p>{solution.executive_summary.alignment_score.customer_requirements}%</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Compromises</h4>
                  <p>{solution.executive_summary.key_compromises}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Risk Assessment</h4>
                  <p>{solution.executive_summary.risk_assessment}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Decision Rationale</h4>
                  <p>{solution.executive_summary.decision_rationale}</p>
                </div>
              </CardContent>
            </Card>

            {/* Reasoning Table */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Reasoning</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Function</TableHead>
                      <TableHead>Selected Option</TableHead>
                      <TableHead>Assumptions</TableHead>
                      <TableHead>Analysis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solution.reasoning.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.function}</TableCell>
                        <TableCell>{item.option}</TableCell>
                        <TableCell>{item.assumptions}</TableCell>
                        <TableCell>{item.analysis}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>



          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultContent />
    </Suspense>
  );
}
