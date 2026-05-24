# PatentBoom

AI-powered patent opportunity engine that searches old/expired patent records, identifies modern technology upgrade opportunities, and generates possible new venture and new patent improvement directions.

## Required Environment Variables

Add these to your Netlify deployment:

```
CRON_SECRET=your-secret-key
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
USPTO_API_KEY=your-uspto-key
PATENTSVIEW_API_KEY=your-patentsview-key
OPENAI_API_KEY=your-openai-key
```

## Automated Hunter Engine

PatentBoom uses Netlify Scheduled Functions to automatically:

1. **Process Hunter Queue** - Every 10 minutes (`hunter-process`)
   - Checks for pending Hunter tasks
   - Processes up to 2 tasks per batch
   - Runs AI analysis on qualified candidates
   - Saves opportunities to database

2. **Daily Scout Scan** - Every day at 7:00 AM UTC (`hunter-daily`)
   - Creates a daily scout run
   - Scans 5 high-value bottleneck categories
   - 2 queries per category
   - Up to 20 AI analyses

3. **Weekly Deep Scan** - Mondays at 7:30 AM UTC (`hunter-weekly`)
   - Creates a comprehensive weekly run
   - Scans all bottleneck categories
   - 3 queries per category
   - Up to 75 AI analyses

## Manual Override

Advanced Controls in `/hunter` allow manual triggering for testing:
- Start Scout Scan
- Create Custom Scan
- Run Worker Check Now

## Legal Disclaimers

Patent status and expiration estimates are informational only. Attorney review is required before relying on any patent status, commercialization strategy, or new patent filing.

This app does not provide legal advice and does not guarantee that patents are safe to copy or that new patents are guaranteed to be patentable.
