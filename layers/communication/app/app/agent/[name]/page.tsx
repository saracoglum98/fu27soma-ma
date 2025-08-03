"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { IconDeviceFloppy, IconArrowLeft } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";

import { getAgentByName, updateAgentByName } from "../../services/Agents";
import type { Agent } from "../../types/Agents";

export default function AgentPage() {
  const router = useRouter();
  const params = useParams();
  const agentName = params.name as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState("0.7");
  const [userPrompt, setUserPrompt] = useState("");
  const [outputSchema, setOutputSchema] = useState("");

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const data = await getAgentByName(agentName);
        setAgent(data);
        setSystemPrompt(data.prompt_system || "");
        setTemperature(data.temperature?.toString() || "0.7");
        setUserPrompt(data.prompt_user || "");
        setOutputSchema(data.output_schema || "");
      } catch (error) {
        console.error("Failed to fetch agent:", error);
      }
    };

    if (agentName) {
      fetchAgent();
    }
  }, [agentName]);

  const handleSave = async () => {
    if (!agent) return;

    try {
      const parsedTemp = parseFloat(temperature);
      if (isNaN(parsedTemp) || parsedTemp < 0 || parsedTemp > 1) {
        alert("Temperature must be a number between 0 and 1");
        return;
      }

      const updatedAgent = await updateAgentByName(agentName, {
        prompt_system: systemPrompt,
        temperature: parsedTemp,
        prompt_user: userPrompt,
        output_schema: outputSchema,
      });

      setAgent(updatedAgent);
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Failed to update agent:", error);
      alert("Failed to save changes");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!agent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
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
          <h1 className="text-2xl font-bold text-black">{agentName}</h1>
        </div>
        <Button onClick={handleSave}>
          <IconDeviceFloppy className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="flex gap-2">
        {/* Left Section - System Prompt */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">System Prompt</h2>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[400px] font-mono"
              placeholder="Enter system prompt..."
            />
          </div>
        </div>

        <Separator orientation="vertical" className="mx-4" />

        {/* Right Section - Temperature, User Prompt, Output Schema */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Temperature</h2>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">User Prompt</h2>
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="min-h-[150px] font-mono"
              placeholder="Enter user prompt..."
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Output Schema</h2>
            <Textarea
              value={outputSchema}
              onChange={(e) => setOutputSchema(e.target.value)}
              className="min-h-[150px] font-mono"
              placeholder="Enter JSON schema..."
            />
          </div>
        </div>
      </div>
    </div>
  );
} 