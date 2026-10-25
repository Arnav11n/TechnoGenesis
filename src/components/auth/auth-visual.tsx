"use client";

import { motion } from "framer-motion";
import { LiquidField } from "@/components/landing/liquid-field";

const rings = [
  { size: 220, duration: 38, dots: 1, dashed: false },
  { size: 340, duration: 56, dots: 2, dashed: true },
  { size: 470, duration: 80, dots: 3, dashed: false },
  { size: 610, duration: 110, dots: 2, dashed: true },
];

export function AuthVisual() {
  return (
    <div className="relative flex h-full min-h-dvh flex-col justify-between overflow-hidden bg-ink-900 p-12">
      {/* the same liquid as the home page, in the current theme */}
      <LiquidField className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-ink-950/40" />

      {/* orbiting rings, like a cell under a microscope */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {rings.map((ring, i) => (
          <motion.div
            key={ring.size}
            className="absolute rounded-full"
            style={{
              width: ring.size,
              height: ring.size,
              left: "50%",
              top: "46%",
              marginLeft: -ring.size / 2,
              marginTop: -ring.size / 2,
              border: ring.dashed
                ? "1px dashed rgb(var(--glow) / 0.5)"
                : "1px solid var(--hairline)",
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: ring.duration, ease: "linear", repeat: Infinity }}
          >
            {Array.from({ length: ring.dots }).map((_, d) => (
              <span
                key={d}
                className="absolute inset-0"
                style={{ transform: `rotate(${(360 / ring.dots) * d}deg)` }}
              >
                <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-glow shadow-[0_0_16px_3px_rgb(var(--glow)/0.6)]" />
              </span>
            ))}
          </motion.div>
        ))}

        {/* glowing core */}
        <motion.div
          className="absolute left-1/2 top-[46%] -ml-8 -mt-8 size-16 rounded-full bg-lime-glow shadow-[0_0_80px_20px_rgb(var(--glow)/0.35)]"
          animate={{ scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
        />
      </div>

      <div className="relative font-mono text-xs uppercase tracking-[0.3em] text-bone-300">
        TechnoGenesis / Access
      </div>

      <div className="relative max-w-md">
        <p className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-bone-50">
          Life is no longer only grown. It is also{" "}
          <span className="text-lime-glow">trained, printed and built.</span>
        </p>
        <p className="mt-6 text-sm leading-relaxed text-bone-300">
          An account saves your neural-network experiments, robot builds and
          bookmarked milestones, so you can pick up where you left off.
        </p>
      </div>
    </div>
  );
}