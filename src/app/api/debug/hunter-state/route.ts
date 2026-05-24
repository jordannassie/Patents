/**
 * GET /api/debug/hunter-state
 * Returns current Hunter database state for debugging
 * DO NOT expose secrets
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Count opportunity_hunter_runs
    const { count: runsCount } = await supabase
      .from('opportunity_hunter_runs')
      .select('*', { count: 'exact', head: true });

    // Count opportunity_hunter_tasks by status
    const { data: tasks } = await supabase
      .from('opportunity_hunter_tasks')
      .select('status');

    const taskCounts = {
      pending: tasks?.filter(t => t.status === 'pending').length || 0,
      running: tasks?.filter(t => t.status === 'running').length || 0,
      completed: tasks?.filter(t => t.status === 'completed').length || 0,
      failed: tasks?.filter(t => t.status === 'failed').length || 0,
    };

    // Count opportunity_hunter_items
    const { count: itemsCount } = await supabase
      .from('opportunity_hunter_items')
      .select('*', { count: 'exact', head: true });

    // Count saved_opportunities
    const { count: savedCount } = await supabase
      .from('saved_opportunities')
      .select('*', { count: 'exact', head: true });

    // Count patent_opportunity_reports
    const { count: reportsCount } = await supabase
      .from('patent_opportunity_reports')
      .select('*', { count: 'exact', head: true });

    // Count patent_results
    const { count: resultsCount } = await supabase
      .from('patent_results')
      .select('*', { count: 'exact', head: true });

    // Get latest Hunter items (up to 10)
    const { data: latestItems } = await supabase
      .from('opportunity_hunter_items')
      .select('id, title, patent_result_id, report_id, opportunity_score, recommendation, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get latest runs
    const { data: latestRuns } = await supabase
      .from('opportunity_hunter_runs')
      .select('id, name, status, total_saved, completed_at, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      opportunity_hunter_runs: runsCount || 0,
      opportunity_hunter_tasks: taskCounts,
      opportunity_hunter_items: itemsCount || 0,
      saved_opportunities: savedCount || 0,
      patent_opportunity_reports: reportsCount || 0,
      patent_results: resultsCount || 0,
      latestHunterItems: latestItems || [],
      latestRuns: latestRuns || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Debug Hunter State] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Hunter state',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
