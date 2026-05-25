/**
 * Helper functions for patent status classification and recommended actions
 */

export interface StatusClassification {
  sourceStatus: string;
  statusColor: string;
  recommendedAction: string;
  actionColor: string;
}

export function classifyPatentStatus(sourceStatusEstimate: string): StatusClassification {
  const status = (sourceStatusEstimate || "").toLowerCase();

  // Check for Pending/Active
  if (status.includes("pending") || status.includes("active") || status.includes("filed")) {
    return {
      sourceStatus: "Pending / Possibly Active Signal",
      statusColor: "text-yellow-300 bg-yellow-900/20 border-yellow-700",
      recommendedAction: "Use this only as prior-art and market signal. Create a clearly differentiated new improvement. Do not copy existing claims.",
      actionColor: "bg-yellow-900/10 border-yellow-800 text-yellow-200",
    };
  }

  // Check for Expired
  if (status.includes("expired") || status.includes("lapsed")) {
    return {
      sourceStatus: "Likely Expired Signal",
      statusColor: "text-green-300 bg-green-900/20 border-green-700",
      recommendedAction: "Potential modernization opportunity. Verify maintenance, patent family, continuations, and expiration before relying on status.",
      actionColor: "bg-green-900/10 border-green-800 text-green-200",
    };
  }

  // Check for Abandoned
  if (status.includes("abandoned") || status.includes("withdrawn")) {
    return {
      sourceStatus: "Likely Abandoned Signal",
      statusColor: "text-blue-300 bg-blue-900/20 border-blue-700",
      recommendedAction: "Potential prior-art signal. Verify whether application was revived, continued, or covered by related filings.",
      actionColor: "bg-blue-900/10 border-blue-800 text-blue-200",
    };
  }

  // Status Unclear or missing
  return {
    sourceStatus: "Status Unclear Signal",
    statusColor: "text-zinc-300 bg-zinc-800/20 border-zinc-700",
    recommendedAction: "Use for idea generation only until status is verified.",
    actionColor: "bg-zinc-800/10 border-zinc-700 text-zinc-300",
  };
}

export function getVerificationChecklist(): string[] {
  return [
    "Check USPTO Patent Center status",
    "Check maintenance fee status if granted",
    "Check filing, priority, and grant dates",
    "Check continuations, divisionals, reissues, and related family members",
    "Check whether claims are still active",
    "Run prior-art search around the new improvement",
    "Have patent attorney review freedom to operate and patentability",
  ];
}
