import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Find the invention hiding inside the{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
                future bottleneck
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400 sm:text-xl">
              PatentBoom runs an AI-powered Hunter Engine that searches patent records, 
              identifies likely old or expired invention opportunities, and ranks which ones 
              could become billion-dollar AI-era ventures.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/hunter"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 px-8 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90"
              >
                Launch Hunter
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                Manual Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Engine Section */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Automated Patent Opportunity Intelligence
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              The Hunter Engine runs 24/7, scanning for future bottleneck opportunities
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Bottleneck Discovery
              </h3>
              <p className="mt-2 text-zinc-400">
                Scans high-value categories like AI agents, cyber defense, energy, robotics, 
                digital identity, fintech, and DARPA-style defense autonomy.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Patent Mining
              </h3>
              <p className="mt-2 text-zinc-400">
                Searches USPTO patent data and surfaces old or overlooked inventions 
                tied to future market constraints.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Pre-AI Filtering
              </h3>
              <p className="mt-2 text-zinc-400">
                Pre-scores candidates before spending AI tokens, filtering for bottleneck 
                relevance, future demand, and modernization potential.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">
                AI Venture Analysis
              </h3>
              <p className="mt-2 text-zinc-400">
                Generates modernization angles, new patent directions, venture concepts, 
                and opportunity scores.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Worker Queue
              </h3>
              <p className="mt-2 text-zinc-400">
                Runs in small batches every 10 minutes so the engine keeps working 
                without timeouts.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Opportunity Pipeline
              </h3>
              <p className="mt-2 text-zinc-400">
                Saves the best opportunities into a ranked pipeline for follow-up, 
                patent review, and venture creation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              From future bottleneck to patent-backed venture
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Choose bottlenecks
              </h3>
              <p className="mt-2 text-zinc-400">
                Select high-value future constraint categories.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Start Hunter run
              </h3>
              <p className="mt-2 text-zinc-400">
                Launch automated patent discovery engine.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Worker scans USPTO
              </h3>
              <p className="mt-2 text-zinc-400">
                Engine searches patent records every 10 minutes.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <span className="text-xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                AI ranks opportunities
              </h3>
              <p className="mt-2 text-zinc-400">
                Scores and analyzes the best candidates.
              </p>
            </div>

            {/* Step 5 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <span className="text-xl font-bold text-white">5</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Review top ventures
              </h3>
              <p className="mt-2 text-zinc-400">
                Explore patent-backed venture opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Billion-Dollar Bottlenecks Section */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Billion-Dollar Bottlenecks We Hunt
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Future constraints that become more valuable as the world needs them
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'AI-Agent Control',
              'Cybersecurity / Data Exfiltration',
              'Digital Identity / Deepfake Trust',
              'Energy / Grid',
              'Compute',
              'Robotics Safety',
              'Defense Autonomy / DARPA',
              'Payments / Fraud',
              'Crypto Irreversible Transactions',
              'Healthcare Labor / Liability',
              'Space / Satellite Resilience',
              'Compliance / Audit / Liability'
            ].map((bottleneck) => (
              <div key={bottleneck} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-center">
                <span className="text-sm font-medium text-indigo-400">{bottleneck}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Automated Runs Section */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built for automated runs
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              PatentBoom can run daily scout searches and weekly deep runs. Each worker batch 
              processes a small number of queued tasks, logs activity, and continues until the 
              run is complete. The Hunter keeps working even when you're not watching.
            </p>
            <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-left">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Daily Scout</h3>
                  <p className="text-sm text-zinc-400">
                    Lightweight daily scans of top bottleneck categories with 
                    focused AI analysis budget.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Weekly Deep</h3>
                  <p className="text-sm text-zinc-400">
                    Comprehensive weekly runs across all categories with expanded 
                    AI analysis and deeper candidate review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity Scoring Section */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How We Score Bottleneck Opportunities
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Every patent opportunity receives an AI-generated score based on
              future bottleneck relevance, market demand, technical buildability, 
              revenue opportunity, and the strength of possible new patent directions.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-left">
                <div className="mb-2 text-2xl font-bold text-indigo-400">
                  Bottleneck Relevance
                </div>
                <p className="text-sm text-zinc-400">
                  How critical this invention becomes as future constraints emerge
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-left">
                <div className="mb-2 text-2xl font-bold text-blue-400">
                  Market Demand
                </div>
                <p className="text-sm text-zinc-400">
                  Size of addressable market and current demand signals
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-left">
                <div className="mb-2 text-2xl font-bold text-green-400">
                  Buildability
                </div>
                <p className="text-sm text-zinc-400">
                  Technical feasibility and modernization complexity
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-left">
                <div className="mb-2 text-2xl font-bold text-purple-400">
                  Patent Strength
                </div>
                <p className="text-sm text-zinc-400">
                  Likelihood of securing new patents for modern improvements
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to discover billion-dollar bottlenecks?
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Launch the Hunter Engine and start building your opportunity pipeline.
            </p>
            <div className="mt-8">
              <Link
                href="/hunter"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 px-8 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90"
              >
                Launch Hunter
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
