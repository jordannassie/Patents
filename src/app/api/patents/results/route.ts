/**
 * Patent Results API Route
 * GET /api/patents/results?searchId=uuid
 *
 * Fetches patent results for a specific search from Supabase
 *
 * Query params:
 * - searchId: UUID of the search record
 *
 * Response:
 * {
 *   "search": { id, query, market, ... },
 *   "results": [ { patent_number, title, ... }, ... ]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get("searchId");

    // Validate searchId
    if (!searchId) {
      return NextResponse.json(
        { error: "searchId is required" },
        { status: 400 }
      );
    }

    // Fetch search record
    const { data: searchRecord, error: searchError } = await supabaseAdmin
      .from("patent_searches")
      .select("*")
      .eq("id", searchId)
      .single();

    if (searchError || !searchRecord) {
      return NextResponse.json(
        { error: "Search not found" },
        { status: 404 }
      );
    }

    // Fetch patent results for this search
    const { data: results, error: resultsError } = await supabaseAdmin
      .from("patent_results")
      .select("*")
      .eq("search_id", searchId)
      .order("created_at", { ascending: false });

    if (resultsError) {
      console.error("Error fetching results:", resultsError);
      return NextResponse.json(
        { error: "Failed to fetch patent results" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      search: searchRecord,
      results: results || [],
      resultCount: results?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching patent results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
