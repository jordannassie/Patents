/**
 * Supabase Admin Client (Server-Side Only)
 *
 * CRITICAL: This client uses the SERVICE_ROLE_KEY which bypasses Row Level Security (RLS).
 * - NEVER import this in client components
 * - ONLY use in API routes and server components
 * - The service role key has full database access
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase admin client
 * Lazy initialization to avoid build-time errors when env vars are not set
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not defined. Please add it to your environment variables."
    );
  }

  if (!supabaseServiceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not defined. Please add it to your environment variables."
    );
  }

  // Create admin client with service role key
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminInstance;
}

// Export as named export for backward compatibility
export const supabaseAdmin = getSupabaseAdmin;

// Database types for type safety
export type Database = {
  patent_searches: {
    id: string;
    query: string;
    market: string | null;
    source: string;
    result_count: number;
    created_at: string;
  };
  patent_results: {
    id: string;
    search_id: string;
    patent_number: string | null;
    title: string | null;
    abstract: string | null;
    filing_date: string | null;
    grant_date: string | null;
    assignee: string | null;
    inventors: string | null;
    cpc_codes: string | null;
    status_estimate: string | null;
    source_url: string | null;
    source: string;
    is_demo: boolean;
    raw_json: unknown;
    created_at: string;
  };
  patent_api_cache: {
    id: string;
    cache_key: string;
    query: string;
    market: string | null;
    response_json: unknown;
    created_at: string;
  };
  patent_api_usage: {
    id: string;
    provider: string;
    endpoint: string | null;
    request_count: number;
    created_at: string;
  };
};

