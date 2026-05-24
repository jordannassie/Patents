"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";

// Type definitions
interface PatentResult {
  id: string;
  patent_number: string;
  title: string;
  abstract: string;
  grant_date: string | null;
  assignee: string | null;
  status_estimate: string;
  is_demo: boolean;
}

interface OpportunityReport {
  id: string;
  opportunity_score: number;
  recommendation: string;
  summary: string;
}

interface SearchData {
  query: string;
  market: string | null;
  result_count: number;
  source: string;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const searchId = searchParams.get("searchId");
  const [results, setResults] = useState<PatentResult[]>([]);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedPatents, setSavedPatents] = useState<string[]>([]);
  const [analyzingPatent, setAnalyzingPatent] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, OpportunityReport>>({});

  useEffect(() => {
    if (!searchId) {
      setError("No search ID provided");
      setLoading(false);
      return;
    }

    async function fetchResults() {
      try {
        const response = await fetch(
          `/api/patents/results?searchId=${searchId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }

        const data = await response.json();
        setSearchData(data.search);
        setResults(data.results);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [searchId]);

  const toggleSave = (patentId: string) => {
    setSavedPatents((prev) =>
      prev.includes(patentId)
        ? prev.filter((id) => id !== patentId)
        : [...prev, patentId]
    );
  };

  const handleAnalyze = async (patentResultId: string) => {
    setAnalyzingPatent(patentResultId);

    try {
      const response = await fetch("/api/patents/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patentResultId,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      
      // Store the report
      setReports((prev) => ({
        ...prev,
        [patentResultId]: data.report,
      }));
    } catch (err) {
      console.error("Error analyzing patent:", err);
      alert("Analysis failed. Please try again.");
    } finally {
      setAnalyzingPatent(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))] bg-black">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-32">
            <div className="flex items-center gap-3">
              <svg
                className="h-8 w-8 animate-spin text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-lg text-white">Loading results...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !searchData) {
    return (
      <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))] bg-black">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <h1 className="text-2xl font-bold text-white">Error</h1>
            <p className="mt-2 text-zinc-400">
              {error || "Failed to load search results"}
            </p>
            <Link
              href="/search"
              className="mt-6 inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))] bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Search
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">
            Search Results
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
            <span>Query: &quot;{searchData.query}&quot;</span>
            {searchData.market && (
              <>
                <span>•</span>
                <span>Category: {searchData.market}</span>
              </>
            )}
            <span>•</span>
            <span>{results.length} opportunities found</span>
          </div>
        </div>

        {/* Demo Data Warning */}
        {results.some((r) => r.is_demo) && (
          <div className="mb-6 rounded-lg border border-orange-800 bg-orange-950/20 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-300">
                  Demo Data Notice
                </p>
                <p className="mt-1 text-sm text-orange-400">
                  Patent APIs are currently unavailable. Showing demo results
                  for demonstration purposes. Configure PATENTSVIEW_API_KEY or
                  USPTO_API_KEY for live data.
                </p>
                <p className="mt-3 text-xs text-orange-400/80">
                  <span className="font-mono">Live provider attempted: {searchData?.source || 'unknown'}</span>
                  <br />
                  To debug API issues, check{" "}
                  <Link 
                    href="/api/debug/patent-provider" 
                    target="_blank"
                    className="underline hover:text-orange-300"
                  >
                    /api/debug/patent-provider
                  </Link>
                  {" "}or view Netlify function logs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {results.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <h2 className="text-xl font-bold text-white">No Results Found</h2>
            <p className="mt-2 text-zinc-400">
              Try a different search query or category.
            </p>
            <Link
              href="/search"
              className="mt-6 inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              New Search
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((patent) => (
              <div
                key={patent.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    {/* Title and Status */}
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-white">
                        {patent.title}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          patent.status_estimate.includes("Expired")
                            ? "bg-red-500/10 text-red-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {patent.status_estimate}
                      </span>
                      {patent.is_demo && (
                        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                          Demo Data
                        </span>
                      )}
                    </div>

                    {/* Patent Info */}
                    <div className="mb-3 flex flex-wrap gap-4 text-sm text-zinc-400">
                      <span>Patent: {patent.patent_number}</span>
                      {patent.grant_date && (
                        <>
                          <span>•</span>
                          <span>Granted: {patent.grant_date}</span>
                        </>
                      )}
                      {patent.assignee && (
                        <>
                          <span>•</span>
                          <span>Assignee: {patent.assignee}</span>
                        </>
                      )}
                    </div>

                    {/* Abstract */}
                    <p className="mb-4 text-sm text-zinc-300">
                      {patent.abstract}
                    </p>

                    {/* AI Report Summary (if analyzed) */}
                    {reports[patent.id] && (
                      <div className="mt-4 rounded-lg border border-blue-900/50 bg-blue-950/20 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl font-bold text-white">
                              {reports[patent.id].opportunity_score}
                              <span className="text-sm font-normal text-zinc-400">
                                /100
                              </span>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                reports[patent.id].recommendation ===
                                "BUILD NOW"
                                  ? "bg-green-500/20 text-green-400"
                                  : reports[patent.id].recommendation ===
                                    "STRONG WATCH"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : reports[patent.id].recommendation ===
                                    "RESEARCH MORE"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {reports[patent.id].recommendation}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-blue-300">
                          {reports[patent.id].summary}
                        </p>
                        <Link
                          href={`/patents/${patent.patent_number}`}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300"
                        >
                          View Full Report
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {!reports[patent.id] ? (
                    <button
                      onClick={() => handleAnalyze(patent.id)}
                      disabled={analyzingPatent === patent.id}
                      className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {analyzingPatent === patent.id ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          AI is ranking this opportunity...
                        </span>
                      ) : (
                        "Analyze with AI"
                      )}
                    </button>
                  ) : (
                    <Link
                      href={`/patents/${patent.patent_number}`}
                      className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      View Full Report
                    </Link>
                  )}
                  <Link
                    href={`/patents/${patent.patent_number}`}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => toggleSave(patent.id)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      savedPatents.includes(patent.id)
                        ? "border-green-600 bg-green-900/20 text-green-400 hover:bg-green-900/30"
                        : "border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                    }`}
                  >
                    {savedPatents.includes(patent.id) ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                        Saved
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        Save
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-center text-sm text-zinc-400">
            <strong className="text-zinc-300">Note:</strong> Patent status and
            expiration estimates are informational only. Attorney review is
            required before relying on any patent status, commercialization
            strategy, or new patent filing.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))] bg-black">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-32">
              <div className="flex items-center gap-3">
                <svg
                  className="h-8 w-8 animate-spin text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-lg text-white">Loading results...</span>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
