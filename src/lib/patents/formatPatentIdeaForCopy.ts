/**
 * Format patent creation plan as plain text for copy/paste
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

export function formatPatentPlanForCopy(plan: PatentCreationPlan): string {
  const lines: string[] = [];

  lines.push("PATENT IDEA / PATENT CREATION PLAN");
  lines.push("=".repeat(60));
  lines.push("");

  lines.push(`Recommended Patent Title:`);
  lines.push(plan.recommended_patent_title);
  lines.push("");

  lines.push(`Score: ${plan.score}/100`);
  lines.push(`Priority: ${plan.priority.replace(/_/g, " ")}`);
  lines.push("");

  lines.push("WHAT EXISTS NOW");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push("Source Patent/Application:");
  lines.push(plan.source_title);
  lines.push("");
  lines.push("Status:");
  lines.push(plan.source_status_estimate);
  lines.push("");
  lines.push("Summary:");
  lines.push(plan.source_summary);
  lines.push("");

  lines.push("NEW PATENT TO CREATE");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push(plan.recommended_patent_summary);
  lines.push("");

  lines.push("Future Bottleneck:");
  lines.push(plan.future_bottleneck);
  lines.push("");

  lines.push("Market Timing:");
  lines.push(plan.market_timing);
  lines.push("");

  lines.push("Why This Could Be Big:");
  lines.push(plan.why_this_is_best);
  lines.push("");

  if (plan.new_patent_ideas && plan.new_patent_ideas.length > 0) {
    lines.push("NEW PATENT IDEAS");
    lines.push("-".repeat(60));
    lines.push("");
    plan.new_patent_ideas.forEach((idea, idx) => {
      lines.push(`${idx + 1}. ${idea.title}`);
      lines.push(`   Summary: ${idea.summary}`);
      lines.push(`   What It Would Claim: ${idea.what_it_would_claim}`);
      lines.push(`   Why It Is a New Direction: ${idea.why_it_is_new_direction}`);
      lines.push(`   Market Need: ${idea.market_need}`);
      lines.push(`   Score: ${idea.score}/100`);
      lines.push("");
    });
  }

  if (plan.possible_claim_themes && plan.possible_claim_themes.length > 0) {
    lines.push("POSSIBLE CLAIM THEMES");
    lines.push("-".repeat(60));
    lines.push("");
    plan.possible_claim_themes.forEach((claim, idx) => {
      lines.push(`${idx + 1}. ${claim.claim_theme}`);
      lines.push(`   Description: ${claim.description}`);
      lines.push(`   Novelty Angle: ${claim.novelty_angle}`);
      lines.push("");
    });
  }

  if (plan.system_architecture && plan.system_architecture.length > 0) {
    lines.push("SYSTEM ARCHITECTURE");
    lines.push("-".repeat(60));
    lines.push("");
    plan.system_architecture.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.component}`);
      lines.push(`   Function: ${item.function}`);
      lines.push(`   Why It Matters: ${item.why_it_matters}`);
      lines.push("");
    });
  }

  if (plan.target_buyers && plan.target_buyers.length > 0) {
    lines.push("TARGET BUYERS");
    lines.push("-".repeat(60));
    lines.push("");
    plan.target_buyers.forEach((buyer, idx) => {
      lines.push(`${idx + 1}. ${buyer.buyer}`);
      lines.push(`   Why They Need It: ${buyer.why_they_need_it}`);
      lines.push("");
    });
  }

  lines.push("VENTURE ANGLE");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push(plan.venture_angle);
  lines.push("");

  if (plan.founder_next_steps && plan.founder_next_steps.length > 0) {
    lines.push("FOUNDER NEXT STEPS");
    lines.push("-".repeat(60));
    lines.push("");
    plan.founder_next_steps.forEach((step, idx) => {
      lines.push(`${idx + 1}. ${step.step}`);
      lines.push(`   Action: ${step.action}`);
      lines.push(`   Outcome: ${step.outcome}`);
      lines.push("");
    });
  }

  lines.push("RISKS");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push(plan.risks);
  lines.push("");

  lines.push("ATTORNEY REVIEW NOTE");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push(plan.attorney_review_note);
  lines.push("");

  lines.push("=".repeat(60));
  lines.push("IMPORTANT LEGAL DISCLAIMER");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("This is not legal advice. Patentability, freedom to operate,");
  lines.push("infringement risk, and patent status require review by a");
  lines.push("qualified patent attorney. This plan identifies possible new");
  lines.push("improvement directions and does not recommend copying existing");
  lines.push("patents.");

  return lines.join("\n");
}

export function formatPatentIdeaSummary(plan: PatentCreationPlan): string {
  const lines: string[] = [];

  lines.push("PATENT IDEA");
  lines.push("=".repeat(60));
  lines.push("");

  lines.push("Title:");
  lines.push(plan.recommended_patent_title);
  lines.push("");

  lines.push(`Score: ${plan.score}/100`);
  lines.push(`Priority: ${plan.priority.replace(/_/g, " ")}`);
  lines.push("");

  lines.push("Future Bottleneck:");
  lines.push(plan.future_bottleneck);
  lines.push("");

  lines.push("New Patent Direction:");
  lines.push(plan.recommended_patent_summary);
  lines.push("");

  lines.push("Why This Could Be Big:");
  lines.push(plan.why_this_is_best);
  lines.push("");

  if (plan.target_buyers && plan.target_buyers.length > 0) {
    lines.push("Target Buyers:");
    plan.target_buyers.forEach((buyer, idx) => {
      lines.push(`${idx + 1}. ${buyer.buyer}`);
    });
    lines.push("");
  }

  if (plan.founder_next_steps && plan.founder_next_steps.length > 0) {
    lines.push("Next Step:");
    lines.push(plan.founder_next_steps[0].step);
    lines.push("");
  }

  lines.push("Attorney Review Required.");

  return lines.join("\n");
}

export function formatFullDraftForCopy(draft: any): string {
  const lines: string[] = [];

  lines.push("FULL PATENT DRAFT");
  lines.push("=".repeat(60));
  lines.push("");

  lines.push("TITLE");
  lines.push("-".repeat(60));
  lines.push(draft.draft_title);
  lines.push("");

  lines.push("ABSTRACT");
  lines.push("-".repeat(60));
  lines.push(draft.abstract);
  lines.push("");

  lines.push("FIELD OF THE INVENTION");
  lines.push("-".repeat(60));
  lines.push(draft.field_of_invention);
  lines.push("");

  lines.push("BACKGROUND");
  lines.push("-".repeat(60));
  lines.push(draft.background);
  lines.push("");

  lines.push("PROBLEM STATEMENT");
  lines.push("-".repeat(60));
  lines.push(draft.problem_statement);
  lines.push("");

  lines.push("SUMMARY OF THE INVENTION");
  lines.push("-".repeat(60));
  lines.push(draft.summary_of_invention);
  lines.push("");

  lines.push("SYSTEM OVERVIEW");
  lines.push("-".repeat(60));
  lines.push(draft.system_overview);
  lines.push("");

  if (draft.technical_architecture && draft.technical_architecture.length > 0) {
    lines.push("TECHNICAL ARCHITECTURE");
    lines.push("-".repeat(60));
    draft.technical_architecture.forEach((item: any, idx: number) => {
      lines.push(`${idx + 1}. ${item.component}`);
      lines.push(`   Description: ${item.description}`);
      lines.push(`   Function: ${item.function}`);
      lines.push("");
    });
  }

  if (draft.method_flow && draft.method_flow.length > 0) {
    lines.push("METHOD FLOW");
    lines.push("-".repeat(60));
    draft.method_flow.forEach((step: any) => {
      lines.push(`Step ${step.step_number}: ${step.step_title}`);
      lines.push(`   ${step.description}`);
      lines.push("");
    });
  }

  lines.push("DETAILED DESCRIPTION");
  lines.push("-".repeat(60));
  lines.push(draft.detailed_description);
  lines.push("");

  if (draft.example_embodiments && draft.example_embodiments.length > 0) {
    lines.push("EXAMPLE EMBODIMENTS");
    lines.push("-".repeat(60));
    draft.example_embodiments.forEach((item: any, idx: number) => {
      lines.push(`${idx + 1}. ${item.embodiment}`);
      lines.push(`   ${item.description}`);
      lines.push("");
    });
  }

  if (draft.alternative_embodiments && draft.alternative_embodiments.length > 0) {
    lines.push("ALTERNATIVE EMBODIMENTS");
    lines.push("-".repeat(60));
    draft.alternative_embodiments.forEach((item: any, idx: number) => {
      lines.push(`${idx + 1}. ${item.variation}`);
      lines.push(`   ${item.description}`);
      lines.push("");
    });
  }

  if (draft.use_cases && draft.use_cases.length > 0) {
    lines.push("USE CASES");
    lines.push("-".repeat(60));
    draft.use_cases.forEach((item: any, idx: number) => {
      lines.push(`${idx + 1}. ${item.use_case}`);
      lines.push(`   ${item.description}`);
      lines.push("");
    });
  }

  if (draft.claim_set && draft.claim_set.length > 0) {
    lines.push("CLAIM SET");
    lines.push("-".repeat(60));
    draft.claim_set.forEach((claim: any) => {
      lines.push(`Claim ${claim.claim_number} (${claim.claim_type.toUpperCase()})`);
      lines.push(claim.claim_text);
      lines.push("");
    });
  }

  if (draft.drawing_descriptions && draft.drawing_descriptions.length > 0) {
    lines.push("DRAWING DESCRIPTIONS");
    lines.push("-".repeat(60));
    draft.drawing_descriptions.forEach((item: any) => {
      lines.push(`${item.figure}: ${item.description}`);
      lines.push("");
    });
  }

  lines.push("ATTORNEY REVIEW NOTES");
  lines.push("-".repeat(60));
  lines.push(draft.attorney_review_notes);
  lines.push("");

  lines.push("FILING NOTES");
  lines.push("-".repeat(60));
  lines.push(draft.filing_notes);
  lines.push("");

  lines.push("=".repeat(60));
  lines.push("LEGAL DISCLAIMER");
  lines.push("=".repeat(60));
  lines.push("This draft is not legal advice and is not ready to file without");
  lines.push("review by a qualified patent attorney.");

  return lines.join("\n");
}

export function formatClaimsOnly(draft: any): string {
  const lines: string[] = [];

  lines.push("CLAIM SET");
  lines.push("=".repeat(60));
  lines.push("");

  if (draft.claim_set && draft.claim_set.length > 0) {
    draft.claim_set.forEach((claim: any) => {
      lines.push(`Claim ${claim.claim_number} (${claim.claim_type.toUpperCase()})`);
      lines.push(claim.claim_text);
      lines.push("");
    });
  } else {
    lines.push("No claims available.");
  }

  return lines.join("\n");
}

export function formatAttorneyReviewPackage(plan: PatentCreationPlan, draft?: any): string {
  const lines: string[] = [];

  lines.push("ATTORNEY REVIEW PACKAGE");
  lines.push("=".repeat(60));
  lines.push("");

  lines.push("PATENT CREATION PLAN SUMMARY");
  lines.push("-".repeat(60));
  lines.push("");
  lines.push("Recommended Patent:");
  lines.push(plan.recommended_patent_title);
  lines.push("");
  lines.push(plan.recommended_patent_summary);
  lines.push("");
  lines.push(`Priority: ${plan.priority.replace(/_/g, " ")}`);
  lines.push(`Score: ${plan.score}/100`);
  lines.push("");

  if (draft) {
    lines.push("DRAFT TITLE");
    lines.push("-".repeat(60));
    lines.push(draft.draft_title);
    lines.push("");

    if (draft.claim_set && draft.claim_set.length > 0) {
      lines.push("CLAIMS");
      lines.push("-".repeat(60));
      draft.claim_set.forEach((claim: any) => {
        lines.push(`Claim ${claim.claim_number} (${claim.claim_type.toUpperCase()})`);
        lines.push(claim.claim_text);
        lines.push("");
      });
    }
  }

  lines.push("RISKS");
  lines.push("-".repeat(60));
  lines.push(plan.risks);
  lines.push("");

  lines.push("ATTORNEY REVIEW NOTES");
  lines.push("-".repeat(60));
  lines.push(plan.attorney_review_note);
  lines.push("");

  if (draft) {
    lines.push("DETAILED ATTORNEY REVIEW NOTES");
    lines.push("-".repeat(60));
    lines.push(draft.attorney_review_notes);
    lines.push("");

    lines.push("FILING NOTES");
    lines.push("-".repeat(60));
    lines.push(draft.filing_notes);
    lines.push("");
  }

  return lines.join("\n");
}
