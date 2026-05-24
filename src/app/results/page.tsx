"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, Suspense } from "react";

// Mock data for demonstration
const MOCK_RESULTS = [
  {
    id: "US6026163",
    title: "Cryptographic system and method for electronic transactions",
    patentNumber: "US6026163",
    grantDate: "1998-02-15",
    assignee: "DigiCash Inc",
    status: "Expired",
    abstract:
      "A system for secure electronic payment transactions using blind signature protocols and anonymous digital cash.",
    opportunityScore: 87,
    recommendation:
      "Strong opportunity for blockchain-based modernization with zero-knowledge proofs",
  },
  {
    id: "US5913210",
    title: "Voice recognition system with user verification",
    patentNumber: "US5913210",
    grantDate: "1997-06-22",
    assignee: "VoiceTech Systems",
    status: "Expired",
    abstract:
      "System for authenticating users through voice biometric analysis and speaker identification.",
    opportunityScore: 82,
    recommendation:
      "Modernize with neural network voice models and multi-factor biometrics",
  },
  {
    id: "US5859971",
    title: "Autonomous vehicle navigation and control",
    patentNumber: "US5859971",
    grantDate: "1996-01-12",
    assignee: "AutoNav Corp",
    status: "Expired",
    abstract:
      "Method for autonomous vehicle navigation using GPS and sensor fusion for obstacle detection.",
    opportunityScore: 91,
    recommendation:
      "Upgrade with computer vision, LiDAR, and AI-based decision-making",
  },
];

function ResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const [savedPatents, setSavedPatents] = useState<string[]>([]);

  const toggleSave = (patentId: string) => {
    setSavedPatents((prev) =>
      prev.includes(patentId)
        ? prev.filter((id) => id !== patentId)
        : [...prev, patentId]
    );
  };

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
            <span>Query: &quot;{query}&quot;</span>
            {category && (
              <>
                <span>•</span>
                <span>Category: {category}</span>
              </>
            )}
            <span>•</span>
            <span>{MOCK_RESULTS.length} opportunities found</span>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6">
          {MOCK_RESULTS.map((patent) => (
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
                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                      {patent.status}
                    </span>
                  </div>

                  {/* Patent Info */}
                  <div className="mb-3 flex flex-wrap gap-4 text-sm text-zinc-400">
                    <span>Patent: {patent.patentNumber}</span>
                    <span>•</span>
                    <span>Granted: {patent.grantDate}</span>
                    <span>•</span>
                    <span>Assignee: {patent.assignee}</span>
                  </div>

                  {/* Abstract */}
                  <p className="mb-4 text-sm text-zinc-300">
                    {patent.abstract}
                  </p>

                  {/* Opportunity Info */}
                  {patent.opportunityScore && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-400">
                        Opportunity Score:
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-zinc-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                            style={{ width: `${patent.opportunityScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {patent.opportunityScore}/100
                        </span>
                      </div>
                    </div>
                  )}

                  {patent.recommendation && (
                    <div className="rounded-lg border border-blue-900/50 bg-blue-950/20 p-3">
                      <p className="text-sm text-blue-300">
                        <span className="font-semibold">
                          AI Recommendation:
                        </span>{" "}
                        {patent.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/patents/${patent.id}`}
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Analyze with AI
                </Link>
                <Link
                  href={`/patents/${patent.id}`}
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
