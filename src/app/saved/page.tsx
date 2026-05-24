import Link from "next/link";

export default function SavedPage() {
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
                Hunter Engine opportunities appear on the{' '}
                <Link href="/hunter" className="font-medium underline hover:text-indigo-200">
                  Hunter dashboard
                </Link>
                {' '}and in{' '}
                <Link href="/hunter/runs" className="font-medium underline hover:text-indigo-200">
                  Hunter runs
                </Link>
                . This page shows manually saved opportunities from Search.
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
            <svg
              className="h-10 w-10 text-zinc-600"
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
          </div>
          <h2 className="mt-6 text-2xl font-bold text-white">
            No saved opportunities yet
          </h2>
          <p className="mt-3 text-lg text-zinc-400">
            Search patents and save the best ideas to build your opportunity
            pipeline.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/hunter"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
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
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-700"
            >
              Manual Search
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <svg
                className="h-6 w-6 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">
              Search Patents
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Enter markets, technologies, or problem spaces to find expired
              patents with opportunity potential.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <svg
                className="h-6 w-6 text-purple-400"
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
            <h3 className="text-lg font-semibold text-white">
              AI Analysis
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Get AI-powered modernization ideas, venture concepts, and new
              patent directions for each opportunity.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <svg
                className="h-6 w-6 text-green-400"
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
            </div>
            <h3 className="text-lg font-semibold text-white">
              Save Opportunities
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Build your pipeline by saving the most promising patents for
              future ventures and innovations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
