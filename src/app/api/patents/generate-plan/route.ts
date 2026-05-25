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
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const openai = getOpenAIClient();

    const { patentResultId, force = false } = await req.json();

    if (!patentResultId) {
      return NextResponse.json(
        { error: "patentResultId is required" },
        { status: 400 }
      );
    }

    // Check if plan already exists
    if (!force) {
      const { data: existingPlan } = await supabase
        .from("patent_venture_plans")
        .select("*")
        .eq("patent_result_id", patentResultId)
        .single();

      if (existingPlan) {
        return NextResponse.json({ plan: existingPlan });
      }
    }

    // Load patent result
    const { data: patent, error: patentError } = await supabase
      .from("patent_results")
      .select("*")
      .eq("id", patentResultId)
      .single();

    if (patentError || !patent) {
      return NextResponse.json(
        { error: "Patent not found" },
        { status: 404 }
      );
    }

    // Load related data
    const { data: opportunityReport } = await supabase
      .from("patent_opportunity_reports")
      .select("*")
      .eq("patent_result_id", patentResultId)
      .single();

    const { data: conceptReport } = await supabase
      .from("patent_concept_reports")
      .select("*")
      .eq("patent_result_id", patentResultId)
      .single();

    const { data: hunterItem } = await supabase
      .from("opportunity_hunter_items")
      .select("*")
      .eq("patent_result_id", patentResultId)
      .maybeSingle();

    // Build context for OpenAI
    const context = {
      patent: {
        title: patent.title,
        abstract: patent.abstract,
        filing_date: patent.filing_date,
        grant_date: patent.grant_date,
        assignee: patent.assignee,
        inventors: patent.inventors,
        status_estimate: patent.status_estimate,
        patent_number: patent.patent_number,
      },
      opportunity_report: opportunityReport
        ? {
            opportunity_score: opportunityReport.opportunity_score,
            recommendation: opportunityReport.recommendation,
            modernization_angles: opportunityReport.modernization_angles,
            venture_concepts: opportunityReport.venture_concepts,
            patent_directions: opportunityReport.patent_directions,
            future_bottleneck_score: opportunityReport.future_bottleneck_score,
            market_inevitability_score: opportunityReport.market_inevitability_score,
            ai_upgrade_score: opportunityReport.ai_upgrade_score,
            patentability_score: opportunityReport.patentability_score,
            buildability_score: opportunityReport.buildability_score,
            revenue_score: opportunityReport.revenue_score,
            strategic_fit_score: opportunityReport.strategic_fit_score,
          }
        : null,
      concept_report: conceptReport
        ? {
            concept_title: conceptReport.concept_title,
            bottleneck_solved: conceptReport.bottleneck_solved,
            why_now: conceptReport.why_now,
            old_invention_insight: conceptReport.old_invention_insight,
            new_invention_concept: conceptReport.new_invention_concept,
            system_architecture: conceptReport.system_architecture,
            ai_upgrade_layers: conceptReport.ai_upgrade_layers,
            possible_claim_directions: conceptReport.possible_claim_directions,
            venture_concept: conceptReport.venture_concept,
            target_customers: conceptReport.target_customers,
            billion_dollar_thesis: conceptReport.billion_dollar_thesis,
            darpa_relevance: conceptReport.darpa_relevance,
            risks: conceptReport.risks,
          }
        : null,
      hunter_context: hunterItem
        ? {
            category: hunterItem.category,
            query: hunterItem.query,
            recommendation: hunterItem.recommendation,
            pre_ai_score: hunterItem.pre_ai_score,
          }
        : null,
    };

    // Generate plan with OpenAI
    const prompt = `You are an elite patent strategist, deep-tech venture analyst, and founder advisor.

Your job is to turn an existing patent/application signal into a NEW patent-backed venture plan.

CRITICAL RULES:
- Do NOT recommend copying the old patent
- Do NOT claim the old patent is safe to use
- Do NOT guarantee patentability
- Do NOT give legal advice
- Focus on creating a NEW improvement/upgrade to the existing invention

The output must clearly answer:
1. What exists now?
2. What is the new patent idea?
3. Why is this valuable now?
4. What future bottleneck does it solve?
5. What could be patented as a NEW improvement?
6. Who would buy it?
7. Why could it become a $1B+ opportunity?
8. What should the founder do next?

Context:
${JSON.stringify(context, null, 2)}

Return a JSON object with this exact structure:
{
  "plan_title": "Brief title for the new patent opportunity (max 10 words)",
  "existing_patent_summary": "2-3 sentence summary of what the existing patent/application covers",
  "new_patent_concept_title": "Title for the NEW improvement concept",
  "new_invention_summary": "2-3 sentences describing the NEW invention/improvement",
  "future_bottleneck_solved": "What future bottleneck/problem this solves",
  "why_now": "Why this opportunity is timely now",
  "technical_improvement": "Specific technical improvement over the existing patent",
  "differentiation_from_existing_patent": "How this NEW idea differs from the old patent",
  "possible_claim_directions": [
    {
      "claim_theme": "Patent claim theme/direction",
      "description": "What this claim would cover",
      "novelty_angle": "Why this could be novel/patentable"
    }
  ],
  "system_architecture": [
    {
      "component": "System component name",
      "function": "What it does",
      "why_it_matters": "Why this is important"
    }
  ],
  "upgrade_layers": [
    {
      "layer": "Upgrade layer (AI, software, hardware, etc.)",
      "description": "Description of the upgrade"
    }
  ],
  "target_buyers": [
    {
      "buyer": "Type of buyer",
      "why_they_need_it": "Why they need this",
      "first_pitch": "30-second pitch for this buyer"
    }
  ],
  "commercial_use_cases": [
    {
      "use_case": "Specific use case",
      "market": "Target market/industry",
      "why_it_matters": "Why this matters commercially"
    }
  ],
  "billion_dollar_thesis": "Why this could become a $1B+ opportunity (3-5 sentences)",
  "risks": "Key risks and challenges (technical, market, IP, competitive)",
  "attorney_review_notes": "What a patent attorney should review/verify",
  "founder_action_plan": {
    "patent_next_step": "Immediate patent filing recommendation",
    "mvp_next_step": "MVP/prototype next step",
    "customer_validation_next_step": "Customer validation recommendation",
    "darpa_or_government_next_step": "Government/DARPA next step if relevant, or 'Not applicable'",
    "next_30_days": [
      {
        "action": "Specific action",
        "outcome": "Expected outcome"
      }
    ],
    "next_90_days": [
      {
        "phase": "Phase name (e.g., 'Month 1', 'Month 2-3')",
        "action": "Action to take",
        "outcome": "Expected milestone"
      }
    ]
  },
  "scores": {
    "future_bottleneck_score": 0-100,
    "market_inevitability_score": 0-100,
    "ai_upgrade_score": 0-100,
    "buyer_demand_score": 0-100,
    "patentability_upgrade_score": 0-100,
    "buildability_score": 0-100
  },
  "priority_level": "PRIORITY_TARGET" | "TOP_OPPORTUNITY" | "STRONG_WATCH" | "WATCH" | "SKIP",
  "overall_score": 0-100
}

Priority level scoring:
- 90-100 = PRIORITY_TARGET
- 80-89 = TOP_OPPORTUNITY
- 70-79 = STRONG_WATCH
- 60-69 = WATCH
- below 60 = SKIP

The plan must be:
- Concise and specific
- Founder-useful and actionable
- Focused on $1B+ potential
- Targeting enterprise/government/financial/defense/cyber/AI/robotics/energy markets
- Avoid small consumer app ideas`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an elite patent strategist and venture analyst. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const planData = JSON.parse(completion.choices[0].message.content || "{}");

    // Save plan to database
    const { data: savedPlan, error: saveError } = await supabase
      .from("patent_venture_plans")
      .upsert({
        patent_result_id: patentResultId,
        opportunity_hunter_item_id: hunterItem?.id || null,
        patent_opportunity_report_id: opportunityReport?.id || null,
        patent_concept_report_id: conceptReport?.id || null,
        plan_title: planData.plan_title,
        existing_patent_summary: planData.existing_patent_summary,
        new_patent_concept_title: planData.new_patent_concept_title,
        new_invention_summary: planData.new_invention_summary,
        future_bottleneck_solved: planData.future_bottleneck_solved,
        why_now: planData.why_now,
        technical_improvement: planData.technical_improvement,
        differentiation_from_existing_patent:
          planData.differentiation_from_existing_patent,
        possible_claim_directions: planData.possible_claim_directions,
        system_architecture: planData.system_architecture,
        upgrade_layers: planData.upgrade_layers,
        target_buyers: planData.target_buyers,
        commercial_use_cases: planData.commercial_use_cases,
        billion_dollar_thesis: planData.billion_dollar_thesis,
        risks: planData.risks,
        attorney_review_notes: planData.attorney_review_notes,
        founder_action_plan: planData.founder_action_plan,
        scores: planData.scores,
        priority_level: planData.priority_level,
        overall_score: planData.overall_score,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving plan:", saveError);
      return NextResponse.json(
        { error: "Failed to save plan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ plan: savedPlan });
  } catch (error) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { error: "Failed to generate plan", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
