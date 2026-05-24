/**
 * GET /api/cron/hunter-daily
 * Daily Scout Run - Protected by CRON_SECRET
 * 
 * Daily scout settings:
 * - Small, low-cost searches
 * - 3 categories, 2 queries each
 * - Max 10 AI analyses
 */

import { NextResponse } from 'next/server';
import { runOpportunityHunter } from '@/lib/hunter/runHunter';

const DAILY_CATEGORIES = [
  'AI-Agent Control Bottleneck',
  'Cybersecurity / Data Exfiltration Bottleneck',
  'Digital Identity / Deepfake Trust Bottleneck',
  'Crypto Irreversible Transaction Bottleneck',
  'Defense Autonomy / Command Bottleneck',
];

export async function GET(request: Request) {
  try {
    // Check CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Cron] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron not configured' },
        { status: 500 }
      );
    }

    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      console.error('[Cron] Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting daily scout run');

    const result = await runOpportunityHunter({
      runType: 'daily_scout',
      name: `Daily Scout - ${new Date().toISOString().split('T')[0]}`,
      categories: DAILY_CATEGORIES,
      minScore: 75,
      maxCategories: 3,
      maxQueriesPerCategory: 2,
      maxResultsPerQuery: 25,
      maxAiAnalyses: 10,
    });

    console.log('[Cron] Daily scout completed:', result.summary);

    return NextResponse.json({
      success: true,
      runId: result.runId,
      summary: result.summary,
    });
  } catch (error) {
    console.error('[Cron] Daily scout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run daily scout',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
