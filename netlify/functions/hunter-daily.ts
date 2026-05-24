import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  console.log('[Scheduled] Hunter daily scout starting...');

  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error('[Scheduled] CRON_SECRET not configured');
      return new Response(JSON.stringify({ error: 'CRON_SECRET not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get site URL from environment
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL;
    if (!siteUrl) {
      console.error('[Scheduled] Site URL not available');
      return new Response(JSON.stringify({ error: 'Site URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dailyUrl = `${siteUrl}/api/cron/hunter-daily`;
    console.log(`[Scheduled] Calling daily endpoint: ${dailyUrl}`);

    const response = await fetch(dailyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log(`[Scheduled] Daily scout response:`, {
      status: response.status,
      message: data.message || data.error,
    });

    return new Response(JSON.stringify({
      success: true,
      status: response.status,
      message: data.message || data.status,
      runId: data.runId,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Scheduled] Hunter daily error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to run daily scout',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config: Config = {
  schedule: "0 7 * * *", // Daily at 7:00 AM UTC
};
