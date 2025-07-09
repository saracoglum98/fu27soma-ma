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
import { IconPlus, IconEye, IconDownload, IconTrash, IconSearch } from "@tabler/icons-react";
import { KnowledgeItems } from "@/app/types/KnowledgeItems";
import { useState, useEffect } from "react";
import { getAllKnowledgeItems, deleteKnowledgeItem, createKnowledgeItem, uploadKnowledgeItem } from "@/app/services/KnowledgeItems";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 10MB in bytes

const formatSizeInMB = (bytes: number | null | undefined): string => {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${mb.toFixed(2)} MB` : `${Math.round(mb * 10) / 10} MB`;
};

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchKnowledgeItems();
  }, []);

  const fetchKnowledgeItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllKnowledgeItems();
      setKnowledgeItems(data);
    } catch (err) {
      setError('Failed to fetch knowledge items');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    try {
      await deleteKnowledgeItem(uuid);
      // Refresh the list after deletion
      await fetchKnowledgeItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleSave = async () => {
    if (!itemName || !selectedFile) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setIsSaving(true);
      // First create the knowledge item
      const createdItem = await createKnowledgeItem(itemName);
      
      // Then upload the file
      await uploadKnowledgeItem(createdItem.uuid, selectedFile);
      
      // Reset form and close dialog
      setItemName("");
      setSelectedFile(null);
      setIsDialogOpen(false);
      
      // Refresh the list
      await fetchKnowledgeItems();
    } catch (error) {
      console.error('Failed to save knowledge item:', error);
      alert('Failed to save knowledge item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredData = knowledgeItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

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
        <h1 className="text-2xl font-bold text-black">Knowledge Base</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Knowledge Item</DialogTitle>
              <DialogDescription>
                Max file size is 20MB. Allowed file types are .doc, .docx, .xlsx, .xls, .ppt, .pptx, .pdf, .csv, .txt, .xml, .json, .md, .zip.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-input">Name</Label>
                <Input
                  id="name-input"
                  type="text"
                  placeholder="Enter a name for this knowledge item"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-input">Select File (Max 10MB)</Label>
                <Input
                  id="file-input"
                  type="file"
                  className="cursor-pointer"
                  accept=".doc,.docx,.xlsx,.xls,.ppt,.pptx,.pdf,.csv,.txt,.xml,.json,.md,.zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > MAX_FILE_SIZE) {
                        setFileError("File size exceeds 10MB limit");
                        setSelectedFile(null);
                      } else {
                        setFileError(null);
                        setSelectedFile(file);
                      }
                    } else {
                      setFileError(null);
                      setSelectedFile(null);
                    }
                  }}
                />
                {fileError && (
                  <p className="text-sm text-red-500 mt-1">{fileError}</p>
                )}
              </div>
              <Button 
                className="w-full" 
                onClick={handleSave}
                disabled={isSaving || !itemName || !selectedFile}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full relative">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search knowledge base..."
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
              <TableHead>File Type</TableHead>
              <TableHead>File Size</TableHead>
              <TableHead>Content Length</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.uuid}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{formatSizeInMB(item.size)}</TableCell>
                <TableCell>{item.length}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!item.url}
                    onClick={() => item.url && handleDownload(item.url, `${item.name}.pdf`)}
                  >
                    <IconDownload className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(item.uuid)}
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