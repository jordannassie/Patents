"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MARKET_CATEGORIES = [
  "AI Authorization",
  "Crypto Security",
  "Payments/Fraud",
  "Voice Authentication",
  "Autonomous Systems",
  "Healthcare Automation",
  "Defense / Government",
  "Bible / Education Tech",
  "Trading / Market Data",
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);

    try {
      // Call patent search API
      const response = await fetch("/api/patents/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          market: category || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      // Redirect to results page with searchId
      router.push(`/results?searchId=${data.searchId}`);
    } catch (error) {
      console.error("Search error:", error);
      setIsSearching(false);
      alert("Search failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))] bg-black">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Search Patent Opportunities
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Enter a market, technology, or problem space to discover expired
            patents with modernization potential
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-12 space-y-6">
          {/* Search Input */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-zinc-300"
            >
              Search Query
            </label>
            <input
              type="text"
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: crypto transaction safety, voice authentication, autonomous AI control"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSearching}
            />
          </div>

          {/* Market Category Dropdown */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-zinc-300"
            >
              Market Category (Optional)
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSearching}
            >
              <option value="">All Categories</option>
              {MARKET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div>
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin"
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
                  Searching old patents and building opportunity list...
                </span>
              ) : (
                "Find Opportunities"
              )}
            </button>
          </div>

          {/* Legal Note */}
          <p className="text-center text-xs text-zinc-500">
            Patent status estimates are informational only. Attorney review
            required.
          </p>
        </form>

        {/* Example Searches */}
        <div className="mt-16">
          <h2 className="text-center text-sm font-medium text-zinc-400">
            Popular Searches
          </h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              "biometric authentication",
              "blockchain voting",
              "AI-powered diagnostics",
              "autonomous drone delivery",
              "voice encryption",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                disabled={isSearching}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
