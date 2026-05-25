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
      .select(`
        *,
        patent_results (
          id
        ),
        patent_concept_reports (
          id,
          concept_title,
          overall_score
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Hunter Opportunities] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch opportunities', message: error.message },
        { status: 500 }
      );
    }

    // Flatten the response to include concept info at top level
    const flattenedOpportunities = opportunities?.map((opp: any) => ({
      ...opp,
      has_concept: !!(opp.patent_concept_reports && opp.patent_concept_reports.length > 0),
      concept_title: opp.patent_concept_reports?.[0]?.concept_title || null,
      concept_score: opp.patent_concept_reports?.[0]?.overall_score || null,
    })) || [];

    return NextResponse.json({ items: flattenedOpportunities });
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
