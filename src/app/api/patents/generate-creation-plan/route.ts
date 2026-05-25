import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { safeParsePatentPlan, createFallbackPlan } from "@/lib/patents/safeParsePatentPlan";

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
    }
  );
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(req: NextRequest) {
  let stage = "initialization";
  
  try {
    const supabase = getSupabaseClient();
    const openai = getOpenAIClient();

    const { patentResultId, force = false } = await req.json();

    if (!patentResultId) {
      return NextResponse.json(
        { 
          error: "patentResultId is required",
          stage: "validation",
          details: "No patent ID provided in request",
          hint: "Provide a valid patentResultId in the request body"
        },
        { status: 400 }
      );
    }

    // Check if plan already exists
    stage = "check_existing_plan";
    if (!force) {
      const { data: existingPlan } = await supabase
        .from("patent_creation_plans")
        .select("*")
        .eq("patent_result_id", patentResultId)
        .single();

      if (existingPlan) {
        return NextResponse.json({ plan: existingPlan });
      }
    }

    // Load patent result
    stage = "load_patent";
    const { data: patent, error: patentError } = await supabase
      .from("patent_results")
      .select("*")
      .eq("id", patentResultId)
      .single();

    if (patentError || !patent) {
      console.error("[Patent Creation Plan] Patent not found:", { patentResultId, error: patentError });
      return NextResponse.json(
        { 
          error: "Patent not found",
          stage: "load_patent",
          details: "The patent result does not exist in the database",
          hint: "Verify the patent ID is correct and the patent has been saved"
        },
        { status: 404 }
      );
    }

    // Load related data
    stage = "load_context";
    const { data: opportunityReport } = await supabase
      .from("patent_opportunity_reports")
      .select("*")
      .eq("patent_result_id", patentResultId)
      .maybeSingle();

    const { data: conceptReport } = await supabase
      .from("patent_concept_reports")
      .select("*")
      .eq("patent_result_id", patentResultId)
      .maybeSingle();

    const { data: hunterItem } = await supabase
      .from("opportunity_hunter_items")
      .select("*")
      .eq("patent_result_id", patentResultId)
      .maybeSingle();

    // Build context for OpenAI
    const context = {
      title: patent.title,
      abstract: patent.abstract,
      filing_date: patent.filing_date,
      grant_date: patent.grant_date,
      assignee: patent.assignee,
      status_estimate: patent.status_estimate,
      category: hunterItem?.category || "Not specified",
      bottleneck_reason: hunterItem?.recommendation || "Not specified",
      modernization_angle: opportunityReport?.modernization_angles?.[0] || "Not specified",
      score: opportunityReport?.opportunity_score || hunterItem?.pre_ai_score || 0,
    };

    // Check if OpenAI is available
    if (!openai) {
      console.warn("[Patent Creation Plan] OpenAI API key not configured, using fallback");
      stage = "openai_unavailable";
      const fallbackPlan = createFallbackPlan(patent.title, patent.abstract);
      
      // Save fallback plan
      stage = "database_insert";
      const { data: savedPlan, error: saveError } = await supabase
        .from("patent_creation_plans")
        .upsert({
          patent_result_id: patentResultId,
          opportunity_hunter_item_id: hunterItem?.id || null,
          ...fallbackPlan,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.error("[Patent Creation Plan] Error saving fallback plan:", saveError);
        return NextResponse.json(
          {
            error: "Failed to save fallback plan",
            stage: "database_insert",
            details: "Database insertion failed for fallback plan",
            hint: "Check database logs and table schema"
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        plan: savedPlan, 
        isFallback: true,
        message: "Fallback plan generated. OpenAI API key not configured. Retry for full AI analysis."
      });
    }

    // Generate plan with OpenAI
    stage = "openai_call";
    const prompt = `You are an elite patent strategist, deep-tech founder advisor, and future bottleneck analyst.

Your job is to decide what NEW patents should be created based on an existing patent/application signal.

CRITICAL RULES:
- Do NOT copy the existing patent
- Do NOT claim the existing patent is safe to use
- Do NOT guarantee patentability
- Do NOT give legal advice
- Use the existing patent only as a signal of prior art and technical direction
- Generate NEW improvement directions that could be filed as new patents after attorney review

Existing patent/application:
Title: ${context.title}
Abstract: ${context.abstract}
Filing date: ${context.filing_date || "Unknown"}
Grant date: ${context.grant_date || "Not granted"}
Assignee: ${Array.isArray(context.assignee) ? context.assignee.join(", ") : "Unknown"}
Status estimate: ${context.status_estimate}

Hunter context:
Category: ${context.category}
Bottleneck reason: ${context.bottleneck_reason}
Modernization angle: ${context.modernization_angle}
Score: ${context.score}

Return a JSON object with this exact structure:
{
  "source_title": "Brief title of the existing patent/application",
  "source_summary": "2-3 sentence summary of what the existing patent covers",
  "source_status_estimate": "Status (expired, active, pending, etc.)",
  "future_bottleneck": "What future bottleneck this area will face",
  "market_timing": "Why this is timely now (2-3 sentences)",
  "recommended_patent_title": "Title for the BEST new patent to file first",
  "recommended_patent_summary": "3-4 sentence summary of the recommended new patent",
  "why_this_is_best": "Why this is the best patent direction to pursue first (3-4 sentences)",
  "new_patent_ideas": [
    {
      "title": "Patent idea title",
      "summary": "What this patent would cover",
      "what_it_would_claim": "Specific claims it could make",
      "why_it_is_new_direction": "How this differs from the existing patent",
      "market_need": "Why someone would buy/license this",
      "score": 0-100
    }
  ],
  "filing_priority_rankings": [
    {
      "rank": 1,
      "title": "Patent title",
      "reason": "Why file this first/second/third",
      "file_now_or_later": "File now" | "File in 6 months" | "File in 1 year"
    }
  ],
  "possible_claim_themes": [
    {
      "claim_theme": "Claim theme/direction",
      "description": "What this would claim",
      "novelty_angle": "Why this could be novel"
    }
  ],
  "system_architecture": [
    {
      "component": "System component",
      "function": "What it does",
      "why_it_matters": "Why this is important"
    }
  ],
  "target_buyers": [
    {
      "buyer": "Type of buyer (enterprise, government, etc.)",
      "why_they_need_it": "Why they would buy/license this"
    }
  ],
  "venture_angle": "How to turn this into a venture (3-4 sentences)",
  "founder_next_steps": [
    {
      "step": "Step name (e.g., 'File provisional patent', 'Build MVP')",
      "action": "Specific action to take",
      "outcome": "Expected outcome"
    }
  ],
  "score": 0-100,
  "priority": "BEST_TO_FILE" | "TOP_TARGET" | "STRONG" | "WATCH" | "SKIP",
  "risks": "Key risks (technical, market, IP, competitive)",
  "attorney_review_note": "What a patent attorney should review before filing"
}

Priority scoring:
- 90-100 = BEST_TO_FILE (file this patent first)
- 80-89 = TOP_TARGET (strong patent direction)
- 70-79 = STRONG (good patent direction)
- 60-69 = WATCH (interesting but lower priority)
- Below 60 = SKIP (not worth pursuing)

Focus on markets:
- AI agents and automation
- Fraud prevention and security
- Payments and fintech
- Crypto irreversible transactions
- Cybersecurity
- Defense and DARPA
- Robotics and drones
- Digital identity
- Energy and grid
- Compute infrastructure
- Compliance and liability
- Healthcare automation
- Infrastructure bottlenecks

Avoid:
- Vague ideas
- Generic software
- Small consumer apps
- Weak markets
- Ideas that copy the old patent

The plan must be:
- Specific and actionable
- Focused on NEW improvements
- Targeted at enterprise/government/financial buyers
- Realistic about $1B+ potential`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an elite patent strategist. Always return valid JSON with specific, actionable patent filing recommendations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const rawContent = completion.choices[0].message.content || "{}";
      
      // Parse and normalize JSON
      stage = "json_parse";
      const planData = safeParsePatentPlan(rawContent);

      // Save plan to database
      stage = "database_insert";
      const { data: savedPlan, error: saveError } = await supabase
        .from("patent_creation_plans")
        .upsert({
          patent_result_id: patentResultId,
          opportunity_hunter_item_id: hunterItem?.id || null,
          source_title: planData.source_title,
          source_summary: planData.source_summary,
          source_status_estimate: planData.source_status_estimate,
          future_bottleneck: planData.future_bottleneck,
          market_timing: planData.market_timing,
          recommended_patent_title: planData.recommended_patent_title,
          recommended_patent_summary: planData.recommended_patent_summary,
          why_this_is_best: planData.why_this_is_best,
          new_patent_ideas: planData.new_patent_ideas,
          filing_priority_rankings: planData.filing_priority_rankings,
          possible_claim_themes: planData.possible_claim_themes,
          system_architecture: planData.system_architecture,
          target_buyers: planData.target_buyers,
          venture_angle: planData.venture_angle,
          founder_next_steps: planData.founder_next_steps,
          score: planData.score,
          priority: planData.priority,
          risks: planData.risks,
          attorney_review_note: planData.attorney_review_note,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.error("[Patent Creation Plan] Error saving plan:", saveError);
        return NextResponse.json(
          {
            error: "Failed to save plan to database",
            stage: "database_insert",
            details: saveError.message || "Database insertion failed",
            hint: "Check if patent_creation_plans table exists and has correct schema"
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ plan: savedPlan });
    } catch (openaiError) {
      // If OpenAI fails, use fallback
      console.error("[Patent Creation Plan] OpenAI error, using fallback:", openaiError);
      stage = "openai_error_fallback";
      
      const fallbackPlan = createFallbackPlan(patent.title, patent.abstract);
      
      // Save fallback plan
      stage = "database_insert";
      const { data: savedPlan, error: saveError } = await supabase
        .from("patent_creation_plans")
        .upsert({
          patent_result_id: patentResultId,
          opportunity_hunter_item_id: hunterItem?.id || null,
          ...fallbackPlan,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.error("[Patent Creation Plan] Error saving fallback plan after OpenAI error:", saveError);
        return NextResponse.json(
          {
            error: "Failed to save fallback plan",
            stage: "database_insert",
            details: "Both OpenAI and database operations failed",
            hint: "Check OpenAI API key and database connection"
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        plan: savedPlan, 
        isFallback: true,
        message: "Fallback plan generated due to AI error. Retry for full analysis.",
        originalError: openaiError instanceof Error ? openaiError.message : "Unknown OpenAI error"
      });
    }
  } catch (error) {
    console.error("[Patent Creation Plan] Error at stage:", stage, error);
    return NextResponse.json(
      { 
        error: "Failed to generate patent creation plan",
        stage,
        details: error instanceof Error ? error.message : "Unknown error",
        hint: stage === "database_insert" 
          ? "Check if patent_creation_plans table exists with correct schema" 
          : stage === "load_patent"
          ? "Verify patent result exists in database"
          : "Check server logs for more details"
      },
      { status: 500 }
    );
  }
}
