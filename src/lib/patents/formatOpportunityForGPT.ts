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
  lines.push("MY REQUEST TO GPT:");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("Please act as an elite patent strategist, technical invention architect, and prior-art risk reviewer.");
  lines.push("");
  lines.push("I want you to improve this into a stronger NEW patent direction.");
  lines.push("");
  lines.push("Do NOT assume this is legally patentable.");
  lines.push("Do NOT assume the existing patent is safe to copy.");
  lines.push("Do NOT simply restate the existing invention.");
  lines.push("Do NOT give legal advice.");
  lines.push("");
  lines.push("Your job is to help create a NEW improvement direction that could be reviewed by a patent attorney.");
  lines.push("");
  lines.push("Please provide:");
  lines.push("");
  lines.push("1. A stronger patent title");
  lines.push("   - Make it more specific, technical, and defensible.");
  lines.push("   - Avoid generic titles like \"AI fraud detection system.\"");
  lines.push("");
  lines.push("2. A sharper invention summary");
  lines.push("   - Explain the NEW system in plain English.");
  lines.push("   - Make clear how it differs from the existing patent/application.");
  lines.push("");
  lines.push("3. The core future bottleneck");
  lines.push("   - Identify the unavoidable market constraint this solves.");
  lines.push("   - Explain why this bottleneck is becoming more urgent now.");
  lines.push("");
  lines.push("4. The strongest novelty angle");
  lines.push("   - What is the most defensible technical improvement?");
  lines.push("   - What makes this more than a generic use of AI?");
  lines.push("");
  lines.push("5. Stronger system architecture");
  lines.push("   - List the major system components.");
  lines.push("   - Explain what each component does.");
  lines.push("   - Explain how the components interact.");
  lines.push("");
  lines.push("6. Method flow");
  lines.push("   - Give step-by-step method claims/process flow.");
  lines.push("   - Make the method specific enough to support patent drafting.");
  lines.push("");
  lines.push("7. Independent claim concepts");
  lines.push("   - Suggest at least 5 possible independent claim concepts.");
  lines.push("   - Include system claims, method claims, and computer-readable medium/software claims if applicable.");
  lines.push("");
  lines.push("8. Dependent claim concepts");
  lines.push("   - Suggest at least 15 dependent claim concepts.");
  lines.push("   - These should add technical details, variants, thresholds, signals, workflows, integrations, or embodiments.");
  lines.push("");
  lines.push("9. Prior-art risks");
  lines.push("   - Identify where this idea might be too obvious or already known.");
  lines.push("   - Identify which parts are likely crowded with prior art.");
  lines.push("   - Suggest how to avoid weak/generic claim scope.");
  lines.push("");
  lines.push("10. Ways to strengthen patentability");
  lines.push("    - Suggest narrower technical features.");
  lines.push("    - Suggest unique combinations.");
  lines.push("    - Suggest data flows, control flows, timing mechanisms, risk-scoring logic, or system constraints that make the invention more concrete.");
  lines.push("");
  lines.push("11. Embodiments");
  lines.push("    - Give multiple embodiments:");
  lines.push("      - enterprise embodiment");
  lines.push("      - API/platform embodiment");
  lines.push("      - mobile/browser extension embodiment");
  lines.push("      - government/defense/compliance embodiment if relevant");
  lines.push("      - AI-agent/autonomous-system embodiment if relevant");
  lines.push("");
  lines.push("12. Commercial strategy");
  lines.push("    - Who would buy this?");
  lines.push("    - Why would they need it?");
  lines.push("    - What MVP should be built first?");
  lines.push("    - What should be validated before filing a non-provisional?");
  lines.push("");
  lines.push("13. Patent attorney checklist");
  lines.push("    - What should an attorney review?");
  lines.push("    - What prior-art searches should be done?");
  lines.push("    - What claim areas should be emphasized?");
  lines.push("    - What claim areas should be avoided?");
  lines.push("");
  lines.push("14. Final recommendation");
  lines.push("    - Should this be pursued as:");
  lines.push("      BEST_TO_FILE");
  lines.push("      TOP_TARGET");
  lines.push("      STRONG");
  lines.push("      WATCH");
  lines.push("      SKIP");
  lines.push("    - Explain why.");
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("MAKE THIS MORE DEFENSIBLE:");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("Focus areas for strengthening:");
  lines.push("");
  lines.push("If this involves crypto, blockchain, payments, fraud, wallets, or irreversible transactions:");
  lines.push("- Focus on pre-execution authorization before transaction broadcast.");
  lines.push("- Use adaptive risk windows that change based on wallet behavior, transaction velocity, counterparty reputation, smart-contract risk, user intent, device/session data, and transaction context.");
  lines.push("- Use AI-generated fraud probability scores before irreversible execution.");
  lines.push("- Include approve / delay / escalate / block decision states.");
  lines.push("- Include human-in-the-loop authorization when risk exceeds threshold.");
  lines.push("- Include tamper-evident authorization receipts for each approved, delayed, escalated, or blocked transaction.");
  lines.push("- Include wallet, exchange, payment processor, and AI-agent payment integrations.");
  lines.push("- Avoid generic \"AI fraud detection\" claims.");
  lines.push("- Make the patent angle about pre-execution transaction safety, adaptive authorization, and verifiable decision records.");
  lines.push("");
  lines.push("If this involves AI agents or autonomous systems:");
  lines.push("- Focus on pre-action permissioning.");
  lines.push("- Risk scoring before execution.");
  lines.push("- Policy-bound authorization.");
  lines.push("- Identity and delegated authority verification.");
  lines.push("- Escalation to humans for high-risk actions.");
  lines.push("- Audit receipts proving who/what authorized the action.");
  lines.push("- Fail-closed safety behavior.");
  lines.push("- Enterprise/government compliance.");
  lines.push("");
  lines.push("If this involves cybersecurity/data exfiltration:");
  lines.push("- Pre-transfer authorization.");
  lines.push("- Sensitive-data classification.");
  lines.push("- Contextual risk scoring.");
  lines.push("- Policy enforcement before data leaves the system.");
  lines.push("- User/entity behavior analytics.");
  lines.push("- Tamper-evident audit records.");
  lines.push("- Escalation and blocking workflows.");
  lines.push("");
  lines.push("If this involves defense/DARPA:");
  lines.push("- Command authorization.");
  lines.push("- Human-machine teaming.");
  lines.push("- Mission safety constraints.");
  lines.push("- Secure command verification.");
  lines.push("- Chain-of-command logic.");
  lines.push("- Rules-of-engagement policy packs.");
  lines.push("- Auditability and accountability.");
  lines.push("- Resilience, logistics, cyber defense, and autonomy governance.");
  lines.push("- Do not include weapon construction, targeting instructions, or harmful operational details.");
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("BETTER PATENT TITLE SUGGESTIONS:");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("Please also generate 5 stronger patent title options and rank them.");
  lines.push("");
  lines.push("For each title:");
  lines.push("- title");
  lines.push("- why it is stronger");
  lines.push("- what claim direction it supports");
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("CLAIM STRATEGY OUTPUT FORMAT:");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("Please provide claim strategy in this format:");
  lines.push("");
  lines.push("CLAIM STRATEGY");
  lines.push("");
  lines.push("Independent Claim 1 — System Claim:");
  lines.push("...");
  lines.push("");
  lines.push("Independent Claim 2 — Method Claim:");
  lines.push("...");
  lines.push("");
  lines.push("Independent Claim 3 — Computer-Readable Medium Claim:");
  lines.push("...");
  lines.push("");
  lines.push("Independent Claim 4 — API/Platform Claim:");
  lines.push("...");
  lines.push("");
  lines.push("Independent Claim 5 — Authorization/Decision Record Claim:");
  lines.push("...");
  lines.push("");
  lines.push("Dependent Claim Concepts:");
  lines.push("1. ...");
  lines.push("2. ...");
  lines.push("through at least 15.");
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("PROVISIONAL PATENT STARTER:");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("Please include a provisional patent starter:");
  lines.push("");
  lines.push("PROVISIONAL PATENT STARTER");
  lines.push("");
  lines.push("Title:");
  lines.push("Field:");
  lines.push("Background:");
  lines.push("Problem:");
  lines.push("Summary:");
  lines.push("System Components:");
  lines.push("Method Steps:");
  lines.push("Example Embodiments:");
  lines.push("Alternative Embodiments:");
  lines.push("Commercial Use Cases:");
  lines.push("Possible Claim Themes:");
  lines.push("Attorney Review Notes:");

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

export function formatQuickGPTPrompt(plan: PatentCreationPlan): string {
  const lines: string[] = [];

  lines.push("I want you to improve this patent opportunity into a stronger NEW patent direction.");
  lines.push("");
  lines.push("Patent opportunity:");
  lines.push(plan.recommended_patent_title || "Not provided.");
  lines.push("");
  lines.push("What exists:");
  lines.push(plan.source_title || "Not provided.");
  lines.push(plan.source_summary || "Not provided.");
  lines.push("");
  lines.push("New direction:");
  lines.push(plan.recommended_patent_summary || "Not provided.");
  lines.push("");
  lines.push("Future bottleneck:");
  lines.push(plan.future_bottleneck || "Not provided.");
  lines.push("");
  lines.push("Why it could be big:");
  lines.push(plan.why_this_is_best || "Not provided.");
  lines.push("");
  lines.push("Please generate:");
  lines.push("1. Stronger patent title");
  lines.push("2. Better invention summary");
  lines.push("3. Strongest novelty angle");
  lines.push("4. System architecture");
  lines.push("5. Method flow");
  lines.push("6. 5 independent claim concepts");
  lines.push("7. 15 dependent claim concepts");
  lines.push("8. Prior-art risks");
  lines.push("9. Ways to strengthen patentability");
  lines.push("10. Provisional patent starter");
  lines.push("");
  lines.push("Do not assume patentability. Do not copy the old patent. Create a NEW improvement direction for attorney review.");

  return lines.join("\n");
}
