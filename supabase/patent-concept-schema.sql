-- Patent Concept Reports Table
-- Stores AI-generated $1B patent concept reports inspired by old patents

CREATE TABLE IF NOT EXISTS patent_concept_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patent_result_id uuid REFERENCES patent_results(id) ON DELETE CASCADE NOT NULL,
  opportunity_hunter_item_id uuid REFERENCES opportunity_hunter_items(id) ON DELETE SET NULL,
  patent_opportunity_report_id uuid REFERENCES patent_opportunity_reports(id) ON DELETE SET NULL,
  
  -- Core concept fields
  concept_title text NOT NULL,
  bottleneck_solved text,
  why_now text,
  old_invention_insight text,
  new_invention_concept text,
  
  -- Technical details
  system_architecture jsonb,
  ai_upgrade_layers jsonb,
  possible_claim_directions jsonb,
  
  -- Venture details
  venture_concept jsonb,
  target_customers jsonb,
  billion_dollar_thesis text,
  
  -- Defense/DARPA
  darpa_relevance text,
  
  -- Legal/risk
  risks text,
  attorney_review_notes text,
  
  -- Provisional draft starter
  provisional_draft_starter jsonb,
  
  -- Scoring
  overall_score integer,
  
  -- Timestamps
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patent_concept_reports_patent_result_id 
  ON patent_concept_reports(patent_result_id);
  
CREATE INDEX IF NOT EXISTS idx_patent_concept_reports_overall_score 
  ON patent_concept_reports(overall_score);
  
CREATE INDEX IF NOT EXISTS idx_patent_concept_reports_created_at 
  ON patent_concept_reports(created_at);

-- Comments
COMMENT ON TABLE patent_concept_reports IS 'AI-generated $1B patent concept reports inspired by old patents and future bottlenecks';
COMMENT ON COLUMN patent_concept_reports.concept_title IS 'Title of the new patent concept';
COMMENT ON COLUMN patent_concept_reports.bottleneck_solved IS 'Description of the future bottleneck this concept solves';
COMMENT ON COLUMN patent_concept_reports.new_invention_concept IS 'The NEW invention concept (not copying the old patent)';
COMMENT ON COLUMN patent_concept_reports.provisional_draft_starter IS 'Starter content for provisional patent filing';
