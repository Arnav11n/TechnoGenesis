"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MIN_MS = 2600; // the bar always takes at least this long
const MAX_MS = 9000; // never wait longer than this

const STATUS = [
  { at: 0, text: "Seeding neurons" },
  { at: 25, text: "Growing membrane" },
  { at: 50, text: "Writing DNA" },
  { at: 75, text: "Fitting actuators" },
  { at: 96, text: "Alive" },
];

type Mode = "pending" | "play" | "done";

/**
 * Plays once when the site is first opened in a tab. The bar fills from 0 to
 * 100 in at least 2.6 seconds, and waits for the page and fonts if they are
 * slow. It never plays again while the person browses around.
 */
export function IntroGate({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("pending");
  const [fast, setFast] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("tg-intro") === "1";
    } catch {
      /* storage blocked: play the intro */
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seen || reduced) {
      setFast(true);
      setMode("done");
      return;
    }
    setMode("play");

    let loaded = document.readyState === "complete";
    let fontsReady = false;
    const onLoad = () => {
      loaded = true;
    };
    if (!loaded) window.addEventListener("load", onLoad);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        fontsReady = true;
      });
    } else {
      fontsReady = true;
    }

    const start = performance.now();
    let shown = 0;
    let raf = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / MIN_MS);
      const eased = 1 - Math.pow(1 - t, 2.2);
      const ready = (loaded && fontsReady) || elapsed > MAX_MS;
      // If the page is still loading, creep slowly and wait near the end.
      const cap = ready ? 1 : 0.9 + Math.min(0.08, Math.max(0, elapsed - MIN_MS) / 60000);
      const target = Math.min(eased, cap);

      shown += (target - shown) * 0.14;
      if (ready && t >= 1 && shown > 0.995) shown = 1;
      setPct(Math.round(shown * 100));

      if (shown >= 1) {
        try {
          sessionStorage.setItem("tg-intro", "1");
        } catch {
          /* ignore */
        }
        timeout = setTimeout(() => setMode("done"), 350);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  const status = [...STATUS].reverse().find((s) => pct >= s.at)?.text ?? "";

  return (
    <>
      <AnimatePresence>
        {mode === "play" && (
          <motion.div
            key="intro"
            aria-hidden
            initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={
              fast
                ? { opacity: 0, transition: { duration: 0.15 } }
                : {
                    clipPath: "inset(0% 0% 100% 0%)",
                    transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] },
                  }
            }
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink-950"
          >
            <div className="pointer-events-none absolute size-[30rem] rounded-full bg-lime-glow/15 blur-[7.5rem]" />

            <div className="relative">
              <p className="display-tight ghost-text text-[clamp(2.6rem,11vw,9rem)] font-extrabold [--stroke:var(--bone-300)]">
                TechnoGenesis
              </p>
              <p
                className="display-tight absolute inset-0 text-[clamp(2.6rem,11vw,9rem)] font-extrabold text-lime-glow"
                style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
              >
                TechnoGenesis
              </p>
            </div>

            <div className="relative mt-12 w-full max-w-md px-6">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-bone-100/10">
                <div
                  className="h-full rounded-full bg-lime-glow shadow-[0_0_18px_2px_rgb(var(--glow)/0.7)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-bone-300">
                <span>{status}</span>
                <span className="tabular-nums text-lime-glow">{String(pct).padStart(3, "0")}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === "done" && children}
    </>
  );
}