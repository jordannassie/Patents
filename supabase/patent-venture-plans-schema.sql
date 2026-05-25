-- Patent Venture Plans Table
-- Stores unified patent opportunity plans combining all analysis into founder-focused output

CREATE TABLE IF NOT EXISTS patent_venture_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patent_result_id uuid REFERENCES patent_results(id) ON DELETE CASCADE NOT NULL,
  opportunity_hunter_item_id uuid REFERENCES opportunity_hunter_items(id) ON DELETE SET NULL,
  patent_opportunity_report_id uuid REFERENCES patent_opportunity_reports(id) ON DELETE SET NULL,
  patent_concept_report_id uuid REFERENCES patent_concept_reports(id) ON DELETE SET NULL,
  
  -- Plan Content
  plan_title text NOT NULL,
  existing_patent_summary text,
  new_patent_concept_title text NOT NULL,
  new_invention_summary text NOT NULL,
  future_bottleneck_solved text NOT NULL,
  why_now text NOT NULL,
  technical_improvement text NOT NULL,
  differentiation_from_existing_patent text NOT NULL,
  
  -- Structured Data
  possible_claim_directions jsonb,
  system_architecture jsonb,
  upgrade_layers jsonb,
  target_buyers jsonb,
  commercial_use_cases jsonb,
  
  -- Analysis
  billion_dollar_thesis text NOT NULL,
  risks text NOT NULL,
  attorney_review_notes text NOT NULL,
  
  -- Action Plan
  founder_action_plan jsonb NOT NULL,
  
  -- Scoring
  scores jsonb,
  priority_level text,
  overall_score integer,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patent_venture_plans_patent_result_id 
  ON patent_venture_plans(patent_result_id);

CREATE INDEX IF NOT EXISTS idx_patent_venture_plans_hunter_item_id 
  ON patent_venture_plans(opportunity_hunter_item_id);

CREATE INDEX IF NOT EXISTS idx_patent_venture_plans_overall_score 
  ON patent_venture_plans(overall_score DESC);

CREATE INDEX IF NOT EXISTS idx_patent_venture_plans_priority_level 
  ON patent_venture_plans(priority_level);

-- Unique constraint: one plan per patent result
CREATE UNIQUE INDEX IF NOT EXISTS idx_patent_venture_plans_unique_patent 
  ON patent_venture_plans(patent_result_id);
