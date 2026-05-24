/**
 * GET /api/hunter/runs/[id]
 * Get details for a specific hunter run
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Get run
    const { data: run, error: runError } = await supabase
      .from('opportunity_hunter_runs')
      .select('*')
      .eq('id', id)
      .single();

    if (runError || !run) {
      return NextResponse.json(
        { error: 'Run not found', message: runError?.message },
        { status: 404 }
      );
    }

    // Get tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('opportunity_hunter_tasks')
      .select('*')
      .eq('run_id', id)
      .order('created_at', { ascending: true });

    if (tasksError) {
      console.error('[API] Failed to fetch tasks:', tasksError);
    }

    // Get saved items
    const { data: items, error: itemsError } = await supabase
      .from('opportunity_hunter_items')
      .select('*')
      .eq('run_id', id)
      .order('pre_ai_score', { ascending: false });

    if (itemsError) {
      console.error('[API] Failed to fetch items:', itemsError);
    }

    return NextResponse.json({
      run,
      tasks: tasks || [],
      items: items || [],
    });
  } catch (error) {
    console.error('[API] Run detail error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch run details',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
