"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

// Mock patent data
const MOCK_PATENT_DATA: Record<
  string,
  {
    title: string;
    patentNumber: string;
    grantDate: string;
    assignee: string;
    status: string;
    abstract: string;
    claims: number;
    hasReport: boolean;
    report?: {
      summary: string;
      modernization: string[];
      ventures: string[];
      newPatents: string[];
      risks: string[];
    };
  }
> = {
  US6026163: {
    title: "Cryptographic system and method for electronic transactions",
    patentNumber: "US6026163",
    grantDate: "1998-02-15",
    assignee: "DigiCash Inc",
    status: "Expired",
    abstract:
      "A system for secure electronic payment transactions using blind signature protocols and anonymous digital cash.",
    claims: 24,
    hasReport: true,
    report: {
      summary:
        "This patent describes an early digital cash system using cryptographic blind signatures. While groundbreaking for its time, the technology is now dated compared to modern blockchain and zero-knowledge proof systems.",
      modernization: [
        "Replace blind signatures with zero-knowledge proofs (zk-SNARKs)",
        "Implement on Ethereum or Solana for decentralization",
        "Add smart contract programmability for complex transactions",
        "Integrate with modern wallets (MetaMask, WalletConnect)",
        "Use IPFS for decentralized transaction history",
        "Add multi-signature and time-lock capabilities",
      ],
      ventures: [
        "Privacy-focused DeFi protocol for anonymous transactions",
        "Enterprise blockchain payment rail for B2B settlements",
        "Decentralized identity system with anonymous credentials",
        "Privacy layer for existing blockchain ecosystems",
        "Anonymous voting system for DAOs and governance",
      ],
      newPatents: [
        "Zero-knowledge transaction batching for improved privacy",
        "Hybrid on-chain/off-chain settlement protocol",
        "AI-based fraud detection for anonymous transactions",
        "Cross-chain privacy bridge architecture",
        "Quantum-resistant anonymous credential system",
      ],
      risks: [
        "Regulatory scrutiny around privacy and anonymity features",
        "Competition from established privacy coins (Monero, Zcash)",
        "Smart contract security vulnerabilities",
        "Scalability challenges with zero-knowledge proofs",
        "User experience complexity for mainstream adoption",
      ],
    },
  },
  demo: {
    title: "Example Patent for Demonstration",
    patentNumber: "US1234567",
    grantDate: "1999-01-01",
    assignee: "Demo Corp",
    status: "Expired",
    abstract:
      "An example patent demonstrating the PatentBoom patent detail view.",
    claims: 10,
    hasReport: true,
    report: {
      summary:
        "This is a demonstration patent showing how PatentBoom analyzes opportunities.",
      modernization: [
        "Apply modern AI and machine learning",
        "Leverage cloud infrastructure and APIs",
        "Add mobile-first user experience",
        "Integrate blockchain for transparency",
      ],
      ventures: [
        "SaaS platform targeting enterprise customers",
        "Consumer mobile app with freemium model",
        "API-first developer tool with usage-based pricing",
      ],
      newPatents: [
        "AI-enhanced method for improved accuracy",
        "Distributed architecture for scalability",
        "Novel user interface patterns",
      ],
      risks: [
        "Market competition from existing solutions",
        "Technical complexity and development cost",
        "Regulatory compliance requirements",
      ],
    },
  },
};

export default function PatentDetailPage() {
  const params = useParams();
  const patentId = params.id as string;
  const [isSaved, setIsSaved] = useState(false);

  const patent = MOCK_PATENT_DATA[patentId];

  if (!patent) {
    return (
      <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))] bg-black">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <h1 className="text-2xl font-bold text-white">Patent Not Found</h1>
            <p className="mt-2 text-zinc-400">
              The patent you&apos;re looking for doesn&apos;t exist or
              hasn&apos;t been analyzed yet.
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
          href="/results"
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
          Back to Results
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
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                  {patent.status}
                </span>
                <span className="text-sm text-zinc-400">
                  {patent.patentNumber}
                </span>
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
            <div>
              <div className="text-sm text-zinc-400">Grant Date</div>
              <div className="mt-1 font-medium text-white">
                {patent.grantDate}
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Assignee</div>
              <div className="mt-1 font-medium text-white">
                {patent.assignee}
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Claims</div>
              <div className="mt-1 font-medium text-white">{patent.claims}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium text-zinc-400">Abstract</div>
            <p className="mt-2 text-zinc-300">{patent.abstract}</p>
          </div>
        </div>

        {/* AI Opportunity Report */}
        {patent.hasReport && patent.report ? (
          <div className="mt-6 space-y-6">
            {/* Original Invention Summary */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-3 text-xl font-bold text-white">
                Original Invention Summary
              </h2>
              <p className="text-zinc-300">{patent.report.summary}</p>
            </div>

            {/* AI Opportunity Report Header */}
            <div className="rounded-xl border border-blue-900/50 bg-gradient-to-r from-blue-950/50 to-purple-950/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <svg
                    className="h-6 w-6 text-white"
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
                <div>
                  <h2 className="text-xl font-bold text-white">
                    AI Opportunity Report
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Generated modernization analysis and venture concepts
                  </p>
                </div>
              </div>
            </div>

            {/* Modernization Angles */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">
                Modernization Angles
              </h2>
              <ul className="space-y-2">
                {patent.report.modernization.map((item, idx) => (
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
              <div className="space-y-3">
                {patent.report.ventures.map((venture, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="text-zinc-300">{venture}</span>
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
                {patent.report.newPatents.map((item, idx) => (
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
              <ul className="space-y-2">
                {patent.report.risks.map((risk, idx) => (
                  <li key={idx} className="flex gap-3">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-orange-300">{risk}</span>
                  </li>
                ))}
              </ul>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">
              No AI Report Available
            </h2>
            <p className="mt-2 text-zinc-400">
              Generate an AI opportunity report after selecting a patent from
              search results.
            </p>
            <Link
              href="/search"
              className="mt-6 inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Search Patents
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
