"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface PatentCreationPlan {
  id: string;
  source_title: string;
  source_summary: string;
  source_status_estimate: string;
  future_bottleneck: string;
  market_timing: string;
  recommended_patent_title: string;
  recommended_patent_summary: string;
  why_this_is_best: string;
  new_patent_ideas: Array<{
    title: string;
    summary: string;
    what_it_would_claim: string;
    why_it_is_new_direction: string;
    market_need: string;
    score: number;
  }>;
  filing_priority_rankings: Array<{
    rank: number;
    title: string;
    reason: string;
    file_now_or_later: string;
  }>;
  possible_claim_themes: Array<{
    claim_theme: string;
    description: string;
    novelty_angle: string;
  }>;
  system_architecture: Array<{
    component: string;
    function: string;
    why_it_matters: string;
  }>;
  target_buyers: Array<{
    buyer: string;
    why_they_need_it: string;
  }>;
  venture_angle: string;
  founder_next_steps: Array<{
    step: string;
    action: string;
    outcome: string;
  }>;
  score: number;
  priority: string;
  risks: string;
  attorney_review_note: string;
}

export default function PatentPlanDetailPage() {
  const params = useParams();
  const planId = params.id as string;
  
  const [plan, setPlan] = useState<PatentCreationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlan() {
      try {
        // This is a placeholder - you'll need to create an API endpoint
        // For now, returning error to show empty state
        throw new Error("Plan not found");
      } catch (err) {
        console.error("Error loading plan:", err);
        setError("Plan not found");
      } finally {
        setLoading(false);
      }
    }

    if (planId) {
      loadPlan();
    }
  }, [planId]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "BEST_TO_FILE":
        return "bg-red-500/20 text-red-300 border-red-600";
      case "TOP_TARGET":
        return "bg-orange-500/20 text-orange-300 border-orange-600";
      case "STRONG":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-600";
      case "WATCH":
        return "bg-blue-500/20 text-blue-300 border-blue-600";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-600";
    }
  };

  const getPriorityLabel = (priority: string) => {
    return priority.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading patent plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Plan Not Found</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <Link
            href="/patent-plans"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Back to Patent Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/patent-plans"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Patent Plans
        </Link>

        {/* Hero Section */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">Patent Plan</h1>
                <p className="text-zinc-400">Best patent to create</p>
              </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{plan.score}</div>
                  <div className="text-xs text-blue-100">/ 100</div>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold border ${getPriorityColor(plan.priority)}`}>
                {getPriorityLabel(plan.priority)}
              </span>
            </div>
          </div>
        </div>

        {/* Recommended Patent */}
        <div className="mb-6 rounded-xl border-2 border-emerald-600 bg-gradient-to-br from-emerald-950/50 to-teal-950/50 p-8">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-emerald-300">What to File</h2>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{plan.recommended_patent_title}</h3>
          <p className="text-emerald-100 mb-4">{plan.recommended_patent_summary}</p>
          <div className="rounded-lg bg-emerald-900/20 border border-emerald-800 p-4">
            <h4 className="text-sm font-medium text-emerald-400 mb-2">Why Big</h4>
            <p className="text-sm text-emerald-100">{plan.why_this_is_best}</p>
          </div>
        </div>

        {/* What Exists Now */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">What Exists Now</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-zinc-500">Source Patent/Application</div>
              <div className="text-white font-medium">{plan.source_title}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500">Status</div>
              <div className="text-zinc-300">{plan.source_status_estimate}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500">Summary</div>
              <p className="text-zinc-300">{plan.source_summary}</p>
            </div>
          </div>
        </div>

        {/* Future Bottleneck */}
        <div className="mb-6 rounded-xl border border-blue-800 bg-blue-950/50 p-6">
          <h2 className="text-xl font-bold text-blue-300 mb-4">Future Bottleneck</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-blue-400 mb-1">The Problem</div>
              <p className="text-blue-100">{plan.future_bottleneck}</p>
            </div>
            <div>
              <div className="text-sm text-blue-400 mb-1">Market Timing</div>
              <p className="text-blue-100">{plan.market_timing}</p>
            </div>
          </div>
        </div>

        {/* New Patent Ideas */}
        {plan.new_patent_ideas && plan.new_patent_ideas.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Best Patents to Create</h2>
            <div className="space-y-4">
              {plan.new_patent_ideas.map((idea, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{idea.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
                          Score: {idea.score}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 mb-2">{idea.summary}</p>
                      <div className="grid md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-zinc-500">What It Would Claim</div>
                          <div className="text-zinc-400">{idea.what_it_would_claim}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500">Why It's New</div>
                          <div className="text-zinc-400">{idea.why_it_is_new_direction}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs">
                        <div className="text-zinc-500">Market Need</div>
                        <div className="text-zinc-400">{idea.market_need}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filing Priority Rankings */}
        {plan.filing_priority_rankings && plan.filing_priority_rankings.length > 0 && (
          <div className="mb-6 rounded-xl border border-purple-800 bg-purple-950/50 p-6">
            <h2 className="text-xl font-bold text-purple-300 mb-4">What to File First</h2>
            <div className="space-y-3">
              {plan.filing_priority_rankings.map((ranking, idx) => (
                <div key={idx} className="rounded-lg bg-purple-900/20 border border-purple-800 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                      #{ranking.rank}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-purple-200 mb-1">{ranking.title}</div>
                      <div className="text-sm text-purple-300 mb-1">{ranking.reason}</div>
                      <div className="text-xs text-purple-400">{ranking.file_now_or_later}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Possible Claim Themes */}
        {plan.possible_claim_themes && plan.possible_claim_themes.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Possible Claim Themes</h2>
            <div className="space-y-3">
              {plan.possible_claim_themes.map((claim, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="font-semibold text-zinc-200 mb-1">{claim.claim_theme}</div>
                  <p className="text-sm text-zinc-300 mb-2">{claim.description}</p>
                  <div className="text-xs text-zinc-400">
                    <strong>Novelty Angle:</strong> {claim.novelty_angle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Architecture */}
        {plan.system_architecture && plan.system_architecture.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">System Architecture</h2>
            <div className="space-y-3">
              {plan.system_architecture.map((item, idx) => (
                <div key={idx} className="border-l-2 border-indigo-600 pl-4">
                  <div className="font-semibold text-indigo-300">{item.component}</div>
                  <div className="text-sm text-indigo-200 mt-1">{item.function}</div>
                  <div className="text-xs text-indigo-400 mt-1">
                    Why it matters: {item.why_it_matters}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Buyers */}
        {plan.target_buyers && plan.target_buyers.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Who Buys</h2>
            <div className="space-y-3">
              {plan.target_buyers.map((buyer, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="font-semibold text-green-300 mb-1">{buyer.buyer}</div>
                  <p className="text-sm text-green-200">{buyer.why_they_need_it}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Venture Angle */}
        {plan.venture_angle && (
          <div className="mb-6 rounded-xl border border-cyan-800 bg-cyan-950/50 p-6">
            <h2 className="text-xl font-bold text-cyan-300 mb-4">What to Build</h2>
            <p className="text-cyan-100">{plan.venture_angle}</p>
          </div>
        )}

        {/* Founder Next Steps */}
        {plan.founder_next_steps && plan.founder_next_steps.length > 0 && (
          <div className="mb-6 rounded-xl border border-blue-800 bg-blue-950/50 p-6">
            <h2 className="text-xl font-bold text-blue-300 mb-4">What to Do Next</h2>
            <div className="space-y-3">
              {plan.founder_next_steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-blue-200">{step.step}</div>
                    <div className="text-sm text-blue-300 mt-1">Action: {step.action}</div>
                    <div className="text-xs text-blue-400 mt-1">Outcome: {step.outcome}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risks + Attorney Review */}
        <div className="mb-6 rounded-xl border border-orange-800 bg-orange-950/50 p-6">
          <h2 className="text-xl font-bold text-orange-300 mb-4">Risks + Attorney Review</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-orange-400 mb-2">Risks</div>
              <p className="text-orange-200">{plan.risks}</p>
            </div>
            <div>
              <div className="text-sm text-orange-400 mb-2">Attorney Review Required</div>
              <p className="text-orange-200">{plan.attorney_review_note}</p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="rounded-xl border border-yellow-800 bg-yellow-900/20 p-6">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 flex-shrink-0 text-yellow-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-300 mb-2">Legal Disclaimer</h3>
              <p className="text-sm text-yellow-200/90">
                This is not legal advice. Patentability, freedom to operate, infringement risk, and patent status require review by a qualified patent attorney. 
                PatentBoom identifies possible new improvement directions and does not recommend copying existing patents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
