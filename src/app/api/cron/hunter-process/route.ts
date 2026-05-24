/**
 * GET /api/cron/hunter-process
 * Cron worker that processes pending Hunter tasks
 * Protected by CRON_SECRET
 * Should be called every 10 minutes
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Cron Process] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron not configured' },
        { status: 500 }
      );
    }

    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      console.error('[Cron Process] Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron Process] Processing pending hunter tasks');

    // Call /api/hunter/process-next
    const processResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/hunter/process-next`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({
          maxTasks: 2,
          maxAiAnalyses: 4,
          source: 'cron',
        }),
      }
    );

    const processData = await processResponse.json();

    if (!processResponse.ok) {
      throw new Error(processData.message || 'Failed to process tasks');
    }

    console.log('[Cron Process] Result:', processData.status, processData.message);

    return NextResponse.json(processData);
  } catch (error) {
    console.error('[Cron Process] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process tasks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
