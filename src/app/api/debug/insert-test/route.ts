/**
 * Database Insert Test Route
 * GET /api/debug/insert-test
 *
 * TEMPORARY ROUTE - Remove this route before public launch.
 *
 * Inserts a test row into patent_searches table to verify write access
 * Returns the inserted row ID for verification
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    console.log("[Debug Insert Test] Starting insert test");

    // Check environment variables
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        {
          error: "Missing required environment variables",
          env: {
            supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          },
        },
        { status: 500 }
      );
    }

    // Get Supabase client
    const supabaseAdmin = getSupabaseAdmin();

    // Insert test row
    const { data, error } = await supabaseAdmin
      .from("patent_searches")
      .insert({
        query: "debug test",
        market: "Debug",
        source: "debug",
        result_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("[Debug Insert Test] Insert failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log("[Debug Insert Test] Insert successful, ID:", data.id);

    return NextResponse.json({
      success: true,
      insertedId: data.id,
      insertedRow: {
        id: data.id,
        query: data.query,
        market: data.market,
        source: data.source,
        result_count: data.result_count,
        created_at: data.created_at,
      },
      message: "Test row inserted successfully. Check Supabase dashboard.",
    });
  } catch (error) {
    console.error("[Debug Insert Test] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Fatal error during insert test",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
