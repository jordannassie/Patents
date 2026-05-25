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

interface VenturePlan {
  id: string;
  plan_title: string;
  existing_patent_summary: string;
  new_patent_concept_title: string;
  new_invention_summary: string;
  future_bottleneck_solved: string;
  why_now: string;
  technical_improvement: string;
  differentiation_from_existing_patent: string;
  possible_claim_directions: Array<{
    claim_theme: string;
    description: string;
    novelty_angle: string;
  }>;
  system_architecture: Array<{
    component: string;
    function: string;
    why_it_matters: string;
  }>;
  upgrade_layers: Array<{
    layer: string;
    description: string;
  }>;
  target_buyers: Array<{
    buyer: string;
    why_they_need_it: string;
    first_pitch: string;
  }>;
  commercial_use_cases: Array<{
    use_case: string;
    market: string;
    why_it_matters: string;
  }>;
  billion_dollar_thesis: string;
  risks: string;
  attorney_review_notes: string;
  founder_action_plan: {
    patent_next_step: string;
    mvp_next_step: string;
    customer_validation_next_step: string;
    darpa_or_government_next_step: string;
    next_30_days: Array<{
      action: string;
      outcome: string;
    }>;
    next_90_days: Array<{
      phase: string;
      action: string;
      outcome: string;
    }>;
  };
  scores: {
    future_bottleneck_score: number;
    market_inevitability_score: number;
    ai_upgrade_score: number;
    buyer_demand_score: number;
    patentability_upgrade_score: number;
    buildability_score: number;
  };
  priority_level: string;
  overall_score: number;
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
  const [venturePlan, setVenturePlan] = useState<VenturePlan | null>(null);
  const [hunterItem, setHunterItem] = useState<HunterItem | null>(null);
  const [opportunityReport, setOpportunityReport] = useState<OpportunityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
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
        setVenturePlan(data.venturePlan);
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

  // Auto-generate venture plan if missing
  useEffect(() => {
    async function autoGeneratePlan() {
      if (!patent || loading || venturePlan || generatingPlan || hasStartedAutoGenerate) return;

      setHasStartedAutoGenerate(true);
      setGeneratingPlan(true);
      setPlanError(null);

      try {
        const response = await fetch("/api/patents/generate-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patentResultId: patent.id }),
        });

        if (!response.ok) {
          throw new Error("Plan generation failed");
        }

        const data = await response.json();
        setVenturePlan(data.plan);
      } catch (err) {
        console.error("Auto-generate plan error:", err);
        setPlanError("PatentBoom could not complete the plan. Retry is available in Advanced Details.");
      } finally {
        setGeneratingPlan(false);
      }
    }

    if (patent && !loading && !venturePlan && !hasStartedAutoGenerate) {
      autoGeneratePlan();
    }
  }, [patent, loading, venturePlan, generatingPlan, hasStartedAutoGenerate]);

  const handleRegeneratePlan = async () => {
    if (!patent) return;

    setGeneratingPlan(true);
    setPlanError(null);

    try {
      const response = await fetch("/api/patents/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patentResultId: patent.id, force: true }),
      });

      if (!response.ok) {
        throw new Error("Plan generation failed");
      }

      const data = await response.json();
      setVenturePlan(data.plan);
    } catch (err) {
      console.error("Regenerate plan error:", err);
      setPlanError("Plan generation failed. Please try again.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "PRIORITY_TARGET":
        return "bg-red-500/20 text-red-300 border-red-600";
      case "TOP_OPPORTUNITY":
        return "bg-orange-500/20 text-orange-300 border-orange-600";
      case "STRONG_WATCH":
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
                New Patent Opportunity
              </h1>
              <p className="text-zinc-400">
                PatentBoom analyzed an existing patent/application signal and generated a new improvement plan.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              {venturePlan && (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{venturePlan.overall_score}</div>
                      <div className="text-xs text-blue-100">/ 100</div>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold border ${getPriorityBadgeColor(venturePlan.priority_level)}`}>
                    {getPriorityLabel(venturePlan.priority_level)}
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
                <span className="text-zinc-500 text-sm">PatentBoom is building the new patent plan...</span>
              </>
            ) : venturePlan ? (
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
          <div className="mt-6 rounded-xl border border-red-700 bg-red-900/20 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-red-300">{planError}</p>
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
                <h4 className="font-bold text-blue-300 mb-2">PatentBoom is building the new patent plan...</h4>
                <p className="text-sm text-blue-200">
                  Analyzing the existing patent, generating new improvement concepts, scoring market opportunity, and creating actionable founder steps. This takes about 15-20 seconds.
                </p>
              </div>
            </div>
          </div>
        )}

        {venturePlan && (
          <>
            {/* A. Existing Patent Signal */}
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="text-xl font-bold text-white mb-4">What Exists Now</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-200">{patent.title}</h3>
                </div>

                {venturePlan.existing_patent_summary && (
                  <p className="text-zinc-400">{venturePlan.existing_patent_summary}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                  {patent.filing_date && (
                    <div>
                      <div className="text-zinc-500">Filed</div>
                      <div className="text-zinc-300 font-medium">{new Date(patent.filing_date).toLocaleDateString()}</div>
                    </div>
                  )}
                  {patent.grant_date && (
                    <div>
                      <div className="text-zinc-500">Granted</div>
                      <div className="text-zinc-300 font-medium">{new Date(patent.grant_date).toLocaleDateString()}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-zinc-500">Status</div>
                    <div className="text-zinc-300 font-medium">{patent.status_estimate}</div>
                  </div>
                  {patent.patent_number && patent.patent_number !== "Unknown" && (
                    <div>
                      <div className="text-zinc-500">Patent #</div>
                      <div className="text-zinc-300 font-medium">{patent.patent_number}</div>
                    </div>
                  )}
                </div>

                {patent.assignee && patent.assignee.length > 0 && (
                  <div className="text-sm">
                    <span className="text-zinc-500">Assignee: </span>
                    <span className="text-zinc-300">{patent.assignee.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* B. New Patent Plan - MAIN SECTION */}
            <div className="mt-6 rounded-xl border-2 border-emerald-600 bg-gradient-to-br from-emerald-950/50 to-teal-950/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-emerald-300">The New Patent Plan</h2>
              </div>

              <div className="space-y-6">
                {/* Concept Title */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{venturePlan.new_patent_concept_title}</h3>
                  <p className="text-emerald-100">{venturePlan.new_invention_summary}</p>
                </div>

                {/* Key Insights Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-lg bg-emerald-900/20 border border-emerald-800 p-4">
                    <h4 className="text-sm font-medium text-emerald-400 mb-2">Future Bottleneck Solved</h4>
                    <p className="text-sm text-emerald-100">{venturePlan.future_bottleneck_solved}</p>
                  </div>

                  <div className="rounded-lg bg-teal-900/20 border border-teal-800 p-4">
                    <h4 className="text-sm font-medium text-teal-400 mb-2">Why Now</h4>
                    <p className="text-sm text-teal-100">{venturePlan.why_now}</p>
                  </div>

                  <div className="rounded-lg bg-cyan-900/20 border border-cyan-800 p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-2">Technical Improvement</h4>
                    <p className="text-sm text-cyan-100">{venturePlan.technical_improvement}</p>
                  </div>

                  <div className="rounded-lg bg-blue-900/20 border border-blue-800 p-4">
                    <h4 className="text-sm font-medium text-blue-400 mb-2">How It's Different</h4>
                    <p className="text-sm text-blue-100">{venturePlan.differentiation_from_existing_patent}</p>
                  </div>
                </div>

                {/* Possible Claim Directions */}
                {venturePlan.possible_claim_directions && venturePlan.possible_claim_directions.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-300 mb-3">Possible Claim Directions</h4>
                    <div className="space-y-3">
                      {venturePlan.possible_claim_directions.map((claim, idx) => (
                        <div key={idx} className="rounded-lg bg-purple-900/20 border border-purple-800 p-4">
                          <div className="font-semibold text-purple-300 mb-1">{claim.claim_theme}</div>
                          <div className="text-sm text-purple-200 mb-2">{claim.description}</div>
                          <div className="text-xs text-purple-400">
                            <strong>Novelty:</strong> {claim.novelty_angle}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Architecture */}
                {venturePlan.system_architecture && venturePlan.system_architecture.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-300 mb-3">System Architecture</h4>
                    <div className="space-y-3">
                      {venturePlan.system_architecture.map((item, idx) => (
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

                {/* Upgrade Layers */}
                {venturePlan.upgrade_layers && venturePlan.upgrade_layers.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-300 mb-3">AI / Software / Hardware Upgrades</h4>
                    <div className="space-y-2">
                      {venturePlan.upgrade_layers.map((layer, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-500" />
                          <div>
                            <div className="font-medium text-cyan-300">{layer.layer}</div>
                            <div className="text-sm text-cyan-200">{layer.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Buyers */}
                {venturePlan.target_buyers && venturePlan.target_buyers.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-300 mb-3">Target Buyers</h4>
                    <div className="space-y-3">
                      {venturePlan.target_buyers.map((buyer, idx) => (
                        <div key={idx} className="rounded-lg bg-green-900/20 border border-green-800 p-4">
                          <div className="font-semibold text-green-300 mb-1">{buyer.buyer}</div>
                          <div className="text-sm text-green-200 mb-2">{buyer.why_they_need_it}</div>
                          <div className="text-xs text-green-400 italic">
                            First pitch: {buyer.first_pitch}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Commercial Use Cases */}
                {venturePlan.commercial_use_cases && venturePlan.commercial_use_cases.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-300 mb-3">Commercial Use Cases</h4>
                    <div className="space-y-2">
                      {venturePlan.commercial_use_cases.map((useCase, idx) => (
                        <div key={idx} className="border-l-2 border-blue-600 pl-4">
                          <div className="font-semibold text-blue-300">{useCase.use_case}</div>
                          <div className="text-sm text-blue-200">Market: {useCase.market}</div>
                          <div className="text-xs text-blue-400">{useCase.why_it_matters}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* $1B Thesis */}
                <div className="rounded-lg bg-yellow-900/20 border border-yellow-800 p-4">
                  <h4 className="text-lg font-bold text-yellow-300 mb-2">$1 Billion Thesis</h4>
                  <p className="text-yellow-200">{venturePlan.billion_dollar_thesis}</p>
                </div>

                {/* Risks */}
                <div className="rounded-lg bg-orange-900/20 border border-orange-800 p-4">
                  <h4 className="text-lg font-bold text-orange-300 mb-2">Risks & Challenges</h4>
                  <p className="text-orange-200 mb-3">{venturePlan.risks}</p>
                  <div className="text-sm text-orange-300">
                    <strong>Attorney Review Required:</strong> {venturePlan.attorney_review_notes}
                  </div>
                </div>
              </div>
            </div>

            {/* C. Scorecard */}
            {venturePlan.scores && (
              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Opportunity Scorecard</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {venturePlan.scores.future_bottleneck_score && (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                      <div className="text-sm text-zinc-400">Future Bottleneck</div>
                      <div className="mt-1 text-2xl font-bold text-white">
                        {venturePlan.scores.future_bottleneck_score}
                        <span className="text-sm font-normal text-zinc-400">/100</span>
                      </div>
                    </div>
                  )}
                  {venturePlan.scores.market_inevitability_score && (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                      <div className="text-sm text-zinc-400">Market Inevitability</div>
                      <div className="mt-1 text-2xl font-bold text-white">
                        {venturePlan.scores.market_inevitability_score}
                        <span className="text-sm font-normal text-zinc-400">/100</span>
                      </div>
                    </div>
                  )}
                  {venturePlan.scores.ai_upgrade_score && (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                      <div className="text-sm text-zinc-400">AI Upgrade</div>
                      <div className="mt-1 text-2xl font-bold text-white">
                        {venturePlan.scores.ai_upgrade_score}
                        <span className="text-sm font-normal text-zinc-400">/100</span>
                      </div>
                    </div>
                  )}
                  {venturePlan.scores.buyer_demand_score && (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                      <div className="text-sm text-zinc-400">Buyer Demand</div>
                      <div className="mt-1 text-2xl font-bold text-white">
                        {venturePlan.scores.buyer_demand_score}
                        <span className="text-sm font-normal text-zinc-400">/100</span>
                      </div>
                    </div>
                  )}
                  {venturePlan.scores.patentability_upgrade_score && (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                      <div className="text-sm text-zinc-400">Patentability Upgrade</div>
                      <div className="mt-1 text-2xl font-bold text-white">
                        {venturePlan.scores.patentability_upgrade_score}
                        <span className="text-sm font-normal text-zinc-400">/100</span>
                      </div>
                    </div>
                  )}
                  {venturePlan.scores.buildability_score && (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                      <div className="text-sm text-zinc-400">Buildability</div>
                      <div className="mt-1 text-2xl font-bold text-white">
                        {venturePlan.scores.buildability_score}
                        <span className="text-sm font-normal text-zinc-400">/100</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* D. Founder Action Plan */}
            {venturePlan.founder_action_plan && (
              <div className="mt-6 rounded-xl border border-blue-800 bg-blue-950/50 p-6">
                <h2 className="text-xl font-bold text-blue-300 mb-4">What To Do Next</h2>
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-lg bg-purple-900/20 border border-purple-800 p-4">
                      <h4 className="text-sm font-medium text-purple-300 mb-1">Patent Filing</h4>
                      <p className="text-sm text-purple-100">{venturePlan.founder_action_plan.patent_next_step}</p>
                    </div>
                    <div className="rounded-lg bg-cyan-900/20 border border-cyan-800 p-4">
                      <h4 className="text-sm font-medium text-cyan-300 mb-1">MVP / Prototype</h4>
                      <p className="text-sm text-cyan-100">{venturePlan.founder_action_plan.mvp_next_step}</p>
                    </div>
                    <div className="rounded-lg bg-green-900/20 border border-green-800 p-4">
                      <h4 className="text-sm font-medium text-green-300 mb-1">Customer Validation</h4>
                      <p className="text-sm text-green-100">{venturePlan.founder_action_plan.customer_validation_next_step}</p>
                    </div>
                    {venturePlan.founder_action_plan.darpa_or_government_next_step && 
                     venturePlan.founder_action_plan.darpa_or_government_next_step !== "Not applicable" && (
                      <div className="rounded-lg bg-red-900/20 border border-red-800 p-4">
                        <h4 className="text-sm font-medium text-red-300 mb-1">Government / DARPA</h4>
                        <p className="text-sm text-red-100">{venturePlan.founder_action_plan.darpa_or_government_next_step}</p>
                      </div>
                    )}
                  </div>

                  {/* 30-Day Plan */}
                  {venturePlan.founder_action_plan.next_30_days && venturePlan.founder_action_plan.next_30_days.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-blue-200 mb-3">Next 30 Days</h4>
                      <div className="space-y-2">
                        {venturePlan.founder_action_plan.next_30_days.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <div className="font-medium text-blue-200">{item.action}</div>
                              <div className="text-sm text-blue-300/80">Outcome: {item.outcome}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 90-Day Plan */}
                  {venturePlan.founder_action_plan.next_90_days && venturePlan.founder_action_plan.next_90_days.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-blue-200 mb-3">Next 90 Days</h4>
                      <div className="space-y-3">
                        {venturePlan.founder_action_plan.next_90_days.map((phase, idx) => (
                          <div key={idx} className="rounded-lg bg-blue-900/20 border border-blue-800 p-4">
                            <div className="font-semibold text-blue-300 mb-1">{phase.phase}</div>
                            <div className="text-sm text-blue-200 mb-1">{phase.action}</div>
                            <div className="text-xs text-blue-300">Milestone: {phase.outcome}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                This plan recommends NEW improvements and does not claim the existing patent is safe to copy or use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
