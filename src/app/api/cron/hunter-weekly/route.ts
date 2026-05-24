/**
 * GET /api/cron/hunter-weekly
 * Weekly Deep Run - Protected by CRON_SECRET
 * 
 * Weekly deep settings:
 * - All bottleneck categories
 * - 12 categories, 3 queries each
 * - Max 50 AI analyses
 */

import { NextResponse } from 'next/server';
import { runOpportunityHunter } from '@/lib/hunter/runHunter';

const ALL_BOTTLENECK_CATEGORIES = [
  'Compute Bottleneck',
  'Energy / Grid Bottleneck',
  'AI-Agent Control Bottleneck',
  'Cybersecurity / Data Exfiltration Bottleneck',
  'Digital Identity / Deepfake Trust Bottleneck',
  'Crypto Irreversible Transaction Bottleneck',
  'Healthcare Automation / Liability Bottleneck',
  'Autonomous Vehicle / Logistics Bottleneck',
  'Payment / Fintech Authorization Bottleneck',
  'Regulatory / Compliance Policy Bottleneck',
  'Space / Satellite Communication Bottleneck',
  'Robotics Safety / Verification Bottleneck',
  'DARPA / Defense Autonomy Bottleneck',
  'Command & Control Authorization Bottleneck',
  'Cybersecurity / SOCOM / Cyber Command Bottleneck',
  'Battlefield Medicine / Triage Bottleneck',
  'Drone Swarm / Coordination Bottleneck',
  'Satellite / Space Comms / GPS Bottleneck',
  'Defense Supply Chain / Logistics Bottleneck',
  'Counter-UAS / Electronic Warfare Bottleneck',
  'Nuclear Command / Authorization Bottleneck',
  'Special Operations / Intelligence Bottleneck',
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

    console.log('[Cron] Starting weekly deep run');

    const result = await runOpportunityHunter({
      runType: 'weekly_deep',
      name: `Weekly Deep - ${new Date().toISOString().split('T')[0]}`,
      categories: ALL_BOTTLENECK_CATEGORIES,
      minScore: 75,
      maxCategories: 12,
      maxQueriesPerCategory: 3,
      maxResultsPerQuery: 25,
      maxAiAnalyses: 50,
    });

    console.log('[Cron] Weekly deep completed:', result.summary);

    return NextResponse.json({
      success: true,
      runId: result.runId,
      summary: result.summary,
    });
  } catch (error) {
    console.error('[Cron] Weekly deep error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run weekly deep',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
