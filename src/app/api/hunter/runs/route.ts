/**
 * GET /api/hunter/runs
 * List recent hunter runs
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const runType = searchParams.get('runType');

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('opportunity_hunter_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (runType) {
      query = query.eq('run_type', runType);
    }

    const { data: runs, error } = await query;

    if (error) {
      console.error('[API] Failed to fetch runs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch runs', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ runs: runs || [] });
  } catch (error) {
    console.error('[API] Runs list error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list runs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
