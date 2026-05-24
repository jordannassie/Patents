"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

interface PatentData {
  id: string;
  patent_number: string;
  title: string;
  abstract: string;
  filing_date: string | null;
  grant_date: string | null;
  assignee: string | null;
  inventors: string | null;
  cpc_codes: string | null;
  status_estimate: string;
  source_url: string | null;
  source: string | null;
  is_demo: boolean;
  raw_json?: any;
}

interface OpportunityReport {
  id: string;
  opportunity_score: number;
  future_market_score: number;
  ai_upgrade_score: number;
  patentability_score: number;
  buildability_score: number;
  revenue_score: number;
  strategic_fit_score: number;
  summary: string;
  modernization_angles: string[];
  venture_concepts: Array<{
    name: string;
    description: string;
    target_customer: string;
    business_model: string;
  }>;
  new_patent_directions: string[];
  risks: string;
  recommendation: string;
  created_at: string;
}

export default function PatentDetailPage() {
  const params = useParams();
  const patentId = params.id as string;
  
  const [patent, setPatent] = useState<PatentData | null>(null);
  const [report, setReport] = useState<OpportunityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadPatentAndReport() {
      try {
        // Primary: Load patent by UUID (patent_results.id)
        let patentResponse = await fetch(
          `/api/patents/by-id?id=${encodeURIComponent(patentId)}`
        );

        // Fallback: Try loading by patent number if UUID lookup fails
        if (!patentResponse.ok) {
          console.log('UUID lookup failed, trying patent number fallback');
          patentResponse = await fetch(
            `/api/patents/by-number?number=${encodeURIComponent(patentId)}`
          );
        }

        if (!patentResponse.ok) {
          throw new Error("Patent result not found");
        }

        const patentData = await patentResponse.json();
        setPatent(patentData.patent);

        // Load report if it exists
        if (patentData.report) {
          setReport(patentData.report);
        }
      } catch (err) {
        console.error("Error loading patent:", err);
        setError("Patent result not found. Go back to search results.");
      } finally {
        setLoading(false);
      }
    }

    if (patentId) {
      loadPatentAndReport();
    }
  }, [patentId]);

  const handleGenerateReport = async () => {
    if (!patent) return;

    setGenerating(true);

    try {
      const response = await fetch("/api/patents/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patentResultId: patent.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setReport(data.report);
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))] bg-black">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
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
              <span className="text-lg text-white">Loading patent...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patent) {
    return (
      <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))] bg-black">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <h1 className="text-2xl font-bold text-white">Patent Not Found</h1>
            <p className="mt-2 text-zinc-400">
              {error || "The patent you're looking for doesn't exist or hasn't been analyzed yet."}
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
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
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

        {/* Patent Overview */}
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white">
                  {patent.title}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    patent.status_estimate.includes("Expired")
                      ? "bg-red-500/10 text-red-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {patent.status_estimate}
                </span>
                <span className="text-sm text-zinc-400">
                  {patent.patent_number === "Unknown" && patent.raw_json?.applicationMetaData?.applicationNumberText
                    ? `Application: ${patent.raw_json.applicationMetaData.applicationNumberText}`
                    : patent.patent_number !== "Unknown" 
                    ? `Patent: ${patent.patent_number}`
                    : "Patent Number: Unknown"}
                </span>
                {patent.is_demo && (
                  <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                    Demo Data
                  </span>
                )}
                {patent.source && (
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                    Source: {patent.source}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                isSaved
                  ? "border-green-600 bg-green-900/20 text-green-400 hover:bg-green-900/30"
                  : "border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {isSaved ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
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

          <div className="grid gap-4 sm:grid-cols-3">
            {patent.filing_date && (
              <div>
                <div className="text-sm text-zinc-400">Filing Date</div>
                <div className="mt-1 font-medium text-white">
                  {patent.filing_date}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-zinc-400">Grant Date</div>
              <div className="mt-1 font-medium text-white">
                {patent.grant_date || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Assignee</div>
              <div className="mt-1 font-medium text-white">
                {patent.assignee || "N/A"}
              </div>
            </div>
            {patent.inventors && (
              <div>
                <div className="text-sm text-zinc-400">Inventors</div>
                <div className="mt-1 font-medium text-white">
                  {patent.inventors}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-zinc-400">CPC Codes</div>
              <div className="mt-1 font-medium text-white">
                {patent.cpc_codes || "N/A"}
              </div>
            </div>
            {patent.source_url && (
              <div>
                <div className="text-sm text-zinc-400">Source</div>
                <div className="mt-1">
                  <a 
                    href={patent.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-400 hover:text-blue-300 underline"
                  >
                    View on USPTO
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium text-zinc-400">Abstract</div>
            <p className="mt-2 text-zinc-300">{patent.abstract}</p>
          </div>
        </div>

        {/* AI Opportunity Report or Generate Button */}
        {report ? (
          <div className="mt-6 space-y-6">
            {/* Opportunity Score Header */}
            <div className="rounded-xl border border-blue-900/50 bg-gradient-to-r from-blue-950/50 to-purple-950/50 p-8">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {report.opportunity_score}
                    </div>
                    <div className="text-xs text-blue-100">/ 100</div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                    <h2 className="text-2xl font-bold text-white">
                      AI Opportunity Report
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        report.recommendation === "BUILD NOW"
                          ? "bg-green-500/20 text-green-400"
                          : report.recommendation === "STRONG WATCH"
                          ? "bg-blue-500/20 text-blue-400"
                          : report.recommendation === "RESEARCH MORE"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {report.recommendation}
                    </span>
                  </div>
                  <p className="text-zinc-300">{report.summary}</p>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="text-sm text-zinc-400">Future Market</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {report.future_market_score}
                  <span className="text-sm font-normal text-zinc-400">/100</span>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="text-sm text-zinc-400">AI Upgrade</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {report.ai_upgrade_score}
                  <span className="text-sm font-normal text-zinc-400">/100</span>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="text-sm text-zinc-400">Patentability</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {report.patentability_score}
                  <span className="text-sm font-normal text-zinc-400">/100</span>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="text-sm text-zinc-400">Buildability</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {report.buildability_score}
                  <span className="text-sm font-normal text-zinc-400">/100</span>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="text-sm text-zinc-400">Revenue</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {report.revenue_score}
                  <span className="text-sm font-normal text-zinc-400">/100</span>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="text-sm text-zinc-400">Strategic Fit</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {report.strategic_fit_score}
                  <span className="text-sm font-normal text-zinc-400">/100</span>
                </div>
              </div>
            </div>

            {/* Modernization Angles */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">
                Modernization Angles
              </h2>
              <ul className="space-y-2">
                {report.modernization_angles.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    <span className="text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Venture Concepts */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">
                Venture Concepts
              </h2>
              <div className="space-y-4">
                {report.venture_concepts.map((venture, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
                  >
                    <div className="mb-2 flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {venture.name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-300">
                          {venture.description}
                        </p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div>
                            <span className="text-xs text-zinc-500">Target:</span>
                            <span className="ml-1 text-xs text-zinc-400">
                              {venture.target_customer}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-zinc-500">Model:</span>
                            <span className="ml-1 text-xs text-zinc-400">
                              {venture.business_model}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Possible New Patent Directions */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">
                Possible New Patent Directions
              </h2>
              <ul className="space-y-2">
                {report.new_patent_directions.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500" />
                    <span className="text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks / Attorney Review Required */}
            <div className="rounded-xl border border-orange-900/50 bg-orange-950/20 p-6">
              <h2 className="mb-4 text-xl font-bold text-orange-400">
                Risks / Attorney Review Required
              </h2>
              <p className="text-orange-300 whitespace-pre-line">{report.risks}</p>
              <div className="mt-4 rounded-lg border border-orange-800 bg-orange-900/20 p-4">
                <p className="text-sm text-orange-300">
                  <strong>Legal Disclaimer:</strong> Patent status and
                  expiration estimates are informational only. Attorney review
                  is required before relying on any patent status,
                  commercialization strategy, or new patent filing.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              <svg
                className="h-8 w-8 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">
              No AI Report Available
            </h2>
            <p className="mt-2 text-zinc-400">
              Generate an AI opportunity report to see modernization ideas and venture concepts.
            </p>
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="mt-6 inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
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
                  Generating Report...
                </span>
              ) : (
                "Generate AI Opportunity Report"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Legal Disclaimer */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-yellow-800 bg-yellow-900/20 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-yellow-400 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-300 mb-2">
                Legal Disclaimer
              </h3>
              <p className="text-sm text-yellow-200/90 mb-2">
                Patent status and expiration estimates are informational only. 
                Attorney review is required before relying on any patent status, 
                commercialization strategy, or new patent filing.
              </p>
              <p className="text-sm text-yellow-200/90">
                This report is not legal advice. Patentability, freedom to operate, 
                infringement risk, and patent status require review by a qualified patent attorney.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
