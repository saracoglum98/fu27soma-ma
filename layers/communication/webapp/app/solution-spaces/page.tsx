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
import { useState } from "react";
import { SolutionSpace } from "@/app/types/SolutionSpace";

const data: SolutionSpace[] = [
  {
    uuid: "asdasdasd",
    name: "Test Solution Space 1",
    functions: ["test1", "test2"],
    results: null,
  },
  {
    uuid: "asdasdasd123",
    name: "Test Solution Space 2",
    functions: [],
    results: null,
  },
  {
    uuid: "asdasdasd1234",
    name: "Test Solution Space 3",
    functions: ['test1', 'test2', 'test3'],
    results: ['test1', 'test2', 'test3'],
  },
];

export default function SolutionSpacesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [newSpaceName, setNewSpaceName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateSpace = () => {
    // TODO: Implement creation logic
    console.log("Creating new space:", newSpaceName);
    setNewSpaceName("");
    setIsDialogOpen(false);
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      <Button variant="outline" size="sm">
                        <IconPlayerPlay className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
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