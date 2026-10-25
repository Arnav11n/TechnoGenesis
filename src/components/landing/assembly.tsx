"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { COUNTS, RobotViewport } from "@/components/landing/robot-viewport";

type P = MotionValue<number>;
type Range = [number, number];

type Stage = {
  n: string;
  tag: string;
  title: string;
  text: string;
  from: number;
  to: number;
  rail: string;
};

const STAGES: Stage[] = [
  {
    n: "01",
    tag: "Artificial intelligence",
    title: "It starts as a thought.",
    text: "A network of artificial neurons ignites and wires itself together. No body yet. Only the capacity to learn.",
    from: 0,
    to: 0.27,
    rail: "Mind",
  },
  {
    n: "02",
    tag: "Biotechnology",
    title: "Then it grows.",
    text: "Synthetic biology writes the living layer: a membrane, a genome, a core that beats.",
    from: 0.25,
    to: 0.52,
    rail: "Body",
  },
  {
    n: "03",
    tag: "Robotics",
    title: "Then it is built.",
    text: "Robotics gives the thought a skeleton: 17 plates and actuators that dock onto the body and move with intent.",
    from: 0.5,
    to: 0.82,
    rail: "Frame",
  },
  {
    n: "04",
    tag: "Emergence",
    title: "Then it moves.",
    text: "Where the three meet, something new begins. Not a machine. Not an animal. Something that learns, grows and acts.",
    from: 0.8,
    to: 1,
    rail: "Life",
  },
];

function Caption({ p, s }: { p: P; s: Stage }) {
  const first = s.from <= 0;
  const last = s.to >= 1;
  const input = [
    Math.max(0, s.from),
    first ? 0 : s.from + 0.05,
    last ? 1 : s.to - 0.04,
    Math.min(1, s.to),
  ];
  const opacity = useTransform(p, input, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(p, input, [first ? 0 : 40, 0, 0, last ? 0 : -40]);
  const blur = useTransform(p, input, [first ? 0 : 12, 0, 0, last ? 0 : 12]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.div style={{ opacity, y, filter }} className="col-start-1 row-start-1">
      <span className="ghost-text [--stroke:var(--lime-glow)] hidden font-display text-[clamp(4rem,9vw,8rem)] font-extrabold leading-none md:block">
        {s.n}
      </span>
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow md:mt-2">
        {s.n} / 04 — {s.tag}
      </p>
      <h2 className="display-tight mt-3 text-[clamp(2.2rem,5vw,4.8rem)] font-extrabold text-bone-50">
        {s.title}
      </h2>
      <p className="mt-4 max-w-md text-base leading-relaxed text-bone-300 md:text-lg">{s.text}</p>
    </motion.div>
  );
}

function Counter({ p, range, max, label }: { p: P; range: Range; max: number; label: string }) {
  const raw = useTransform(p, range, [0, max]);
  const text = useTransform(raw, (v) => String(Math.round(v)).padStart(2, "0"));
  return (
    <div>
      <motion.p className="font-display text-3xl font-bold tabular-nums text-bone-50">{text}</motion.p>
      <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-bone-500">{label}</p>
    </div>
  );
}

function RailSegment({ p, s }: { p: P; s: Stage }) {
  const scaleX = useTransform(p, [Math.max(0, s.from + 0.05), Math.min(1, s.to - 0.04)], [0, 1]);
  return (
    <div>
      <div className="h-1 overflow-hidden rounded-full bg-bone-100/10">
        <motion.div style={{ scaleX }} className="h-full origin-left bg-lime-glow" />
      </div>
      <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-bone-500">{s.rail}</p>
    </div>
  );
}

function Percent({ p }: { p: P }) {
  const text = useTransform(p, (v) => `${Math.round(v * 100)}%`);
  return (
    <motion.span className="font-mono text-[0.6875rem] tabular-nums tracking-[0.2em] text-bone-300">
      {text}
    </motion.span>
  );
}

export function Assembly() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} id="assembly" className="relative h-[640dvh]">
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden pt-20 md:pt-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_55%_at_75%_50%,rgb(var(--glow)/0.12),transparent)]" />

        <div className="relative mx-auto grid min-h-0 w-full max-w-[93.75rem] flex-1 grid-rows-[auto_1fr] gap-4 px-6 pb-6 md:grid-cols-[0.9fr_1.1fr] md:grid-rows-1 md:gap-10 md:px-14">
          {/* story */}
          <div className="flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-bone-500">
              <span>The assembly</span>
              <Percent p={p} />
            </div>

            <div className="grid">
              {STAGES.map((s) => (
                <Caption key={s.n} p={p} s={s} />
              ))}
            </div>

            <div className="hidden space-y-8 md:block">
              <div className="grid grid-cols-3 gap-6">
                <Counter p={p} range={[0.02, 0.2]} max={COUNTS.neurons} label="Neurons" />
                <Counter p={p} range={[0.38, 0.5]} max={COUNTS.basePairs} label="Base pairs" />
                <Counter p={p} range={[0.5, 0.78]} max={COUNTS.actuators} label="Actuators" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {STAGES.map((s) => (
                  <RailSegment key={s.n} p={p} s={s} />
                ))}
              </div>
            </div>
          </div>

          {/* the 3D viewport */}
          <div className="relative min-h-[18rem] md:min-h-0">
            <RobotViewport p={p} />
          </div>
        </div>
      </div>
    </section>
  );
}