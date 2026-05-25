import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
    }
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patentResultId = searchParams.get("patentResultId");

    if (!patentResultId) {
      return NextResponse.json({
        error: "patentResultId query parameter is required",
        usage: "/api/debug/patent-plan?patentResultId=<uuid>"
      });
    }

    const supabase = getSupabaseClient();

    // Check if patent exists
    const { data: patent, error: patentError } = await supabase
      .from("patent_results")
      .select("id, title")
      .eq("id", patentResultId)
      .maybeSingle();

    // Check if plan exists
    const { data: plan, error: planError } = await supabase
      .from("patent_creation_plans")
      .select("id, score, priority, created_at")
      .eq("patent_result_id", patentResultId)
      .maybeSingle();

    // Check table existence by attempting query
    let tableCheck = "ok";
    let tableError = null;
    try {
      await supabase
        .from("patent_creation_plans")
        .select("id")
        .limit(1);
    } catch (e) {
      tableCheck = "error";
      tableError = e instanceof Error ? e.message : "Unknown table error";
    }

    // Check OpenAI key
    const openaiKeyExists = !!process.env.OPENAI_API_KEY;

    // Check Supabase config
    const supabaseUrlExists = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKeyExists = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    return NextResponse.json({
      patentResultId,
      patentExists: !!patent,
      patentTitle: patent?.title || null,
      planExists: !!plan,
      latestPlanId: plan?.id || null,
      planScore: plan?.score || null,
      planPriority: plan?.priority || null,
      planCreatedAt: plan?.created_at || null,
      openaiKeyExists,
      supabaseUrlExists,
      supabaseKeyExists,
      tableCheck,
      tableError: tableError || (planError ? planError.message : null),
      safeMessage: !patent
        ? "Patent not found in database"
        : !plan
        ? "No creation plan exists for this patent. Generation should auto-trigger on detail page."
        : "Plan exists and is ready to display",
      hint: !patent
        ? "Verify the patent ID is correct"
        : !openaiKeyExists
        ? "OpenAI API key not configured - fallback plans will be used"
        : !plan
        ? "Visit /patents/" + patentResultId + " to trigger auto-generation"
        : "Plan is ready",
    });
  } catch (error) {
    return NextResponse.json({
      error: "Debug check failed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
