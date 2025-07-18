'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconPlus, IconEdit, IconTrash, IconPlayerPlay, IconClipboardList, IconSearch } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SolutionSpace } from "../types/SolutionSpaces";
import * as SolutionSpacesService from "../services/SolutionSpaces";
import * as SolutionsService from "../services/Solutions";

export default function SolutionSpacesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [newSpaceName, setNewSpaceName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlayDialogOpen, setIsPlayDialogOpen] = useState(false);
  const [newSolutionName, setNewSolutionName] = useState("");
  const [selectedSpaceUuid, setSelectedSpaceUuid] = useState<string>("");
  const [solutionSpaces, setSolutionSpaces] = useState<SolutionSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSolutionSpaces();
  }, []);

  const fetchSolutionSpaces = async () => {
    try {
      setIsLoading(true);
      const spaces = await SolutionSpacesService.getAllSolutionSpaces();
      setSolutionSpaces(spaces);
      setError(null);
    } catch (err) {
      setError("Failed to fetch solution spaces");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    try {
      await SolutionSpacesService.createSolutionSpace(newSpaceName);
      setNewSpaceName("");
      setIsDialogOpen(false);
      // Refresh the list after creating
      await fetchSolutionSpaces();
    } catch (err) {
      console.error("Failed to create solution space:", err);
      setError("Failed to create solution space");
    }
  };

  const handleCreateSolution = async () => {
    try {
      await SolutionsService.createSolution(selectedSpaceUuid, { name: newSolutionName });
      setNewSolutionName("");
      setIsPlayDialogOpen(false);
      // Optionally refresh the list or show a success message
    } catch (err) {
      console.error("Failed to create solution:", err);
      setError("Failed to create solution");
    }
  };

  const filteredData = solutionSpaces.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Solution Spaces</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Solution Space</DialogTitle>
              <DialogDescription>
                Add a new entry to your solution spaces.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter solution space name"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreateSpace} disabled={!newSpaceName.trim()}>
                  Create Solution Space
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full relative">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search solution spaces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 pl-10"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Functions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((space) => (
              <TableRow key={space.uuid}>
                <TableCell>{space.name}</TableCell>
                <TableCell>{space.functions?.length ?? 0} functions</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {(space.results?.length ?? 0) > 0 && (
                      <Button variant="outline" size="sm">
                        <IconClipboardList className="w-4 h-4" />
                      </Button>
                    )}
                    {(space.functions?.length ?? 0) > 0 && (
                      <Dialog open={isPlayDialogOpen} onOpenChange={setIsPlayDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSpaceUuid(space.uuid)}
                          >
                            <IconPlayerPlay className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Solution</DialogTitle>
                            <DialogDescription>
                              Create a new solution in this solution space.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="solutionName">Solution Name</Label>
                              <Input
                                id="solutionName"
                                placeholder="Enter solution name"
                                value={newSolutionName}
                                onChange={(e) => setNewSolutionName(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end">
                              <Button onClick={handleCreateSolution} disabled={!newSolutionName.trim()}>
                                Create Solution
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button variant="outline" size="sm" onClick={() => router.push(`/solution-space?uuid=${space.uuid}`)}>
                      <IconEdit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <IconTrash className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 