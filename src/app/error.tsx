"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
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
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-copper-400/15 blur-[9.375rem]" />
      <div className="relative max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-copper-400">Something went wrong</p>
        <h1 className="display-tight mt-4 text-[clamp(3rem,10vw,7rem)] font-extrabold text-bone-50">
          The organism <span className="ghost-text [--stroke:var(--copper-400)]">stumbled.</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-bone-300">
          An unexpected error stopped this page. It is not your fault. Try again, and if it keeps happening, go back
          to the start.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={reset}>Try again</Button>
          <Button href="/" variant="outline" size="lg">Back to the start</Button>
        </div>
      </div>
    </main>
  );
}