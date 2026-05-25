"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="border-b border-zinc-800 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-sm font-bold text-white">PB</span>
              </div>
              <span className="text-lg font-semibold text-white">
                PatentBoom
              </span>
            </Link>
            <div className="hidden md:flex md:gap-6">
              <Link
                href="/hunter"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/hunter" || pathname.startsWith("/hunter")
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Hunter
              </Link>
              <Link
                href="/patent-plans"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/patent-plans" || pathname.startsWith("/patent-plans")
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Patent Plans
              </Link>
              <Link
                href="/hunter/runs"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/hunter/runs"
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Runs
              </Link>
              <Link
                href="/search"
                className={`text-sm font-medium transition-colors ${
                  isActive("/search")
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Search
              </Link>
              <Link
                href="/saved"
                className={`text-sm font-medium transition-colors ${
                  isActive("/saved")
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Saved
              </Link>
            </div>
          </div>
          <Link
            href="/patent-plans"
            className="rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            View Patent Plans
          </Link>
        </div>
      </div>
    </nav>
  );
}
