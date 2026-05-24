/**
 * GET /api/cron/hunter-bootstrap
 * Ensures a Hunter run exists if none is active
 * Protected by CRON_SECRET
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { BOTTLENECK_CATEGORIES } from '@/lib/hunter/categories';

function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Bootstrap] CRON_SECRET not configured');
    return false;
  }

  const expectedAuth = `Bearer ${cronSecret}`;
  return authHeader === expectedAuth;
}

export async function GET(request: Request) {
  // Verify CRON_SECRET in production
  if (process.env.NODE_ENV === 'production' && !verifyCronSecret(request)) {
    console.error('[Bootstrap] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Check if there's already a running or pending run
    const { data: existingRuns } = await supabase
      .from('opportunity_hunter_runs')
      .select('*')
      .in('status', ['running', 'pending'])
      .limit(1);

    if (existingRuns && existingRuns.length > 0) {
      return NextResponse.json({
        status: 'exists',
        message: 'Hunter run already active',
        runId: existingRuns[0].id,
      });
    }

    // Create a daily scout run
    const dailyScoutCategories = [
      'AI-Agent Control Bottleneck',
      'Cybersecurity / Data Exfiltration Bottleneck',
      'Digital Identity / Deepfake Trust Bottleneck',
      'Crypto Irreversible Transaction Bottleneck',
      'Defense Autonomy / Command Bottleneck',
    ];

    const { data: newRun, error: runError } = await supabase
      .from('opportunity_hunter_runs')
      .insert({
        run_type: 'daily_scout',
        name: `Daily Scout - ${new Date().toLocaleDateString()}`,
        status: 'running',
        categories: dailyScoutCategories,
        min_score: 75,
        max_queries_per_category: 2,
        max_results_per_query: 25,
        max_ai_analyses: 20,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runError || !newRun) {
      throw new Error(runError?.message || 'Failed to create run');
    }

    // Create tasks for each category
    const tasks = dailyScoutCategories.flatMap((category) => {
      const queries = [
        `${category} patent automation`,
        `${category} AI modernization`,
      ];

      return queries.map((query) => ({
        run_id: newRun.id,
        category,
        query,
        status: 'pending' as const,
      }));
    });

    const { error: tasksError } = await supabase
      .from('opportunity_hunter_tasks')
      .insert(tasks);

    if (tasksError) {
      console.error('[Bootstrap] Failed to create tasks:', tasksError);
    }

    // Update run with total task count
    await supabase
      .from('opportunity_hunter_runs')
      .update({
        total_tasks: tasks.length,
        pending_tasks: tasks.length,
        total_queries: tasks.length,
      })
      .eq('id', newRun.id);

    console.log(`[Bootstrap] Created daily scout run: ${newRun.id} with ${tasks.length} tasks`);

    return NextResponse.json({
      status: 'created',
      message: 'Daily scout run created',
      runId: newRun.id,
      taskCount: tasks.length,
    });
  } catch (error) {
    console.error('[Bootstrap] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to bootstrap hunter',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
