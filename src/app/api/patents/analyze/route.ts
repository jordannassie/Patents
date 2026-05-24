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

// OpenAI integration (conditionally imported)
let OpenAI: any = null;
try {
  OpenAI = require("openai").default;
} catch {
  console.warn("[Patent Analyze] OpenAI package not found, will use demo mode");
}

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

    // Step 1: Load patent result from Supabase
    const { data: patentResult, error: patentError } = await supabaseAdmin
      .from("patent_results")
      .select("*")
      .eq("id", patentResultId)
      .single();

    if (patentError || !patentResult) {
      console.error("[Patent Analyze] patent not found:", patentError);
      return NextResponse.json(
        { error: "Patent result not found", details: patentError?.message },
        { status: 404 }
      );
    }

    console.log("[Patent Analyze] loaded patent:", patentResult.patent_number);

    // Step 2: Check if report already exists (unless force=true)
    if (!force) {
      const { data: existingReport } = await supabaseAdmin
        .from("patent_opportunity_reports")
        .select("*")
        .eq("patent_result_id", patentResultId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingReport) {
        console.log("[Patent Analyze] returning existing report");
        return NextResponse.json({
          report: existingReport,
          isDemo: false,
          cached: true,
        });
      }
    }

    // Step 3: Generate AI report
    console.log("[Patent Analyze] generating new report");

    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    console.log("[Patent Analyze] OpenAI key exists:", hasOpenAIKey);

    let reportData;
    let isDemo = false;

    if (hasOpenAIKey && OpenAI) {
      // Use real OpenAI API
      try {
        reportData = await generateOpenAIReport(patentResult);
      } catch (error) {
        console.error("[Patent Analyze] OpenAI error:", error);
        console.log("[Patent Analyze] falling back to demo report");
        reportData = generateDemoReport(patentResult);
        isDemo = true;
      }
    } else {
      // Use demo report
      console.log("[Patent Analyze] using demo report (no API key)");
      reportData = generateDemoReport(patentResult);
      isDemo = true;
    }

    // Step 4: Calculate final opportunity score (weighted average)
    const opportunityScore = calculateOpportunityScore(reportData);
    reportData.opportunity_score = opportunityScore;

    // Add recommendation based on score
    reportData.recommendation = getRecommendation(opportunityScore);

    console.log("[Patent Analyze] opportunity score:", opportunityScore);
    console.log("[Patent Analyze] recommendation:", reportData.recommendation);

    // Step 5: Save report to Supabase
    const { data: savedReport, error: saveError } = await supabaseAdmin
      .from("patent_opportunity_reports")
      .insert({
        patent_result_id: patentResultId,
        opportunity_score: reportData.opportunity_score,
        future_market_score: reportData.future_market_score,
        ai_upgrade_score: reportData.ai_upgrade_score,
        patentability_score: reportData.patentability_score,
        buildability_score: reportData.buildability_score,
        revenue_score: reportData.revenue_score,
        strategic_fit_score: reportData.strategic_fit_score,
        summary: reportData.summary,
        modernization_angles: reportData.modernization_angles,
        venture_concepts: reportData.venture_concepts,
        new_patent_directions: reportData.new_patent_directions,
        risks: reportData.risks,
        recommendation: reportData.recommendation,
      })
      .select()
      .single();

    if (saveError) {
      console.error("[Patent Analyze] save error:", saveError);
      return NextResponse.json(
        {
          error: "Failed to save opportunity report",
          details: saveError?.message,
        },
        { status: 500 }
      );
    }

    console.log("[Patent Analyze] report saved successfully");

    return NextResponse.json({
      report: savedReport,
      isDemo,
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

/**
 * Generate AI opportunity report using OpenAI
 */
async function generateOpenAIReport(patentResult: any) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = buildAnalysisPrompt(patentResult);

  console.log("[Patent Analyze] calling OpenAI API");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an AI patent opportunity analyst and venture strategist. Return valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const responseText = completion.choices[0]?.message?.content || "{}";
  console.log("[Patent Analyze] OpenAI response received");

  const parsed = JSON.parse(responseText);

  // Ensure all required fields exist
  return {
    future_market_score: parsed.future_market_score || 50,
    ai_upgrade_score: parsed.ai_upgrade_score || 50,
    patentability_score: parsed.patentability_score || 50,
    buildability_score: parsed.buildability_score || 50,
    revenue_score: parsed.revenue_score || 50,
    strategic_fit_score: parsed.strategic_fit_score || 50,
    summary: parsed.summary || "Analysis completed.",
    modernization_angles: parsed.modernization_angles || [],
    venture_concepts: parsed.venture_concepts || [],
    new_patent_directions: parsed.new_patent_directions || [],
    risks: parsed.risks || "Attorney review required before proceeding.",
    opportunity_score: 0, // Will be calculated
    recommendation: "RESEARCH MORE", // Will be calculated
  };
}

/**
 * Build the AI analysis prompt
 */
function buildAnalysisPrompt(patentResult: any): string {
  return `You are an AI patent opportunity analyst and venture strategist.

You are reviewing an old patent record. Your job is NOT to suggest copying the old invention. Your job is to identify whether the old invention suggests a modern, new, non-obvious improvement that could become a new product, startup, or patent direction.

Analyze this patent:

Title:
${patentResult.title || "N/A"}

Patent Number:
${patentResult.patent_number || "N/A"}

Abstract:
${patentResult.abstract || "N/A"}

Filing Date:
${patentResult.filing_date || "N/A"}

Grant Date:
${patentResult.grant_date || "N/A"}

Assignee:
${patentResult.assignee || "N/A"}

Inventors:
${patentResult.inventors || "N/A"}

CPC Codes:
${patentResult.cpc_codes || "N/A"}

Status Estimate:
${patentResult.status_estimate || "Unknown"}

Return valid JSON only with this exact structure:
{
  "future_market_score": number (1-100),
  "ai_upgrade_score": number (1-100),
  "patentability_score": number (1-100),
  "buildability_score": number (1-100),
  "revenue_score": number (1-100),
  "strategic_fit_score": number (1-100),
  "summary": string (2-3 sentences explaining the original invention and why modernization is interesting),
  "modernization_angles": string[] (5-7 specific modern technology upgrades),
  "venture_concepts": [
    {
      "name": string,
      "description": string,
      "target_customer": string,
      "business_model": string
    }
  ] (2-3 venture concepts),
  "new_patent_directions": string[] (4-6 specific new patentable improvement directions),
  "risks": string (paragraph listing risks and attorney review requirements)
}

Required analysis:
1. Explain the original invention in plain English.
2. Explain why it may have been too early or outdated.
3. Identify modern technology upgrades.
4. Identify possible new patentable improvement directions.
5. Create 2-3 venture concepts.
6. Identify risks and attorney-review issues.

Modern technology upgrades to consider:
- AI and machine learning
- Cloud APIs and serverless systems
- Mobile-first applications
- Browser extensions and PWAs
- Blockchain for audit trails
- Autonomous agents
- Compliance dashboards
- Cybersecurity enhancements
- Voice identity and biometrics
- Transaction risk scoring
- Human-in-the-loop authorization
- Defense/government applications
- Enterprise risk reduction

Rules:
- Do not give legal advice.
- Do not claim patentability is guaranteed.
- Do not claim the old patent is safe to copy.
- Always include "Attorney review required."
- Focus on new improvements, new workflows, new systems, and new technology layers.
- Do not recommend copying the expired patent directly.`;
}

/**
 * Generate demo report (fallback when OpenAI unavailable)
 */
function generateDemoReport(patentResult: any) {
  return {
    future_market_score: 75,
    ai_upgrade_score: 80,
    patentability_score: 70,
    buildability_score: 65,
    revenue_score: 70,
    strategic_fit_score: 60,
    summary: `This patent describes ${patentResult.title?.toLowerCase() || "an invention"}. While the original approach was limited by technology of its era, modern AI, cloud infrastructure, and cybersecurity advances create opportunities for significant improvement and new patent directions.`,
    modernization_angles: [
      "Apply modern AI/ML for enhanced decision-making",
      "Implement cloud-native architecture with API-first design",
      "Add real-time cybersecurity monitoring and threat detection",
      "Integrate blockchain for immutable audit trails",
      "Build mobile-first user experience",
      "Add compliance dashboard for regulatory requirements",
      "Implement autonomous agent workflows",
    ],
    venture_concepts: [
      {
        name: "Enterprise Security Platform",
        description:
          "SaaS platform modernizing the core concept with AI-powered risk scoring and real-time monitoring",
        target_customer: "Mid-market and enterprise companies",
        business_model: "Subscription-based with usage tiers",
      },
      {
        name: "Developer API Service",
        description:
          "API-first service enabling developers to integrate the modernized technology into their applications",
        target_customer: "Software developers and tech companies",
        business_model: "Usage-based pricing with free tier",
      },
      {
        name: "Government Compliance Tool",
        description:
          "Specialized version targeting defense and government use cases with enhanced security",
        target_customer: "Government agencies and defense contractors",
        business_model: "Contract-based with custom deployments",
      },
    ],
    new_patent_directions: [
      "AI-enhanced method for improving accuracy and reducing false positives",
      "Distributed architecture enabling real-time processing at scale",
      "Novel integration of blockchain for tamper-evident audit trails",
      "Advanced user interface patterns for complex workflow visualization",
      "Hybrid cloud-edge computing approach for latency-sensitive operations",
      "Zero-knowledge proof methods for privacy-preserving verification",
    ],
    risks: `This is a demo analysis generated without OpenAI API access. For production use, configure OPENAI_API_KEY. Attorney review is required before relying on any patent status, patentability assessment, or commercialization strategy. Competitive landscape analysis needed. Market validation required before significant investment.`,
    opportunity_score: 0,
    recommendation: "RESEARCH MORE",
  };
}

/**
 * Calculate weighted opportunity score
 */
function calculateOpportunityScore(reportData: any): number {
  const weights = {
    future_market: 0.2,
    ai_upgrade: 0.2,
    patentability: 0.2,
    buildability: 0.15,
    revenue: 0.15,
    strategic_fit: 0.1,
  };

  const score =
    reportData.future_market_score * weights.future_market +
    reportData.ai_upgrade_score * weights.ai_upgrade +
    reportData.patentability_score * weights.patentability +
    reportData.buildability_score * weights.buildability +
    reportData.revenue_score * weights.revenue +
    reportData.strategic_fit_score * weights.strategic_fit;

  return Math.round(score);
}

/**
 * Get recommendation based on opportunity score
 */
function getRecommendation(score: number): string {
  if (score >= 85) return "BUILD NOW";
  if (score >= 70) return "STRONG WATCH";
  if (score >= 50) return "RESEARCH MORE";
  return "SKIP";
}
