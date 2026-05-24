/**
 * GET /api/hunter/status
 * Returns current hunter automation status and next expected worker run
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Get pending and running task counts
    const { count: pendingCount } = await supabase
      .from('opportunity_hunter_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: runningCount } = await supabase
      .from('opportunity_hunter_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'running');

    const pendingTasks = pendingCount || 0;
    const runningTasks = runningCount || 0;

    // Get latest running/pending run
    const { data: runningRuns } = await supabase
      .from('opportunity_hunter_runs')
      .select('*')
      .eq('status', 'running')
      .order('created_at', { ascending: false })
      .limit(1);

    const runningRun = runningRuns && runningRuns.length > 0 ? runningRuns[0] : null;

    // Get latest completed run
    const { data: latestRuns } = await supabase
      .from('opportunity_hunter_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    const latestRun = latestRuns && latestRuns.length > 0 ? latestRuns[0] : null;

    // Get latest worker log
    const { data: workerLogs } = await supabase
      .from('hunter_worker_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    const latestWorkerLog = workerLogs && workerLogs.length > 0 ? workerLogs[0] : null;

    // Calculate next expected worker run time
    const workerIntervalMinutes = 10;
    let nextExpectedWorkerRunAt: string | null = null;
    let secondsUntilNextExpectedRun = 0;

    if (latestWorkerLog) {
      const baseTime = latestWorkerLog.completed_at || latestWorkerLog.started_at;
      if (baseTime) {
        const nextRun = new Date(baseTime);
        nextRun.setMinutes(nextRun.getMinutes() + workerIntervalMinutes);
        nextExpectedWorkerRunAt = nextRun.toISOString();

        const now = new Date();
        secondsUntilNextExpectedRun = Math.max(0, Math.floor((nextRun.getTime() - now.getTime()) / 1000));
      }
    }

    // Determine overall status
    let status: 'idle' | 'pending' | 'running' | 'completed' | 'failed' = 'idle';
    
    if (runningTasks > 0) {
      status = 'running';
    } else if (pendingTasks > 0) {
      status = 'pending';
    } else if (latestRun && latestRun.status === 'completed') {
      status = 'completed';
    } else if (latestWorkerLog && latestWorkerLog.status === 'failed') {
      status = 'failed';
    }

    // Helper flags for UI
    const hasWorkerLogs = !!latestWorkerLog;
    const hasActiveRun = !!(runningRun || (latestRun && latestRun.status === 'running'));

    return NextResponse.json({
      status,
      runningRunId: runningRun?.id || null,
      pendingTasks,
      runningTasks,
      hasWorkerLogs,
      hasActiveRun,
      lastWorkerStartedAt: latestWorkerLog?.started_at || null,
      lastWorkerCompletedAt: latestWorkerLog?.completed_at || null,
      lastWorkerStatus: latestWorkerLog?.status || null,
      lastWorkerMessage: latestWorkerLog?.message || null,
      lastWorkerTasksProcessed: latestWorkerLog?.tasks_processed || 0,
      lastWorkerAiAnalysesUsed: latestWorkerLog?.ai_analyses_used || 0,
      lastWorkerItemsSaved: latestWorkerLog?.items_saved || 0,
      workerIntervalMinutes,
      nextExpectedWorkerRunAt,
      secondsUntilNextExpectedRun,
      lastRunCreatedAt: latestRun?.created_at || null,
      lastRunCompletedAt: latestRun?.completed_at || null,
      lastRunName: latestRun?.name || null,
    });
  } catch (error) {
    console.error('[Hunter Status] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get hunter status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
