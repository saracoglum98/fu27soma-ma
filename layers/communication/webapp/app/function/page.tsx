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

import { Function } from "@/app/types/Functions";
import { Option } from "@/app/types/Options";
import { KnowledgeItems } from "@/app/types/KnowledgeItems";
import { getFunction, updateFunction, attachOption, detachOption } from "@/app/services/Functions";
import { createOption, updateOption, deleteOption, attachKnowledge, detachKnowledge } from "@/app/services/Options";
import { getAllKnowledgeItems } from "@/app/services/KnowledgeItems";
import { getOption } from "@/app/services/Options";

export default function FunctionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");

  const [functionData, setFunctionData] = useState<Function | null>(null);
  const [functionName, setFunctionName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItems[]>([]);
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [newOptionName, setNewOptionName] = useState("");
  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>([]);
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (uuid) {
      fetchFunction();
      fetchKnowledgeItems();
    }
  }, [uuid]);

  const fetchFunction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getFunction(uuid!);
      setFunctionData(data);
      setFunctionName(data.name);
      
      // Fetch all options
      const optionPromises = (data.options || []).map(async (optionUuid: string) => {
        try {
          return await getOption(optionUuid);
        } catch (err) {
          console.error(`Failed to fetch option ${optionUuid}:`, err);
          return null;
        }
      });
      
      const fetchedOptions = (await Promise.all(optionPromises)).filter((opt): opt is Option => opt !== null);
      setOptions(fetchedOptions);
    } catch (err) {
      setError("Failed to fetch function");
      console.error("Error fetching function:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKnowledgeItems = async () => {
    try {
      const items = await getAllKnowledgeItems();
      setKnowledgeItems(items);
    } catch (err) {
      console.error("Error fetching knowledge items:", err);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!uuid) return;
      await updateFunction(uuid, functionName);
      await fetchFunction();
    } catch (err) {
      setError("Failed to update function");
      console.error("Error updating function:", err);
    }
  };

  const handleCreateOption = async () => {
    try {
      // Create the option
      const newOption = await createOption(newOptionName);
      
      // Attach selected knowledge items
      for (const knowledgeUuid of selectedKnowledge) {
        await attachKnowledge(newOption.uuid, knowledgeUuid);
      }

      // Attach option to function
      await attachOption(uuid!, newOption.uuid);
      
      // Reset form and refresh data
      setNewOptionName("");
      setSelectedKnowledge([]);
      setOptionDialogOpen(false);
      await fetchFunction();
    } catch (err) {
      setError("Failed to create option");
      console.error("Error creating option:", err);
    }
  };

  const handleUpdateOption = async () => {
    try {
      if (!editingOption) return;

      // Update option name
      await updateOption(editingOption.uuid, newOptionName);

      // Get current knowledge items
      const currentKnowledge = editingOption.knowledge || [];

      // Detach removed knowledge items
      for (const knowledgeUuid of currentKnowledge) {
        if (!selectedKnowledge.includes(knowledgeUuid)) {
          await detachKnowledge(editingOption.uuid, knowledgeUuid);
        }
      }

      // Attach new knowledge items
      for (const knowledgeUuid of selectedKnowledge) {
        if (!currentKnowledge.includes(knowledgeUuid)) {
          await attachKnowledge(editingOption.uuid, knowledgeUuid);
        }
      }

      // Reset form and refresh data
      setEditingOption(null);
      setNewOptionName("");
      setSelectedKnowledge([]);
      setOptionDialogOpen(false);
      await fetchFunction();
    } catch (err) {
      setError("Failed to update option");
      console.error("Error updating option:", err);
    }
  };

  const handleDeleteOption = async (optionUuid: string) => {
    try {
      // Detach option from function first
      await detachOption(uuid!, optionUuid);
      // Then delete the option
      await deleteOption(optionUuid);
      await fetchFunction();
    } catch (err) {
      setError("Failed to delete option");
      console.error("Error deleting option:", err);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const openEditDialog = (option: Option) => {
    setEditingOption(option);
    setNewOptionName(option.name);
    setSelectedKnowledge(option.knowledge || []);
    setOptionDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingOption(null);
    setNewOptionName("");
    setSelectedKnowledge([]);
    setOptionDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        {error}
        <Button onClick={fetchFunction} className="ml-2">
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
        <h1 className="text-2xl font-bold">Edit Function</h1>
        <div className="flex items-center space-x-4">
          <Input
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            className="w-[300px]"
            placeholder="Function name"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <h2 className="text-xl font-semibold">Options</h2>
        <Dialog open={optionDialogOpen} onOpenChange={setOptionDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <IconPlus className="w-4 h-4 mr-2" />
              New Option
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingOption ? "Edit Option" : "Create New Option"}
              </DialogTitle>
              <DialogDescription>
                {editingOption
                  ? "Edit the option details below."
                  : "Add a new option to your function."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>Option Name</label>
                <Input
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  placeholder="Enter option name"
                />
              </div>
              <div className="space-y-2">
                <label>Knowledge Items</label>
                <MultiSelect
                  options={knowledgeItems.map((item) => ({
                    label: item.name,
                    value: item.uuid,
                  }))}
                  defaultValue={selectedKnowledge}
                  onValueChange={setSelectedKnowledge}
                  placeholder="Select knowledge items..."
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={editingOption ? handleUpdateOption : handleCreateOption}
                >
                  {editingOption ? "Save Changes" : "Create Option"}
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
              <TableHead>Knowledge Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.map((option) => (
              <TableRow key={option.uuid}>
                <TableCell>{option.name}</TableCell>
                <TableCell>
                  {(option.knowledge || []).length}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(option)}
                  >
                    <IconEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteOption(option.uuid)}
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
