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
import { getAllSolutions } from "../services/Solutions";
import { Solution } from "../types/Solutions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SolutionsPage() {
  const router = useRouter();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                <TableCell>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleViewSolution(solution.uuid)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 