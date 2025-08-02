"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getDashboardStats } from "./services/Views";

export default function DashboardPage() {
  const [data, setData] = useState({
    knowledge_items: 0,
    kpis: 0,
    options: 0,
    functions: 0,
    solution_spaces: 0,
    solutions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getDashboardStats();
      setData(stats);
    } catch (error) {
      setError('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
      </div>
      
      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading dashboard stats...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Total items in the knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.knowledge_items}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>KPIs</CardTitle>
              <CardDescription>Active KPIs being tracked</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.kpis}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
              <CardDescription>Options in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.options}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Functions</CardTitle>
              <CardDescription>Functions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.functions}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solution Spaces</CardTitle>
              <CardDescription>Solution Spaces in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.solution_spaces}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solutions</CardTitle>
              <CardDescription>Solutions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.solutions}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
