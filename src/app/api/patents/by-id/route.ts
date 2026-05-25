/**
 * GET /api/patents/by-id
 * Fetch a patent result and its report by patent_results.id (UUID)
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Patent result ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Load patent by UUID
    const { data: patent, error: patentError } = await supabase
      .from('patent_results')
      .select('*')
      .eq('id', id)
      .single();

    if (patentError || !patent) {
      console.error('[By ID] Patent not found:', patentError);
      return NextResponse.json(
        { error: 'Patent result not found', message: patentError?.message },
        { status: 404 }
      );
    }

    // Load latest report for this patent
    const { data: report } = await supabase
      .from('patent_opportunity_reports')
      .select('*')
      .eq('patent_result_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Load creation plan for this patent
    const { data: creationPlan } = await supabase
      .from('patent_creation_plans')
      .select('*')
      .eq('patent_result_id', id)
      .maybeSingle();

    // Load venture plan for this patent (legacy)
    const { data: venturePlan } = await supabase
      .from('patent_venture_plans')
      .select('*')
      .eq('patent_result_id', id)
      .maybeSingle();

    // Load concept report for this patent
    const { data: concept } = await supabase
      .from('patent_concept_reports')
      .select('*')
      .eq('patent_result_id', id)
      .maybeSingle();

    // Load hunter item for this patent
    const { data: hunterItem } = await supabase
      .from('opportunity_hunter_items')
      .select('*')
      .eq('patent_result_id', id)
      .maybeSingle();

    return NextResponse.json({
      patent,
      report: report || null,
      creationPlan: creationPlan || null,
      venturePlan: venturePlan || null,
      concept: concept || null,
      hunterItem: hunterItem || null,
    });
  } catch (error) {
    console.error('[By ID] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to load patent',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
