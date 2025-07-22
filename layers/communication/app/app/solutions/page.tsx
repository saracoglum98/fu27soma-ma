'use client';

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllSolutions } from "../services/Solutions";
import { Solution } from "../types/Solutions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { solveSolution } from "../services/LLM";

export default function SolutionsPage() {
  const router = useRouter();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solveDialogOpen, setSolveDialogOpen] = useState(false);
  const [solvingLoading, setSolvingLoading] = useState(false);
  const [solveContent, setSolveContent] = useState("");
  const [solvingSolution, setSolvingSolution] = useState<Solution | null>(null);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const data = await getAllSolutions();
        setSolutions(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch solutions");
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, []);

  const handleViewSolution = (uuid: string) => {
    router.push(`/solution?uuid=${uuid}`);
  };

  const handleSolve = async (solution: Solution) => {
    try {
      setSolvingSolution(solution);
      setSolvingLoading(true);
      setSolveDialogOpen(true);
      const analysis = await solveSolution(solution.uuid);
      // Pretty print the JSON response
      setSolveContent(JSON.stringify(JSON.parse(analysis), null, 2));
    } catch (err) {
      setError("Failed to solve solution");
      console.error("Error solving solution:", err);
    } finally {
      setSolvingLoading(false);
    }
  };

  if (loading) {
    return <div>Loading solutions...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Solutions</h1>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solutions.map((solution) => (
              <TableRow key={solution.uuid}>
                <TableCell>{solution.name}</TableCell>
                <TableCell className="space-x-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleViewSolution(solution.uuid)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSolve(solution)}
                    disabled={solvingLoading && solvingSolution?.uuid === solution.uuid}
                  >
                    {solvingLoading && solvingSolution?.uuid === solution.uuid ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent" />
                    ) : (
                      "Solve"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={solveDialogOpen} onOpenChange={setSolveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {solvingSolution?.name} - Solution Analysis
            </DialogTitle>
            <DialogDescription>
              This is the analysis result for the solution.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {solvingLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-transparent" />
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap font-mono text-sm max-h-[60vh] overflow-y-auto">
                  {solveContent}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 