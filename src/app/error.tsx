"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          The page hit an unexpected error. Try refreshing — if the problem
          persists, restart the dev server with{" "}
          <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">
            npm run dev:clean
          </code>
          .
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
