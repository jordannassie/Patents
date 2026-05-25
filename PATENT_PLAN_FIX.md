# Patent Plan Generation - Fixed and Reliable

## Problem Solved
Previously, patent plan generation would fail silently with "Plan Error — PatentBoom could not complete the plan."

## Solution Implemented

### 1. Safe JSON Parser (`src/lib/patents/safeParsePatentPlan.ts`)
Handles OpenAI response variations:
- Strips markdown code fences (```json```)
- Extracts JSON from mixed content
- Normalizes missing fields with safe defaults
- Validates and corrects data types
- Auto-assigns priority based on score

### 2. Fallback Plan Generation
When OpenAI fails or is unavailable:
- Creates basic plan from patent title/abstract
- Marks as fallback with clear messaging
- Saves to database (not lost work)
- Provides retry guidance

### 3. Stage-Based Error Handling
API tracks progress through stages:
- `initialization` - Setup
- `check_existing_plan` - Check for existing plan
- `load_patent` - Fetch patent data
- `load_context` - Fetch related data
- `openai_unavailable` - No API key
- `openai_call` - Calling OpenAI API
- `json_parse` - Parsing response
- `database_insert` - Saving to DB

Each error returns:
```json
{
  "error": "Failed to generate patent creation plan",
  "stage": "json_parse",
  "details": "Unexpected token in JSON",
  "hint": "Check OpenAI response format"
}
```

### 4. Frontend Error Display
- Shows stage, details, and hints
- Yellow warning for fallback plans (not red errors)
- Clear distinction between errors and fallbacks
- Retry button in Advanced Details

### 5. Debug Route
**URL:** `/api/debug/patent-plan?patentResultId=<uuid>`

**Returns:**
```json
{
  "patentResultId": "abc-123",
  "patentExists": true,
  "patentTitle": "Method for...",
  "planExists": true,
  "latestPlanId": "def-456",
  "planScore": 85,
  "planPriority": "TOP_TARGET",
  "openaiKeyExists": true,
  "supabaseUrlExists": true,
  "supabaseKeyExists": true,
  "tableCheck": "ok",
  "safeMessage": "Plan exists and is ready to display",
  "hint": "Plan is ready"
}
```

## Database Schema

The `patent_creation_plans` table already exists:
**Location:** `supabase/patent-creation-plans-schema.sql`

**If missing, run this SQL:**
```sql
CREATE TABLE IF NOT EXISTS patent_creation_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patent_result_id uuid REFERENCES patent_results(id) ON DELETE CASCADE NOT NULL,
  opportunity_hunter_item_id uuid REFERENCES opportunity_hunter_items(id) ON DELETE SET NULL,
  
  -- Source Context
  source_title text NOT NULL,
  source_summary text,
  source_status_estimate text,
  
  -- Analysis
  future_bottleneck text NOT NULL,
  market_timing text NOT NULL,
  
  -- Recommendation
  recommended_patent_title text NOT NULL,
  recommended_patent_summary text NOT NULL,
  why_this_is_best text NOT NULL,
  
  -- Structured Data
  new_patent_ideas jsonb,
  filing_priority_rankings jsonb,
  possible_claim_themes jsonb,
  system_architecture jsonb,
  target_buyers jsonb,
  
  -- Strategy
  venture_angle text,
  founder_next_steps jsonb,
  
  -- Scoring
  score integer NOT NULL,
  priority text NOT NULL,
  
  -- Risk Assessment
  risks text NOT NULL,
  attorney_review_note text NOT NULL,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patent_creation_plans_patent_result_id 
  ON patent_creation_plans(patent_result_id);

CREATE INDEX IF NOT EXISTS idx_patent_creation_plans_score 
  ON patent_creation_plans(score DESC);

CREATE INDEX IF NOT EXISTS idx_patent_creation_plans_priority 
  ON patent_creation_plans(priority);

CREATE INDEX IF NOT EXISTS idx_patent_creation_plans_created_at 
  ON patent_creation_plans(created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_patent_creation_plans_unique_patent 
  ON patent_creation_plans(patent_result_id);
```

## Testing Checklist

1. **Test Debug Route**
   ```bash
   curl "http://localhost:3000/api/debug/patent-plan?patentResultId=YOUR_PATENT_ID"
   ```

2. **Test Auto-Generation**
   - Visit `/patents/[id]`
   - Should auto-generate plan if missing
   - Shows loading state during generation
   - Displays plan when complete

3. **Test Fallback Plan**
   - Temporarily remove `OPENAI_API_KEY` from `.env`
   - Visit `/patents/[id]`
   - Should generate fallback plan
   - Shows yellow warning (not red error)

4. **Test Error Handling**
   - Invalid patent ID should show "Patent not found" with stage
   - Database errors show hint to check schema
   - OpenAI errors trigger fallback plan

5. **Test Retry**
   - Open Advanced Details section
   - Click "Regenerate Patent Plan"
   - Should force new generation
   - Works even if fallback exists

## Error Messages Guide

### "Patent not found"
- **Stage:** `load_patent`
- **Fix:** Verify patent ID is correct
- **Debug:** Use `/api/debug/patent-plan?patentResultId=<id>`

### "Failed to save plan to database"
- **Stage:** `database_insert`
- **Fix:** Check if `patent_creation_plans` table exists
- **Debug:** Run schema SQL from above

### "Fallback plan generated"
- **Stage:** `openai_unavailable` or `openai_error_fallback`
- **Fix:** Check `OPENAI_API_KEY` in environment
- **Note:** This is a warning, not an error - plan is saved

### "JSON parse error"
- **Stage:** `json_parse`
- **Fix:** Handled automatically by `safeParsePatentPlan`
- **Action:** Retry generation if persists

## Priority Levels

- **BEST_TO_FILE** (90-100): File this patent first
- **TOP_TARGET** (80-89): Strong patent direction
- **STRONG** (70-79): Good patent direction
- **WATCH** (60-69): Interesting but lower priority
- **SKIP** (0-59): Not worth pursuing

## What's Protected

The error handling never exposes:
- OpenAI API keys
- Supabase service role keys
- CRON_SECRET
- Full database errors (sanitized for frontend)
- Internal implementation details

## Deployment Notes

1. Build passed: ✅
2. All routes working: ✅
3. Error handling tested: ✅
4. Fallback logic tested: ✅
5. Debug route available: ✅

## Next Steps

Deploy to Netlify:
```bash
git push origin main
```

Monitor the first few plan generations in production:
1. Check logs for stage errors
2. Verify fallback plans are rare
3. Confirm database inserts succeed
4. Test debug route with real patent IDs
