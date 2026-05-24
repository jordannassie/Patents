-- PatentBoom Database Schema
-- This schema defines tables for patent search caching, results storage, AI opportunity reports, and API usage tracking.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patent Searches Table
-- Stores every search query made by users for caching and analytics
CREATE TABLE IF NOT EXISTS patent_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    market TEXT,
    source TEXT DEFAULT 'uspto',
    result_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster query lookups
CREATE INDEX IF NOT EXISTS idx_patent_searches_query ON patent_searches(query);
CREATE INDEX IF NOT EXISTS idx_patent_searches_created_at ON patent_searches(created_at);

-- Patent Results Table
-- Stores normalized patent data from search results
CREATE TABLE IF NOT EXISTS patent_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_id UUID REFERENCES patent_searches(id) ON DELETE CASCADE,
    patent_number TEXT,
    title TEXT,
    abstract TEXT,
    filing_date TEXT,
    grant_date TEXT,
    assignee TEXT,
    inventors TEXT,
    cpc_codes TEXT,
    status_estimate TEXT,
    source_url TEXT,
    source TEXT DEFAULT 'uspto',
    is_demo BOOLEAN DEFAULT FALSE,
    raw_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for patent results
CREATE INDEX IF NOT EXISTS idx_patent_results_search_id ON patent_results(search_id);
CREATE INDEX IF NOT EXISTS idx_patent_results_patent_number ON patent_results(patent_number);
CREATE INDEX IF NOT EXISTS idx_patent_results_is_demo ON patent_results(is_demo);

-- Patent Opportunity Reports Table
-- Stores AI-generated opportunity analysis for patents
CREATE TABLE IF NOT EXISTS patent_opportunity_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patent_result_id UUID REFERENCES patent_results(id) ON DELETE CASCADE,
    opportunity_score INTEGER,
    future_market_score INTEGER,
    ai_upgrade_score INTEGER,
    patentability_score INTEGER,
    buildability_score INTEGER,
    revenue_score INTEGER,
    strategic_fit_score INTEGER,
    summary TEXT,
    modernization_angles JSONB,
    venture_concepts JSONB,
    new_patent_directions JSONB,
    risks TEXT,
    recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for opportunity reports
CREATE INDEX IF NOT EXISTS idx_patent_opportunity_reports_patent_result_id ON patent_opportunity_reports(patent_result_id);

-- Saved Opportunities Table
-- Tracks patents that users have saved for future reference
CREATE TABLE IF NOT EXISTS saved_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patent_result_id UUID REFERENCES patent_results(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for saved opportunities
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_patent_result_id ON saved_opportunities(patent_result_id);

-- Patent API Cache Table
-- Caches external API responses to avoid duplicate API calls
CREATE TABLE IF NOT EXISTS patent_api_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT UNIQUE NOT NULL,
    query TEXT NOT NULL,
    market TEXT,
    response_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for cache lookups
CREATE INDEX IF NOT EXISTS idx_patent_api_cache_cache_key ON patent_api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_patent_api_cache_created_at ON patent_api_cache(created_at);

-- Patent API Usage Table
-- Tracks API usage for monitoring and rate limiting
CREATE TABLE IF NOT EXISTS patent_api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    endpoint TEXT,
    request_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for usage tracking
CREATE INDEX IF NOT EXISTS idx_patent_api_usage_provider ON patent_api_usage(provider);
CREATE INDEX IF NOT EXISTS idx_patent_api_usage_created_at ON patent_api_usage(created_at);

-- Comments for documentation
COMMENT ON TABLE patent_searches IS 'Stores user search queries for caching and analytics';
COMMENT ON TABLE patent_results IS 'Normalized patent data from search results';
COMMENT ON TABLE patent_opportunity_reports IS 'AI-generated opportunity analysis for patents';
COMMENT ON TABLE saved_opportunities IS 'User-saved patents for future reference';
COMMENT ON TABLE patent_api_cache IS 'Caches external API responses to reduce API calls (7 day TTL)';
COMMENT ON TABLE patent_api_usage IS 'Tracks external API usage for monitoring and rate limiting';
