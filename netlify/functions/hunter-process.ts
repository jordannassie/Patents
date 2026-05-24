import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  console.log('[Scheduled] Hunter process worker starting...');

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

    const workerUrl = `${siteUrl}/api/cron/hunter-process`;
    console.log(`[Scheduled] Calling worker endpoint: ${workerUrl}`);

    const response = await fetch(workerUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log(`[Scheduled] Worker response:`, {
      status: response.status,
      message: data.message || data.error,
    });

    return new Response(JSON.stringify({
      success: true,
      status: response.status,
      message: data.message || data.status,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Scheduled] Hunter process error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to run hunter process',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config: Config = {
  schedule: "*/10 * * * *", // Every 10 minutes
};
