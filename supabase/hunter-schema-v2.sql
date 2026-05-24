-- Opportunity Hunter Queue-Based System Schema
-- Run this SQL in Supabase SQL Editor to update tables for queue-based processing

-- Update opportunity_hunter_runs table with new fields for queue tracking
ALTER TABLE opportunity_hunter_runs 
  ADD COLUMN IF NOT EXISTS total_tasks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_tasks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed_tasks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_tasks INTEGER DEFAULT 0;

-- Add comment explaining the queue-based processing
COMMENT ON COLUMN opportunity_hunter_runs.total_tasks IS 'Total number of tasks created for this run';
COMMENT ON COLUMN opportunity_hunter_runs.completed_tasks IS 'Number of tasks completed successfully';
COMMENT ON COLUMN opportunity_hunter_runs.failed_tasks IS 'Number of tasks that failed';
COMMENT ON COLUMN opportunity_hunter_runs.pending_tasks IS 'Number of tasks still pending (calculated)';
