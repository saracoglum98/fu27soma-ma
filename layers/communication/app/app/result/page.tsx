'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconArrowLeft } from "@tabler/icons-react";
import { SolutionDisplayResponse } from '../types/Solutions';
import { displaySolution } from '../services/Solutions';
import { analyzeKPI, optimizeSolution, analyzeSysML } from '../services/AgentCalls';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

interface QualitativeKPIResult {
  kpi: string;
  rationale: string;
  assessment: 'low' | 'medium' | 'high';
}

interface QuantitativeKPIResult {
  kpi: string;
  rationale: string;
  assessment: 'hit' | 'miss';
}

interface KPIAnalysis {
  solution_id: number;
  qualitative_analysis: QualitativeKPIResult[];
  quantitative_analysis: QuantitativeKPIResult[];
}

interface InitialSolutionData {
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

interface FinalSolutionData {
  reasoning: ReasoningItem[];
  executive_summary: ExecutiveSummary;
}


function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams.get('uuid');
  const [solution, setSolution] = useState<SolutionDisplayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [generatingSysML, setGeneratingSysML] = useState(false);
  const [optimizationPrompt, setOptimizationPrompt] = useState('');
  const [showSysMLModal, setShowSysMLModal] = useState(false);

  const handleSysMLGeneration = async () => {
    if (!uuid) return;
    setGeneratingSysML(true);
    try {
      await analyzeSysML(uuid);
      // Refresh the solution data after SysML generation
      const updatedData = await displaySolution(uuid);
      setSolution(updatedData);
    } catch (err) {
      console.error('Error generating SysML:', err);
      setError('Failed to generate SysML');
    } finally {
      setGeneratingSysML(false);
    }
  };

  const handleOptimization = async () => {
    if (!uuid || !optimizationPrompt.trim()) return;
    setOptimizing(true);
    try {
      await optimizeSolution(uuid, optimizationPrompt);
      // Refresh the solution data after optimization
      const updatedData = await displaySolution(uuid);
      setSolution(updatedData);
      setOptimizationPrompt(''); // Clear the input after successful optimization
    } catch (err) {
      console.error('Error optimizing solution:', err);
      setError('Failed to optimize solution');
    } finally {
      setOptimizing(false);
    }
  };

  const handleKPIAnalysis = async (type: 'initial' | 'final' = 'initial') => {
    if (!uuid) return;
    setAnalyzing(true);
    try {
      await analyzeKPI(uuid, type);
      // Refresh the solution data after analysis
      const updatedData = await displaySolution(uuid);
      setSolution(updatedData);
    } catch (err) {
      console.error('Error analyzing KPIs:', err);
      setError(`Failed to analyze ${type} KPIs`);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    const fetchSolution = async () => {
      if (!uuid) {
        setError('No solution UUID provided');
        setLoading(false);
        return;
      }

      try {
        const data = await displaySolution(uuid);
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

  if (!solution?.result_initial) {
    return <div>No result available for this solution</div>;
  }

  const data = solution.result_initial as InitialSolutionData;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {data.meta.solution_space} Solutions
          </h1>
        </div>
        <div className="flex gap-2">
          {!solution.result_initial_analysis && (
            <Button 
              onClick={() => handleKPIAnalysis('initial')} 
              disabled={analyzing}
            >
              {analyzing ? 'Analyzing KPIs...' : 'Analyze KPIs'}
            </Button>
          )}
          {solution.result_final && !solution.sysml && (
            <Button 
              onClick={handleSysMLGeneration}
              disabled={generatingSysML}
            >
              {generatingSysML ? 'Generating...' : 'Generate SysML'}
            </Button>
          )}
          {solution.sysml && (
            <Button 
              onClick={() => setShowSysMLModal(true)}
              variant="outline"
            >
              Show SysML Definition
            </Button>
          )}
        </div>
      </div>

      {/* SysML Modal */}
      <Dialog open={showSysMLModal} onOpenChange={setShowSysMLModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>SysML Definition</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(80vh-8rem)]">
            <pre className="p-4 bg-slate-50 rounded-lg whitespace-pre text-sm">
              {solution.sysml?.sysml}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comparison Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison of Initial Solutions</CardTitle>
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
            {/* Combined Solution Details Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Initial Solution Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList>
                    <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                    <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
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
                  </TabsContent>

                  <TabsContent value="reasoning">
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>



          </TabsContent>
        ))}
      </Tabs>

      {/* KPI Analysis Table */}
      {solution.result_initial_analysis && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>KPI Analysis of Initial Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qualitative" className="w-full">
              <TabsList>
                <TabsTrigger value="qualitative">Qualitative Analysis</TabsTrigger>
                <TabsTrigger value="quantitative">Quantitative Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="qualitative">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      {(solution.result_initial_analysis as any[]).map((_, index) => (
                        <TableHead key={index}>Solution {index + 1}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(new Set((solution.result_initial_analysis as any[]).flatMap(s => s.qualitative_analysis.map((a: QualitativeKPIResult) => a.kpi)))).map((kpi) => (
                      <TableRow key={kpi}>
                        <TableCell className="font-medium">{kpi}</TableCell>
                        {(solution.result_initial_analysis as any[]).map((sol, index) => {
                          const analysis = sol.qualitative_analysis.find((a: any) => a.kpi === kpi);
                          return (
                            <TableCell key={index}>
                              <HoverCard>
                                <HoverCardTrigger>
                                  <span className={
                                    analysis?.assessment === 'high' ? 'text-green-600 font-semibold' :
                                    analysis?.assessment === 'medium' ? 'text-yellow-600' :
                                    'text-red-600'
                                  }>
                                    {analysis?.assessment.charAt(0).toUpperCase() + analysis?.assessment.slice(1)}
                                  </span>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                  <p className="text-sm">{analysis?.rationale}</p>
                                </HoverCardContent>
                              </HoverCard>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="quantitative">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      {(solution.result_initial_analysis as any[]).map((_, index) => (
                        <TableHead key={index}>Solution {index + 1}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(new Set((solution.result_initial_analysis as any[]).flatMap(s => s.quantitative_analysis.map((a: QuantitativeKPIResult) => a.kpi)))).map((kpi) => (
                      <TableRow key={kpi}>
                        <TableCell className="font-medium">{kpi}</TableCell>
                        {(solution.result_initial_analysis as any[]).map((sol, index) => {
                          const analysis = sol.quantitative_analysis.find((a: any) => a.kpi === kpi);
                          return (
                            <TableCell key={index}>
                              <HoverCard>
                                <HoverCardTrigger>
                                  <span className={analysis?.assessment === 'hit' ? 'text-green-600 font-semibold' : 'text-red-600'}>
                                    {analysis?.assessment.charAt(0).toUpperCase() + analysis?.assessment.slice(1)}
                                  </span>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                  <p className="text-sm">{analysis?.rationale}</p>
                                </HoverCardContent>
                              </HoverCard>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Optimization Card */}
      {solution.result_initial && solution.result_initial_analysis && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Optimize</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter optimization instructions..."
              value={optimizationPrompt}
              onChange={(e) => setOptimizationPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleOptimization}
              disabled={optimizing || !optimizationPrompt.trim()}
              className="w-full"
            >
              {optimizing ? 'Optimizing...' : 'Optimize'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Final KPI Results */}
      {solution.result_final && solution.result_initial_analysis && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Optimized Solution</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList>
                <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
                {solution.result_final_analysis && (
                  <TabsTrigger value="kpi">KPI Analysis</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Business Requirements</h4>
                    <p>{(solution.result_final as FinalSolutionData).executive_summary.alignment_score.business_requirements}%</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Customer Requirements</h4>
                    <p>{(solution.result_final as FinalSolutionData).executive_summary.alignment_score.customer_requirements}%</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Compromises</h4>
                  <p>{(solution.result_final as FinalSolutionData).executive_summary.key_compromises}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Risk Assessment</h4>
                  <p>{(solution.result_final as FinalSolutionData).executive_summary.risk_assessment}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Decision Rationale</h4>
                  <p>{(solution.result_final as FinalSolutionData).executive_summary.decision_rationale}</p>
                </div>
              </TabsContent>

              <TabsContent value="reasoning">
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
                    {(solution.result_final as FinalSolutionData).reasoning.map((item: ReasoningItem, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{item.function}</TableCell>
                        <TableCell>{item.option}</TableCell>
                        <TableCell>{item.assumptions}</TableCell>
                        <TableCell>{item.analysis}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {solution.result_final_analysis && (
                <TabsContent value="kpi">
                  <Tabs defaultValue="qualitative" className="w-full">
                    <TabsList>
                      <TabsTrigger value="qualitative">Qualitative Analysis</TabsTrigger>
                      <TabsTrigger value="quantitative">Quantitative Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="qualitative">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>KPI</TableHead>
                            <TableHead>Assessment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(solution.result_final_analysis[0] as KPIAnalysis).qualitative_analysis.map((analysis, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{analysis.kpi}</TableCell>
                              <TableCell>
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <span className={
                                      analysis.assessment === 'high' ? 'text-green-600 font-semibold' :
                                      analysis.assessment === 'medium' ? 'text-yellow-600' :
                                      'text-red-600'
                                    }>
                                      {analysis.assessment.charAt(0).toUpperCase() + analysis.assessment.slice(1)}
                                    </span>
                                  </HoverCardTrigger>
                                  <HoverCardContent>
                                    <p className="text-sm">{analysis.rationale}</p>
                                  </HoverCardContent>
                                </HoverCard>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="quantitative">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>KPI</TableHead>
                            <TableHead>Assessment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(solution.result_final_analysis[0] as KPIAnalysis).quantitative_analysis.map((analysis, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{analysis.kpi}</TableCell>
                              <TableCell>
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <span className={analysis.assessment === 'hit' ? 'text-green-600 font-semibold' : 'text-red-600'}>
                                      {analysis.assessment.charAt(0).toUpperCase() + analysis.assessment.slice(1)}
                                    </span>
                                  </HoverCardTrigger>
                                  <HoverCardContent>
                                    <p className="text-sm">{analysis.rationale}</p>
                                  </HoverCardContent>
                                </HoverCard>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
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
