'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BOTTLENECK_CATEGORIES } from '@/lib/hunter/categories';

export default function HunterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [runType, setRunType] = useState<'manual' | 'daily_scout' | 'weekly_deep'>('manual');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'AI-Agent Control Bottleneck',
    'Cybersecurity / Data Exfiltration Bottleneck',
  ]);
  const [minScore, setMinScore] = useState(75);
  const [maxAiAnalyses, setMaxAiAnalyses] = useState(20);
  const [maxQueriesPerCategory, setMaxQueriesPerCategory] = useState(2);

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleStartHunter = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/hunter/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runType,
          categories: selectedCategories,
          minScore,
          maxQueriesPerCategory,
          maxResultsPerQuery: 25,
          maxAiAnalyses,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start hunter');
      }

      router.push(`/hunter/runs/${data.runId}`);
    } catch (error) {
      console.error('Hunter start error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start hunter');
      setLoading(false);
    }
  };

  const handleProcessNext = async () => {
    setProcessing(true);

    try {
      const response = await fetch('/api/hunter/process-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxTasks: 2,
          maxAiAnalyses: 4,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process tasks');
      }

      alert(data.message || 'Tasks processed successfully');
    } catch (error) {
      console.error('Process error:', error);
      alert(error instanceof Error ? error.message : 'Failed to process tasks');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Opportunity Hunter</h1>
        <p className="text-gray-400 text-lg mb-8">
          Queue-based patent opportunity discovery. Searches are processed in small batches every 10 minutes.
        </p>

        {/* Queue Explanation */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-400">⚙️</span> Queue-Based Processing
          </h2>
          <p className="text-gray-300 mb-3">
            Hunter runs are processed in small batches every 10 minutes to avoid Netlify timeouts.
            When you start a run, tasks are queued and processed incrementally by the cron worker.
          </p>
          <p className="text-gray-300 text-sm">
            <strong>Daily Scout:</strong> 5 categories, 2 queries each, max 20 AI analyses.
          </p>
          <p className="text-gray-300 text-sm">
            <strong>Weekly Deep:</strong> All categories, 3 queries each, max 75 AI analyses.
          </p>
        </div>

        {/* Run Type */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium mb-3">Run Type</label>
          <div className="flex gap-3">
            <button
              onClick={() => setRunType('manual')}
              className={`px-4 py-2 rounded-lg font-medium ${
                runType === 'manual'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setRunType('daily_scout')}
              className={`px-4 py-2 rounded-lg font-medium ${
                runType === 'daily_scout'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Daily Scout
            </button>
            <button
              onClick={() => setRunType('weekly_deep')}
              className={`px-4 py-2 rounded-lg font-medium ${
                runType === 'weekly_deep'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Weekly Deep
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium mb-3">
            Categories ({selectedCategories.length} selected)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {BOTTLENECK_CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleToggleCategory(category)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Min Score (Pre-AI)</label>
              <input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max AI Analyses</label>
              <input
                type="number"
                value={maxAiAnalyses}
                onChange={(e) => setMaxAiAnalyses(parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Queries per Category</label>
              <input
                type="number"
                value={maxQueriesPerCategory}
                onChange={(e) => setMaxQueriesPerCategory(parseInt(e.target.value))}
                min="1"
                max="5"
                className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleStartHunter}
            disabled={loading || selectedCategories.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting Hunter...' : 'Start Hunter Run'}
          </button>

          <button
            onClick={handleProcessNext}
            disabled={processing}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Process Next Batch (Testing)'}
          </button>
        </div>

        {/* View Past Runs */}
        <div className="mt-6 text-center">
          <a href="/hunter/runs" className="text-indigo-400 hover:text-indigo-300">
            View Past Hunter Runs →
          </a>
        </div>

        {/* Rate Limit Note */}
        <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400">
          <strong>Rate-Limit Safe:</strong> PatentBoom uses metadata-only searches, caching, pre-AI filtering, 
          and sequential processing. Max 25 results per query, no auto-pagination, reuses existing reports.
          Tasks are processed in 10-minute intervals to avoid serverless timeouts.
        </div>
      </div>
    </div>
  );
}
