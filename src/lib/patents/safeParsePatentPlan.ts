/**
 * Safely parse and normalize patent creation plan JSON from OpenAI
 */

interface RawPatentPlan {
  source_title?: string;
  source_summary?: string;
  source_status_estimate?: string;
  future_bottleneck?: string;
  market_timing?: string;
  recommended_patent_title?: string;
  recommended_patent_summary?: string;
  why_this_is_best?: string;
  new_patent_ideas?: any[];
  filing_priority_rankings?: any[];
  possible_claim_themes?: any[];
  system_architecture?: any[];
  target_buyers?: any[];
  venture_angle?: string;
  founder_next_steps?: any[];
  score?: number;
  priority?: string;
  risks?: string;
  attorney_review_note?: string;
}

export function safeParsePatentPlan(rawContent: string): RawPatentPlan {
  try {
    // Remove markdown code fences if present
    let content = rawContent.trim();
    if (content.startsWith("```json")) {
      content = content.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (content.startsWith("```")) {
      content = content.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    // Find first { and last }
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }

    // Parse JSON
    const parsed = JSON.parse(content) as RawPatentPlan;

    // Normalize and validate
    return normalizePlan(parsed);
  } catch (error) {
    console.error("[safeParsePatentPlan] JSON parse error:", error);
    throw new Error(`Failed to parse patent plan JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function normalizePlan(plan: RawPatentPlan): RawPatentPlan {
  // Ensure arrays exist
  plan.new_patent_ideas = Array.isArray(plan.new_patent_ideas) ? plan.new_patent_ideas : [];
  plan.filing_priority_rankings = Array.isArray(plan.filing_priority_rankings) ? plan.filing_priority_rankings : [];
  plan.possible_claim_themes = Array.isArray(plan.possible_claim_themes) ? plan.possible_claim_themes : [];
  plan.system_architecture = Array.isArray(plan.system_architecture) ? plan.system_architecture : [];
  plan.target_buyers = Array.isArray(plan.target_buyers) ? plan.target_buyers : [];
  plan.founder_next_steps = Array.isArray(plan.founder_next_steps) ? plan.founder_next_steps : [];

  // Default score if missing
  if (typeof plan.score !== "number" || plan.score < 0 || plan.score > 100) {
    plan.score = 70;
  }

  // Default priority based on score
  if (!plan.priority) {
    if (plan.score >= 90) plan.priority = "BEST_TO_FILE";
    else if (plan.score >= 80) plan.priority = "TOP_TARGET";
    else if (plan.score >= 70) plan.priority = "STRONG";
    else if (plan.score >= 60) plan.priority = "WATCH";
    else plan.priority = "SKIP";
  }

  // Validate priority
  const validPriorities = ["BEST_TO_FILE", "TOP_TARGET", "STRONG", "WATCH", "SKIP"];
  if (!validPriorities.includes(plan.priority)) {
    plan.priority = "WATCH";
  }

  // Default attorney review note
  if (!plan.attorney_review_note || plan.attorney_review_note.trim() === "") {
    plan.attorney_review_note = "Attorney review required. This is not legal advice. Patentability, freedom to operate, and IP strategy must be reviewed by a qualified patent attorney.";
  }

  // Default risks
  if (!plan.risks || plan.risks.trim() === "") {
    plan.risks = "Comprehensive risk assessment required. Consider technical feasibility, market competition, IP landscape, and regulatory constraints.";
  }

  // Ensure string fields have defaults
  plan.source_title = plan.source_title || "Source patent information unavailable";
  plan.source_summary = plan.source_summary || "Summary unavailable";
  plan.source_status_estimate = plan.source_status_estimate || "Status unknown";
  plan.future_bottleneck = plan.future_bottleneck || "Future bottleneck analysis unavailable";
  plan.market_timing = plan.market_timing || "Market timing analysis unavailable";
  plan.recommended_patent_title = plan.recommended_patent_title || "Patent title unavailable";
  plan.recommended_patent_summary = plan.recommended_patent_summary || "Patent summary unavailable";
  plan.why_this_is_best = plan.why_this_is_best || "Analysis unavailable";
  plan.venture_angle = plan.venture_angle || "Venture strategy analysis unavailable";

  return plan;
}

export function createFallbackPlan(patentTitle: string, patentAbstract: string): RawPatentPlan {
  return {
    source_title: patentTitle || "Patent title unavailable",
    source_summary: patentAbstract ? patentAbstract.substring(0, 300) : "Patent abstract unavailable",
    source_status_estimate: "Status unknown - analysis unavailable",
    future_bottleneck: "AI analysis unavailable. Manual review required to identify future bottlenecks and modernization opportunities.",
    market_timing: "Market timing analysis requires AI generation. Please retry plan generation.",
    recommended_patent_title: `AI-Enhanced Modernization of ${patentTitle || "Existing Patent"}`,
    recommended_patent_summary: "A proposed new improvement direction based on the existing patent signal. Full AI analysis should be retried for comprehensive patent filing recommendations.",
    why_this_is_best: "Complete analysis unavailable. This is a fallback plan generated when AI analysis failed. Retry generation for full patent strategy.",
    new_patent_ideas: [],
    filing_priority_rankings: [],
    possible_claim_themes: [],
    system_architecture: [],
    target_buyers: [],
    venture_angle: "Venture strategy unavailable. Retry AI generation for comprehensive business model and commercialization strategy.",
    founder_next_steps: [
      {
        step: "Retry AI Plan Generation",
        action: "Use the regenerate button to create a full AI-powered patent creation plan",
        outcome: "Complete patent filing recommendations with claim themes, architecture, and market analysis"
      },
      {
        step: "Manual Patent Review",
        action: "Review the existing patent abstract and filing details for preliminary assessment",
        outcome: "Initial understanding of the technical domain and prior art"
      }
    ],
    score: 65,
    priority: "WATCH",
    risks: "OpenAI generation failed or was unavailable. This is a fallback plan with limited analysis. Retry required for comprehensive risk assessment.",
    attorney_review_note: "Attorney review required. This is not legal advice. This fallback plan was generated when AI analysis failed - full AI generation should be retried before patent filing decisions."
  };
}
