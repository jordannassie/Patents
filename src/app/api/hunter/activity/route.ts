/**
 * GET /api/hunter/activity
 * Returns latest hunter worker logs for activity feed
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = getSupabaseAdmin();

    const { data: logs, error } = await supabase
      .from('hunter_worker_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Hunter Activity] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity logs', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (error) {
    console.error('[Hunter Activity] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch activity',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
