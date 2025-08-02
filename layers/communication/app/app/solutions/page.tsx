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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { solveSolution } from "../services/LLM";
import { getAllSolutions, deleteSolution } from "../services/Solutions";
import { Solution } from "../types/Solutions";
import { IconPlayerPlay, IconEdit, IconTrash, IconSearch, IconEye } from "@tabler/icons-react";

export default function SolutionsPage() {
  const router = useRouter();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numSolutionsDialogOpen, setNumSolutionsDialogOpen] = useState(false);
  const [solvingLoading, setSolvingLoading] = useState(false);
  const [numSolutions, setNumSolutions] = useState<number>(1);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    fetchSolutions();
  }, []);

  const handleViewSolution = (uuid: string) => {
    router.push(`/solution?uuid=${uuid}`);
  };

  const handleSolveClick = (solution: Solution) => {
    setSelectedSolution(solution);
    setNumSolutionsDialogOpen(true);
  };

  const handleSolve = async () => {
    if (!selectedSolution) return;
    
    try {
      setSolvingLoading(true);
      await solveSolution(selectedSolution.uuid, numSolutions);
      await fetchSolutions(); // Refresh the solutions list after solving
    } catch (err) {
      setError("Failed to solve solution");
      console.error("Error solving solution:", err);
    } finally {
      setSolvingLoading(false);
      setNumSolutionsDialogOpen(false);
      setSelectedSolution(null);
    }
  };

  const handleViewResult = (uuid: string) => {
    router.push(`/result?uuid=${uuid}`);
  };

  const handleDelete = async (uuid: string) => {
    try {
      await deleteSolution(uuid);
      await fetchSolutions(); // Refresh the list after deletion
      setError(null);
    } catch (err) {
      setError("Failed to delete solution");
      console.error("Error deleting solution:", err);
    }
  };

  const filteredData = solutions.filter((solution) =>
    solution.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      
      <div className="w-full relative">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search solutions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((solution) => (
              <TableRow key={solution.uuid}>
                <TableCell>{solution.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => solution.data 
                      ? handleViewResult(solution.uuid)
                      : handleSolveClick(solution)
                    }
                    disabled={solvingLoading && selectedSolution?.uuid === solution.uuid}
                  >
                    {solvingLoading && selectedSolution?.uuid === solution.uuid ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent" />
                    ) : solution.data ? (
                      <IconEye className="w-4 h-4" />
                    ) : (
                      <IconPlayerPlay className="w-4 h-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewSolution(solution.uuid)}
                  >
                    <IconEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(solution.uuid)}
                  >
                    <IconTrash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={numSolutionsDialogOpen} onOpenChange={setNumSolutionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Number of Solutions</DialogTitle>
            <DialogDescription>
              Enter the number of solutions you want to generate
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={numSolutions}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setNumSolutions(Math.min(Math.max(value, 1), 5));
              }}
              min={1}
              max={5}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNumSolutionsDialogOpen(false)}
              disabled={solvingLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSolve}
              disabled={solvingLoading}
            >
              {solvingLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent" />
              ) : (
                "Solve"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 