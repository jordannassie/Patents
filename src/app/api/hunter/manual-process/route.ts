/**
 * POST /api/hunter/manual-process
 * Safe endpoint for manually triggering batch processing from the UI
 * Does not require CRON_SECRET from client - uses it server-side
 */

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('[Manual Process] Triggering manual batch processing');

    // Check if CRON_SECRET exists server-side
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured on server' },
        { status: 500 }
      );
    }

    // Build the full URL for process-next
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.URL || 
                    'http://localhost:3000';
    
    const processUrl = `${baseUrl}/api/hunter/process-next`;

    // Call process-next with CRON_SECRET server-side
    const processResponse = await fetch(processUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({
        maxTasks: 2,
        maxAiAnalyses: 4,
        source: 'manual',
      }),
    });

    const processData = await processResponse.json();

    if (!processResponse.ok) {
      throw new Error(processData.message || 'Failed to process tasks');
    }

    console.log('[Manual Process] Result:', processData.status, processData.message);

    return NextResponse.json(processData);
  } catch (error) {
    console.error('[Manual Process] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process tasks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
