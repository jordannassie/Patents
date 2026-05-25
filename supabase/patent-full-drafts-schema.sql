-- Patent Full Drafts Table
-- Stores complete patent draft packages generated from Patent Creation Plans
-- These are structured drafts for attorney review, NOT ready-to-file documents

CREATE TABLE IF NOT EXISTS patent_full_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patent_creation_plan_id uuid REFERENCES patent_creation_plans(id) ON DELETE CASCADE NOT NULL,
  patent_result_id uuid REFERENCES patent_results(id) ON DELETE CASCADE NOT NULL,
  
  -- Core Patent Sections
  draft_title text NOT NULL,
  field_of_invention text NOT NULL,
  background text NOT NULL,
  problem_statement text NOT NULL,
  summary_of_invention text NOT NULL,
  system_overview text NOT NULL,
  
  -- Structured Technical Content
  technical_architecture jsonb,
  method_flow jsonb,
  
  -- Description and Examples
  detailed_description text NOT NULL,
  example_embodiments jsonb,
  alternative_embodiments jsonb,
  use_cases jsonb,
  
  -- Claims and Abstract
  claim_set jsonb NOT NULL,
  abstract text NOT NULL,
  
  -- Supporting Materials
  drawing_descriptions jsonb,
  
  -- Review Notes
  attorney_review_notes text NOT NULL,
  filing_notes text NOT NULL,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patent_full_drafts_creation_plan_id 
  ON patent_full_drafts(patent_creation_plan_id);

CREATE INDEX IF NOT EXISTS idx_patent_full_drafts_patent_result_id 
  ON patent_full_drafts(patent_result_id);

CREATE INDEX IF NOT EXISTS idx_patent_full_drafts_created_at 
  ON patent_full_drafts(created_at DESC);

-- Unique constraint: one draft per creation plan
CREATE UNIQUE INDEX IF NOT EXISTS idx_patent_full_drafts_unique_plan 
  ON patent_full_drafts(patent_creation_plan_id);
