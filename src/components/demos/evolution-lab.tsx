"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Bug = { id: number; x: number; y: number; c: number; delay: number };
type FieldId = "green" | "orange";

const COUNT = 40;
const EATS = 12;

const FIELDS: Record<FieldId, { label: string; bg: string; target: number }> = {
  green: { label: "Green leaves", bg: "hsl(100 38% 30%)", target: 0 },
  orange: { label: "Orange sand", bg: "hsl(30 48% 36%)", target: 1 },
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const mean = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
// c = 0 is green, c = 1 is orange
const colourOf = (c: number) => `hsl(${Math.round(100 - 70 * c)} 50% 34%)`;

function makeBug(id: number, c: number): Bug {
  return {
    id,
    x: 6 + Math.random() * 88,
    y: 8 + Math.random() * 84,
    c,
    delay: Math.random() * -9,
  };
}

function BugShape({ colour }: { colour: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-full" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,.35))" }}>
      <g stroke={colour} strokeWidth="1.6" strokeLinecap="round">
        <line x1="6" y1="9" x2="2" y2="6" />
        <line x1="6" y1="13" x2="1.5" y2="13" />
        <line x1="6" y1="17" x2="2" y2="20" />
        <line x1="18" y1="9" x2="22" y2="6" />
        <line x1="18" y1="13" x2="22.5" y2="13" />
        <line x1="18" y1="17" x2="22" y2="20" />
      </g>
      <ellipse cx="12" cy="14" rx="6.5" ry="8" fill={colour} />
      <circle cx="12" cy="5.5" r="3.2" fill={colour} />
    </svg>
  );
}

export function EvolutionLab() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [field, setField] = useState<FieldId>("green");
  const [eaten, setEaten] = useState(0);
  const [day, setDay] = useState(1);
  const [phase, setPhase] = useState<"hunt" | "night">("hunt");
  const [history, setHistory] = useState<number[]>([]);
  const idRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    if (timer.current) clearTimeout(timer.current);
    const first = Array.from({ length: COUNT }, (_, i) => makeBug(i, Math.random()));
    idRef.current = COUNT;
    setBugs(first);
    setEaten(0);
    setDay(1);
    setPhase("hunt");
    setHistory([mean(first.map((b) => b.c))]);
  }

  useEffect(() => {
    start();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };

  }, []);

  function endDay(survivors: Bug[]) {
    if (survivors.length === 0) return;
    setPhase("night");
    timer.current = setTimeout(() => {
      const babies = Array.from({ length: COUNT }, (_, i) => {
        const parent = survivors[Math.floor(Math.random() * survivors.length)];
        return makeBug(idRef.current + i, clamp01(parent.c + (Math.random() - 0.5) * 0.14));
      });
      idRef.current += COUNT;
      setBugs(babies);
      setEaten(0);
      setDay((d) => d + 1);
      setHistory((h) => [...h, mean(babies.map((b) => b.c))].slice(-14));
      setPhase("hunt");
    }, 1600);
  }

  function eat(id: number) {
    if (phase !== "hunt") return;
    const rest = bugs.filter((b) => b.id !== id);
    const e = eaten + 1;
    setBugs(rest);
    setEaten(e);
    if (e >= EATS) endDay(rest);
  }

  const avg = mean(bugs.map((b) => b.c));
  const match = bugs.length > 0 && Math.abs(avg - FIELDS[field].target) < 0.2;

  let message = `You are a hungry bird. Click the bugs you can see to eat them. After ${EATS} bugs, night falls.`;
  if (day >= 2) message = "The survivors had babies, and the babies look like their parents. Keep eating the bugs you can see.";
  if (day >= 3 && match)
    message =
      "Look: most bugs now blend into the background. Nobody told them to. The easy-to-see bugs got eaten, so the hidden ones had the babies. That is natural selection. Now switch the background and watch them adapt again.";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-lime-glow/30 bg-lime-glow/[0.06] p-5">
        <p className="font-display text-xl font-bold leading-snug text-bone-100">
          Bugs that are easy to see get eaten. The ones that blend in survive and have babies. Watch what happens to
          the colour of the bugs, day after day.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">Background</span>
        {(Object.keys(FIELDS) as FieldId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setField(id)}
            aria-pressed={field === id}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-all",
              field === id
                ? "border-lime-glow bg-lime-glow text-ink-950"
                : "border-bone-100/20 text-bone-100 hover:border-lime-glow/60",
            )}
          >
            {FIELDS[id].label}
          </button>
        ))}
      </div>

      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-bone-100/15 transition-colors duration-700"
        style={{ background: FIELDS[field].bg }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_80%_85%,rgba(0,0,0,0.25),transparent_45%)]" />

        <AnimatePresence>
          {bugs.map((b) => (
            <motion.button
              key={b.id}
              type="button"
              onClick={() => eat(b.id)}
              aria-label="Eat this bug"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.25 } }}
              className="absolute -ml-4 -mt-4 size-8"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            >
              <span className="block size-full animate-float" style={{ animationDelay: `${b.delay}s` }}>
                <BugShape colour={colourOf(b.c)} />
              </span>
            </motion.button>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "night" && (
            <motion.div
              key="night"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 grid place-items-center bg-black/65 px-6 text-center"
            >
              <div>
                <p className="font-display text-3xl font-extrabold text-white">Night falls.</p>
                <p className="mt-2 text-white/80">The bugs you missed are having babies...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { k: "Day", v: String(day) },
          { k: "Eaten today", v: `${eaten} / ${EATS}` },
          { k: "Bugs", v: String(bugs.length) },
        ].map((s) => (
          <div key={s.k} className="hairline rounded-xl p-4">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-bone-500">{s.k}</p>
            <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-bone-50">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="hairline rounded-xl p-4">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-bone-500">
          Average bug colour, day by day
        </p>
        <div className="mt-3 flex gap-1.5">
          {history.map((v, i) => (
            <span
              key={i}
              title={`Day ${day - history.length + 1 + i}`}
              className="size-7 rounded-md border border-bone-100/20"
              style={{ background: colourOf(v) }}
            />
          ))}
        </div>
      </div>

      <p className="min-h-[3.5rem] leading-relaxed text-bone-100">{message}</p>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => endDay(bugs)} disabled={phase !== "hunt" || eaten < 1}>
          End the day early
        </Button>
        <Button variant="ghost" onClick={start}>
          <RotateCcw className="size-4" /> Start over
        </Button>
      </div>
    </div>
  );
}