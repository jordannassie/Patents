import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

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

    const { patentCreationPlanId, force = false } = await req.json();

    if (!patentCreationPlanId) {
      return NextResponse.json(
        { 
          error: "patentCreationPlanId is required",
          stage: "validation",
          details: "No creation plan ID provided in request",
          hint: "Provide a valid patentCreationPlanId in the request body"
        },
        { status: 400 }
      );
    }

    // Check if draft already exists
    stage = "check_existing_draft";
    if (!force) {
      const { data: existingDraft } = await supabase
        .from("patent_full_drafts")
        .select("*")
        .eq("patent_creation_plan_id", patentCreationPlanId)
        .maybeSingle();

      if (existingDraft) {
        return NextResponse.json({ draft: existingDraft });
      }
    }

    // Load patent creation plan
    stage = "load_creation_plan";
    const { data: creationPlan, error: planError } = await supabase
      .from("patent_creation_plans")
      .select("*")
      .eq("id", patentCreationPlanId)
      .single();

    if (planError || !creationPlan) {
      console.error("[Patent Full Draft] Creation plan not found:", { patentCreationPlanId, error: planError });
      return NextResponse.json(
        { 
          error: "Patent creation plan not found",
          stage: "load_creation_plan",
          details: "The creation plan does not exist in the database",
          hint: "Verify the creation plan ID is correct"
        },
        { status: 404 }
      );
    }

    // Load patent result
    stage = "load_patent";
    const { data: patent, error: patentError } = await supabase
      .from("patent_results")
      .select("*")
      .eq("id", creationPlan.patent_result_id)
      .single();

    if (patentError || !patent) {
      console.error("[Patent Full Draft] Patent not found:", { patentResultId: creationPlan.patent_result_id, error: patentError });
      return NextResponse.json(
        { 
          error: "Patent not found",
          stage: "load_patent",
          details: "The patent result does not exist in the database",
          hint: "The creation plan references a missing patent"
        },
        { status: 404 }
      );
    }

    // Check if OpenAI is available
    if (!openai) {
      console.warn("[Patent Full Draft] OpenAI API key not configured");
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          stage: "openai_unavailable",
          details: "Full patent draft generation requires OpenAI",
          hint: "Configure OPENAI_API_KEY environment variable"
        },
        { status: 503 }
      );
    }

    // Build context for OpenAI
    const context = {
      recommended_patent_title: creationPlan.recommended_patent_title,
      recommended_patent_summary: creationPlan.recommended_patent_summary,
      future_bottleneck: creationPlan.future_bottleneck,
      why_this_is_best: creationPlan.why_this_is_best,
      possible_claim_themes: creationPlan.possible_claim_themes || [],
      system_architecture: creationPlan.system_architecture || [],
      target_buyers: creationPlan.target_buyers || [],
      venture_angle: creationPlan.venture_angle,
      risks: creationPlan.risks,
      source_title: creationPlan.source_title,
      source_summary: creationPlan.source_summary,
    };

    // Generate draft with OpenAI
    stage = "openai_call";
    const prompt = `You are an expert patent drafting assistant helping prepare a patent draft package for attorney review.

CRITICAL DISCLAIMERS:
- You are NOT providing legal advice
- You are NOT guaranteeing patentability
- You are NOT saying this is ready to file without review
- You are creating a structured draft package based on a NEW invention direction

Patent Creation Plan:

Recommended Patent Title: ${context.recommended_patent_title}

Recommended Patent Summary: ${context.recommended_patent_summary}

Future Bottleneck: ${context.future_bottleneck}

Why This Is Best: ${context.why_this_is_best}

Possible Claim Themes:
${JSON.stringify(context.possible_claim_themes, null, 2)}

System Architecture:
${JSON.stringify(context.system_architecture, null, 2)}

Target Buyers:
${JSON.stringify(context.target_buyers, null, 2)}

Venture Angle: ${context.venture_angle}

Risks: ${context.risks}

Existing Patent Signal:
${context.source_title}
${context.source_summary}

Return valid JSON with this exact structure:
{
  "draft_title": "Title for the new patent application",
  "field_of_invention": "Description of the technical field (2-3 sentences)",
  "background": "Background explaining the technical problem and prior art context (4-6 paragraphs)",
  "problem_statement": "Clear articulation of the problem being solved (2-3 paragraphs)",
  "summary_of_invention": "High-level summary of the NEW invention (3-4 paragraphs)",
  "system_overview": "Overview of the system architecture and key components (3-4 paragraphs)",
  "technical_architecture": [
    {
      "component": "Component name",
      "description": "What this component does",
      "function": "How it works and why it matters"
    }
  ],
  "method_flow": [
    {
      "step_number": 1,
      "step_title": "Step title",
      "description": "Detailed description of this step"
    }
  ],
  "detailed_description": "Full detailed description of the invention including all technical aspects, implementation details, and how components work together (8-12 paragraphs minimum)",
  "example_embodiments": [
    {
      "embodiment": "Embodiment name/title",
      "description": "Detailed description of this specific implementation"
    }
  ],
  "alternative_embodiments": [
    {
      "variation": "Variation name",
      "description": "How this variation differs and why it's valuable"
    }
  ],
  "use_cases": [
    {
      "use_case": "Use case title",
      "description": "How the invention is applied in this scenario"
    }
  ],
  "claim_set": [
    {
      "claim_number": 1,
      "claim_type": "independent",
      "claim_text": "Full claim text with proper patent claim structure"
    }
  ],
  "abstract": "Patent abstract (150 words max)",
  "drawing_descriptions": [
    {
      "figure": "Figure 1",
      "description": "What this figure would illustrate"
    }
  ],
  "attorney_review_notes": "Notes for attorney review including areas needing novelty analysis, prior art searches, and freedom-to-operate review",
  "filing_notes": "Strategic notes about filing timeline, provisional vs non-provisional, and market considerations"
}

Drafting rules:
- Draft claims around the NEW invention, not the old patent
- Focus on new improvements, system architecture, method flow
- Include AI/ML features, real-time processing, adaptive systems where relevant
- Include at least 3 independent claims and 12 dependent claims
- Keep claim language broad but technically grounded
- Do not copy existing patent language
- Include specific technical details in the detailed description
- Make embodiments concrete and implementable
- Include attorney review notes identifying novelty and prior art concerns
- End attorney_review_notes with: "Attorney review required before filing."
- End filing_notes with: "This draft requires review by a qualified patent attorney."`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert patent drafting assistant. Always return valid JSON with comprehensive patent draft content. This is NOT legal advice and requires attorney review.",
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
      
      // Parse JSON
      stage = "json_parse";
      let draftData;
      try {
        draftData = JSON.parse(rawContent);
      } catch (parseError) {
        console.error("[Patent Full Draft] JSON parse error:", parseError);
        return NextResponse.json(
          {
            error: "Failed to parse draft response",
            stage: "json_parse",
            details: "OpenAI returned invalid JSON",
            hint: "Retry draft generation"
          },
          { status: 500 }
        );
      }

      // Save draft to database
      stage = "database_insert";
      const { data: savedDraft, error: saveError } = await supabase
        .from("patent_full_drafts")
        .upsert({
          patent_creation_plan_id: patentCreationPlanId,
          patent_result_id: creationPlan.patent_result_id,
          draft_title: draftData.draft_title,
          field_of_invention: draftData.field_of_invention,
          background: draftData.background,
          problem_statement: draftData.problem_statement,
          summary_of_invention: draftData.summary_of_invention,
          system_overview: draftData.system_overview,
          technical_architecture: draftData.technical_architecture,
          method_flow: draftData.method_flow,
          detailed_description: draftData.detailed_description,
          example_embodiments: draftData.example_embodiments,
          alternative_embodiments: draftData.alternative_embodiments,
          use_cases: draftData.use_cases,
          claim_set: draftData.claim_set,
          abstract: draftData.abstract,
          drawing_descriptions: draftData.drawing_descriptions,
          attorney_review_notes: draftData.attorney_review_notes,
          filing_notes: draftData.filing_notes,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.error("[Patent Full Draft] Error saving draft:", saveError);
        return NextResponse.json(
          {
            error: "Failed to save draft to database",
            stage: "database_insert",
            details: saveError.message || "Database insertion failed",
            hint: "Check if patent_full_drafts table exists and has correct schema"
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ draft: savedDraft });
    } catch (openaiError) {
      console.error("[Patent Full Draft] OpenAI error:", openaiError);
      return NextResponse.json(
        {
          error: "OpenAI generation failed",
          stage: "openai_call",
          details: openaiError instanceof Error ? openaiError.message : "Unknown OpenAI error",
          hint: "Check OpenAI API key and try again"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Patent Full Draft] Error at stage:", stage, error);
    return NextResponse.json(
      { 
        error: "Failed to create full patent draft",
        stage,
        details: error instanceof Error ? error.message : "Unknown error",
        hint: stage === "database_insert" 
          ? "Check if patent_full_drafts table exists with correct schema" 
          : "Check server logs for more details"
      },
      { status: 500 }
    );
  }
}
