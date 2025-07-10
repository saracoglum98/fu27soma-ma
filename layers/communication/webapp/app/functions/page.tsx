"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconPlus, IconEdit, IconTrash, IconSearch } from "@tabler/icons-react"
import { useEffect, useState } from "react";
import { Function } from "@/app/types/Functions";
import { getAllFunctions, createFunction } from "@/app/services/Functions";
import { useRouter } from "next/navigation";

export default function FunctionsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [functionName, setFunctionName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [functions, setFunctions] = useState<Function[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunctions();
  }, []);

  const fetchFunctions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllFunctions();
      setFunctions(data);
    } catch (err) {
      setError("Failed to fetch functions");
      console.error("Error fetching functions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = functions.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const newFunction = await createFunction(functionName);
      setFunctions([...functions, newFunction]);
      setFunctionName("");
      setOpen(false);
    } catch (err) {
      setError("Failed to create function");
      console.error("Error creating function:", err);
    }
  };

  const handleEdit = (uuid: string) => {
    router.push(`/function?uuid=${uuid}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        {error}
        <Button onClick={fetchFunctions} className="ml-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Functions</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Function</DialogTitle>
              <DialogDescription>
                Add a new entry to your functions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Function Name</Label>
                <Input
                  id="name"
                  placeholder="Enter function name"
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Create Function</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full relative">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search functions..."
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
              <TableHead>Knowledge Count</TableHead>
              <TableHead>Options Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.uuid}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{(item.knowledge ?? []).length}</TableCell>
                <TableCell>{(item.options ?? []).length}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item.uuid)}
                  >
                    <IconEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
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