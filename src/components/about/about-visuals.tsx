"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useScroll, useSpring } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Three orbits (mind, body, frame) circling one glowing core. */
export function OrbitDiagram() {
  const orbits = [
    { inset: "32%", d: 14, dot: "bg-lime-glow shadow-[0_0_22px_5px_rgb(var(--glow)/0.6)]", dash: false },
    { inset: "18%", d: 26, dot: "bg-copper-400 shadow-[0_0_20px_4px_rgba(227,154,99,0.55)]", dash: true },
    { inset: "3%", d: 42, dot: "bg-bone-100", dash: false },
  ];
  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-[30rem]" aria-hidden>
        <div className="absolute inset-[10%] rounded-full bg-lime-glow/10 blur-3xl" />
        {orbits.map((o, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{ inset: o.inset, borderStyle: o.dash ? "dashed" : "solid", borderColor: "var(--hairline)" }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: o.d, ease: "linear", repeat: Infinity }}
          >
            <span className={cn("absolute left-1/2 top-0 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full", o.dot)} />
            {i === 2 && (
              <span className="absolute bottom-0 left-1/2 size-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-bone-100/60" />
            )}
          </motion.div>
        ))}
        <motion.div
          className="absolute inset-[44%] rounded-full bg-lime-glow shadow-[0_0_70px_16px_rgb(var(--glow)/0.4)]"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
        />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-300">
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-lime-glow" /> Mind</span>
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-copper-400" /> Body</span>
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-bone-100" /> Frame</span>
      </div>
    </div>
  );
}

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>0</span>;
}

/** Counters. Every number is something you can actually find on this site. */
export function StatStrip({ items }: { items: { n: number; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-bone-100/10 bg-bone-100/10 md:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="bg-ink-950 p-8 text-center transition-colors hover:bg-ink-900">
          <p className="display-tight text-[clamp(3.4rem,7vw,6rem)] font-extrabold text-bone-50">
            <CountUp to={s.n} />
          </p>
          <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/** Steps joined by a line that draws itself as you scroll. */
export function ProcessSteps({ steps }: { steps: { n: string; title: string; text: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className="relative mx-auto max-w-[68.75rem]">
      <div className="absolute bottom-2 left-[1.1rem] top-2 w-px bg-bone-100/15 md:left-1/2" />
      <motion.div
        style={{ scaleY }}
        className="absolute bottom-2 left-[1.1rem] top-2 w-px origin-top bg-lime-glow md:left-1/2"
      />
      <div className="space-y-20">
        {steps.map((s, i) => (
          <Reveal key={s.n}>
            <div className="relative grid pl-14 md:grid-cols-2 md:pl-0">
              <span className="absolute left-0 top-0 grid size-9 place-items-center rounded-full bg-lime-glow font-mono text-xs font-bold text-ink-950 shadow-[0_0_20px_2px_rgb(var(--glow)/0.5)] md:left-1/2 md:-translate-x-1/2">
                {s.n}
              </span>
              <div className={i % 2 === 0 ? "md:pr-20 md:text-right" : "md:col-start-2 md:pl-20"}>
                <h3 className="display-tight text-4xl font-extrabold text-bone-50">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-bone-300">{s.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}