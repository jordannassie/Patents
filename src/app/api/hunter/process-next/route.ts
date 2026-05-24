/**
 * POST /api/hunter/process-next
 * Processes a batch of pending Hunter tasks
 * Protected by CRON_SECRET
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { searchPatents } from '@/lib/patents/searchPatents';
import { scorePreAiOpportunity, extractBottleneckReason } from '@/lib/hunter/scorePreAiOpportunity';

function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Process Next] CRON_SECRET not configured');
    return false;
  }

  const expectedAuth = `Bearer ${cronSecret}`;
  return authHeader === expectedAuth;
}

export async function POST(request: Request) {
  // Verify CRON_SECRET in production
  if (process.env.NODE_ENV === 'production' && !verifyCronSecret(request)) {
    console.error('[Process Next] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  let workerLogId: string | null = null;

  try {
    const body = await request.json();
    const { maxTasks = 2, maxAiAnalyses = 4, source = 'manual' } = body;

    // Create worker log entry
    const { data: workerLog, error: logError } = await supabase
      .from('hunter_worker_logs')
      .insert({
        source: source === 'cron' ? 'cron' : 'manual',
        status: 'started',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error('[Process Next] Failed to create worker log:', logError);
    } else {
      workerLogId = workerLog?.id || null;
    }

    // Find the oldest running Hunter run with pending tasks
    const { data: runs } = await supabase
      .from('opportunity_hunter_runs')
      .select('*')
      .eq('status', 'running')
      .order('created_at', { ascending: true })
      .limit(1);

    if (!runs || runs.length === 0) {
      // Update worker log to idle
      if (workerLogId) {
        await supabase
          .from('hunter_worker_logs')
          .update({
            status: 'idle',
            message: 'No pending hunter tasks',
            completed_at: new Date().toISOString(),
          })
          .eq('id', workerLogId);
      }

      return NextResponse.json({
        status: 'idle',
        message: 'No pending hunter tasks.',
      });
    }

    const run = runs[0];
    console.log('[Process Next] Processing run:', run.id, run.name);

    // Get pending tasks for this run
    const { data: tasks } = await supabase
      .from('opportunity_hunter_tasks')
      .select('*')
      .eq('run_id', run.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(maxTasks);

    if (!tasks || tasks.length === 0) {
      // No pending tasks - mark run as completed
      await supabase
        .from('opportunity_hunter_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          pending_tasks: 0,
        })
        .eq('id', run.id);

      // Update worker log
      if (workerLogId) {
        await supabase
          .from('hunter_worker_logs')
          .update({
            status: 'completed',
            run_id: run.id,
            message: `Run ${run.id} completed`,
            completed_at: new Date().toISOString(),
          })
          .eq('id', workerLogId);
      }

      return NextResponse.json({
        status: 'completed',
        message: `Run ${run.id} completed.`,
        runId: run.id,
      });
    }

    let totalRecordsPulled = run.total_records_pulled || 0;
    let totalAnalyzed = run.total_analyzed || 0;
    let totalSaved = run.total_saved || 0;
    let aiAnalysesRemaining = maxAiAnalyses;
    let completedTasksCount = run.completed_tasks || 0;
    let failedTasksCount = run.failed_tasks || 0;

    console.log('[Process Next] Processing', tasks.length, 'tasks');

    // Process each task
    for (const task of tasks) {
      try {
        // Mark task as running
        await supabase
          .from('opportunity_hunter_tasks')
          .update({
            status: 'running',
            started_at: new Date().toISOString(),
          })
          .eq('id', task.id);

        // Search USPTO using existing provider
        console.log(`[Process Next] Searching: ${task.query}`);
        const searchResult = await searchPatents(task.query);
        const results = searchResult.results.slice(0, run.max_results_per_query || 25);

        totalRecordsPulled += results.length;

        // Pre-score candidates
        const scoredCandidates = results.map((result) => ({
          ...result,
          preAiScore: scorePreAiOpportunity({
            patent_number: result.patent_number,
            title: result.title,
            abstract: result.abstract,
            filing_date: result.filing_date,
            grant_date: result.grant_date,
            status_estimate: result.status_estimate,
            category: task.category,
          }),
          bottleneckReason: extractBottleneckReason({
            patent_number: result.patent_number,
            title: result.title,
            abstract: result.abstract,
            filing_date: result.filing_date,
            grant_date: result.grant_date,
            status_estimate: result.status_estimate,
            category: task.category,
          }),
        }));

        // Select top candidates above minimum score
        const minScore = run.min_score || 75;
        const qualifiedCandidates = scoredCandidates
          .filter((c) => c.preAiScore >= minScore)
          .sort((a, b) => b.preAiScore - a.preAiScore);

        // Save top candidates to opportunity_hunter_items
        let analyzedInTask = 0;
        let savedInTask = 0;

        for (const candidate of qualifiedCandidates) {
          // Check if we've exceeded AI analysis budget for this batch
          if (aiAnalysesRemaining <= 0) {
            console.log('[Process Next] AI analysis budget exhausted for this batch');
            break;
          }

          // TODO: Optionally call /api/patents/analyze here if we want full AI reports
          // For now, just save with pre-AI scores
          
          const { error: itemError } = await supabase
            .from('opportunity_hunter_items')
            .insert({
              run_id: run.id,
              task_id: task.id,
              category: task.category,
              query: task.query,
              title: candidate.title,
              patent_number: candidate.patent_number,
              status_estimate: candidate.status_estimate,
              pre_ai_score: candidate.preAiScore,
              bottleneck_reason: candidate.bottleneckReason,
              reason_saved: `Pre-AI score: ${candidate.preAiScore}/100`,
            });

          if (!itemError) {
            savedInTask++;
            totalSaved++;
            aiAnalysesRemaining--;
          }
        }

        // Mark task as completed
        await supabase
          .from('opportunity_hunter_tasks')
          .update({
            status: 'completed',
            results_count: results.length,
            candidates_selected: qualifiedCandidates.length,
            analyzed_count: analyzedInTask,
            saved_count: savedInTask,
            completed_at: new Date().toISOString(),
          })
          .eq('id', task.id);

        completedTasksCount++;

        console.log(`[Process Next] Task completed: ${savedInTask} saved from ${results.length} results`);
      } catch (taskError) {
        console.error('[Process Next] Task error:', taskError);

        // Mark task as failed but continue processing other tasks
        await supabase
          .from('opportunity_hunter_tasks')
          .update({
            status: 'failed',
            error_message: taskError instanceof Error ? taskError.message : 'Unknown error',
            completed_at: new Date().toISOString(),
          })
          .eq('id', task.id);

        failedTasksCount++;
      }
    }

    // Count remaining pending tasks
    const { count: pendingCount } = await supabase
      .from('opportunity_hunter_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('run_id', run.id)
      .eq('status', 'pending');

    const pendingTasks = pendingCount || 0;

    // Update run totals
    const updateData: any = {
      total_records_pulled: totalRecordsPulled,
      total_analyzed: totalAnalyzed,
      total_saved: totalSaved,
      completed_tasks: completedTasksCount,
      failed_tasks: failedTasksCount,
      pending_tasks: pendingTasks,
    };

    // If no pending tasks remain, mark run as completed
    if (pendingTasks === 0) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    await supabase
      .from('opportunity_hunter_runs')
      .update(updateData)
      .eq('id', run.id);

    // Update worker log with results
    if (workerLogId) {
      await supabase
        .from('hunter_worker_logs')
        .update({
          status: pendingTasks === 0 ? 'completed' : 'completed',
          run_id: run.id,
          tasks_processed: tasks.length,
          ai_analyses_used: maxAiAnalyses - aiAnalysesRemaining,
          items_saved: totalSaved,
          message: pendingTasks === 0 
            ? `Run completed. Saved ${totalSaved} opportunities.`
            : `Processed ${tasks.length} tasks. ${pendingTasks} tasks remaining.`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', workerLogId);
    }

    return NextResponse.json({
      status: pendingTasks === 0 ? 'completed' : 'processing',
      runId: run.id,
      runName: run.name,
      tasksProcessed: tasks.length,
      pendingTasks,
      totalSaved,
      message: pendingTasks === 0 
        ? `Run completed. Saved ${totalSaved} opportunities.`
        : `Processed ${tasks.length} tasks. ${pendingTasks} tasks remaining.`,
    });
  } catch (error) {
    console.error('[Process Next] Error:', error);

    // Update worker log to failed
    if (workerLogId) {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('hunter_worker_logs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', workerLogId);
    }

    return NextResponse.json(
      {
        error: 'Failed to process tasks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
