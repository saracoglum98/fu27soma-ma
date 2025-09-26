"use client";

import { Suspense } from "react";
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
import { convertFile } from "@/app/services/Utils";

function SolutionContent() {
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [uploadedBusinessFile, setUploadedBusinessFile] = useState<File | null>(null);
  const [businessMarkdownContent, setBusinessMarkdownContent] = useState<string>("");
  const [isConvertingBusiness, setIsConvertingBusiness] = useState(false);
  const [businessFileError, setBusinessFileError] = useState<string | null>(null);
  const [businessActiveTab, setBusinessActiveTab] = useState("text");
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
      
      // Use markdown content if file is uploaded, otherwise use the text input
      const customerReqContent = uploadedFile ? markdownContent : customerRequirements;
      const businessReqContent = uploadedBusinessFile ? businessMarkdownContent : businessRequirements;
      
      await updateSolution(uuid, {
        name: solutionName,
        req_customer: customerReqContent,
        req_business: businessReqContent,
      });
      await fetchSolution();
      await fetchDisplayData(); // Refresh display data after save
    } catch (err) {
      setError("Failed to update solution");
      console.error("Error updating solution:", err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size exceeds 20 MB limit");
      return;
    }
    
    setFileError(null);
    setIsConverting(true);
    
    try {
      const markdown = await convertFile(file);
      setUploadedFile(file);
      setMarkdownContent(markdown);
      setCustomerRequirements(markdown); // Update the textarea with markdown content
      setActiveTab("file"); // Switch to file tab to show uploaded file info
    } catch (err) {
      setFileError("Failed to convert file to markdown");
      console.error("Error converting file:", err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleBusinessFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setBusinessFileError("File size exceeds 20 MB limit");
      return;
    }
    
    setBusinessFileError(null);
    setIsConvertingBusiness(true);
    
    try {
      const markdown = await convertFile(file);
      setUploadedBusinessFile(file);
      setBusinessMarkdownContent(markdown);
      setBusinessRequirements(markdown); // Update the textarea with markdown content
      setBusinessActiveTab("file"); // Switch to file tab to show uploaded file info
    } catch (err) {
      setBusinessFileError("Failed to convert file to markdown");
      console.error("Error converting business file:", err);
    } finally {
      setIsConvertingBusiness(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setMarkdownContent("");
    setCustomerRequirements(""); // Clear the textarea
    setFileError(null);
    setActiveTab("text"); // Switch back to text tab
    // Reset the file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemoveBusinessFile = () => {
    setUploadedBusinessFile(null);
    setBusinessMarkdownContent("");
    setBusinessRequirements(""); // Clear the textarea
    setBusinessFileError(null);
    setBusinessActiveTab("text"); // Switch back to text tab
    // Reset the file input
    const fileInput = document.getElementById('business-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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
        <Tabs defaultValue="text" className="w-full" onValueChange={setBusinessActiveTab}>
          <TabsList>
            <TabsTrigger value="text">Textual Input</TabsTrigger>
            <TabsTrigger value="file">From File</TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <Textarea
              value={businessRequirements}
              onChange={(e) => setBusinessRequirements(e.target.value)}
              placeholder="Enter business requirements..."
              className="min-h-[200px]"
              disabled={!!uploadedBusinessFile}
            />
            {uploadedBusinessFile && (
              <p className="text-sm text-gray-500 mt-2">
                Text input is disabled because a file is uploaded. Remove the file to enable text editing.
              </p>
            )}
          </TabsContent>
          <TabsContent value="file">
            <div className="space-y-4">
              {!uploadedBusinessFile ? (
                <Input
                  id="business-file-input"
                  type="file"
                  className="cursor-pointer"
                  accept=".doc,.docx,.xlsx,.xls,.ppt,.pptx,.pdf,.csv,.txt,.xml,.json,.md,.zip"
                  onChange={handleBusinessFileUpload}
                  disabled={isConvertingBusiness}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{uploadedBusinessFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(uploadedBusinessFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveBusinessFile}
                      disabled={isConvertingBusiness}
                    >
                      Remove
                    </Button>
                  </div>
                  {isConvertingBusiness && (
                    <p className="text-sm text-blue-600">Converting file to markdown...</p>
                  )}
                </div>
              )}
              {businessFileError && (
                <p className="text-sm text-red-500 mt-1">{businessFileError}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
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
              disabled={!!uploadedFile}
            />
            {uploadedFile && (
              <p className="text-sm text-gray-500 mt-2">
                Text input is disabled because a file is uploaded. Remove the file to enable text editing.
              </p>
            )}
          </TabsContent>
          <TabsContent value="file">
            <div className="space-y-4">
              {!uploadedFile ? (
                <Input
                  id="file-input"
                  type="file"
                  className="cursor-pointer"
                  accept=".doc,.docx,.xlsx,.xls,.ppt,.pptx,.pdf,.csv,.txt,.xml,.json,.md,.zip"
                  onChange={handleFileUpload}
                  disabled={isConverting}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveFile}
                      disabled={isConverting}
                    >
                      Remove
                    </Button>
                  </div>
                  {isConverting && (
                    <p className="text-sm text-blue-600">Converting file to markdown...</p>
                  )}
                </div>
              )}
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

export default function SolutionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SolutionContent />
    </Suspense>
  );
}
