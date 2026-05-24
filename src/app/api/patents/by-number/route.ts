/**
 * Get Patent by Number API Route
 * GET /api/patents/by-number?number=US6026163
 *
 * Fetches patent result and associated report from Supabase
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get("number");

    if (!number) {
      return NextResponse.json(
        { error: "Patent number is required" },
        { status: 400 }
      );
    }

    console.log("[Patent By Number] fetching patent:", number);

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch patent result
    const { data: patent, error: patentError } = await supabaseAdmin
      .from("patent_results")
      .select("*")
      .eq("patent_number", number)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (patentError || !patent) {
      console.error("[Patent By Number] not found:", patentError);
      return NextResponse.json(
        { error: "Patent not found" },
        { status: 404 }
      );
    }

    // Fetch latest report if exists
    const { data: report } = await supabaseAdmin
      .from("patent_opportunity_reports")
      .select("*")
      .eq("patent_result_id", patent.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    console.log("[Patent By Number] found patent, has report:", !!report);

    return NextResponse.json({
      patent,
      report: report || null,
    });
  } catch (error) {
    console.error("[Patent By Number] error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
