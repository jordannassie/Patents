import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Discover the companies hiding inside{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                expired patents
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400 sm:text-xl">
              PatentBoom uses AI to search old patents, identify modern
              technology upgrades, and rank the best opportunities for new
              ventures, products, and patentable improvements.
            </p>
            <div className="mt-10">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90"
              >
                Start Searching
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

      {/* How It Works Section */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              From patent search to venture opportunity in five steps
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Search old patents
              </h3>
              <p className="mt-2 text-zinc-400">
                Enter a market, technology, or problem space.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Let AI analyze the invention
              </h3>
              <p className="mt-2 text-zinc-400">
                PatentBoom summarizes the old invention and identifies what is
                outdated.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Discover modern upgrades
              </h3>
              <p className="mt-2 text-zinc-400">
                AI finds ways to apply AI, cloud, APIs, mobile, crypto,
                cybersecurity, and automation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Rank the opportunity
              </h3>
              <p className="mt-2 text-zinc-400">
                Each patent receives a score for market potential, buildability,
                revenue, and possible new patent direction.
              </p>
            </div>

            {/* Step 5 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-xl font-bold text-white">5</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Save the best ideas
              </h3>
              <p className="mt-2 text-zinc-400">
                Build your own pipeline of future companies and patent
                opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity Scoring Section */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Opportunity Scoring
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Every patent opportunity receives an AI-generated score based on
              multiple factors including market potential, technical
              buildability, revenue opportunity, and the strength of possible
              new patent directions.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-left">
                <div className="mb-2 text-2xl font-bold text-blue-400">
                  Market Potential
                </div>
                <p className="text-sm text-zinc-400">
                  Size of addressable market and current demand signals
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-left">
                <div className="mb-2 text-2xl font-bold text-purple-400">
                  Buildability
                </div>
                <p className="text-sm text-zinc-400">
                  Technical feasibility and modernization complexity
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-left">
                <div className="mb-2 text-2xl font-bold text-green-400">
                  Revenue
                </div>
                <p className="text-sm text-zinc-400">
                  Monetization pathways and business model viability
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-left">
                <div className="mb-2 text-2xl font-bold text-orange-400">
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
              Ready to discover your next venture?
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Start searching expired patents and building your opportunity
              pipeline today.
            </p>
            <div className="mt-8">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90"
              >
                Start Searching
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
