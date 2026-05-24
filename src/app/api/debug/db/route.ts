/**
 * Database Debug Route
 * GET /api/debug/db
 *
 * Server-side diagnostics for Supabase connection and table access
 *
 * Returns:
 * {
 *   env: { supabaseUrl: boolean, serviceRoleKey: boolean },
 *   tables: { patent_searches: number | error, ... }
 * }
 *
 * IMPORTANT: Never returns actual environment variable values
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    console.log("[Debug DB] Starting database diagnostics");

    // Check environment variables exist (never return values)
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    console.log("[Debug DB] Environment check:", envCheck);

    // If env vars missing, return early
    if (!envCheck.supabaseUrl || !envCheck.serviceRoleKey) {
      return NextResponse.json({
        env: envCheck,
        tables: {
          error: "Missing required environment variables",
        },
      });
    }

    // Try to get Supabase client
    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch (error) {
      return NextResponse.json({
        env: envCheck,
        tables: {
          error:
            "Failed to initialize Supabase client: " +
            (error instanceof Error ? error.message : "Unknown error"),
        },
      });
    }

    // Check each table
    const tables: Record<string, number | string> = {};

    // patent_searches
    try {
      const { count, error } = await supabaseAdmin
        .from("patent_searches")
        .select("*", { count: "exact", head: true });

      if (error) {
        tables.patent_searches = `Error: ${error.message}`;
        console.error("[Debug DB] patent_searches error:", error);
      } else {
        tables.patent_searches = count || 0;
        console.log("[Debug DB] patent_searches count:", count);
      }
    } catch (error) {
      tables.patent_searches =
        "Exception: " +
        (error instanceof Error ? error.message : "Unknown error");
    }

    // patent_results
    try {
      const { count, error } = await supabaseAdmin
        .from("patent_results")
        .select("*", { count: "exact", head: true });

      if (error) {
        tables.patent_results = `Error: ${error.message}`;
        console.error("[Debug DB] patent_results error:", error);
      } else {
        tables.patent_results = count || 0;
        console.log("[Debug DB] patent_results count:", count);
      }
    } catch (error) {
      tables.patent_results =
        "Exception: " +
        (error instanceof Error ? error.message : "Unknown error");
    }

    // patent_api_cache
    try {
      const { count, error } = await supabaseAdmin
        .from("patent_api_cache")
        .select("*", { count: "exact", head: true });

      if (error) {
        tables.patent_api_cache = `Error: ${error.message}`;
        console.error("[Debug DB] patent_api_cache error:", error);
      } else {
        tables.patent_api_cache = count || 0;
        console.log("[Debug DB] patent_api_cache count:", count);
      }
    } catch (error) {
      tables.patent_api_cache =
        "Exception: " +
        (error instanceof Error ? error.message : "Unknown error");
    }

    // patent_api_usage
    try {
      const { count, error } = await supabaseAdmin
        .from("patent_api_usage")
        .select("*", { count: "exact", head: true });

      if (error) {
        tables.patent_api_usage = `Error: ${error.message}`;
        console.error("[Debug DB] patent_api_usage error:", error);
      } else {
        tables.patent_api_usage = count || 0;
        console.log("[Debug DB] patent_api_usage count:", count);
      }
    } catch (error) {
      tables.patent_api_usage =
        "Exception: " +
        (error instanceof Error ? error.message : "Unknown error");
    }

    console.log("[Debug DB] Diagnostics complete");

    return NextResponse.json({
      env: envCheck,
      tables,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Debug DB] Fatal error:", error);
    return NextResponse.json(
      {
        error: "Fatal error during diagnostics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
