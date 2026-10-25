"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KineticText } from "@/components/motion/kinetic-text";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type Field = "ai" | "bio" | "robo";

type Zone = {
  id: string;
  fields: Field[];
  label: string;
  kicker: string;
  text: string;
  example: string;
};

const ZONES: Zone[] = [
  {
    id: "ai",
    fields: ["ai"],
    label: "Artificial intelligence",
    kicker: "The Mind",
    text: "Software that learns patterns from data and uses them to make predictions and decisions.",
    example: "Example: a neural network that learns to recognise images, speech or disease markers.",
  },
  {
    id: "bio",
    fields: ["bio"],
    label: "Biotechnology",
    kicker: "The Body",
    text: "Engineering living cells and molecules: reading, writing and editing DNA to give cells new abilities.",
    example: "Example: CRISPR gene editing and synthetic biology, where cells are programmed like machines.",
  },
  {
    id: "robo",
    fields: ["robo"],
    label: "Robotics",
    kicker: "The Frame",
    text: "Machines that sense the physical world, move through it and act on it.",
    example: "Example: robot arms in factories, drones, and walking robots with legs and sensors.",
  },
  {
    id: "ai-bio",
    fields: ["ai", "bio"],
    label: "AI × Biotech",
    kicker: "Designing life",
    text: "AI predicts how molecules fold and behave, so scientists can design proteins and medicines instead of guessing.",
    example: "Example: AlphaFold predicts 3D protein structures. Its creators shared the 2024 Nobel Prize in Chemistry.",
  },
  {
    id: "bio-robo",
    fields: ["bio", "robo"],
    label: "Biotech × Robotics",
    kicker: "Living machines",
    text: "Robots built from living tissue, and robots that automate the biology lab.",
    example: "Example: Xenobots, tiny programmable organisms assembled from frog cells (2020).",
  },
  {
    id: "ai-robo",
    fields: ["ai", "robo"],
    label: "AI × Robotics",
    kicker: "Embodied intelligence",
    text: "A learning system given a body: it perceives, plans and acts in the real world.",
    example: "Example: robots that learn tasks by watching demonstrations instead of being hand-programmed.",
  },
  {
    id: "all",
    fields: ["ai", "bio", "robo"],
    label: "All three together",
    kicker: "Emergence",
    text: "When learning, living and building combine, systems start to adapt, grow and act on their own. This is the idea behind the whole site.",
    example: "Example: self-driving labs, where AI plans experiments, robots run them and biology is the subject.",
  },
];

const CIRCLES: {
  id: Field;
  cx: number;
  cy: number;
  fill: string;
  stroke: string;
  name: string;
  tx: number;
  ty: number;
}[] = [
  { id: "ai", cx: 186, cy: 160, fill: "fill-lime-glow", stroke: "stroke-lime-glow", name: "AI", tx: 138, ty: 126 },
  { id: "bio", cx: 294, cy: 160, fill: "fill-copper-400", stroke: "stroke-copper-400", name: "BIO", tx: 342, ty: 126 },
  { id: "robo", cx: 240, cy: 252, fill: "fill-bone-100", stroke: "stroke-bone-100", name: "ROBOTICS", tx: 240, ty: 322 },
];

export function Convergence() {
  const [activeId, setActiveId] = useState("all");
  const zone = ZONES.find((z) => z.id === activeId) ?? ZONES[ZONES.length - 1];

  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-14 md:py-44">
      <div className="pointer-events-none absolute -left-40 top-1/3 size-[34rem] rounded-full bg-lime-glow/10 blur-[8.75rem]" />

      <div className="relative mx-auto max-w-[93.75rem]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">
          The convergence
        </p>
        <h2 className="display-tight mt-5 max-w-5xl text-[clamp(2.8rem,8vw,8rem)] font-extrabold text-bone-50">
          <KineticText text="Three fields." />{" "}
          <span className="ghost-text [--stroke:var(--lime-glow)]">
            <KineticText text="One organism." delay={0.3} />
          </span>
        </h2>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-300">
            Each field is powerful alone. The new possibilities appear where they
            overlap. Pick a field, or an overlap, and see what it makes possible.
          </p>
        </Reveal>

        <div className="mt-16 grid items-center gap-12 md:grid-cols-[1.05fr_1fr] md:gap-20">
          {/* diagram */}
          <Reveal>
            <div className="mx-auto w-full max-w-xl">
              <svg viewBox="0 0 480 400" className="w-full" role="img" aria-label="Venn diagram of AI, biotechnology and robotics">
                {CIRCLES.map((c) => {
                  const on = zone.fields.includes(c.id);
                  return (
                    <motion.circle
                      key={c.id}
                      cx={c.cx}
                      cy={c.cy}
                      r={104}
                      strokeWidth={1.5}
                      className={cn(c.fill, c.stroke)}
                      animate={{ fillOpacity: on ? 0.34 : 0.06, strokeOpacity: on ? 1 : 0.3 }}
                      transition={{ duration: 0.45 }}
                      style={{ cursor: "pointer" }}
                      onClick={() => setActiveId(c.id)}
                    />
                  );
                })}

                {CIRCLES.map((c) => (
                  <text
                    key={c.id}
                    x={c.tx}
                    y={c.ty}
                    textAnchor="middle"
                    className="pointer-events-none fill-bone-50 font-mono"
                    style={{ fontSize: 13, letterSpacing: "0.2em" }}
                  >
                    {c.name}
                  </text>
                ))}

                <motion.circle
                  cx={240}
                  cy={190}
                  r={6}
                  className="fill-bone-50"
                  animate={{ scale: zone.id === "all" ? [1, 1.8, 1] : 1 }}
                  transition={{ duration: 1.8, repeat: zone.id === "all" ? Infinity : 0 }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              </svg>
            </div>
          </Reveal>

          {/* explanation */}
          <div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a field or an overlap">
              {ZONES.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  aria-pressed={z.id === activeId}
                  onClick={() => setActiveId(z.id)}
                  onMouseEnter={() => setActiveId(z.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.18em] transition-all duration-300",
                    z.id === activeId
                      ? "border-lime-glow bg-lime-glow text-ink-950"
                      : "border-bone-100/20 text-bone-300 hover:border-lime-glow/60 hover:text-lime-glow",
                  )}
                >
                  {z.label}
                </button>
              ))}
            </div>

            <div className="mt-10 min-h-[22rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow">
                    {zone.kicker}
                  </p>
                  <h3 className="display-tight mt-3 text-[clamp(2rem,4vw,3.6rem)] font-extrabold text-bone-50">
                    {zone.label}
                  </h3>
                  <p className="mt-5 max-w-lg text-lg leading-relaxed text-bone-300">
                    {zone.text}
                  </p>
                  <p className="hairline mt-6 max-w-lg rounded-xl px-5 py-4 text-sm leading-relaxed text-bone-100">
                    {zone.example}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button href="/demos" variant="outline">
                        Open the AI × Biotech lab
                        <ArrowUpRight className="size-4" />
                      </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}