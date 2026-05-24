'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BOTTLENECK_CATEGORIES } from '@/lib/hunter/categories';

interface HunterStatus {
  status: 'idle' | 'pending' | 'running' | 'completed' | 'failed';
  runningRunId: string | null;
  pendingTasks: number;
  runningTasks: number;
  lastWorkerStartedAt: string | null;
  lastWorkerCompletedAt: string | null;
  lastWorkerStatus: string | null;
  lastWorkerMessage: string | null;
  lastWorkerTasksProcessed: number;
  lastWorkerAiAnalysesUsed: number;
  lastWorkerItemsSaved: number;
  workerIntervalMinutes: number;
  nextExpectedWorkerRunAt: string | null;
  secondsUntilNextExpectedRun: number;
  lastRunCreatedAt: string | null;
  lastRunCompletedAt: string | null;
  lastRunName: string | null;
}

interface WorkerLog {
  id: string;
  source: string;
  status: string;
  message: string | null;
  tasks_processed: number;
  ai_analyses_used: number;
  items_saved: number;
  created_at: string;
  error_message: string | null;
}

interface Opportunity {
  id: string;
  title: string;
  category: string;
  pre_ai_score: number;
  opportunity_score: number | null;
  recommendation: string | null;
  bottleneck_reason: string;
  patent_result_id: string;
}

interface RunningRun {
  id: string;
  name: string;
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  pending_tasks: number;
  total_records_pulled: number;
  total_analyzed: number;
  total_saved: number;
}

export default function HunterPage() {
  const router = useRouter();
  const [hunterStatus, setHunterStatus] = useState<HunterStatus | null>(null);
  const [runningRun, setRunningRun] = useState<RunningRun | null>(null);
  const [activityLogs, setActivityLogs] = useState<WorkerLog[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [countdown, setCountdown] = useState(0);
  
  // Form state
  const [showControls, setShowControls] = useState(false);
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

  // Fetch all data
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  // Update countdown every second
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      if (hunterStatus && hunterStatus.secondsUntilNextExpectedRun > 0) {
        setCountdown(Math.max(0, hunterStatus.secondsUntilNextExpectedRun - 1));
      } else {
        setCountdown(0);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [hunterStatus]);

  // Initialize countdown when status changes
  useEffect(() => {
    if (hunterStatus) {
      setCountdown(hunterStatus.secondsUntilNextExpectedRun);
    }
  }, [hunterStatus]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchHunterStatus(),
      fetchActivityLogs(),
      fetchOpportunities(),
    ]);
  };

  const fetchHunterStatus = async () => {
    try {
      const response = await fetch('/api/hunter/status');
      const data = await response.json();
      setHunterStatus(data);

      // Fetch running run details if exists
      if (data.runningRunId) {
        const runResponse = await fetch(`/api/hunter/runs/${data.runningRunId}`);
        const runData = await runResponse.json();
        setRunningRun(runData.run);
      } else {
        setRunningRun(null);
      }
    } catch (error) {
      console.error('Failed to fetch hunter status:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch('/api/hunter/activity?limit=10');
      const data = await response.json();
      setActivityLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/hunter/opportunities?limit=5');
      const data = await response.json();
      setOpportunities(data.opportunities || []);
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Processing patent intelligence';
      case 'pending': return 'Queued tasks waiting';
      case 'idle': return 'Standing by for next scan';
      case 'completed': return 'Latest run completed';
      case 'failed': return 'Worker requires attention';
      default: return 'Initializing...';
    }
  };

  const getPipelineStatus = (stage: number) => {
    if (!hunterStatus) return 'inactive';
    if (hunterStatus.status === 'running') return stage <= 3 ? 'active' : 'queued';
    if (hunterStatus.pendingTasks > 0) return 'queued';
    if (hunterStatus.status === 'completed' || hunterStatus.status === 'idle') return 'complete';
    if (hunterStatus.status === 'failed') return 'failed';
    return 'inactive';
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

      setShowControls(false);
      await fetchAllData();
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

      await fetchAllData();
      alert(data.message || 'Tasks processed successfully');
    } catch (error) {
      console.error('Process error:', error);
      alert(error instanceof Error ? error.message : 'Failed to process tasks');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              PatentBoom Hunter Engine
            </h1>
            <span className="px-3 py-1 text-xs font-bold text-green-400 bg-green-900/30 border border-green-700 rounded-full uppercase tracking-wider">
              LIVE AUTOMATION
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            Automated bottleneck intelligence for discovering patent-backed venture opportunities.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Hunter is the main engine. Manual Search is for one-off research.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowControls(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Start New Run
            </button>
            <Link
              href="/hunter/runs"
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors border border-gray-700 inline-flex items-center"
            >
              View Runs
            </Link>
            <Link
              href="/search"
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors border border-gray-700 inline-flex items-center"
            >
              Manual Search
            </Link>
          </div>
        </div>

        {/* Engine Status Hero */}
        {hunterStatus ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-8 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-4 h-4 rounded-full ${
                      hunterStatus.status === 'failed' ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    {hunterStatus.status !== 'failed' && (
                      <div className={`absolute inset-0 w-4 h-4 rounded-full bg-green-500 animate-ping opacity-75`}></div>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-white">Hunter Engine Online</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div className="text-xl font-medium text-white mb-4">
                    {getStatusText(hunterStatus.status)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Next Worker Batch</div>
                  <div className="text-3xl font-bold text-indigo-400">
                    {hunterStatus.nextExpectedWorkerRunAt ? (
                      countdown > 0 ? (
                        formatCountdown(countdown)
                      ) : (
                        <span className="text-xl text-yellow-400">Waiting for cron...</span>
                      )
                    ) : (
                      <span className="text-xl text-gray-500">Not scheduled</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Cron checks the queue every 10 minutes and processes the next batch.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-8 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
            <div className="relative flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 rounded-full bg-gray-600 animate-pulse"></div>
                  <span className="text-xl font-medium text-gray-400">Connecting to Hunter Engine...</span>
                </div>
                <p className="text-sm text-gray-600">Loading automation status</p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        {hunterStatus && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Pending Tasks</div>
              <div className="text-2xl font-bold text-blue-400">{hunterStatus.pendingTasks}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Running Tasks</div>
              <div className="text-2xl font-bold text-green-400">{hunterStatus.runningTasks}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Last Batch</div>
              <div className="text-2xl font-bold text-white">{hunterStatus.lastWorkerTasksProcessed}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">AI Analyses</div>
              <div className="text-2xl font-bold text-purple-400">{hunterStatus.lastWorkerAiAnalysesUsed}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Saved</div>
              <div className="text-2xl font-bold text-emerald-400">{hunterStatus.lastWorkerItemsSaved}</div>
            </div>
          </div>
        )}

        {/* Live Pipeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Live Pipeline</h2>
          <div className="grid grid-cols-5 gap-2">
            {['Search USPTO', 'Pre-score', 'AI Analyze', 'Save Opps', 'Build Reports'].map((stage, idx) => {
              const status = getPipelineStatus(idx);
              return (
                <div key={idx} className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                    status === 'active' ? 'bg-green-500 animate-pulse' :
                    status === 'queued' ? 'bg-blue-500' :
                    status === 'complete' ? 'bg-gray-600' :
                    status === 'failed' ? 'bg-red-500' :
                    'bg-gray-800'
                  }`}></div>
                  <div className="text-xs text-gray-400">{stage}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Queue Progress */}
          {runningRun ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Queue Progress</h2>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Tasks</span>
                  <span className="text-white">{runningRun.completed_tasks} / {runningRun.total_tasks}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${(runningRun.completed_tasks / runningRun.total_tasks) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Completed:</span>
                  <span className="ml-2 text-white">{runningRun.completed_tasks}</span>
                </div>
                <div>
                  <span className="text-gray-500">Pending:</span>
                  <span className="ml-2 text-white">{runningRun.pending_tasks}</span>
                </div>
                <div>
                  <span className="text-gray-500">Records:</span>
                  <span className="ml-2 text-white">{runningRun.total_records_pulled}</span>
                </div>
                <div>
                  <span className="text-gray-500">Analyzed:</span>
                  <span className="ml-2 text-white">{runningRun.total_analyzed}</span>
                </div>
              </div>
              <Link 
                href={`/hunter/runs/${runningRun.id}`}
                className="mt-4 block text-center text-sm text-indigo-400 hover:text-indigo-300"
              >
                View Run Details →
              </Link>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center justify-center text-center">
              <div>
                <div className="text-gray-500 mb-2">No Hunter run is active.</div>
                <div className="text-sm text-gray-600">
                  Start a manual run to begin scanning future bottlenecks.
                </div>
              </div>
            </div>
          )}

          {/* Live Activity Feed */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-white">Live Activity Feed</h2>
            <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto">
              {activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <div key={log.id} className="text-gray-400">
                    <span className="text-gray-600">
                      [{new Date(log.created_at).toLocaleTimeString()}]
                    </span>{' '}
                    <span className={
                      log.status === 'completed' ? 'text-green-400' :
                      log.status === 'failed' ? 'text-red-400' :
                      log.status === 'idle' ? 'text-gray-500' :
                      'text-blue-400'
                    }>
                      {log.source}/{log.status}
                    </span>
                    {' — '}
                    {log.error_message || log.message || 'Processing...'}
                  </div>
                ))
              ) : (
                <div className="text-gray-600 text-center py-8">
                  Waiting for first worker check…
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Latest Opportunities */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Latest Opportunities</h2>
          {opportunities.length > 0 ? (
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div key={opp.id} className="bg-gray-800 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{opp.title}</h3>
                      {opp.opportunity_score ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-900/50 text-green-400 rounded">
                          AI Report Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-900/50 text-blue-400 rounded">
                          Pre-AI Candidate
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500">{opp.category}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-blue-400">{opp.bottleneck_reason}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-400">
                        {opp.opportunity_score || opp.pre_ai_score}
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                    {opp.recommendation && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        opp.recommendation === 'BUILD NOW' ? 'bg-green-900/50 text-green-400' :
                        opp.recommendation === 'STRONG WATCH' ? 'bg-blue-900/50 text-blue-400' :
                        'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {opp.recommendation}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 text-sm">
              Saved opportunities will appear here as the Hunter finds high-scoring patent ideas.
            </div>
          )}
          <div className="mt-4 text-xs text-gray-600">
            Note: Pre-AI Candidates are saved based on pre-scoring only. 
            Full AI analysis can be run separately for detailed reports.
          </div>
        </div>

        {/* Run Controls */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <button
            onClick={() => setShowControls(!showControls)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-lg font-semibold text-white">Run Controls</h2>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${showControls ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showControls && (
            <div className="mt-6 space-y-4">
              {/* Run Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Run Type</label>
                <div className="flex gap-2">
                  {['manual', 'daily_scout', 'weekly_deep'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setRunType(type as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        runType === type
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {type === 'manual' ? 'Manual' : type === 'daily_scout' ? 'Daily Scout' : 'Weekly Deep'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">
                  Categories ({selectedCategories.length} selected)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-gray-800 rounded-lg p-3">
                  {BOTTLENECK_CATEGORIES.map((category) => (
                    <label key={category} className="flex items-center gap-2 text-sm hover:bg-gray-700 p-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleToggleCategory(category)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Min Score</label>
                  <input
                    type="number"
                    value={minScore}
                    onChange={(e) => setMinScore(parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Max AI Analyses</label>
                  <input
                    type="number"
                    value={maxAiAnalyses}
                    onChange={(e) => setMaxAiAnalyses(parseInt(e.target.value))}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Queries/Category</label>
                  <input
                    type="number"
                    value={maxQueriesPerCategory}
                    onChange={(e) => setMaxQueriesPerCategory(parseInt(e.target.value))}
                    min="1"
                    max="5"
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStartHunter}
                  disabled={loading || selectedCategories.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Starting...' : 'Start Manual Run'}
                </button>
                <button
                  onClick={handleProcessNext}
                  disabled={processing}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
                >
                  {processing ? 'Processing...' : 'Process Next Batch Now'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-gray-600">
          Timer reflects the next expected cron check based on the latest recorded worker log. 
          The external scheduler controls the actual trigger.
        </div>

        {/* View Runs Link */}
        <div className="mt-4 text-center">
          <Link href="/hunter/runs" className="text-indigo-400 hover:text-indigo-300 text-sm">
            View All Hunter Runs →
          </Link>
        </div>
      </div>
    </div>
  );
}
