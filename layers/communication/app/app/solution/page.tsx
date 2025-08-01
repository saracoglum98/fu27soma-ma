"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowLeft } from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Solution, SolutionDisplayResponse } from "@/app/types/Solutions";
import { getSolution, updateSolution, displaySolution } from "@/app/services/Solutions";

export default function SolutionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");

  const [solutionData, setSolutionData] = useState<Solution | null>(null);
  const [displayData, setDisplayData] = useState<SolutionDisplayResponse | null>(null);
  const [solutionName, setSolutionName] = useState("");
  const [customerRequirements, setCustomerRequirements] = useState("");
  const [businessRequirements, setBusinessRequirements] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("text");
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

  useEffect(() => {
    if (uuid) {
      fetchSolution();
      fetchDisplayData();
    }
  }, [uuid]);

  const fetchSolution = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSolution(uuid!);
      setSolutionData(data);
      setSolutionName(data.name);
      setCustomerRequirements(data.req_customer || "");
      setBusinessRequirements(data.req_business || "");
    } catch (err) {
      setError("Failed to fetch solution");
      console.error("Error fetching solution:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDisplayData = async () => {
    try {
      if (!uuid) return;
      const data = await displaySolution(uuid);
      console.log("Display data received:", data);
      console.log("Table data:", data.table);
      console.log("Table keys:", Object.keys(data.table || {}));
      setDisplayData(data);
    } catch (err) {
      console.error("Error fetching display data:", err);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!uuid) return;
      await updateSolution(uuid, {
        name: solutionName,
        req_customer: customerRequirements,
        req_business: businessRequirements,
      });
      await fetchSolution();
      await fetchDisplayData(); // Refresh display data after save
    } catch (err) {
      setError("Failed to update solution");
      console.error("Error updating solution:", err);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size exceeds 20 MB limit");
      return;
    }
    
    setFileError(null);
    // File processing will be implemented later
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
        <Button onClick={fetchSolution} className="ml-2">
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
        <h1 className="text-2xl font-bold">Edit Solution</h1>
        <div className="flex items-center space-x-4">
          <Input
            value={solutionName}
            onChange={(e) => setSolutionName(e.target.value)}
            className="w-[300px]"
            placeholder="Solution name"
          />
        </div>
      </div>
      
      {displayData?.table && Object.keys(displayData.table).length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Functions and Options</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Function</TableHead>
                  <TableHead>Available Options</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(displayData.table).map(([functionName, options]) => {
                  return (
                    <TableRow key={functionName}>
                      <TableCell className="font-medium">{functionName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {options.map((option, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-gray-100 rounded-md text-sm"
                            >
                              {option}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Business Requirements</h2>
        <Textarea
          value={businessRequirements}
          onChange={(e) => setBusinessRequirements(e.target.value)}
          placeholder="Enter business requirements..."
          className="min-h-[200px]"
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Customer Requirements</h2>
        <Tabs defaultValue="text" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="text">Textual Input</TabsTrigger>
            <TabsTrigger value="file">From File</TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <Textarea
              value={customerRequirements}
              onChange={(e) => setCustomerRequirements(e.target.value)}
              placeholder="Enter customer requirements..."
              className="min-h-[200px]"
            />
          </TabsContent>
          <TabsContent value="file">
            <div className="space-y-4">
              <Input
                id="file-input"
                type="file"
                className="cursor-pointer"
                accept=".doc,.docx,.xlsx,.xls,.ppt,.pptx,.pdf,.csv,.txt,.xml,.json,.md,.zip"
                onChange={handleFileUpload}
              />
              {fileError && (
                <p className="text-sm text-red-500 mt-1">{fileError}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
