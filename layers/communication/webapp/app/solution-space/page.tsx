"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MultiSelect } from "@/components/ui/multi-select";
import { IconEdit, IconTrash, IconPlus, IconArrowLeft } from "@tabler/icons-react";

import { SolutionSpace } from "@/app/types/SolutionSpaces";
import { Function } from "@/app/types/Functions";
import { getSolutionSpace, updateSolutionSpace, attachFunction, detachFunction } from "@/app/services/SolutionSpaces";
import { getAllFunctions, getFunction } from "@/app/services/Functions";
import { cn } from "@/lib/utils";

export default function SolutionSpacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");

  const [solutionSpace, setSolutionSpace] = useState<SolutionSpace | null>(null);
  const [solutionSpaceName, setSolutionSpaceName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [functions, setFunctions] = useState<Function[]>([]);
  const [availableFunctions, setAvailableFunctions] = useState<Function[]>([]);
  const [functionDialogOpen, setFunctionDialogOpen] = useState(false);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);

  useEffect(() => {
    if (uuid) {
      fetchSolutionSpace();
      fetchAvailableFunctions();
    }
  }, [uuid]);

  const fetchSolutionSpace = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSolutionSpace(uuid!);
      setSolutionSpace(data);
      setSolutionSpaceName(data.name);
      
      // Fetch all attached functions
      const functionPromises = (data.functions || []).map(async (functionUuid: string) => {
        try {
          return await getFunction(functionUuid);
        } catch (err) {
          console.error(`Failed to fetch function ${functionUuid}:`, err);
          return null;
        }
      });
      
      const fetchedFunctions = (await Promise.all(functionPromises)).filter((fn): fn is Function => fn !== null);
      setFunctions(fetchedFunctions);
    } catch (err) {
      setError("Failed to fetch solution space");
      console.error("Error fetching solution space:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableFunctions = async () => {
    try {
      const allFunctions = await getAllFunctions();
      setAvailableFunctions(allFunctions);
    } catch (err) {
      console.error("Error fetching available functions:", err);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!uuid) return;
      await updateSolutionSpace(uuid, solutionSpaceName);
      await fetchSolutionSpace();
    } catch (err) {
      setError("Failed to update solution space");
      console.error("Error updating solution space:", err);
    }
  };

  const handleAttachFunctions = async () => {
    try {
      if (!selectedFunctions.length) return;
      
      // Attach each selected function
      await Promise.all(
        selectedFunctions.map(functionUuid => attachFunction(uuid!, functionUuid))
      );
      
      setSelectedFunctions([]);
      setFunctionDialogOpen(false);
      await fetchSolutionSpace();
    } catch (err) {
      setError("Failed to attach functions");
      console.error("Error attaching functions:", err);
    }
  };

  const handleDetachFunction = async (functionUuid: string) => {
    try {
      await detachFunction(uuid!, functionUuid);
      await fetchSolutionSpace();
    } catch (err) {
      setError("Failed to detach function");
      console.error("Error detaching function:", err);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        {error}
        <Button onClick={fetchSolutionSpace} className="ml-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoBack}
            className="mb-4"
          >
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Edit Solution Space</h1>
        <div className="flex items-center space-x-4">
          <Input
            value={solutionSpaceName}
            onChange={(e) => setSolutionSpaceName(e.target.value)}
            className="w-[300px]"
            placeholder="Solution space name"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <h2 className="text-xl font-semibold">Functions</h2>
        <Dialog open={functionDialogOpen} onOpenChange={(open) => {
          if (open) {
            setSelectedFunctions(functions.map(fn => fn.uuid));
          }
          setFunctionDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="w-4 h-4 mr-2" />
              Attach Functions
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Attach Functions</DialogTitle>
              <DialogDescription>
                Select functions to attach to this solution space.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <MultiSelect
                options={availableFunctions.map(fn => ({
                  label: fn.name,
                  value: fn.uuid
                }))}
                onValueChange={setSelectedFunctions}
                placeholder="Select functions..."
                defaultValue={functions.map(fn => fn.uuid)}
                value={selectedFunctions}
              />
              <div className="flex justify-end">
                <Button onClick={handleAttachFunctions}>
                  Attach Selected Functions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Options Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {functions.map((fn) => (
              <TableRow key={fn.uuid}>
                <TableCell>{fn.name}</TableCell>
                <TableCell>
                  {(fn.options || []).length}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDetachFunction(fn.uuid)}
                  >
                    <IconTrash className="w-4 h-4" />
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
