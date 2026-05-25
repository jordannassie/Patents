-- Patent Creation Plans Table
-- Stores recommendations for what NEW patents to create based on existing patent signals

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patent_creation_plans_patent_result_id 
  ON patent_creation_plans(patent_result_id);

CREATE INDEX IF NOT EXISTS idx_patent_creation_plans_hunter_item_id 
  ON patent_creation_plans(opportunity_hunter_item_id);

CREATE INDEX IF NOT EXISTS idx_patent_creation_plans_score 
  ON patent_creation_plans(score DESC);

CREATE INDEX IF NOT EXISTS idx_patent_creation_plans_priority 
  ON patent_creation_plans(priority);

CREATE INDEX IF NOT EXISTS idx_patent_creation_plans_created_at 
  ON patent_creation_plans(created_at DESC);

-- Unique constraint: one plan per patent result
CREATE UNIQUE INDEX IF NOT EXISTS idx_patent_creation_plans_unique_patent 
  ON patent_creation_plans(patent_result_id);
