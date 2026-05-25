"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface PatentData {
  id: string;
  title: string;
  abstract: string;
  filing_date: string | null;
  grant_date: string | null;
  assignee: string[];
  inventors: string[];
  status_estimate: string;
  patent_number: string;
  source: string | null;
  source_url: string | null;
  is_demo?: boolean;
}

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

interface HunterItem {
  id: string;
  category: string;
  query: string;
  recommendation: string;
  pre_ai_score: number;
}

interface OpportunityReport {
  id: string;
  opportunity_score: number;
  recommendation: string;
  future_bottleneck_score: number;
  market_inevitability_score: number;
  ai_upgrade_score: number;
  patentability_score: number;
  buildability_score: number;
  revenue_score: number;
  strategic_fit_score: number;
}

export default function PatentDetailPage() {
  const params = useParams();
  const patentId = params.id as string;

  const [patent, setPatent] = useState<PatentData | null>(null);
  const [creationPlan, setCreationPlan] = useState<PatentCreationPlan | null>(null);
  const [hunterItem, setHunterItem] = useState<HunterItem | null>(null);
  const [opportunityReport, setOpportunityReport] = useState<OpportunityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<{
    message: string;
    stage?: string;
    details?: string;
    hint?: string;
    isFallback?: boolean;
  } | null>(null);
  const [hasStartedAutoGenerate, setHasStartedAutoGenerate] = useState(false);

  // Load patent and venture plan
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(
          `/api/patents/by-id?id=${encodeURIComponent(patentId)}`
        );

        if (!response.ok) {
          throw new Error("Patent not found");
        }

        const data = await response.json();
        setPatent(data.patent);
        setCreationPlan(data.creationPlan);
        setHunterItem(data.hunterItem);
        setOpportunityReport(data.report);
      } catch (err) {
        console.error("Error loading patent:", err);
        setError("Patent not found. Go back to search results.");
      } finally {
        setLoading(false);
      }
    }

    if (patentId) {
      loadData();
    }
  }, [patentId]);

  // Auto-generate creation plan if missing
  useEffect(() => {
    async function autoGeneratePlan() {
      if (!patent || loading || creationPlan || generatingPlan || hasStartedAutoGenerate) return;

      setHasStartedAutoGenerate(true);
      setGeneratingPlan(true);
      setPlanError(null);

      try {
        const response = await fetch("/api/patents/generate-creation-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patentResultId: patent.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || data.error || "Plan generation failed");
        }

        setCreationPlan(data.plan);
        
        // Check if fallback plan
        if (data.isFallback) {
          setPlanError({
            message: data.message || "Fallback plan generated",
            isFallback: true,
            hint: "Retry generation for full AI-powered analysis"
          });
        }
      } catch (err) {
        console.error("Auto-generate plan error:", err);
        const errorData = err instanceof Error ? err.message : "Unknown error";
        setPlanError({
          message: "Plan generation needs attention",
          details: errorData,
          hint: "Retry is available in Advanced Details. Check debug console for more info."
        });
      } finally {
        setGeneratingPlan(false);
      }
    }

    if (patent && !loading && !creationPlan && !hasStartedAutoGenerate) {
      autoGeneratePlan();
    }
  }, [patent, loading, creationPlan, generatingPlan, hasStartedAutoGenerate]);

  const handleRegeneratePlan = async () => {
    if (!patent) return;

    setGeneratingPlan(true);
    setPlanError(null);

    try {
      const response = await fetch("/api/patents/generate-creation-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patentResultId: patent.id, force: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Plan generation failed");
      }

      setCreationPlan(data.plan);
      setPlanError(null);
      
      // Check if fallback plan
      if (data.isFallback) {
        setPlanError({
          message: data.message || "Fallback plan generated",
          isFallback: true,
          hint: "Retry generation for full AI-powered analysis"
        });
      }
    } catch (err) {
      console.error("Regenerate plan error:", err);
      const errorData = err instanceof Error ? err.message : "Unknown error";
      setPlanError({
        message: "Plan generation failed",
        details: errorData,
        hint: "Check server logs or try again later"
      });
    } finally {
      setGeneratingPlan(false);
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading patent...</p>
        </div>
      </div>
    );
  }

  if (error || !patent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Patent Not Found</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <Link
            href="/search"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Back to Search
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
          href="/saved"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Saved
        </Link>

        {/* Top Section: Status and Score */}
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                Patent Creation Plan
              </h1>
              <p className="text-zinc-400">
                PatentBoom analyzed an existing patent signal and recommends what NEW patent to create.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              {creationPlan && (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{creationPlan.score}</div>
                      <div className="text-xs text-blue-100">/ 100</div>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold border ${getPriorityBadgeColor(creationPlan.priority)}`}>
                    {getPriorityLabel(creationPlan.priority)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mt-4 flex items-center gap-2">
            {generatingPlan ? (
              <>
                <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-blue-400 font-medium">Building Plan...</span>
                <span className="text-zinc-500 text-sm">PatentBoom is creating the patent plan...</span>
              </>
            ) : creationPlan ? (
              <>
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400 font-medium">Plan Ready</span>
              </>
            ) : planError ? (
              <>
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-red-400 font-medium">Plan Error</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-yellow-400 font-medium">No Plan Yet</span>
              </>
            )}
          </div>
        </div>

        {planError && (
          <div className={`mt-6 rounded-xl border p-6 ${
            planError.isFallback 
              ? "border-yellow-700 bg-yellow-900/20" 
              : "border-red-700 bg-red-900/20"
          }`}>
            <div className="flex items-start gap-3">
              <svg className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                planError.isFallback ? "text-yellow-400" : "text-red-400"
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className={`font-semibold mb-2 ${
                  planError.isFallback ? "text-yellow-300" : "text-red-300"
                }`}>
                  {planError.message}
                </h4>
                {planError.stage && (
                  <p className="text-sm text-zinc-400 mb-1">
                    <strong>Stage:</strong> {planError.stage}
                  </p>
                )}
                {planError.details && (
                  <p className="text-sm text-zinc-400 mb-2">
                    <strong>Details:</strong> {planError.details}
                  </p>
                )}
                {planError.hint && (
                  <p className={`text-sm ${
                    planError.isFallback ? "text-yellow-200" : "text-red-200"
                  }`}>
                    <strong>Hint:</strong> {planError.hint}
                  </p>
                )}
                {planError.isFallback && creationPlan && (
                  <p className="text-sm text-yellow-200 mt-3">
                    A fallback plan is displayed below. Use "Regenerate Patent Plan" in Advanced Details for full AI analysis.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {generatingPlan && (
          <div className="mt-6 rounded-xl border border-blue-700 bg-blue-900/20 p-6">
            <div className="flex items-start gap-4">
              <svg className="w-8 h-8 text-blue-400 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-bold text-blue-300 mb-2">PatentBoom is creating the patent plan...</h4>
                <p className="text-sm text-blue-200">
                  Analyzing the existing patent signal, generating new patent ideas, scoring market opportunity, and creating a founder action plan. This takes about 15-20 seconds.
                </p>
              </div>
            </div>
          </div>
        )}

        {creationPlan && (
          <>
            {/* Recommended Patent to File */}
            <div className="mt-6 rounded-xl border-2 border-emerald-600 bg-gradient-to-br from-emerald-950/50 to-teal-950/50 p-8">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-emerald-300">Recommended Patent to File</h2>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{creationPlan.recommended_patent_title}</h3>
              <p className="text-emerald-100 mb-4">{creationPlan.recommended_patent_summary}</p>
              <div className="rounded-lg bg-emerald-900/20 border border-emerald-800 p-4">
                <h4 className="text-sm font-medium text-emerald-400 mb-2">Why This Is Best</h4>
                <p className="text-sm text-emerald-100">{creationPlan.why_this_is_best}</p>
              </div>
            </div>

            {/* A. What Exists Now */}
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="text-xl font-bold text-white mb-4">What Exists Now</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-zinc-500">Source Patent/Application</div>
                  <h3 className="text-lg font-semibold text-white">{creationPlan.source_title}</h3>
                </div>

                <div>
                  <div className="text-sm text-zinc-500">Status</div>
                  <div className="text-zinc-300">{creationPlan.source_status_estimate}</div>
                </div>

                {creationPlan.source_summary && (
                  <div>
                    <div className="text-sm text-zinc-500">Summary</div>
                    <p className="text-zinc-400">{creationPlan.source_summary}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Future Bottleneck */}
            <div className="mt-6 rounded-xl border border-blue-800 bg-blue-950/50 p-6">
              <h2 className="text-xl font-bold text-blue-300 mb-4">Future Bottleneck</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-blue-400 mb-1">The Problem</div>
                  <p className="text-blue-100">{creationPlan.future_bottleneck}</p>
                </div>
                <div>
                  <div className="text-sm text-blue-400 mb-1">Market Timing</div>
                  <p className="text-blue-100">{creationPlan.market_timing}</p>
                </div>
              </div>
            </div>

            {/* New Patent Ideas */}
            {creationPlan.new_patent_ideas && creationPlan.new_patent_ideas.length > 0 && (
              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-xl font-bold text-white mb-4">New Patents PatentBoom Recommends</h2>
                <div className="space-y-4">
                  {creationPlan.new_patent_ideas.map((idea, idx) => (
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
            {creationPlan.filing_priority_rankings && creationPlan.filing_priority_rankings.length > 0 && (
              <div className="mt-6 rounded-xl border border-purple-800 bg-purple-950/50 p-6">
                <h2 className="text-xl font-bold text-purple-300 mb-4">Best Patent to File First</h2>
                <div className="space-y-3">
                  {creationPlan.filing_priority_rankings.map((ranking, idx) => (
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
            {creationPlan.possible_claim_themes && creationPlan.possible_claim_themes.length > 0 && (
              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Possible Claim Themes</h2>
                <div className="space-y-3">
                  {creationPlan.possible_claim_themes.map((claim, idx) => (
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
            {creationPlan.system_architecture && creationPlan.system_architecture.length > 0 && (
              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-xl font-bold text-white mb-4">System Architecture</h2>
                <div className="space-y-3">
                  {creationPlan.system_architecture.map((item, idx) => (
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
            {creationPlan.target_buyers && creationPlan.target_buyers.length > 0 && (
              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Who Would Buy This</h2>
                <div className="space-y-3">
                  {creationPlan.target_buyers.map((buyer, idx) => (
                    <div key={idx} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                      <div className="font-semibold text-green-300 mb-1">{buyer.buyer}</div>
                      <p className="text-sm text-green-200">{buyer.why_they_need_it}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venture Angle */}
            {creationPlan.venture_angle && (
              <div className="mt-6 rounded-xl border border-cyan-800 bg-cyan-950/50 p-6">
                <h2 className="text-xl font-bold text-cyan-300 mb-4">Venture Angle</h2>
                <p className="text-cyan-100">{creationPlan.venture_angle}</p>
              </div>
            )}

            {/* Founder Next Steps */}
            {creationPlan.founder_next_steps && creationPlan.founder_next_steps.length > 0 && (
              <div className="mt-6 rounded-xl border border-blue-800 bg-blue-950/50 p-6">
                <h2 className="text-xl font-bold text-blue-300 mb-4">Founder Next Steps</h2>
                <div className="space-y-3">
                  {creationPlan.founder_next_steps.map((step, idx) => (
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
            <div className="mt-6 rounded-xl border border-orange-800 bg-orange-950/50 p-6">
              <h2 className="text-xl font-bold text-orange-300 mb-4">Risks + Attorney Review</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-orange-400 mb-2">Risks</div>
                  <p className="text-orange-200">{creationPlan.risks}</p>
                </div>
                <div>
                  <div className="text-sm text-orange-400 mb-2">Attorney Review Required</div>
                  <p className="text-orange-200">{creationPlan.attorney_review_note}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Advanced Details - Collapsed */}
        {(hunterItem || opportunityReport || patent) && (
          <details className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
            <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-zinc-400 hover:text-zinc-300">
              Advanced Details
            </summary>
            <div className="border-t border-zinc-800 p-6 space-y-6">
              {/* Regenerate Plan Button */}
              <div>
                <h4 className="text-sm font-medium text-zinc-300 mb-2">Regenerate Plan</h4>
                <button
                  onClick={handleRegeneratePlan}
                  disabled={generatingPlan}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generatingPlan ? 'Regenerating...' : 'Regenerate Patent Plan'}
                </button>
              </div>

              {/* Hunter Context */}
              {hunterItem && (
                <div>
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">Hunter Context</h4>
                  <div className="rounded-lg bg-zinc-800/50 p-4 space-y-2 text-sm">
                    <div>
                      <span className="text-zinc-500">Category:</span>
                      <span className="ml-2 text-zinc-300">{hunterItem.category}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Query:</span>
                      <span className="ml-2 text-zinc-300">{hunterItem.query}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Pre-AI Score:</span>
                      <span className="ml-2 text-zinc-300">{hunterItem.pre_ai_score}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Recommendation:</span>
                      <span className="ml-2 text-zinc-300">{hunterItem.recommendation}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Opportunity Report Scores */}
              {opportunityReport && (
                <div>
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">AI Opportunity Report</h4>
                  <div className="rounded-lg bg-zinc-800/50 p-4 space-y-2 text-sm">
                    <div>
                      <span className="text-zinc-500">Opportunity Score:</span>
                      <span className="ml-2 text-zinc-300">{opportunityReport.opportunity_score}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Recommendation:</span>
                      <span className="ml-2 text-zinc-300">{opportunityReport.recommendation}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Patent Abstract */}
              <div>
                <h4 className="text-sm font-medium text-zinc-300 mb-2">Original Patent Abstract</h4>
                <div className="rounded-lg bg-zinc-800/50 p-4 text-sm text-zinc-400">
                  {patent.abstract}
                </div>
              </div>
            </div>
          </details>
        )}

        {/* Legal Disclaimer */}
        <div className="mt-6 rounded-xl border border-yellow-800 bg-yellow-900/20 p-6">
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
