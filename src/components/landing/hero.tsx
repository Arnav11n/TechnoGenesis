"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KineticText } from "@/components/motion/kinetic-text";
import { Magnetic } from "@/components/motion/magnetic";
import { LiquidField } from "@/components/landing/liquid-field";

const disciplines = [
  { n: "01", title: "Artificial Intelligence", text: "Minds that learn, adapt and decide." },
  { n: "02", title: "Biotechnology", text: "Living systems, edited and designed." },
  { n: "03", title: "Robotics", text: "Bodies that sense, move and act." },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Only the background drifts as you scroll. The text never fades.
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);

  return (
    <section ref={ref} className="relative min-h-dvh overflow-hidden">
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="pointer-events-none absolute inset-0"
      >
        <LiquidField className="absolute inset-0" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink-950 to-transparent" />

      <div className="relative mx-auto flex min-h-dvh max-w-[93.75rem] flex-col justify-between px-6 pb-10 pt-28 md:px-14">
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Badge tone="lime">
              <span className="size-1.5 animate-pulse-slow rounded-full bg-lime-glow" />
              Vol. 01 — Emergence
            </Badge>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="hidden text-right font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.25em] text-bone-300 md:block"
          >
            Move your cursor
            <br />
            to bend the liquid
          </motion.p>
        </div>

        <div className="py-12">
          <h1 className="display-tight text-[clamp(3.6rem,14vw,14rem)] font-extrabold text-bone-50">
            <div>
              <KineticText text="A new kind" delay={0.2} />
            </div>
            <div className="ghost-text [--stroke:var(--bone-50)] md:ml-[10vw]">
              <KineticText text="of life is" delay={0.5} />
            </div>
            <div className="text-lime-glow md:ml-[3vw]">
              <KineticText text="assembling." delay={0.8} />
            </div>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.9 }}
            className="mt-10 flex flex-col gap-8 md:ml-[10vw] md:flex-row md:items-end md:gap-14"
          >
            <p className="max-w-md text-lg leading-relaxed text-bone-100/80">
              Artificial intelligence, biotechnology and robotics are no longer
              separate fields. Together they are producing systems that learn,
              grow and act. Scroll to watch one assemble.
            </p>

            <div className="flex flex-wrap gap-3">
              <Magnetic>
                <Button href="/demos" size="lg">
                  Enter the demos
                  <ArrowUpRight className="size-4" />
                </Button>
              </Magnetic>
              <Button href="/signup" variant="glass" size="lg">
                Create free account
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.9 }}
        >
          <div className="grid gap-px border-t border-bone-100/15 md:grid-cols-3">
            {disciplines.map((d) => (
              <div key={d.n} className="group flex items-start gap-5 py-6 md:pr-8">
                <span className="font-mono text-xs text-lime-glow">{d.n}</span>
                <div>
                  <p className="font-display text-xl font-semibold text-bone-50 transition-colors group-hover:text-lime-glow">
                    {d.title}
                  </p>
                  <p className="mt-1 text-sm text-bone-300">{d.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* spinning "scroll" badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="pointer-events-none absolute bottom-40 right-14 hidden size-32 md:block"
          aria-hidden
        >
          <svg viewBox="0 0 120 120" className="size-full animate-spin-slow">
            <defs>
              <path
                id="scroll-circle"
                d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
              />
            </defs>
            <text
              className="fill-bone-100 font-mono"
              style={{ fontSize: 8.5 }}
              textLength="285"
              lengthAdjust="spacing"
            >
              <textPath href="#scroll-circle" textLength="285" lengthAdjust="spacing">
                SCROLL TO ASSEMBLE · SCROLL TO ASSEMBLE ·
              </textPath>
            </text>
          </svg>
          <ArrowDown className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-lime-glow" />
        </motion.div>
      </div>
    </section>
  );
}