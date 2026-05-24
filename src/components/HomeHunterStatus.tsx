'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  secondsUntilNextExpectedRun: number | null;
  lastRunCreatedAt: string | null;
  lastRunCompletedAt: string | null;
  lastRunName: string | null;
  cronDetected: boolean;
  cronActive: boolean;
  cronStatusLabel: string;
}

export default function HomeHunterStatus() {
  const [status, setStatus] = useState<HunterStatus | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!status) return;

    if (status.secondsUntilNextExpectedRun !== null) {
      setCountdown(Math.max(0, status.secondsUntilNextExpectedRun));

      const timer = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown(0);
    }
  }, [status]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/hunter/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch Hunter status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = (statusValue: string): string => {
    switch (statusValue) {
      case 'running':
        return 'Worker Running';
      case 'pending':
        return 'Queue Pending';
      case 'completed':
        return 'Scan Complete';
      case 'failed':
        return 'Needs Attention';
      default:
        return 'Standing By';
    }
  };

  const getStatusColor = (statusValue: string): string => {
    switch (statusValue) {
      case 'running':
        return 'text-green-400';
      case 'pending':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${
                  status.status === 'failed' ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                {status.status !== 'failed' && (
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">Live Hunter Engine</h2>
            </div>
            <p className="text-sm text-gray-400">
              PatentBoom automatically scans future bottlenecks and patent records for AI-era venture opportunities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div className={`text-xl font-medium ${getStatusColor(status.status)}`}>
              {getStatusText(status.status)}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Next Worker Check</div>
            <div className="text-3xl font-bold text-indigo-400">
              {status.pendingTasks > 0 && status.secondsUntilNextExpectedRun !== null && status.secondsUntilNextExpectedRun > 0 ? (
                <>
                  {formatCountdown(countdown)}
                  <div className="text-xs text-gray-500 mt-1">Automatic worker check</div>
                </>
              ) : status.pendingTasks > 0 && status.secondsUntilNextExpectedRun !== null && status.secondsUntilNextExpectedRun <= 0 ? (
                <span className="text-xl text-yellow-400">Automatic worker check is due now</span>
              ) : status.pendingTasks === 0 && status.runningTasks === 0 ? (
                <span className="text-xl text-gray-500">Waiting for scheduled scan</span>
              ) : (
                <span className="text-xl text-gray-500">Calculating...</span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {status.pendingTasks > 0 && !status.cronDetected ? (
                <span className="text-yellow-400">⚠ Cron not detected yet. Connect your scheduler to run automatically every 10 minutes.</span>
              ) : status.cronActive ? (
                <span className="text-green-400">✓ {status.cronStatusLabel}</span>
              ) : status.cronDetected && !status.cronActive ? (
                <span className="text-yellow-400">⚠ {status.cronStatusLabel}</span>
              ) : (
                'The Hunter worker checks the queue every 10 minutes and continues until all patent search tasks are processed.'
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-indigo-400">{status.pendingTasks}</div>
            <div className="text-xs text-gray-500">Pending Tasks</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{status.lastWorkerTasksProcessed}</div>
            <div className="text-xs text-gray-500">Last Batch Processed</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{status.lastWorkerAiAnalysesUsed}</div>
            <div className="text-xs text-gray-500">AI Analyses Used</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{status.lastWorkerItemsSaved}</div>
            <div className="text-xs text-gray-500">Opportunities Saved</div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/hunter"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            View Hunter Engine
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
