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
import { useState } from "react";

const data: KnowledgeItems[] = [
  {
    uuid: "asdasdasd",
    name: "Test Knowledge 1",
    url: "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf",
    length: 100,
  },
  {
    uuid: "asdasdasd12",
    name: "Test Knowledge 2",
    url: "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf",
    length: 100,
  },
];

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

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Knowledge Base</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Knowledge Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-input">Name</Label>
                <Input
                  id="name-input"
                  type="text"
                  placeholder="Enter a name for this knowledge item"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-input">Select File</Label>
                <Input
                  id="file-input"
                  type="file"
                  className="cursor-pointer"
                  accept=".txt,.pdf,.doc,.docx,.xlsx,.xls,.csv,.ppt,.pptx,.md"
                />
              </div>
              <Button className="w-full">Save</Button>
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
              <TableHead>Length</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.uuid}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.length}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    <IconEye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm"
                    onClick={() => handleDownload(item.url, `${item.name}.pdf`)}
                  >
                    <IconDownload className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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