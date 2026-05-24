'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface HunterRun {
  id: string;
  run_type: string;
  name: string;
  status: string;
  categories: string[];
  total_queries: number;
  total_records_pulled: number;
  total_candidates_prescored: number;
  total_analyzed: number;
  total_saved: number;
  min_score: number;
  max_ai_analyses: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

interface HunterTask {
  id: string;
  category: string;
  query: string;
  status: string;
  results_count: number;
  candidates_selected: number;
  analyzed_count: number;
  saved_count: number;
}

interface HunterItem {
  id: string;
  category: string;
  query: string;
  title: string;
  patent_number: string;
  status_estimate: string;
  pre_ai_score: number;
  opportunity_score: number | null;
  recommendation: string | null;
  bottleneck_reason: string;
  modernization_angle: string | null;
}

export default function HunterRunDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [run, setRun] = useState<HunterRun | null>(null);
  const [tasks, setTasks] = useState<HunterTask[]>([]);
  const [items, setItems] = useState<HunterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRunDetails();
    }
  }, [id]);

  const fetchRunDetails = async () => {
    try {
      const response = await fetch(`/api/hunter/runs/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch run details');
      }

      setRun(data.run);
      setTasks(data.tasks);
      setItems(data.items);
    } catch (err) {
      console.error('Failed to fetch run details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch run details');
    } finally {
      setLoading(false);
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

  if (error || !run) {
    return (
      <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <p className="text-red-300">Error: {error || 'Run not found'}</p>
            <Link href="/hunter/runs" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">
              ← Back to Runs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/hunter/runs" className="text-indigo-400 hover:text-indigo-300 mb-6 inline-block">
          ← Back to Runs
        </Link>

        {/* Run Summary */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{run.name}</h1>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
            <div>
              <p className="text-gray-500 text-xs mb-1">Status</p>
              <p className="text-white font-semibold">{run.status}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Type</p>
              <p className="text-white font-semibold">{run.run_type}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Records Pulled</p>
              <p className="text-white font-semibold">{run.total_records_pulled}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Pre-scored</p>
              <p className="text-white font-semibold">{run.total_candidates_prescored}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">AI Analyzed</p>
              <p className="text-white font-semibold">{run.total_analyzed}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Saved</p>
              <p className="text-green-400 font-semibold text-lg">{run.total_saved}</p>
            </div>
          </div>

          <div className="flex gap-4 text-sm text-gray-400">
            <span>Created: {new Date(run.created_at).toLocaleString()}</span>
            {run.completed_at && <span>Completed: {new Date(run.completed_at).toLocaleString()}</span>}
          </div>

          {run.error_message && (
            <div className="mt-4 bg-red-900/20 border border-red-800 rounded p-3">
              <p className="text-red-300 text-sm">Error: {run.error_message}</p>
            </div>
          )}
        </div>

        {/* Tasks Breakdown */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Tasks ({tasks.length})</h2>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{task.category}</p>
                    <p className="text-sm text-gray-400">{task.query}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' ? 'bg-green-900/50 text-green-300' :
                    task.status === 'failed' ? 'bg-red-900/50 text-red-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>Results: {task.results_count}</span>
                  <span>Selected: {task.candidates_selected}</span>
                  <span>Analyzed: {task.analyzed_count}</span>
                  <span>Saved: {task.saved_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Opportunities */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Saved Opportunities ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-gray-400">No opportunities saved from this run.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">Patent: {item.patent_number}</p>
                      <p className="text-sm text-indigo-300 mb-2">{item.bottleneck_reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-400 mb-1">
                        {item.pre_ai_score}
                      </div>
                      <p className="text-xs text-gray-500">Pre-AI Score</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-700 rounded">{item.category}</span>
                    <span className="px-2 py-1 bg-gray-700 rounded">{item.status_estimate}</span>
                    {item.recommendation && (
                      <span className="px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded">
                        {item.recommendation}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
