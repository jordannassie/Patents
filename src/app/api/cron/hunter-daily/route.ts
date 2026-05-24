/**
 * GET /api/cron/hunter-daily
 * Daily Scout Run - Protected by CRON_SECRET
 * 
 * Creates a daily scout run if one doesn't exist today
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

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
      console.error('[Cron Daily] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron not configured' },
        { status: 500 }
      );
    }

    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      console.error('[Cron Daily] Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check if a daily_scout run already exists today or is currently running
    const today = new Date().toISOString().split('T')[0];
    const { data: existingRuns } = await supabase
      .from('opportunity_hunter_runs')
      .select('*')
      .eq('run_type', 'daily_scout')
      .gte('created_at', `${today}T00:00:00Z`)
      .or('status.eq.running,status.eq.pending');

    if (existingRuns && existingRuns.length > 0) {
      console.log('[Cron Daily] Daily scout already exists or is running');
      return NextResponse.json({
        status: 'skipped',
        message: 'Daily scout already exists or is running today',
        existingRunId: existingRuns[0].id,
      });
    }

    console.log('[Cron Daily] Creating daily scout run');

    // Call /api/hunter/start to create the run
    const startResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/hunter/start`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runType: 'daily_scout',
          name: `Daily Scout - ${today}`,
          categories: DAILY_CATEGORIES,
          minScore: 75,
          maxQueriesPerCategory: 2,
          maxResultsPerQuery: 25,
          maxAiAnalyses: 20,
        }),
      }
    );

    const startData = await startResponse.json();

    if (!startResponse.ok) {
      throw new Error(startData.message || 'Failed to start daily scout');
    }

    console.log('[Cron Daily] Daily scout run created:', startData.runId);

    return NextResponse.json({
      success: true,
      runId: startData.runId,
      taskCount: startData.taskCount,
      message: 'Daily scout run created. Will be processed by cron worker.',
    });
  } catch (error) {
    console.error('[Cron Daily] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create daily scout',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
