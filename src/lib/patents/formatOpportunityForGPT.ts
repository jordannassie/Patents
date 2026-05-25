/**
 * Format patent opportunity as a structured prompt for GPT
 */

interface PatentCreationPlan {
  recommended_patent_title: string;
  score: number;
  priority: string;
  source_title: string;
  source_status_estimate: string;
  source_summary: string;
  recommended_patent_summary: string;
  future_bottleneck: string;
  market_timing: string;
  why_this_is_best: string;
  new_patent_ideas?: Array<{
    title: string;
    summary: string;
    what_it_would_claim: string;
    why_it_is_new_direction: string;
    market_need: string;
    score: number;
  }>;
  possible_claim_themes?: Array<{
    claim_theme: string;
    description: string;
    novelty_angle: string;
  }>;
  system_architecture?: Array<{
    component: string;
    function: string;
    why_it_matters: string;
  }>;
  target_buyers?: Array<{
    buyer: string;
    why_they_need_it: string;
  }>;
  venture_angle: string;
  founder_next_steps?: Array<{
    step: string;
    action: string;
    outcome: string;
  }>;
  risks: string;
  attorney_review_note: string;
}

export function formatOpportunityForGPT(plan: PatentCreationPlan): string {
  const lines: string[] = [];

  lines.push("I want you to help me evaluate and improve this patent opportunity.");
  lines.push("");
  lines.push("IMPORTANT:");
  lines.push("Do not assume this is legally patentable.");
  lines.push("Do not assume the existing patent is safe to copy.");
  lines.push("Help me create a NEW improvement direction.");
  lines.push("Point out risks, prior-art concerns, and ways to strengthen the invention.");
  lines.push("Give me practical next steps for filing a stronger provisional or non-provisional patent.");
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("PATENT OPPORTUNITY");
  lines.push("=".repeat(60));
  lines.push("");

  lines.push("Recommended New Patent Title:");
  lines.push(plan.recommended_patent_title || "Not provided.");
  lines.push("");

  lines.push("Score:");
  lines.push(`${plan.score}/100`);
  lines.push("");

  lines.push("Priority:");
  lines.push(plan.priority ? plan.priority.replace(/_/g, " ") : "Not provided.");
  lines.push("");

  lines.push("WHAT EXISTS NOW:");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push("Source Patent/Application:");
  lines.push(plan.source_title || "Not provided.");
  lines.push("");
  lines.push("Status Estimate:");
  lines.push(plan.source_status_estimate || "Not provided.");
  lines.push("");
  lines.push("Existing Invention Summary:");
  lines.push(plan.source_summary || "Not provided.");
  lines.push("");

  lines.push("NEW PATENT TO CREATE:");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push(plan.recommended_patent_summary || "Not provided.");
  lines.push("");

  lines.push("FUTURE BOTTLENECK:");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push(plan.future_bottleneck || "Not provided.");
  lines.push("");

  lines.push("MARKET TIMING:");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push(plan.market_timing || "Not provided.");
  lines.push("");

  lines.push("WHY THIS COULD BE BIG:");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push(plan.why_this_is_best || "Not provided.");
  lines.push("");

  if (plan.new_patent_ideas && plan.new_patent_ideas.length > 0) {
    lines.push("NEW PATENT IDEAS:");
    lines.push("-".repeat(60));
    lines.push("");
    plan.new_patent_ideas.forEach((idea, idx) => {
      lines.push(`${idx + 1}. Title:`);
      lines.push(idea.title || "Not provided.");
      lines.push("");
      lines.push("Summary:");
      lines.push(idea.summary || "Not provided.");
      lines.push("");
      lines.push("What It Would Claim:");
      lines.push(idea.what_it_would_claim || "Not provided.");
      lines.push("");
      lines.push("Why It Is a New Direction:");
      lines.push(idea.why_it_is_new_direction || "Not provided.");
      lines.push("");
      lines.push("Market Need:");
      lines.push(idea.market_need || "Not provided.");
      lines.push("");
      lines.push("Score:");
      lines.push(`${idea.score || "N/A"}/100`);
      lines.push("");
    });
  } else {
    lines.push("NEW PATENT IDEAS:");
    lines.push("-".repeat(60));
    lines.push("");
    lines.push("Not provided.");
    lines.push("");
  }

  if (plan.possible_claim_themes && plan.possible_claim_themes.length > 0) {
    lines.push("POSSIBLE CLAIM THEMES:");
    lines.push("-".repeat(60));
    lines.push("");
    plan.possible_claim_themes.forEach((theme, idx) => {
      lines.push(`${idx + 1}. Claim Theme:`);
      lines.push(theme.claim_theme || "Not provided.");
      lines.push("");
      lines.push("Description:");
      lines.push(theme.description || "Not provided.");
      lines.push("");
      lines.push("Novelty Angle:");
      lines.push(theme.novelty_angle || "Not provided.");
      lines.push("");
    });
  } else {
    lines.push("POSSIBLE CLAIM THEMES:");
    lines.push("-".repeat(60));
    lines.push("");
    lines.push("Not provided.");
    lines.push("");
  }

  if (plan.system_architecture && plan.system_architecture.length > 0) {
    lines.push("SYSTEM ARCHITECTURE:");
    lines.push("-".repeat(60));
    lines.push("");
    plan.system_architecture.forEach((item, idx) => {
      lines.push(`${idx + 1}. Component:`);
      lines.push(item.component || "Not provided.");
      lines.push("");
      lines.push("Function:");
      lines.push(item.function || "Not provided.");
      lines.push("");
      lines.push("Why It Matters:");
      lines.push(item.why_it_matters || "Not provided.");
      lines.push("");
    });
  } else {
    lines.push("SYSTEM ARCHITECTURE:");
    lines.push("-".repeat(60));
    lines.push("");
    lines.push("Not provided.");
    lines.push("");
  }

  if (plan.target_buyers && plan.target_buyers.length > 0) {
    lines.push("TARGET BUYERS:");
    lines.push("-".repeat(60));
    lines.push("");
    plan.target_buyers.forEach((buyer, idx) => {
      lines.push(`${idx + 1}. Buyer:`);
      lines.push(buyer.buyer || "Not provided.");
      lines.push("");
      lines.push("Why They Need It:");
      lines.push(buyer.why_they_need_it || "Not provided.");
      lines.push("");
    });
  } else {
    lines.push("TARGET BUYERS:");
    lines.push("-".repeat(60));
    lines.push("");
    lines.push("Not provided.");
    lines.push("");
  }

  lines.push("VENTURE ANGLE:");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push(plan.venture_angle || "Not provided.");
  lines.push("");

  if (plan.founder_next_steps && plan.founder_next_steps.length > 0) {
    lines.push("FOUNDER NEXT STEPS:");
    lines.push("-".repeat(60));
    lines.push("");
    plan.founder_next_steps.forEach((step, idx) => {
      lines.push(`${idx + 1}. Step:`);
      lines.push(step.step || "Not provided.");
      lines.push("");
      lines.push("Action:");
      lines.push(step.action || "Not provided.");
      lines.push("");
      lines.push("Outcome:");
      lines.push(step.outcome || "Not provided.");
      lines.push("");
    });
  } else {
    lines.push("FOUNDER NEXT STEPS:");
    lines.push("-".repeat(60));
    lines.push("");
    lines.push("Not provided.");
    lines.push("");
  }

  lines.push("RISKS:");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push(plan.risks || "Not provided.");
  lines.push("");

  lines.push("ATTORNEY REVIEW NOTE:");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push(plan.attorney_review_note || "Not provided.");
  lines.push("");

  lines.push("=".repeat(60));
  lines.push("MY REQUEST:");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("Please help me:");
  lines.push("1. Improve this patent idea.");
  lines.push("2. Make the invention more novel and defensible.");
  lines.push("3. Identify the strongest claim angles.");
  lines.push("4. Identify weak spots or prior-art risks.");
  lines.push("5. Suggest better technical architecture.");
  lines.push("6. Suggest better embodiments.");
  lines.push("7. Help me turn this into a stronger patent draft for attorney review.");

  return lines.join("\n");
}

export function formatDraftForGPT(draft: any): string {
  const lines: string[] = [];

  lines.push("I want you to help me improve this patent draft for attorney review.");
  lines.push("");
  lines.push("IMPORTANT:");
  lines.push("Do not provide legal advice.");
  lines.push("Do not guarantee patentability.");
  lines.push("Help me make the draft more clear, technical, broad, and defensible.");
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("FULL PATENT DRAFT");
  lines.push("=".repeat(60));
  lines.push("");

  lines.push("TITLE:");
  lines.push("-".repeat(60));
  lines.push(draft.draft_title || "Not provided.");
  lines.push("");

  lines.push("ABSTRACT:");
  lines.push("-".repeat(60));
  lines.push(draft.abstract || "Not provided.");
  lines.push("");

  lines.push("FIELD OF THE INVENTION:");
  lines.push("-".repeat(60));
  lines.push(draft.field_of_invention || "Not provided.");
  lines.push("");

  lines.push("BACKGROUND:");
  lines.push("-".repeat(60));
  lines.push(draft.background || "Not provided.");
  lines.push("");

  lines.push("PROBLEM STATEMENT:");
  lines.push("-".repeat(60));
  lines.push(draft.problem_statement || "Not provided.");
  lines.push("");

  lines.push("SUMMARY OF THE INVENTION:");
  lines.push("-".repeat(60));
  lines.push(draft.summary_of_invention || "Not provided.");
  lines.push("");

  lines.push("SYSTEM OVERVIEW:");
  lines.push("-".repeat(60));
  lines.push(draft.system_overview || "Not provided.");
  lines.push("");

  if (draft.technical_architecture && draft.technical_architecture.length > 0) {
    lines.push("TECHNICAL ARCHITECTURE:");
    lines.push("-".repeat(60));
    draft.technical_architecture.forEach((item: any, idx: number) => {
      lines.push(`${idx + 1}. ${item.component || "Component"}`);
      lines.push(`   Description: ${item.description || "Not provided."}`);
      lines.push(`   Function: ${item.function || "Not provided."}`);
      lines.push("");
    });
  }

  if (draft.method_flow && draft.method_flow.length > 0) {
    lines.push("METHOD FLOW:");
    lines.push("-".repeat(60));
    draft.method_flow.forEach((step: any) => {
      lines.push(`Step ${step.step_number}: ${step.step_title || "Step"}`);
      lines.push(`   ${step.description || "Not provided."}`);
      lines.push("");
    });
  }

  lines.push("DETAILED DESCRIPTION:");
  lines.push("-".repeat(60));
  lines.push(draft.detailed_description || "Not provided.");
  lines.push("");

  if (draft.example_embodiments && draft.example_embodiments.length > 0) {
    lines.push("EXAMPLE EMBODIMENTS:");
    lines.push("-".repeat(60));
    draft.example_embodiments.forEach((item: any, idx: number) => {
      lines.push(`${idx + 1}. ${item.embodiment || "Embodiment"}`);
      lines.push(`   ${item.description || "Not provided."}`);
      lines.push("");
    });
  }

  if (draft.alternative_embodiments && draft.alternative_embodiments.length > 0) {
    lines.push("ALTERNATIVE EMBODIMENTS:");
    lines.push("-".repeat(60));
    draft.alternative_embodiments.forEach((item: any, idx: number) => {
      lines.push(`${idx + 1}. ${item.variation || "Variation"}`);
      lines.push(`   ${item.description || "Not provided."}`);
      lines.push("");
    });
  }

  if (draft.use_cases && draft.use_cases.length > 0) {
    lines.push("USE CASES:");
    lines.push("-".repeat(60));
    draft.use_cases.forEach((item: any, idx: number) => {
      lines.push(`${idx + 1}. ${item.use_case || "Use Case"}`);
      lines.push(`   ${item.description || "Not provided."}`);
      lines.push("");
    });
  }

  if (draft.claim_set && draft.claim_set.length > 0) {
    lines.push("CLAIM SET:");
    lines.push("-".repeat(60));
    draft.claim_set.forEach((claim: any) => {
      lines.push(`Claim ${claim.claim_number} (${claim.claim_type ? claim.claim_type.toUpperCase() : "N/A"})`);
      lines.push(claim.claim_text || "Not provided.");
      lines.push("");
    });
  }

  if (draft.drawing_descriptions && draft.drawing_descriptions.length > 0) {
    lines.push("DRAWING DESCRIPTIONS:");
    lines.push("-".repeat(60));
    draft.drawing_descriptions.forEach((item: any) => {
      lines.push(`${item.figure || "Figure"}: ${item.description || "Not provided."}`);
      lines.push("");
    });
  }

  lines.push("ATTORNEY REVIEW NOTES:");
  lines.push("-".repeat(60));
  lines.push(draft.attorney_review_notes || "Not provided.");
  lines.push("");

  lines.push("FILING NOTES:");
  lines.push("-".repeat(60));
  lines.push(draft.filing_notes || "Not provided.");
  lines.push("");

  lines.push("=".repeat(60));
  lines.push("MY REQUEST:");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("Please help me:");
  lines.push("1. Improve the claims.");
  lines.push("2. Strengthen novelty.");
  lines.push("3. Improve technical detail.");
  lines.push("4. Suggest missing embodiments.");
  lines.push("5. Identify weak points.");
  lines.push("6. Improve this draft for attorney review.");

  return lines.join("\n");
}
