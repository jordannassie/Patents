/**
 * GET /api/cron/hunter-weekly
 * Weekly Deep Run - Protected by CRON_SECRET
 * 
 * Creates a weekly deep run if one doesn't exist this week
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { BOTTLENECK_CATEGORIES } from '@/lib/hunter/categories';

export async function GET(request: Request) {
  try {
    // Check CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Cron Weekly] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron not configured' },
        { status: 500 }
      );
    }

    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      console.error('[Cron Weekly] Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check if a weekly_deep run already exists this week or is currently running
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: existingRuns } = await supabase
      .from('opportunity_hunter_runs')
      .select('*')
      .eq('run_type', 'weekly_deep')
      .gte('created_at', startOfWeek.toISOString())
      .or('status.eq.running,status.eq.pending');

    if (existingRuns && existingRuns.length > 0) {
      console.log('[Cron Weekly] Weekly deep already exists or is running');
      return NextResponse.json({
        status: 'skipped',
        message: 'Weekly deep already exists or is running this week',
        existingRunId: existingRuns[0].id,
      });
    }

    console.log('[Cron Weekly] Creating weekly deep run');

    // Call /api/hunter/start to create the run
    const startResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/hunter/start`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runType: 'weekly_deep',
          name: `Weekly Deep - ${now.toISOString().split('T')[0]}`,
          categories: BOTTLENECK_CATEGORIES,
          minScore: 75,
          maxQueriesPerCategory: 3,
          maxResultsPerQuery: 25,
          maxAiAnalyses: 75,
        }),
      }
    );

    const startData = await startResponse.json();

    if (!startResponse.ok) {
      throw new Error(startData.message || 'Failed to start weekly deep');
    }

    console.log('[Cron Weekly] Weekly deep run created:', startData.runId);

    return NextResponse.json({
      success: true,
      runId: startData.runId,
      taskCount: startData.taskCount,
      message: 'Weekly deep run created. Will be processed by cron worker.',
    });
  } catch (error) {
    console.error('[Cron Weekly] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create weekly deep',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
