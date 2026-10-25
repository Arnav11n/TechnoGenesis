"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/demos/save-button";
import {
  CATEGORIES,
  PARTS,
  PASS,
  STATS,
  TERRAINS,
  computeStats,
  scoreTerrain,
  type Category,
  type Sel,
} from "@/lib/sim/robot-parts";
import { cn } from "@/lib/utils";

const DEFAULT: Sel = { body: "steel", move: "wheels", brain: "rules", power: "battery" };

function Preview({ sel }: { sel: Sel }) {
  const { body, move, brain, power } = sel;
  return (
    <svg viewBox="0 0 240 290" className="mx-auto w-full max-w-[20rem] animate-float" role="img" aria-label="Preview of your robot">
      <ellipse cx={120} cy={276} rx={86} ry={7} className="fill-bone-100/10" />

      {/* movement */}
      {move === "legs" && (
        <g className="fill-none stroke-bone-100" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M96 196 L82 236 L100 270" />
          <path d="M144 196 L158 236 L140 270" />
        </g>
      )}
      {move === "wheels" && (
        <g className="stroke-bone-100" strokeWidth={4}>
          <circle cx={84} cy={242} r={28} className="fill-ink-900" />
          <circle cx={156} cy={242} r={28} className="fill-ink-900" />
          <circle cx={84} cy={242} r={8} className="fill-lime-glow stroke-none" />
          <circle cx={156} cy={242} r={8} className="fill-lime-glow stroke-none" />
        </g>
      )}
      {move === "treads" && (
        <rect x={56} y={226} width={128} height={44} rx={22} strokeWidth={5} strokeDasharray="9 6" className="fill-ink-900 stroke-bone-100" />
      )}
      {move === "rotors" && (
        <g className="stroke-lime-glow" strokeWidth={4} strokeLinecap="round">
          <line x1={120} y1={64} x2={120} y2={46} />
          <line x1={64} y1={44} x2={176} y2={44} className="animate-pulse-slow" />
        </g>
      )}

      {/* body */}
      {body === "steel" && (
        <g className="stroke-bone-100" strokeWidth={3}>
          <rect x={78} y={108} width={84} height={88} rx={8} className="fill-ink-800" />
          {[[86, 116], [154, 116], [86, 188], [154, 188]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={2.5} className="fill-bone-100 stroke-none" />
          ))}
        </g>
      )}
      {body === "carbon" && (
        <g className="stroke-bone-100" strokeWidth={3}>
          <path d="M84 108 H156 L166 196 H74 Z" className="fill-ink-800" />
          <path d="M92 124 L148 180" className="fill-none stroke-bone-100/40" />
          <path d="M148 124 L92 180" className="fill-none stroke-bone-100/40" />
        </g>
      )}
      {body === "living" && (
        <g strokeWidth={3}>
          <rect x={78} y={108} width={84} height={88} rx={34} className="fill-ink-800 stroke-copper-400" />
          <path d="M90 134 q8 -10 16 0 t16 0 t16 0 t16 0" className="fill-none stroke-copper-400" />
          <path d="M90 154 q8 -10 16 0 t16 0 t16 0 t16 0" className="fill-none stroke-copper-400/70" />
          <path d="M90 174 q8 -10 16 0 t16 0 t16 0 t16 0" className="fill-none stroke-copper-400/50" />
        </g>
      )}

      {/* head and brain */}
      <rect x={96} y={64} width={48} height={40} rx={11} strokeWidth={3} className="fill-ink-800 stroke-bone-100" />
      {brain === "rules" && <rect x={106} y={79} width={28} height={9} rx={4.5} className="fill-lime-glow" />}
      {(brain === "neural" || brain === "learner") && (
        <g>
          <g className="stroke-lime-glow" strokeWidth={1.5}>
            <line x1={106} y1={84} x2={120} y2={74} />
            <line x1={120} y1={74} x2={134} y2={84} />
            <line x1={134} y1={84} x2={120} y2={94} />
            <line x1={120} y1={94} x2={106} y2={84} />
            <line x1={120} y1={74} x2={120} y2={94} />
          </g>
          {[[106, 84], [120, 74], [134, 84], [120, 94]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={3.5} className="fill-lime-glow" />
          ))}
        </g>
      )}
      {brain === "learner" && (
        <circle cx={120} cy={84} r={42} fill="none" strokeWidth={1.5} strokeDasharray="3 6" className="animate-pulse-slow stroke-lime-glow" />
      )}

      {/* power */}
      {power === "battery" && (
        <g strokeWidth={3}>
          <rect x={168} y={128} width={18} height={46} rx={4} className="fill-ink-800 stroke-bone-100" />
          <path d="M178 136 L172 152 H180 L174 168" fill="none" strokeWidth={2.5} className="stroke-lime-glow" />
        </g>
      )}
      {power === "solar" && (
        <g strokeWidth={3}>
          <polygon points="164,122 206,102 216,142 174,162" className="fill-lime-glow/20 stroke-bone-100" />
          <line x1={185} y1={112} x2={195} y2={152} className="stroke-bone-100/50" strokeWidth={1.5} />
          <line x1={169} y1={142} x2={211} y2={122} className="stroke-bone-100/50" strokeWidth={1.5} />
        </g>
      )}
      {power === "biocell" && (
        <g strokeWidth={3}>
          <circle cx={180} cy={152} r={16} className="fill-lime-glow/30 stroke-lime-glow" />
          <path d="M180 136 q10 -6 14 -16" fill="none" strokeWidth={2.5} className="stroke-lime-glow" />
        </g>
      )}
    </svg>
  );
}

export function RobotBuilder() {
  const [sel, setSel] = useState<Sel>(DEFAULT);
  const [shown, setShown] = useState(-1);

  const stats = useMemo(() => computeStats(sel), [sel]);
  const results = useMemo(
    () => TERRAINS.map((t) => ({ t, score: scoreTerrain(stats, sel, t) })),
    [stats, sel],
  );

  useEffect(() => {
    if (shown < 1 || shown >= TERRAINS.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 850);
    return () => clearTimeout(t);
  }, [shown]);

  function pick(cat: Category, id: string) {
    setSel((s) => ({ ...s, [cat]: id }));
    setShown(-1);
  }

  function randomise() {
    const next = { ...DEFAULT };
    for (const c of CATEGORIES) {
      const opts = PARTS.filter((p) => p.cat === c.id);
      next[c.id] = opts[Math.floor(Math.random() * opts.length)].id;
    }
    setSel(next);
    setShown(-1);
  }

  const finished = shown >= TERRAINS.length;
  const passed = results.filter((r) => r.score >= PASS).length;

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* choices */}
        <div className="space-y-6">
          {CATEGORIES.map((c) => (
            <div key={c.id}>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">
                {c.title} <span className="text-bone-500">· {c.blurb}</span>
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {PARTS.filter((p) => p.cat === c.id).map((p) => {
                  const on = sel[c.id] === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => pick(c.id, p.id)}
                      aria-pressed={on}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left transition-all",
                        on
                          ? "border-lime-glow bg-lime-glow text-ink-950"
                          : "border-bone-100/20 text-bone-100 hover:border-lime-glow/60",
                      )}
                    >
                      <span className="block text-sm font-semibold">{p.label}</span>
                      <span className={cn("block text-[0.6875rem]", on ? "text-ink-950/70" : "text-bone-500")}>
                        {p.sub}
                      </span>
                      <span
                        className={cn(
                          "mt-2 inline-block font-mono text-[0.5625rem] uppercase tracking-[0.2em]",
                          on ? "text-ink-950/70" : p.field === "Biotech" ? "text-copper-400" : "text-lime-glow",
                        )}
                      >
                        {p.field}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" onClick={randomise}>
              <Shuffle className="size-4" /> Surprise me
            </Button>
            <SaveButton
              key={`${sel.body}-${sel.move}-${sel.brain}-${sel.power}`}
              data={{ kind: "robot", body: sel.body, move: sel.move, brain: sel.brain, power: sel.power, stats, passed }}
            />
          </div>
        </div>

        {/* preview and stats */}
        <div className="hairline rounded-2xl p-5">
          <Preview sel={sel} />
          <div className="mt-4 space-y-3">
            {STATS.map((s) => (
              <div key={s.id} title={s.hint}>
                <div className="flex justify-between font-mono text-[0.625rem] uppercase tracking-[0.2em] text-bone-300">
                  <span>{s.label}</span>
                  <span className="tabular-nums text-bone-50">{stats[s.id]}/10</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bone-100/10">
                  <div
                    className="h-full rounded-full bg-lime-glow transition-all duration-500"
                    style={{ width: `${stats[s.id] * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* terrain test */}
      <div className="rounded-2xl border border-copper-400/40 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-copper-400">The terrain test</p>
            <p className="mt-2 max-w-xl text-bone-300">
              Your robot faces five places. It passes each one with a score of {PASS} or more out of 10.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShown(1)} disabled={shown >= 1 && !finished}>
              <Play className="size-4" /> {finished ? "Run again" : "Run the test"}
            </Button>
            {shown >= 0 && (
              <Button variant="outline" onClick={() => setShown(-1)}>
                <RotateCcw className="size-4" /> Clear
              </Button>
            )}
          </div>
        </div>

        {shown >= 1 && (
          <div className="mt-6 space-y-3">
            {results.slice(0, shown).map(({ t, score }) => {
              const ok = score >= PASS;
              return (
                <div key={t.id} className="hairline rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-display text-lg font-bold text-bone-50">{t.label}</p>
                    <p className={cn("font-mono text-xs uppercase tracking-[0.2em]", ok ? "text-lime-glow" : "text-red-300")}>
                      {ok ? "Passed" : "Failed"} · {score.toFixed(1)}
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bone-100/10">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", ok ? "bg-lime-glow" : "bg-red-400")}
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
                  {!ok && <p className="mt-2 text-sm text-bone-300">Tip: {t.tip}</p>}
                </div>
              );
            })}
          </div>
        )}

        {finished && (
          <p className="mt-6 font-display text-2xl font-bold text-bone-50">
            Your robot passed {passed} of {TERRAINS.length} terrains.{" "}
            <span className="text-lime-glow">
              {passed === TERRAINS.length
                ? "A perfect all-rounder!"
                : passed >= 3
                  ? "Strong, but not perfect. Swap one part and run it again."
                  : "Every robot has weaknesses. Change a part and try again."}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}