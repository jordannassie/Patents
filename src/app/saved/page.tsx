'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import CopyForGPTButton from "@/components/CopyForGPTButton";
import { formatOpportunityForGPT } from "@/lib/patents/formatOpportunityForGPT";

interface HunterOpportunity {
  id: string;
  patent_result_id: string;
  title: string;
  category: string;
  opportunity_score: number | null;
  pre_ai_score: number;
  recommendation: string | null;
  bottleneck_reason: string;
  reason_saved: string | null;
  report_id: string | null;
  has_concept: boolean;
  concept_title: string | null;
  concept_score: number | null;
  has_plan?: boolean;
  plan?: any;
  created_at: string;
}

export default function SavedPage() {
  const [hunterOpps, setHunterOpps] = useState<HunterOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHunterOpportunities();
  }, []);

  const fetchHunterOpportunities = async () => {
    try {
      const response = await fetch('/api/hunter/opportunities?limit=50');
      if (response.ok) {
        const data = await response.json();
        setHunterOpps(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load Hunter opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))] bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white">Saved Opportunities</h1>
        <p className="mt-2 text-zinc-400">
          Your pipeline of patent opportunities and venture ideas
        </p>

        {/* Info Banner */}
        <div className="mt-6 rounded-lg border border-indigo-800 bg-indigo-900/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-indigo-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-indigo-300">
                Saved includes manually saved patents and top Hunter opportunities automatically saved after AI analysis.
                Visit the{' '}
                <Link href="/hunter" className="font-medium underline hover:text-indigo-200">
                  Hunter dashboard
                </Link>
                {' '}to see live automation status.
              </p>
            </div>
          </div>
        </div>

        {/* Hunter-Saved Opportunities */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Hunter-Saved Opportunities
            </h2>
            <Link
              href="/hunter/runs"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              View All Runs →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : hunterOpps.length > 0 ? (
            <div className="space-y-4">
              {hunterOpps.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {opp.title}
                        </h3>
                        {opp.report_id ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-900/50 text-green-400 rounded">
                            AI Report Ready
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-900/50 text-blue-400 rounded">
                            Pre-AI Candidate
                          </span>
                        )}
                        {opp.has_concept && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-900/50 text-purple-400 rounded">
                            $1B Concept Ready
                          </span>
                        )}
                        {opp.has_plan && (
                          <span className="px-2 py-1 text-xs font-medium bg-indigo-900/50 text-indigo-400 rounded">
                            Plan Ready
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                          {opp.category}
                        </span>
                        {opp.recommendation && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            opp.recommendation === 'BUILD NOW' ? 'bg-green-900/50 text-green-400' :
                            opp.recommendation === 'STRONG WATCH' ? 'bg-blue-900/50 text-blue-400' :
                            'bg-yellow-900/50 text-yellow-400'
                          }`}>
                            {opp.recommendation}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-indigo-300">{opp.bottleneck_reason}</p>
                      {opp.reason_saved && (
                        <p className="text-xs text-gray-500 mt-1">{opp.reason_saved}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-400">
                          {opp.opportunity_score || opp.pre_ai_score}
                        </div>
                        <div className="text-xs text-gray-500">
                          {opp.opportunity_score ? 'AI Score' : 'Pre-AI'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Saved {new Date(opp.created_at).toLocaleDateString()}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-zinc-800">
                    <Link
                      href={`/patents/${opp.patent_result_id}`}
                      className="flex-1 text-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Open Plan
                    </Link>
                    {opp.has_plan && opp.plan ? (
                      <CopyForGPTButton
                        text={formatOpportunityForGPT(opp.plan)}
                        label="Copy for GPT"
                        variant="small"
                      />
                    ) : (
                      <div className="px-3 py-1.5 text-xs text-zinc-500 bg-zinc-800 border border-zinc-700 rounded-lg">
                        Plan generating...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-white">
                No Hunter opportunities yet
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                The Hunter Engine has not saved any high-scoring AI-ready opportunities yet.
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Start or continue a Hunter run to discover patent-backed venture ideas.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href="/hunter"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Open Hunter Engine
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Manually Saved Opportunities - Empty for now */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Manually Saved Opportunities
          </h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-white">
              No manually saved patents yet
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Use Manual Search to find patents and save them to your pipeline.
            </p>
            <div className="mt-6">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-700"
              >
                Manual Search
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
