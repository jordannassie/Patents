"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import CopyForGPTButton from "@/components/CopyForGPTButton";
import { formatFullDraftForCopy, formatClaimsOnly } from "@/lib/patents/formatPatentIdeaForCopy";
import { formatDraftForGPT } from "@/lib/patents/formatOpportunityForGPT";

interface PatentFullDraft {
  id: string;
  draft_title: string;
  field_of_invention: string;
  background: string;
  problem_statement: string;
  summary_of_invention: string;
  system_overview: string;
  technical_architecture: Array<{
    component: string;
    description: string;
    function: string;
  }>;
  method_flow: Array<{
    step_number: number;
    step_title: string;
    description: string;
  }>;
  detailed_description: string;
  example_embodiments: Array<{
    embodiment: string;
    description: string;
  }>;
  alternative_embodiments: Array<{
    variation: string;
    description: string;
  }>;
  use_cases: Array<{
    use_case: string;
    description: string;
  }>;
  claim_set: Array<{
    claim_number: number;
    claim_type: string;
    claim_text: string;
  }>;
  abstract: string;
  drawing_descriptions: Array<{
    figure: string;
    description: string;
  }>;
  attorney_review_notes: string;
  filing_notes: string;
}

export default function PatentDraftDetailPage() {
  const params = useParams();
  const draftId = params.id as string;
  
  const [draft, setDraft] = useState<PatentFullDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDraft() {
      try {
        // Placeholder - will need API endpoint
        throw new Error("Draft not found");
      } catch (err) {
        console.error("Error loading draft:", err);
        setError("Draft not found");
      } finally {
        setLoading(false);
      }
    }

    if (draftId) {
      loadDraft();
    }
  }, [draftId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading patent draft...</p>
        </div>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Draft Not Found</h1>
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
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
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

        {/* Header */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 mb-6">
          <h1 className="text-3xl font-bold text-white mb-3">Full Patent Draft</h1>
          <p className="text-zinc-400">Structured patent draft package for attorney review</p>
        </div>

        {/* Legal Disclaimer - Prominent */}
        <div className="mb-6 rounded-xl border-2 border-yellow-800 bg-yellow-900/20 p-6">
          <div className="flex items-start gap-3">
            <svg className="h-8 w-8 flex-shrink-0 text-yellow-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-300 mb-2">Not Legal Advice - Attorney Review Required</h3>
              <p className="text-sm text-yellow-200/90">
                This draft is not legal advice and is not ready to file without review by a qualified patent attorney. 
                Patentability, freedom to operate, claim scope, prior art, and filing strategy must all be reviewed and refined by counsel before filing.
              </p>
            </div>
          </div>
        </div>

        {/* Copy Buttons */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Export Patent Draft</h2>
          <div className="flex flex-wrap gap-3">
            <CopyForGPTButton
              text={formatDraftForGPT(draft)}
              label="Copy Draft for GPT"
              variant="primary"
            />
            <CopyButton
              text={formatFullDraftForCopy(draft)}
              label="Copy Full Draft"
              variant="secondary"
            />
            <CopyButton
              text={formatClaimsOnly(draft)}
              label="Copy Claims Only"
              variant="secondary"
            />
          </div>
        </div>

        {/* Draft Title */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm text-zinc-500 mb-2">Draft Title</h2>
          <h3 className="text-2xl font-bold text-white">{draft.draft_title}</h3>
        </div>

        {/* Abstract */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Abstract</h2>
          <p className="text-zinc-300 leading-relaxed">{draft.abstract}</p>
        </div>

        {/* Field of the Invention */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Field of the Invention</h2>
          <p className="text-zinc-300 leading-relaxed">{draft.field_of_invention}</p>
        </div>

        {/* Background */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Background</h2>
          <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{draft.background}</div>
        </div>

        {/* Problem Statement */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Problem Statement</h2>
          <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{draft.problem_statement}</div>
        </div>

        {/* Summary of the Invention */}
        <div className="mb-6 rounded-xl border border-blue-800 bg-blue-950/50 p-6">
          <h2 className="text-xl font-bold text-blue-300 mb-4">Summary of the Invention</h2>
          <div className="text-blue-100 leading-relaxed whitespace-pre-wrap">{draft.summary_of_invention}</div>
        </div>

        {/* System Overview */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">System Overview</h2>
          <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{draft.system_overview}</div>
        </div>

        {/* Technical Architecture */}
        {draft.technical_architecture && draft.technical_architecture.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Technical Architecture</h2>
            <div className="space-y-4">
              {draft.technical_architecture.map((item, idx) => (
                <div key={idx} className="border-l-2 border-indigo-600 pl-4">
                  <h3 className="font-semibold text-indigo-300 mb-1">{item.component}</h3>
                  <p className="text-sm text-zinc-300 mb-2">{item.description}</p>
                  <p className="text-xs text-zinc-400">{item.function}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Method Flow */}
        {draft.method_flow && draft.method_flow.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Method Flow</h2>
            <div className="space-y-4">
              {draft.method_flow.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                    {step.step_number}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-300 mb-1">{step.step_title}</h3>
                    <p className="text-sm text-zinc-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Description */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Detailed Description</h2>
          <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{draft.detailed_description}</div>
        </div>

        {/* Example Embodiments */}
        {draft.example_embodiments && draft.example_embodiments.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Example Embodiments</h2>
            <div className="space-y-4">
              {draft.example_embodiments.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                  <h3 className="font-semibold text-emerald-300 mb-2">{item.embodiment}</h3>
                  <p className="text-sm text-zinc-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alternative Embodiments */}
        {draft.alternative_embodiments && draft.alternative_embodiments.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Alternative Embodiments</h2>
            <div className="space-y-4">
              {draft.alternative_embodiments.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                  <h3 className="font-semibold text-cyan-300 mb-2">{item.variation}</h3>
                  <p className="text-sm text-zinc-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Use Cases */}
        {draft.use_cases && draft.use_cases.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Use Cases</h2>
            <div className="space-y-4">
              {draft.use_cases.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                  <h3 className="font-semibold text-green-300 mb-2">{item.use_case}</h3>
                  <p className="text-sm text-zinc-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claim Set */}
        {draft.claim_set && draft.claim_set.length > 0 && (
          <div className="mb-6 rounded-xl border-2 border-purple-800 bg-purple-950/50 p-6">
            <h2 className="text-xl font-bold text-purple-300 mb-4">Claim Set</h2>
            <div className="space-y-4">
              {draft.claim_set.map((claim, idx) => (
                <div key={idx} className={`rounded-lg border p-4 ${
                  claim.claim_type === "independent" 
                    ? "border-purple-700 bg-purple-900/20" 
                    : "border-purple-800 bg-purple-900/10"
                }`}>
                  <div className="flex items-start gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      claim.claim_type === "independent"
                        ? "bg-purple-600 text-white"
                        : "bg-purple-800 text-purple-200"
                    }`}>
                      Claim {claim.claim_number}
                    </span>
                    <span className="text-xs text-purple-400 uppercase">{claim.claim_type}</span>
                  </div>
                  <p className="text-sm text-purple-100 leading-relaxed">{claim.claim_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drawing Descriptions */}
        {draft.drawing_descriptions && draft.drawing_descriptions.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Drawing Descriptions</h2>
            <div className="space-y-3">
              {draft.drawing_descriptions.map((item, idx) => (
                <div key={idx} className="border-l-2 border-blue-600 pl-4">
                  <h3 className="font-semibold text-blue-300">{item.figure}</h3>
                  <p className="text-sm text-zinc-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attorney Review Notes */}
        <div className="mb-6 rounded-xl border border-orange-800 bg-orange-950/50 p-6">
          <h2 className="text-xl font-bold text-orange-300 mb-4">Attorney Review Notes</h2>
          <div className="text-orange-100 leading-relaxed whitespace-pre-wrap">{draft.attorney_review_notes}</div>
        </div>

        {/* Filing Notes */}
        <div className="mb-6 rounded-xl border border-orange-800 bg-orange-950/50 p-6">
          <h2 className="text-xl font-bold text-orange-300 mb-4">Filing Notes</h2>
          <div className="text-orange-100 leading-relaxed whitespace-pre-wrap">{draft.filing_notes}</div>
        </div>

        {/* Final Disclaimer */}
        <div className="rounded-xl border-2 border-yellow-800 bg-yellow-900/20 p-6">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 flex-shrink-0 text-yellow-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-300 mb-2">Legal Disclaimer</h3>
              <p className="text-sm text-yellow-200/90">
                This draft is not legal advice and is not ready to file without review by a qualified patent attorney. 
                Patent attorneys must review and refine all sections, conduct prior art searches, assess patentability, 
                evaluate freedom to operate, and finalize claim scope before any filing decisions are made.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
