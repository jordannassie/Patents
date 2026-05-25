"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { formatPatentIdeaSummary } from "@/lib/patents/formatPatentIdeaForCopy";

interface PatentCreationPlan {
  id: string;
  source_title: string;
  source_summary: string;
  future_bottleneck: string;
  recommended_patent_title: string;
  recommended_patent_summary: string;
  why_this_is_best: string;
  target_buyers: Array<{
    buyer: string;
    why_they_need_it: string;
  }>;
  score: number;
  priority: string;
  created_at: string;
}

export default function PatentPlansPage() {
  const [plans, setPlans] = useState<PatentCreationPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    async function loadPlans() {
      try {
        // For now, we'll load from saved opportunities that might have plans
        // In production, you'd have a dedicated endpoint like /api/patent-plans
        const response = await fetch("/api/hunter/opportunities");
        if (!response.ok) throw new Error("Failed to load plans");
        
        const data = await response.json();
        // This is a placeholder - you'll need to update this to actually load creation plans
        setPlans([]);
      } catch (err) {
        console.error("Error loading plans:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

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

  const filterPlans = (plans: PatentCreationPlan[]) => {
    if (activeTab === "all") return plans;
    if (activeTab === "best") return plans.filter(p => p.priority === "BEST_TO_FILE");
    if (activeTab === "top") return plans.filter(p => p.priority === "TOP_TARGET");
    if (activeTab === "strong") return plans.filter(p => p.priority === "STRONG");
    if (activeTab === "watch") return plans.filter(p => p.priority === "WATCH");
    return plans;
  };

  const filteredPlans = filterPlans(plans);

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Patent Plans</h1>
          <p className="text-xl text-zinc-400">
            Best patents to create, ranked by score
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            }`}
          >
            All Plans
          </button>
          <button
            onClick={() => setActiveTab("best")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "best"
                ? "border-red-500 text-red-400"
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            }`}
          >
            Best to File
          </button>
          <button
            onClick={() => setActiveTab("top")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "top"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            }`}
          >
            Top Targets
          </button>
          <button
            onClick={() => setActiveTab("strong")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "strong"
                ? "border-yellow-500 text-yellow-400"
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            }`}
          >
            Strong
          </button>
          <button
            onClick={() => setActiveTab("watch")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "watch"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            }`}
          >
            Watchlist
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-zinc-400">Loading patent plans...</p>
            </div>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">No Patent Plans Yet</h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-6">
              PatentBoom is still generating patent creation plans. Open a saved opportunity or wait for the next automated Hunter run.
            </p>
            <Link
              href="/hunter"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              View Hunter
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map((plan, idx) => (
              <div
                key={plan.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                {/* Rank and Score */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                      {idx + 1}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{plan.score}</div>
                        <div className="text-xs text-zinc-400">/ 100</div>
                      </div>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold border ${getPriorityColor(plan.priority)}`}>
                    {getPriorityLabel(plan.priority)}
                  </span>
                </div>

                {/* Patent Title */}
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                  {plan.recommended_patent_title}
                </h3>

                {/* Why Big */}
                <div className="mb-3">
                  <div className="text-xs text-zinc-500 mb-1">Why Big</div>
                  <p className="text-sm text-zinc-300 line-clamp-2">{plan.why_this_is_best}</p>
                </div>

                {/* Who Buys */}
                {plan.target_buyers && plan.target_buyers.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-zinc-500 mb-1">Who Buys</div>
                    <div className="flex flex-wrap gap-1">
                      {plan.target_buyers.slice(0, 2).map((buyer, bidx) => (
                        <span key={bidx} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                          {buyer.buyer}
                        </span>
                      ))}
                      {plan.target_buyers.length > 2 && (
                        <span className="text-xs text-zinc-500">+{plan.target_buyers.length - 2} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Future Bottleneck */}
                <div className="mb-4">
                  <div className="text-xs text-zinc-500 mb-1">Future Bottleneck</div>
                  <p className="text-sm text-zinc-400 line-clamp-2">{plan.future_bottleneck}</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-2">
                  <Link
                    href={`/patent-plans/${plan.id}`}
                    className="flex-1 text-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Open Plan
                  </Link>
                  <div onClick={(e) => e.stopPropagation()}>
                    <CopyButton
                      text={formatPatentIdeaSummary(plan as any)}
                      label="Copy"
                      variant="small"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
