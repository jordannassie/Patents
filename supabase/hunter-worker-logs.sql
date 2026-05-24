-- Hunter Worker Logs Table
-- Tracks when the automated worker runs and processes tasks
-- Run this SQL in Supabase SQL Editor

-- Table: hunter_worker_logs
-- Tracks each worker execution for accurate countdown timer
CREATE TABLE IF NOT EXISTS hunter_worker_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT DEFAULT 'cron', -- cron, manual, system
  status TEXT DEFAULT 'started', -- started, completed, failed, idle
  run_id UUID REFERENCES opportunity_hunter_runs(id) ON DELETE SET NULL,
  tasks_processed INTEGER DEFAULT 0,
  ai_analyses_used INTEGER DEFAULT 0,
  items_saved INTEGER DEFAULT 0,
  message TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hunter_worker_logs_created_at ON hunter_worker_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hunter_worker_logs_completed_at ON hunter_worker_logs(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_hunter_worker_logs_status ON hunter_worker_logs(status);

-- Comments for documentation
COMMENT ON TABLE hunter_worker_logs IS 'Tracks automated worker executions for accurate countdown timer';
COMMENT ON COLUMN hunter_worker_logs.source IS 'Origin of worker execution: cron, manual, or system';
COMMENT ON COLUMN hunter_worker_logs.status IS 'Worker execution status: started, completed, failed, or idle';
COMMENT ON COLUMN hunter_worker_logs.run_id IS 'Associated hunter run if processing occurred';
