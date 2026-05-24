/**
 * POST /api/hunter/run
 * Trigger a manual Opportunity Hunter run
 */

import { NextResponse } from 'next/server';
import { runOpportunityHunter } from '@/lib/hunter/runHunter';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      runType = 'manual',
      name,
      categories = [],
      minScore = 75,
      maxCategories = 5,
      maxQueriesPerCategory = 3,
      maxResultsPerQuery = 25,
      maxAiAnalyses = 10,
    } = body;

    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category is required' },
        { status: 400 }
      );
    }

    console.log('[API] Starting hunter run:', {
      runType,
      categories: categories.length,
      maxAiAnalyses,
    });

    const result = await runOpportunityHunter({
      runType,
      name,
      categories,
      minScore,
      maxCategories,
      maxQueriesPerCategory,
      maxResultsPerQuery,
      maxAiAnalyses,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Hunter run error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run hunter',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
