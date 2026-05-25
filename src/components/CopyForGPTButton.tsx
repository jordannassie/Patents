"use client";

import { useState } from "react";

interface CopyForGPTButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  variant?: "primary" | "secondary" | "small";
}

export default function CopyForGPTButton({
  text,
  label = "Copy for GPT",
  copiedLabel = "Copied for GPT!",
  variant = "secondary",
}: CopyForGPTButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy for GPT:", err);
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const baseStyles = "inline-flex items-center gap-2 rounded-lg font-medium transition-all";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-base text-white hover:opacity-90 hover:shadow-lg hover:shadow-green-500/50",
    secondary: "bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:border-green-500/50",
    small: "bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 hover:border-green-500/50",
  };

  const getIcon = () => {
    if (copied) {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (error) {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <button
      onClick={handleCopy}
      className={`${baseStyles} ${variantStyles[variant]}`}
      title={copied ? copiedLabel : label}
    >
      {getIcon()}
      {copied ? copiedLabel : error ? "Failed" : label}
    </button>
  );
}
