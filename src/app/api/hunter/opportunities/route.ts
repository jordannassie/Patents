/**
 * GET /api/hunter/opportunities
 * Returns latest saved opportunities from hunter runs
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const supabase = getSupabaseAdmin();

    const { data: opportunities, error } = await supabase
      .from('opportunity_hunter_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Hunter Opportunities] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch opportunities', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ opportunities: opportunities || [] });
  } catch (error) {
    console.error('[Hunter Opportunities] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch opportunities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
