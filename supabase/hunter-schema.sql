-- Opportunity Hunter Automated Run Tables
-- Run this SQL in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: opportunity_hunter_runs
-- Tracks each automated or manual hunter run
CREATE TABLE IF NOT EXISTS opportunity_hunter_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT DEFAULT 'manual', -- manual, daily_scout, weekly_deep
  name TEXT,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  categories JSONB,
  total_queries INTEGER DEFAULT 0,
  total_records_pulled INTEGER DEFAULT 0,
  total_candidates_prescored INTEGER DEFAULT 0,
  total_analyzed INTEGER DEFAULT 0,
  total_saved INTEGER DEFAULT 0,
  min_score INTEGER DEFAULT 75,
  max_categories INTEGER DEFAULT 5,
  max_queries_per_category INTEGER DEFAULT 3,
  max_results_per_query INTEGER DEFAULT 25,
  max_ai_analyses INTEGER DEFAULT 10,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Table 2: opportunity_hunter_tasks
-- Tracks individual category/query tasks within a run
CREATE TABLE IF NOT EXISTS opportunity_hunter_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES opportunity_hunter_runs(id) ON DELETE CASCADE,
  category TEXT,
  query TEXT,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  results_count INTEGER DEFAULT 0,
  candidates_selected INTEGER DEFAULT 0,
  analyzed_count INTEGER DEFAULT 0,
  saved_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Table 3: opportunity_hunter_items
-- Stores saved opportunities from hunter runs
CREATE TABLE IF NOT EXISTS opportunity_hunter_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES opportunity_hunter_runs(id) ON DELETE CASCADE,
  task_id UUID REFERENCES opportunity_hunter_tasks(id) ON DELETE SET NULL,
  patent_result_id UUID REFERENCES patent_results(id) ON DELETE CASCADE,
  report_id UUID REFERENCES patent_opportunity_reports(id) ON DELETE SET NULL,
  category TEXT,
  query TEXT,
  title TEXT,
  patent_number TEXT,
  status_estimate TEXT,
  pre_ai_score INTEGER,
  opportunity_score INTEGER,
  recommendation TEXT,
  bottleneck_reason TEXT,
  modernization_angle TEXT,
  reason_saved TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunity_hunter_runs_created_at ON opportunity_hunter_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_hunter_runs_run_type ON opportunity_hunter_runs(run_type);
CREATE INDEX IF NOT EXISTS idx_opportunity_hunter_runs_status ON opportunity_hunter_runs(status);
CREATE INDEX IF NOT EXISTS idx_opportunity_hunter_tasks_run_id ON opportunity_hunter_tasks(run_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_hunter_items_run_id ON opportunity_hunter_items(run_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_hunter_items_opportunity_score ON opportunity_hunter_items(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_hunter_items_category ON opportunity_hunter_items(category);

-- Comments for documentation
COMMENT ON TABLE opportunity_hunter_runs IS 'Tracks automated and manual Opportunity Hunter runs';
COMMENT ON TABLE opportunity_hunter_tasks IS 'Individual category/query tasks within hunter runs';
COMMENT ON TABLE opportunity_hunter_items IS 'Saved high-scoring opportunities from hunter runs';
