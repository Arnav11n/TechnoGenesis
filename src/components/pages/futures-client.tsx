"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { OptionalMedia } from "@/components/ui/optional-media";
import { useSectionProgress } from "@/hooks/use-section-progress";
import { askGenesis } from "@/lib/genesis";
import { cn } from "@/lib/utils";

type P = MotionValue<number>;
type Kind = "hopeful" | "cautious" | "wild";

type Future = {
  id: Kind;
  n: string;
  tone: string;
  name: string;
  line: string;
  heads: string[];
  tint: string;
  wipe: [number, number];
  head0: number;
  lp: [number, number];
  hideAt: number;
};

const FUTURES: Future[] = [
  {
    id: "hopeful", n: "01", tone: "Hopeful", name: "The healing decade",
    line: "Open science and sensible rules let good ideas spread fast.",
    heads: [
      "Gene-editing treatments for inherited diseases become routine in hospitals.",
      "Robots help care for older people, so human carers have more time to talk.",
      "AI helps design new medicines in months instead of years.",
    ],
    tint: "bg-lime-glow/15", wipe: [0, 0.01], head0: 0.05, lp: [0, 0.3], hideAt: 0.43,
  },
  {
    id: "cautious", n: "02", tone: "Cautious", name: "The long pause",
    line: "A few mistakes make people slow down. Progress arrives more slowly, but more evenly.",
    heads: [
      "New laws require every medical AI to be tested and explained.",
      "Gene therapies are approved one disease at a time, after long trials.",
      "Robots are allowed in hospitals and homes only with safety certificates.",
    ],
    tint: "bg-copper-400/20", wipe: [0.3, 0.42], head0: 0.45, lp: [0.3, 0.66], hideAt: 0.79,
  },
  {
    id: "wild", n: "03", tone: "Wild", name: "The great blur",
    line: "The line between machine and living thing fades. Nobody agrees where one ends and the other begins.",
    heads: [
      "Buildings are grown from engineered cells instead of being built.",
      "Teams of robots and AI scientists run labs with no people inside.",
      "Courts debate whether a living machine can own anything.",
    ],
    tint: "bg-bone-100/10", wipe: [0.66, 0.78], head0: 0.8, lp: [0.66, 1], hideAt: 0.99,
  },
];

function Headline({ p, at, text }: { p: P; at: number; text: string }) {
  const opacity = useTransform(p, [at, at + 0.04], [0, 1]);
  const x = useTransform(p, [at, at + 0.04], [60, 0]);
  return (
    <motion.li style={{ opacity, x }} className="glass rounded-xl px-5 py-4 text-sm leading-relaxed text-bone-100 md:text-base">
      {text}
    </motion.li>
  );
}

/* ───────────── Emblem 1: DNA helix with a heartbeat ───────────── */

const Y0 = 50;
const Y1 = 350;
const AMP = 70;
const xAt = (y: number, ph: number) => 200 + AMP * Math.sin(((y - Y0) / (Y1 - Y0)) * Math.PI * 4.4 + ph);

function strand(ph: number) {
  let d = "";
  for (let y = Y0; y <= Y1; y += 4) d += `${y === Y0 ? "M" : "L"}${xAt(y, ph).toFixed(1)} ${y} `;
  return d;
}
function rungs(ph: number) {
  let d = "";
  for (let k = 0; k < 14; k++) {
    const y = Y0 + 10 + k * ((Y1 - Y0 - 20) / 13);
    d += `M${xAt(y, ph).toFixed(1)} ${y} L${xAt(y, ph + Math.PI).toFixed(1)} ${y} `;
  }
  return d;
}

function HelixEmblem({ lp }: { lp: P }) {
  const phase = useTransform(lp, [0, 1], [0, Math.PI * 3]);
  const a = useTransform(phase, (ph) => strand(ph));
  const b = useTransform(phase, (ph) => strand(ph + Math.PI));
  const r = useTransform(phase, (ph) => rungs(ph));
  const ring = useTransform(lp, [0, 1], [0, 160]);
  const grow = useTransform(lp, [0, 0.25], [0.2, 1]);

  const plus = Array.from({ length: 8 }, (_, k) => {
    const ang = (k / 8) * Math.PI * 2;
    return { x: 200 + 176 * Math.cos(ang), y: 200 + 176 * Math.sin(ang) };
  });

  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
      <circle cx={200} cy={200} r={120} className="fill-lime-glow/[0.06]" />
      <motion.circle
        cx={200}
        cy={200}
        r={186}
        fill="none"
        strokeDasharray="3 9"
        className="stroke-lime-glow/50"
        style={{ rotate: ring, transformBox: "fill-box", transformOrigin: "center" }}
      />
      {plus.map((p, k) => (
        <motion.path
          key={k}
          d={`M${p.x - 6} ${p.y} H${p.x + 6} M${p.x} ${p.y - 6} V${p.y + 6}`}
          strokeWidth={2.5}
          strokeLinecap="round"
          className="stroke-lime-glow"
          animate={{ opacity: [0.15, 1, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, delay: k * 0.35 }}
        />
      ))}

      {/* heartbeat line behind the helix */}
      <motion.path
        d="M20 200 H128 L146 168 L166 236 L186 186 L200 200 H380"
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-lime-glow/70"
        animate={{ pathLength: [0, 1, 1], opacity: [0.9, 0.9, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.g style={{ scaleY: grow, transformBox: "fill-box", transformOrigin: "center" }}>
        <motion.path d={r} strokeWidth={2} className="stroke-bone-100/45" />
        <motion.path d={b} fill="none" strokeWidth={3} strokeLinecap="round" className="stroke-copper-400" />
        <motion.path d={a} fill="none" strokeWidth={3} strokeLinecap="round" className="stroke-lime-glow" />
        <motion.path d={b} fill="none" strokeWidth={9} strokeLinecap="round" strokeDasharray="0.1 18" className="stroke-copper-400" />
        <motion.path d={a} fill="none" strokeWidth={9} strokeLinecap="round" strokeDasharray="0.1 18" className="stroke-lime-glow" />
      </motion.g>
    </svg>
  );
}

/* ───────────── Emblem 2: scanning shield with checks ───────────── */

const HEX_O = "M200 50 L330 125 L330 275 L200 350 L70 275 L70 125 Z";
const HEX_I = "M200 95 L291 147.5 L291 252.5 L200 305 L109 252.5 L109 147.5 Z";
const VERTS: [number, number][] = [[200, 50], [330, 125], [330, 275], [200, 350], [70, 275], [70, 125]];
const ROWS = [
  { y: 165, a: 0.2, b: 0.38 },
  { y: 200, a: 0.45, b: 0.63 },
  { y: 235, a: 0.7, b: 0.88 },
];

function CheckRow({ lp, y, a, b }: { lp: P; y: number; a: number; b: number }) {
  const len = useTransform(lp, [a, b], [0, 1]);
  return (
    <>
      <path d={`M175 ${y} H262`} strokeWidth={3} strokeLinecap="round" className="stroke-bone-100/30" />
      <motion.path
        d={`M120 ${y} l9 9 l17 -19`}
        fill="none"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-lime-glow"
        style={{ pathLength: len }}
      />
    </>
  );
}

function ShieldEmblem({ lp }: { lp: P }) {
  const ring = useTransform(lp, [0, 1], [0, 120]);
  const scanY = useTransform(lp, [0, 1], [105, 295]);
  const scanOp = useTransform(lp, [0, 0.05, 0.92, 1], [0, 1, 1, 0]);

  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
      <motion.circle
        cx={200}
        cy={200}
        r={186}
        fill="none"
        strokeDasharray="3 9"
        className="stroke-copper-400/60"
        style={{ rotate: ring, transformBox: "fill-box", transformOrigin: "center" }}
      />
      <path d={HEX_O} strokeWidth={2.5} strokeLinejoin="round" className="fill-copper-400/10 stroke-copper-400" />
      <path d={HEX_I} fill="none" strokeWidth={1.5} strokeLinejoin="round" strokeDasharray="4 6" className="stroke-copper-400/60" />
      {VERTS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 6} y={y - 6} width={12} height={12} rx={3} strokeWidth={2} className="fill-ink-950 stroke-copper-400" />
      ))}
      {ROWS.map((row) => (
        <CheckRow key={row.y} lp={lp} {...row} />
      ))}
      <motion.g style={{ y: scanY, opacity: scanOp }}>
        <line x1={100} y1={0} x2={300} y2={0} strokeWidth={2} className="stroke-lime-glow" />
        <line x1={100} y1={-7} x2={300} y2={-7} strokeWidth={14} className="stroke-lime-glow/10" />
      </motion.g>
    </svg>
  );
}

/* ───────────── Emblem 3: a living blob grown over circuit traces ───────────── */

const TRACES = [
  { d: "M200 200 H282 V128 H344", from: 0.05, to: 0.4, x: 344, y: 128 },
  { d: "M200 200 V112 H132 V58", from: 0.1, to: 0.45, x: 132, y: 58 },
  { d: "M200 200 H112 V276 H58", from: 0.2, to: 0.55, x: 58, y: 276 },
  { d: "M200 200 V290 H268 V346", from: 0.3, to: 0.65, x: 268, y: 346 },
  { d: "M200 200 H250 V232 H346", from: 0.4, to: 0.75, x: 346, y: 232 },
  { d: "M200 200 V160 H80 V120", from: 0.5, to: 0.85, x: 80, y: 120 },
];

function Trace({ lp, d, from, to, x, y }: { lp: P; d: string; from: number; to: number; x: number; y: number }) {
  const pathLength = useTransform(lp, [from, to], [0, 1]);
  const dot = useTransform(lp, [Math.max(0, to - 0.03), to], [0, 1]);
  return (
    <>
      <motion.path
        d={d}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-bone-100"
        style={{ pathLength }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r={6}
        className="fill-lime-glow"
        style={{ scale: dot, opacity: dot, transformBox: "fill-box", transformOrigin: "center" }}
      />
    </>
  );
}

function GrownEmblem({ lp }: { lp: P }) {
  const radius = useTransform(lp, [0, 0.5, 1], [
    "50% 50% 50% 50% / 50% 50% 50% 50%",
    "63% 37% 32% 68% / 55% 30% 70% 45%",
    "28% 72% 66% 34% / 34% 34% 66% 66%",
  ]);
  const rot = useTransform(lp, [0, 1], [0, 260]);
  const back = useTransform(lp, [0, 1], [0, -180]);

  return (
    <>
      <motion.div
        style={{
          borderRadius: radius,
          rotate: rot,
          background: "conic-gradient(from 0deg, var(--lime-glow), var(--copper-400), var(--lime-glow))",
        }}
        className="absolute inset-[10%] opacity-80 shadow-[0_0_80px_10px_rgb(var(--glow)/0.35)]"
      />
      <motion.div style={{ borderRadius: radius, rotate: back }} className="absolute inset-[24%] bg-ink-950/85" />
      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
        {TRACES.map((t) => (
          <Trace key={t.d} lp={lp} {...t} />
        ))}
        <circle cx={200} cy={200} r={9} className="fill-bone-50" />
      </svg>
    </>
  );
}

function Emblem({ kind, p, range }: { kind: Kind; p: P; range: [number, number] }) {
  const lp = useTransform(p, range, [0, 1]);
  const scale = useTransform(lp, [0, 1], [0.82, 1.06]);
  return (
    <motion.div style={{ scale }} className="relative mx-auto aspect-square w-[min(28rem,40vw)]" aria-hidden>
      {kind === "hopeful" && <HelixEmblem lp={lp} />}
      {kind === "cautious" && <ShieldEmblem lp={lp} />}
      {kind === "wild" && <GrownEmblem lp={lp} />}
    </motion.div>
  );
}

/* ───────────── Scenes ───────────── */

function Scene({ p, f, i, gone }: { p: P; f: Future; i: number; gone: boolean }) {
  const clip = useTransform(p, f.wipe, ["circle(0% at 50% 60%)", "circle(150% at 50% 60%)"]);
  // Once a later scene fully covers this one, switch it off completely.
  const fade = useTransform(p, [f.hideAt, Math.min(1, f.hideAt + 0.01)], [1, f.id === "wild" ? 1 : 0]);

  return (
    <motion.div
      style={{ ...(i === 0 ? {} : { clipPath: clip }), opacity: fade, display: gone ? "none" : undefined }}
      className="absolute inset-0 bg-ink-950"
    >
      <OptionalMedia src={`/images/futures/${f.id}.jpg`} className="opacity-25" />
      <div className={cn("absolute -right-32 top-1/4 size-[44rem] rounded-full blur-[9.375rem]", f.tint)} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-transparent to-ink-950/70" />

      <div className="relative mx-auto grid h-full max-w-[93.75rem] items-center gap-8 px-6 pb-8 pt-28 md:grid-cols-[1.15fr_1fr] md:px-14">
        <div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow">
            Future {f.n} of 03 · {f.tone}
          </p>
          <h2 className="display-tight mt-4 text-[clamp(2.6rem,7vw,6.5rem)] font-extrabold text-bone-50">{f.name}</h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-bone-300">{f.line}</p>
          <ul className="mt-6 max-w-xl space-y-3">
            {f.heads.map((h, k) => (
              <Headline key={h} p={p} at={f.head0 + k * 0.06} text={h} />
            ))}
          </ul>
        </div>
        <div className="hidden md:block">
          <Emblem kind={f.id} p={p} range={f.lp} />
        </div>
      </div>
    </motion.div>
  );
}

export function FuturesScroll() {
  const ref = useRef<HTMLElement>(null);
  const real = useSectionProgress(ref);
  const one = useMotionValue(1);
  const [active, setActive] = useState(0);
  const [locked, setLocked] = useState(false);
  const lastY = useRef(0);
  useMotionValueEvent(real, "change", (v) => {
    setActive(v < 0.36 ? 0 : v < 0.72 ? 1 : 2);
    const y = window.scrollY;
    const down = y >= lastY.current;
    lastY.current = y;
    if (v >= 0.985 && down) setLocked(true);
    else if (!down && v < 0.97) setLocked(false);
  });
  const p = locked ? one : real;

  function jump(at: number) {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + at * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
  }

  return (
    <section ref={ref} className="relative h-[600dvh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        {FUTURES.map((f, i) => (
          <Scene key={f.id} p={p} f={f} i={i} gone={locked && f.id !== "wild"} />
        ))}

        <div className="absolute inset-x-0 top-20 z-10 mx-auto flex max-w-[93.75rem] items-center justify-between px-6 md:px-14">
          <div className="flex gap-2">
            {[0.06, 0.56, 0.95].map((at, i) => (
              <button
                key={i}
                type="button"
                onClick={() => jump(at)}
                className={cn(
                  "rounded-full border px-4 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.2em] transition-all",
                  active === i
                    ? "border-lime-glow bg-lime-glow text-ink-950"
                    : "border-bone-100/25 bg-ink-950/50 text-bone-300 backdrop-blur hover:border-lime-glow/60",
                )}
              >
                {FUTURES[i].tone}
              </button>
            ))}
          </div>
          <span className="hidden font-mono text-[0.625rem] uppercase tracking-[0.25em] text-bone-500 md:block">
            Imagined headlines, not predictions
          </span>
        </div>
      </div>
    </section>
  );
}

function Bar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-300">
        <span>{label}</span>
        <span className="tabular-nums text-bone-50">{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-bone-100/10">
        <motion.div className={cn("h-full rounded-full", tone)} animate={{ width: `${value}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </div>
    </div>
  );
}

export function ChoiceBlock() {
  const [v, setV] = useState(50);
  const soon = Math.round(20 + v * 0.7);
  const missed = Math.round(10 + v * 0.75);
  const heard = Math.round(92 - v * 0.8);

  const zone =
    v < 34
      ? { t: "Slow and careful", d: "Problems are caught early and more people are heard, but helpful treatments and tools reach people later." }
      : v < 67
        ? { t: "A balanced pace", d: "Useful things arrive at a decent speed, with checks along the way. Most real decisions land somewhere here." }
        : { t: "Fast and bold", d: "Benefits arrive sooner, but there is less time to test, and mistakes can spread before anyone notices." };

  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-14 md:py-44">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-glow/10 blur-[10rem]" />
      <div className="relative mx-auto max-w-[62.5rem]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">Your choice</p>
        <h2 className="display-tight mt-5 text-[clamp(2.8rem,8vw,7.5rem)] font-extrabold text-bone-50">How fast should we go?</h2>

        <div className="glass mt-12 rounded-3xl p-8 md:p-12">
          <input
            type="range"
            min={0}
            max={100}
            value={v}
            onChange={(e) => setV(Number(e.target.value))}
            aria-label="How fast should we develop new technology?"
            className="w-full accent-lime-glow"
          />
          <div className="mt-2 flex justify-between font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-500">
            <span>Slow and careful</span>
            <span>Fast and bold</span>
          </div>

          <div className="mt-10 space-y-6">
            <Bar label="How soon people benefit" value={soon} tone="bg-lime-glow" />
            <Bar label="Chance a problem is missed" value={missed} tone="bg-copper-400" />
            <Bar label="Time to listen to everyone" value={heard} tone="bg-bone-100" />
          </div>

          <div className="mt-10 border-t border-bone-100/10 pt-8">
            <p className="display-tight text-3xl font-extrabold text-bone-50">{zone.t}</p>
            <p className="mt-3 max-w-xl leading-relaxed text-bone-300">{zone.d}</p>
          </div>

          <p className="mt-6 text-xs text-bone-500">A simple illustration of a trade-off. These bars are not measured data.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => askGenesis(`On the Futures page I set the "how fast should we go" slider to ${v}% (${zone.t}). In simple words, what are the good and bad sides of that pace?`)}>Talk it through with Genesis</Button>
            <Button href="/questions" variant="outline">Explore the big questions</Button>
          </div>
        </div>
      </div>
    </section>
  );
}