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

  // Ensure all required fields exist with bottleneck-focused score names
  // Map new scores to existing database fields for backwards compatibility
  return {
    future_market_score: parsed.future_bottleneck_score || parsed.market_size_score || parsed.future_market_score || 50,
    ai_upgrade_score: parsed.ai_acceleration_score || parsed.ai_upgrade_score || 50,
    patentability_score: parsed.patentability_upgrade_score || parsed.patentability_score || 50,
    buildability_score: parsed.buildability_score || 50,
    revenue_score: parsed.revenue_potential_score || parsed.licensing_royalty_score || parsed.revenue_score || 50,
    strategic_fit_score: parsed.market_inevitability_score || parsed.infrastructure_dependency_score || parsed.adoption_pressure_score || parsed.infrastructure_control_score || parsed.strategic_fit_score || 50,
    // Store additional bottleneck-specific scores for enhanced reporting
    bottleneck_score: parsed.future_bottleneck_score || 50,
    market_inevitability_score: parsed.market_inevitability_score || 50,
    scarcity_chokepoint_score: parsed.scarcity_chokepoint_score || 50,
    regulatory_pressure_score: parsed.regulatory_pressure_score || 50,
    infrastructure_dependency_score: parsed.infrastructure_dependency_score || 50,
    summary: parsed.summary || "Analysis completed.",
    modernization_angles: parsed.modernization_angles || [],
    venture_concepts: parsed.venture_concepts || [],
    new_patent_directions: parsed.new_patent_directions || [],
    risks: parsed.risks || "Attorney review required before proceeding.",
    // DARPA / Defense relevance (stored in report metadata)
    defense_relevance: parsed.defense_relevance || null,
    opportunity_score: 0, // Will be calculated
    recommendation: "RESEARCH MORE", // Will be calculated
  };
}

/**
 * Build the AI analysis prompt
 */
function buildAnalysisPrompt(patentResult: any): string {
  return `You are an AI patent opportunity analyst and venture strategist specializing in identifying future bottleneck inventions.

Your job is to identify whether this old patent maps to a future bottleneck. A bottleneck is an unavoidable constraint that large markets must solve in order to scale.

Core thesis: "PatentBoom finds old inventions that become valuable when the future finally needs them."

You are reviewing an old patent record. Your job is NOT to suggest copying the old invention. Your job is to identify whether the old invention was too early but will become valuable when future bottlenecks become urgent.

LOOK FOR CONSTRAINTS CREATED OR INTENSIFIED BY:
- AI growth (compute demand, agent control, identity fraud)
- Automation expansion (robotics safety, command systems, liability)
- Energy demand (grid reliability, power storage, utility control)
- Cybersecurity threats (data exfiltration, attack surfaces)
- Digital identity crisis (deepfakes, synthetic media, fraud)
- Autonomous machines (defense, vehicles, drones, industrial robots)
- Healthcare labor shortages (automation, liability, patient safety)
- Fintech risk (fraud detection, transaction verification, instant settlement)
- Crypto irreversibility (wallet safety, scam prevention, pre-send checks)
- Edge compute demand (trusted execution, hardware security, distributed processing)
- Compliance liability (audit trails, regulatory proof, risk reduction)

DARPA / DEFENSE MODE:
When the category includes "DARPA", "Defense", "Command", "Military", "Battlefield", "Drone Swarm", "Space/Satellite", or "Secure Communications", evaluate whether the old patent could be modernized into:
- Dual-use defense technology
- DARPA proposal concept
- SBIR/STTR idea
- Government contractor solution
- Patent-backed national-security venture

Focus on: autonomy control, cyber defense, secure command authorization, AI governance, robotics safety, drone coordination, space resilience, battlefield logistics, human-machine teaming, and secure communications.

IMPORTANT: Keep analysis at system/governance/safety/verification level. Do not provide weapon construction instructions or operational targeting instructions.

The best opportunities are old inventions that:
- Were too early for their time
- Solve constraints that become urgent as major markets scale
- Can be modernized with AI, automation, or infrastructure upgrades
- Address unavoidable bottlenecks (not optional features)

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
  "future_bottleneck_score": number (1-100, how critical this constraint becomes as markets scale),
  "market_inevitability_score": number (1-100, how certain the market will demand this solution),
  "scarcity_chokepoint_score": number (1-100, how much this controls access to scarce resources or capabilities),
  "ai_acceleration_score": number (1-100, how much AI/automation intensifies the need for this),
  "regulatory_pressure_score": number (1-100, compliance/governance urgency driving adoption),
  "infrastructure_dependency_score": number (1-100, how foundational/critical this becomes for other systems),
  "patentability_upgrade_score": number (1-100, novel improvement potential for new patent filing),
  "licensing_royalty_score": number (1-100, IP licensing/royalty monetization potential),
  "buildability_score": number (1-100, technical feasibility with modern tools),
  "summary": string (2-3 sentences: what bottleneck this addresses, why it was too early, why it becomes valuable),
  "modernization_angles": string[] (5-7 specific ways to modernize with AI/automation/infrastructure),
  "venture_concepts": [
    {
      "name": string,
      "description": string,
      "target_customer": string,
      "business_model": string
    }
  ] (2-3 venture concepts showing how to solve the bottleneck),
  "new_patent_directions": string[] (4-6 specific new patentable improvement directions),
  "risks": string (paragraph listing risks and attorney review requirements),
  "defense_relevance": {
    "darpa_relevance": string (if defense-related: what DARPA program office might care - TTO, STO, I2O, BTO, DSO, MTO, etc.),
    "dual_use_potential": string (commercial + defense applications),
    "government_buyer": string (DoD, intelligence community, homeland security, NASA, etc.),
    "commercial_market": string (enterprise/commercial market beyond defense),
    "proposal_angle": string (SBIR/STTR, DARPA program, or government contract angle)
  } (only include if category is DARPA/defense-related, otherwise null)
}

Note: Use these score names in your response:
- future_bottleneck_score
- market_inevitability_score
- scarcity_chokepoint_score
- ai_acceleration_score
- regulatory_pressure_score
- infrastructure_dependency_score
- patentability_upgrade_score
- licensing_royalty_score
- buildability_score

Required analysis:
1. Identify the future bottleneck this patent addresses (what constraint it removes).
2. Explain why the invention was too early for its time.
3. Explain why this bottleneck becomes urgent as AI, automation, or infrastructure scales.
4. Identify modern technology upgrades to solve the bottleneck better.
5. Identify possible new patentable improvement directions.
6. Create 2-3 venture concepts showing how to monetize the solution.
7. Identify risks and attorney-review issues.

Modern technology upgrades to consider:
- AI agents and autonomous decision-making
- Pre-execution authorization and governance
- Real-time fraud detection and risk scoring
- Biometric identity verification
- Hardware-level security and trusted execution
- Distributed computing and edge AI
- Grid control and energy management
- Medical automation and liability reduction
- Transaction verification and wallet safety
- Command systems and rules of engagement
- Compliance dashboards and audit trails
- Cryptographic protocols and secure computation

Recommendation rules:
- BUILD NOW: strong bottleneck, inevitable market demand, large enterprise/government/financial/infrastructure relevance, clear modernization path
- STRONG WATCH: real bottleneck, but timing/patentability/build path needs more research
- RESEARCH MORE: interesting but unclear market inevitability
- SKIP: small feature, low defensibility, niche consumer idea, or not tied to a major bottleneck

Rules:
- Do not give legal advice
- Do not claim patentability is guaranteed
- Do not claim the old patent is safe to copy
- Always include "Attorney review required"
- Focus on new improvements, new workflows, new systems, and new technology layers
- Do not recommend copying the expired patent directly`;
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
 * Updated weights for bottleneck/inevitability focus
 */
function calculateOpportunityScore(reportData: any): number {
  const weights = {
    future_market: 0.35, // Highest priority: Future bottleneck criticality
    ai_upgrade: 0.15, // AI/automation acceleration potential
    patentability: 0.15, // New patent defensibility
    buildability: 0.15, // Technical feasibility
    revenue: 0.1, // Revenue model / licensing potential
    strategic_fit: 0.1, // Market inevitability / infrastructure dependency
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
 * Updated logic for bottleneck/inevitability focus
 */
function getRecommendation(score: number): string {
  // BUILD NOW: strong bottleneck with inevitable market demand
  if (score >= 85) return "BUILD NOW";
  // STRONG WATCH: real bottleneck but timing/patentability/build needs research
  if (score >= 70) return "STRONG WATCH";
  // RESEARCH MORE: interesting but unclear market inevitability
  if (score >= 50) return "RESEARCH MORE";
  // SKIP: small feature, low defensibility, or not tied to major bottleneck
  return "SKIP";
}
