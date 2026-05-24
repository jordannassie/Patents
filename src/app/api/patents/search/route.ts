/**
 * Patent Search API Route
 * POST /api/patents/search
 *
 * RATE LIMIT PROTECTION:
 * - Caches all searches for 7 days
 * - Max 25 results per search
 * - Checks cache BEFORE calling external APIs
 * - Records API usage for monitoring
 *
 * Request body:
 * {
 *   "query": "crypto transaction safety",
 *   "market": "Crypto Security" (optional)
 * }
 *
 * Response:
 * {
 *   "searchId": "uuid",
 *   "results": [...],
 *   "cached": boolean,
 *   "resultCount": number
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { searchPatents, recordAPIUsage } from "@/lib/patents/searchPatents";

// Cache duration: 7 days in milliseconds
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Parse request body
    const body = await request.json();
    const { query, market } = body;

    // Validate query
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const normalizedQuery = query.trim().toLowerCase();
    const normalizedMarket = market?.trim() || null;

    // Generate cache key
    const cacheKey = `${normalizedQuery}:${normalizedMarket || "all"}`;

    // Step 1: Check cache first
    const { data: cachedData, error: cacheError } = await supabaseAdmin
      .from("patent_api_cache")
      .select("*")
      .eq("cache_key", cacheKey)
      .single();

    if (cachedData && !cacheError) {
      // Check if cache is still valid (less than 7 days old)
      const cacheAge = Date.now() - new Date(cachedData.created_at).getTime();

      if (cacheAge < CACHE_DURATION_MS) {
        console.log(`Cache hit for query: "${query}"`);

        // Return cached results
        const cachedResults = cachedData.response_json as {
          searchId: string;
          results: unknown[];
        };

        return NextResponse.json({
          ...cachedResults,
          cached: true,
          resultCount: cachedResults.results.length,
        });
      } else {
        // Cache expired, delete it
        await supabaseAdmin
          .from("patent_api_cache")
          .delete()
          .eq("cache_key", cacheKey);
      }
    }

    // Step 2: Cache miss - call external patent API
    console.log(`Cache miss for query: "${query}" - calling external API`);

    const patentResults = await searchPatents(normalizedQuery, normalizedMarket);

    // Step 3: Create patent_searches record
    const { data: searchRecord, error: searchError } = await supabaseAdmin
      .from("patent_searches")
      .insert({
        query: normalizedQuery,
        market: normalizedMarket,
        source: patentResults[0]?.source || "unknown",
        result_count: patentResults.length,
      })
      .select()
      .single();

    if (searchError || !searchRecord) {
      console.error("Error creating search record:", searchError);
      return NextResponse.json(
        { error: "Failed to create search record" },
        { status: 500 }
      );
    }

    // Step 4: Insert patent results
    const resultsToInsert = patentResults.map((result) => ({
      search_id: searchRecord.id,
      patent_number: result.patent_number,
      title: result.title,
      abstract: result.abstract,
      filing_date: result.filing_date,
      grant_date: result.grant_date,
      assignee: result.assignee,
      inventors: result.inventors,
      cpc_codes: result.cpc_codes,
      status_estimate: result.status_estimate,
      source_url: result.source_url,
      source: result.source,
      is_demo: result.is_demo,
      raw_json: result.raw_json,
    }));

    const { data: insertedResults, error: insertError } = await supabaseAdmin
      .from("patent_results")
      .insert(resultsToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting results:", insertError);
      return NextResponse.json(
        { error: "Failed to insert patent results" },
        { status: 500 }
      );
    }

    // Step 5: Store in cache
    const responseData = {
      searchId: searchRecord.id,
      results: insertedResults,
      resultCount: insertedResults?.length || 0,
    };

    await supabaseAdmin.from("patent_api_cache").insert({
      cache_key: cacheKey,
      query: normalizedQuery,
      market: normalizedMarket,
      response_json: responseData,
    });

    // Step 6: Record API usage (if not demo data)
    if (!patentResults[0]?.is_demo) {
      await supabaseAdmin.from("patent_api_usage").insert({
        provider: patentResults[0]?.source || "unknown",
        endpoint: "search",
        request_count: 1,
      });
    }

    // Return response
    return NextResponse.json({
      ...responseData,
      cached: false,
    });
  } catch (error) {
    console.error("Patent search error:", error);
    return NextResponse.json(
      {
        error: "Internal server error during patent search",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
