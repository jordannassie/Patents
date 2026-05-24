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
  hasWorkerLogs: boolean;
  hasActiveRun: boolean;
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
      
      // Refresh all data immediately to show "Ready now" status
      await fetchAllData();
      
      // Scroll to the Engine Status Hero to show the "Ready now" timer
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      console.log(`Hunter run started: ${data.runId}, ${data.totalTasks} tasks queued`);
    } catch (error) {
      console.error('Hunter start error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start hunter');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessNext = async () => {
    setProcessing(true);

    try {
      // Use safe manual-process route instead of calling process-next directly
      const response = await fetch('/api/hunter/manual-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process tasks');
      }

      // Refresh all data to show updated status and countdown
      await fetchAllData();
      
      console.log('Batch processed:', data.message || 'Success');
    } catch (error) {
      console.error('Process error:', error);
      alert(error instanceof Error ? error.message : 'Failed to process tasks');
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickScout = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/hunter/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runType: 'manual',
          categories: [
            'AI-Agent Control Bottleneck',
            'Cybersecurity / Data Exfiltration Bottleneck',
            'Crypto Irreversible Transaction Bottleneck',
            'Defense Autonomy / Command Bottleneck',
          ],
          minScore: 75,
          maxQueriesPerCategory: 1,
          maxResultsPerQuery: 25,
          maxAiAnalyses: 8,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to start hunter');
      }

      setShowControls(false);
      
      // Refresh all data immediately to show "Ready now" status
      await fetchAllData();
      
      // Scroll to the Engine Status Hero to show the "Ready now" timer
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      console.log(`Quick Scout Run started: ${data.runId}, ${data.totalTasks} tasks queued`);
    } catch (error) {
      console.error('Quick Scout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start Quick Scout');
    } finally {
      setLoading(false);
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

        {/* Empty State Onboarding - Show when no runs and no worker logs */}
        {hunterStatus && 
         hunterStatus.pendingTasks === 0 && 
         hunterStatus.runningTasks === 0 && 
         activityLogs.length === 0 && 
         !hunterStatus.lastRunCreatedAt && (
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-2 border-indigo-500/50 rounded-xl p-8 mb-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/20 mb-4">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Start the Hunter Engine
                </h2>
                <p className="text-lg text-gray-300 mb-6">
                  Create your first bottleneck scan. PatentBoom will create queued tasks, 
                  then the worker will process them in small batches.
                </p>
              </div>

              {/* 3 Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-400 mb-2">1</div>
                  <div className="text-sm font-semibold text-white mb-1">Start a Hunter Run</div>
                  <div className="text-xs text-gray-400">Choose categories and create queued tasks</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-400 mb-2">2</div>
                  <div className="text-sm font-semibold text-white mb-1">Process the First Batch</div>
                  <div className="text-xs text-gray-400">Manually trigger the worker to start processing</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-400 mb-2">3</div>
                  <div className="text-sm font-semibold text-white mb-1">Connect Cron for Automation</div>
                  <div className="text-xs text-gray-400">Set up 10-minute scheduled processing</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={handleQuickScout}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Starting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Start Quick Scout Run
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowControls(true)}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-gray-700"
                >
                  Custom Run Settings
                </button>
                <Link
                  href="/search"
                  className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Manual Search →
                </Link>
              </div>

              {/* Quick Scout Info */}
              <div className="mt-6 text-sm text-gray-500">
                <p>Quick Scout: 4 high-value categories • 1 query each • Up to 8 AI analyses</p>
              </div>
            </div>
          </div>
        )}

        {/* Process First Batch CTA - Show when tasks exist but no worker logs yet */}
        {hunterStatus && 
         (hunterStatus.pendingTasks > 0 || hunterStatus.runningTasks > 0) && 
         activityLogs.length === 0 && (
          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-2 border-blue-500/50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Ready to Process Tasks
                </h3>
                <p className="text-gray-300 mb-1">
                  Hunter run created! {hunterStatus.pendingTasks} tasks are queued.
                </p>
                <p className="text-sm text-gray-400">
                  Click below to manually process the first batch, or wait for the cron worker.
                </p>
              </div>
              <button
                onClick={handleProcessNext}
                disabled={processing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-4"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Process First Batch Now
                  </>
                )}
              </button>
            </div>
          </div>
        )}

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
                    {hunterStatus.pendingTasks > 0 && !hunterStatus.hasWorkerLogs ? (
                      // Tasks exist but no worker log yet - ready to process now
                      <span className="text-xl text-green-400">Ready now</span>
                    ) : hunterStatus.nextExpectedWorkerRunAt && countdown > 0 ? (
                      // Countdown active
                      formatCountdown(countdown)
                    ) : hunterStatus.pendingTasks > 0 && countdown === 0 ? (
                      // Countdown expired but tasks still pending
                      <span className="text-xl text-yellow-400">Ready — waiting for cron</span>
                    ) : hunterStatus.pendingTasks === 0 && hunterStatus.runningTasks === 0 && !hunterStatus.hasActiveRun ? (
                      // No active run
                      <span className="text-xl text-gray-500">No active run</span>
                    ) : hunterStatus.hasWorkerLogs && hunterStatus.pendingTasks === 0 ? (
                      // All tasks completed
                      <span className="text-xl text-gray-500">Waiting for first worker check</span>
                    ) : (
                      // Default fallback
                      <span className="text-xl text-gray-500">Waiting for first worker check</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {hunterStatus.pendingTasks > 0 && !hunterStatus.hasWorkerLogs ? (
                      <>Click "Process First Batch Now" below to start processing tasks.</>
                    ) : hunterStatus.nextExpectedWorkerRunAt && countdown > 0 ? (
                      'Cron checks the queue every 10 minutes and processes the next batch.'
                    ) : hunterStatus.pendingTasks > 0 && countdown === 0 ? (
                      'Click "Process Next Batch Now" below or wait for the cron worker.'
                    ) : hunterStatus.pendingTasks === 0 && hunterStatus.runningTasks === 0 && !hunterStatus.hasActiveRun ? (
                      'Start a Hunter run to begin scanning for bottleneck opportunities.'
                    ) : (
                      'Start a Hunter run, then process the first batch. After cron is connected, this timer will track the next expected 10-minute worker check.'
                    )}
                  </div>
                </div>
              </div>

              {/* Process First Batch Button - Show when ready */}
              {hunterStatus.pendingTasks > 0 && !hunterStatus.hasWorkerLogs && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <button
                    onClick={handleProcessNext}
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Process First Batch Now</span>
                        <span className="text-sm opacity-75">({hunterStatus.pendingTasks} tasks queued)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Process Next Batch Button - Show when countdown expired */}
              {hunterStatus.pendingTasks > 0 && hunterStatus.hasWorkerLogs && countdown === 0 && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <button
                    onClick={handleProcessNext}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Process Next Batch Now</span>
                        <span className="text-sm opacity-75">({hunterStatus.pendingTasks} tasks remaining)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
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

        {/* Automation Setup Checklist */}
        {hunterStatus && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-white">Automation Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  hunterStatus.lastRunCreatedAt ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  {hunterStatus.lastRunCreatedAt && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Hunter run created</div>
                  <div className="text-xs text-gray-500">
                    {hunterStatus.lastRunCreatedAt ? 'Yes' : 'Not yet'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  hunterStatus.pendingTasks > 0 || hunterStatus.runningTasks > 0 ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  {(hunterStatus.pendingTasks > 0 || hunterStatus.runningTasks > 0) && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Tasks queued</div>
                  <div className="text-xs text-gray-500">
                    {hunterStatus.pendingTasks > 0 || hunterStatus.runningTasks > 0 
                      ? `${hunterStatus.pendingTasks + hunterStatus.runningTasks} tasks` 
                      : 'No tasks'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  activityLogs.length > 0 ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  {activityLogs.length > 0 && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">First batch processed</div>
                  <div className="text-xs text-gray-500">
                    {activityLogs.length > 0 ? 'Yes' : 'Not yet'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  activityLogs.some(log => log.source === 'cron') ? 'bg-green-500' : 'bg-yellow-600'
                }`}>
                  {activityLogs.some(log => log.source === 'cron') ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs text-white font-bold">?</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Cron connected</div>
                  <div className="text-xs text-gray-500">
                    {activityLogs.some(log => log.source === 'cron') 
                      ? 'Active' 
                      : 'Manual only'}
                  </div>
                </div>
              </div>
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
                <Link
                  key={opp.id}
                  href={`/patents/${opp.patent_result_id}`}
                  className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-750 hover:border-indigo-500/50 border border-transparent transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium group-hover:text-indigo-300 transition-colors">{opp.title}</h3>
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
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 text-sm">
              Saved opportunities will appear here as the Hunter finds high-scoring patent ideas.
            </div>
          )}
          <div className="mt-4 text-xs text-gray-500">
            <span className="font-medium text-gray-400">AI Report Ready</span> means PatentBoom generated modernization angles, venture concepts, and possible new patent directions.
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

              {/* Quick Scout Preset */}
              <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-indigo-300 mb-1">Quick Scout Run</h3>
                    <p className="text-xs text-gray-400 mb-2">
                      4 high-value bottleneck categories • 1 query each • Up to 8 AI analyses
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {['AI-Agent Control', 'Cybersecurity', 'Crypto Transaction', 'Defense Autonomy'].map(cat => (
                        <span key={cat} className="text-xs px-2 py-0.5 bg-indigo-900/50 text-indigo-300 rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleQuickScout}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                  >
                    {loading ? 'Starting...' : 'Start Quick Scout'}
                  </button>
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
