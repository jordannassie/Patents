/**
 * Patent AI Opportunity Analysis API Route
 * POST /api/patents/analyze
 *
 * Generates AI-powered opportunity reports for patents
 *
 * Request body:
 * {
 *   "patentResultId": "uuid",
 *   "force": boolean (optional - regenerate even if report exists)
 * }
 *
 * Response:
 * {
 *   "report": { opportunity_score, summary, ... },
 *   "isDemo": boolean
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { analyzePatentOpportunity } from "@/lib/patents/analyzePatentOpportunity";

export async function POST(request: NextRequest) {
  try {
    console.log("[Patent Analyze] Starting analysis request");

    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { patentResultId, force = false } = body;

    // Validate patentResultId
    if (!patentResultId || typeof patentResultId !== "string") {
      return NextResponse.json(
        { error: "patentResultId is required and must be a string" },
        { status: 400 }
      );
    }

    console.log("[Patent Analyze] patent result ID:", patentResultId);
    console.log("[Patent Analyze] force regenerate:", force);

    // Use shared helper for analysis
    const result = await analyzePatentOpportunity(patentResultId, force);

    // Load full report from database
    const { data: fullReport, error: reportError } = await supabaseAdmin
      .from("patent_opportunity_reports")
      .select("*")
      .eq("id", result.reportId)
      .single();

    if (reportError || !fullReport) {
      throw new Error("Failed to load saved report");
    }

    console.log("[Patent Analyze] report ready:", result.reportId);

    return NextResponse.json({
      report: fullReport,
      isDemo: result.isDemo,
      cached: !force,
    });
  } catch (error) {
    console.error("[Patent Analyze] fatal error:", error);
    return NextResponse.json(
      {
        error: "Internal server error during analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

