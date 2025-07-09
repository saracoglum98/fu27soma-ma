"use client";

import { getAllKnowledgeItems } from "../services/KnowledgeItems";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { KnowledgeItems } from "../types/KnowledgeItems";

export default function TestPage() {
    const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItems[]>([]);

    useEffect(() => {
        getAllKnowledgeItems().then(setKnowledgeItems);
    }, []);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">API Test Calls</h1>
        </div>
        <p className="text-gray-600">Welcome to your test page.</p>
        <div className="flex items-center justify-between">
          <Button onClick={() => getAllKnowledgeItems()}>Get All Knowledge Items</Button>
        </div>
        <div className="flex items-center justify-between">
          <p>{knowledgeItems.length}</p>
        </div>
      </div>
    );
  }