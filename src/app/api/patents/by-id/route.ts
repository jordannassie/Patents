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

    return NextResponse.json({
      patent,
      report: report || null,
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
