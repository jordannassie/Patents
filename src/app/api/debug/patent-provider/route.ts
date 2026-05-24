/**
 * Patent Provider Debug Route
 * GET /api/debug/patent-provider
 *
 * Tests the patent provider directly without caching.
 * Returns debug info about API key availability and live API status.
 *
 * NEVER returns actual API key values - only true/false for existence.
 */

import { NextResponse } from "next/server";
import { searchPatents } from "@/lib/patents/searchPatents";

export async function GET() {
  const patentsViewKey = process.env.PATENTSVIEW_API_KEY;
  const usptoKey = process.env.USPTO_API_KEY;

  console.log("[Patent Provider Debug] starting test");
  console.log("[Patent Provider Debug] PATENTSVIEW_API_KEY exists:", !!patentsViewKey);
  console.log("[Patent Provider Debug] USPTO_API_KEY exists:", !!usptoKey);

  try {
    // Attempt a small test search
    const testQuery = "blockchain voting";
    console.log("[Patent Provider Debug] testing with query:", testQuery);

    const searchResult = await searchPatents(testQuery);

    console.log("[Patent Provider Debug] search completed");
    console.log("[Patent Provider Debug] provider:", searchResult.provider);
    console.log("[Patent Provider Debug] results count:", searchResult.results.length);
    console.log("[Patent Provider Debug] is demo:", searchResult.isDemo);

    return NextResponse.json({
      env: {
        patentsViewKey: !!patentsViewKey,
        usptoKey: !!usptoKey,
      },
      providerAttempted: searchResult.provider,
      isDemo: searchResult.isDemo,
      resultCount: searchResult.results.length,
      providerStatus: searchResult.providerStatus || null,
      providerError: searchResult.providerError || null,
      firstResultPreview: searchResult.results[0]
        ? {
            patent_number: searchResult.results[0].patent_number,
            title: searchResult.results[0].title,
            source: searchResult.results[0].source,
            is_demo: searchResult.results[0].is_demo,
          }
        : null,
    });
  } catch (error) {
    console.error("[Patent Provider Debug] test failed:", error);

    return NextResponse.json(
      {
        env: {
          patentsViewKey: !!patentsViewKey,
          usptoKey: !!usptoKey,
        },
        providerAttempted: "unknown",
        error: error instanceof Error ? error.message : "Unknown error",
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    );
  }
}
