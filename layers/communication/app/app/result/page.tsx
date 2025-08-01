'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Solution } from '../types/Solutions';
import { getSolution } from '../services/Solutions';

export default function ResultPage() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get('uuid');
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolution = async () => {
      if (!uuid) {
        setError('No solution UUID provided');
        setLoading(false);
        return;
      }

      try {
        const data = await getSolution(uuid);
        setSolution(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch solution');
        console.error('Error fetching solution:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [uuid]);

  if (loading) {
    return <div>Loading result...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!solution?.data) {
    return <div>No data available for this solution</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Solution Result: {solution.name}</h1>
      </div>
      
      <div className="rounded-md border p-4">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(solution.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
