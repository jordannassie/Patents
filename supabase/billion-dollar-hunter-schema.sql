-- Add billion-dollar analysis to opportunity_hunter_items
-- This stores the $1B Patent Hunter scoring analysis

ALTER TABLE opportunity_hunter_items
ADD COLUMN IF NOT EXISTS billion_dollar_analysis jsonb;

-- Add index for querying by $1B score
CREATE INDEX IF NOT EXISTS idx_opportunity_hunter_items_bd_score 
  ON opportunity_hunter_items((billion_dollar_analysis->>'billion_dollar_score'));

-- Add index for querying by verdict
CREATE INDEX IF NOT EXISTS idx_opportunity_hunter_items_bd_verdict 
  ON opportunity_hunter_items((billion_dollar_analysis->>'verdict'));

COMMENT ON COLUMN opportunity_hunter_items.billion_dollar_analysis IS '$1B Patent Hunter scoring analysis including future bottleneck scores, market inevitability, AI upgrade potential, and verdict';
