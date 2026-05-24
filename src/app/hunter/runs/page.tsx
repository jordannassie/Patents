'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HunterRun {
  id: string;
  run_type: string;
  name: string;
  status: string;
  categories: string[];
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  pending_tasks: number;
  total_queries: number;
  total_records_pulled: number;
  total_candidates_prescored: number;
  total_analyzed: number;
  total_saved: number;
  created_at: string;
  completed_at: string | null;
}

export default function HunterRunsPage() {
  const [runs, setRuns] = useState<HunterRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    try {
      const response = await fetch('/api/hunter/runs');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch runs');
      }

      setRuns(data.runs);
    } catch (err) {
      console.error('Failed to fetch runs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch runs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'running': return 'bg-blue-900/50 text-blue-300 border-blue-700';
      case 'failed': return 'bg-red-900/50 text-red-300 border-red-700';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const getRunTypeLabel = (runType: string) => {
    switch (runType) {
      case 'daily_scout': return 'Daily Scout';
      case 'weekly_deep': return 'Weekly Deep';
      case 'manual': return 'Manual';
      default: return runType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <p className="text-red-300">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Hunter Runs</h1>
            <p className="text-gray-400">View automated and manual opportunity hunter runs</p>
          </div>
          <Link
            href="/hunter"
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-medium"
          >
            Run New Hunter
          </Link>
        </div>

        {runs.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No hunter runs yet.</p>
            <Link
              href="/hunter"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Run your first hunter →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {runs.map((run) => (
              <Link
                key={run.id}
                href={`/hunter/runs/${run.id}`}
                className="block bg-gray-900 hover:bg-gray-800 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{run.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(run.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(run.status)}`}>
                      {run.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-700">
                      {getRunTypeLabel(run.run_type)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Categories</p>
                    <p className="text-white font-semibold">{Array.isArray(run.categories) ? run.categories.length : 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Progress</p>
                    <p className="text-white font-semibold">
                      {run.completed_tasks || 0}/{run.total_tasks || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Records</p>
                    <p className="text-white font-semibold">{run.total_records_pulled}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Analyzed</p>
                    <p className="text-white font-semibold">{run.total_analyzed}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Saved</p>
                    <p className="text-green-400 font-semibold text-lg">{run.total_saved}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
