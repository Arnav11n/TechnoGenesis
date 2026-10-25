"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { OptionalMedia } from "@/components/ui/optional-media";
import { cn } from "@/lib/utils";

type Layer = "Mind" | "Body" | "Frame" | "All three";

type Ev = {
  id: string;
  big: string;
  when: string;
  title: string;
  who: string;
  text: string;
  why: string;
  layer: Layer;
};

const EVENTS: Ev[] = [
  { id: "first-cells", big: "3.5B", when: "Over 3.5 billion years ago", title: "The first cells", who: "Single-celled organisms", text: "Life began as tiny cells floating in water. Each one carried a molecule that stored instructions and could be copied.", why: "Every living thing since, including you, comes from cells like these.", layer: "Body" },
  { id: "mendel", big: "1865", when: "1865", title: "Mendel finds the rules of inheritance", who: "Gregor Mendel, a monk and scientist", text: "By growing thousands of pea plants and counting traits like tall or short, he showed that traits are passed on in separate units. We now call them genes.", why: "It started the science of genetics.", layer: "Body" },
  { id: "turing", big: "1950", when: "1950", title: "Can machines think?", who: "Alan Turing", text: "Turing asked this question in a famous paper. He proposed a test where a person chats with a hidden partner and tries to guess whether it is a human or a machine.", why: "It set the dream that later became artificial intelligence.", layer: "Mind" },
  { id: "helix", big: "1953", when: "1953", title: "The double helix", who: "Watson and Crick, using X-ray evidence from Rosalind Franklin, Raymond Gosling and Maurice Wilkins", text: "DNA looks like a twisted ladder. The rungs are pairs of letters: A always pairs with T, and G with C. Because of this pairing, DNA can copy itself.", why: "It explained how life stores and copies its instructions.", layer: "Body" },
  { id: "unimate", big: "1961", when: "1961", title: "The first factory robot", who: "George Devol and Joseph Engelberger", text: "A robot arm called Unimate started work on a General Motors factory line, lifting and stacking hot metal parts that were dangerous for people.", why: "Robots moved from stories into real workplaces.", layer: "Frame" },
  { id: "recombinant", big: "1973", when: "1973", title: "The first genetic engineering", who: "Stanley Cohen and Herbert Boyer", text: "They cut a piece of DNA, pasted it into a bacterium, and the bacterium used it. Moving genes between living things became possible.", why: "It led to medicines such as human insulin made by bacteria.", layer: "Body" },
  { id: "sanger", big: "1977", when: "1977", title: "Reading DNA letters", who: "Frederick Sanger", text: "His method let scientists find the exact order of the letters in a piece of DNA, like reading a sentence one letter at a time.", why: "Reading DNA became possible.", layer: "Body" },
  { id: "dolly", big: "1996", when: "1996", title: "Dolly the sheep", who: "Ian Wilmut, Keith Campbell and the Roslin Institute team", text: "Dolly was the first mammal cloned from an adult cell. The centre of an adult cell was moved into an egg cell, and she grew up as a genetic copy.", why: "It showed that adult cells still carry the full set of instructions.", layer: "Body" },
  { id: "genome", big: "2003", when: "1990 to 2003", title: "The human genome is read", who: "Thousands of scientists around the world", text: "The Human Genome Project read the whole human instruction book: about 3 billion letters of DNA. It took 13 years of teamwork.", why: "Today a genome can be read in about a day.", layer: "Body" },
  { id: "crispr", big: "2012", when: "2012", title: "CRISPR gene editing", who: "Jennifer Doudna, Emmanuelle Charpentier and colleagues", text: "They showed that a defence system from bacteria can be programmed to cut DNA at an exact spot. It works like find and replace for genes.", why: "Editing became fast, cheap and precise. It won the 2020 Nobel Prize in Chemistry.", layer: "Body" },
  { id: "xenobots", big: "2020", when: "2020", title: "Xenobots: living robots", who: "Sam Kriegman, Josh Bongard, Michael Levin, Douglas Blackiston and colleagues", text: "A computer designed tiny machines, and scientists built them from frog cells. They can move, push particles around and heal after being cut.", why: "They sit between machine and animal, the exact space this site explores.", layer: "All three" },
  { id: "alphafold", big: "2020", when: "2020", title: "AI predicts protein shapes", who: "DeepMind, including Demis Hassabis and John Jumper", text: "A protein's shape decides what it does. AlphaFold predicted shapes from amino-acid chains with very high accuracy, a puzzle scientists had worked on for about 50 years.", why: "It shared the 2024 Nobel Prize in Chemistry with David Baker. AI and biology merged.", layer: "Mind" },
  { id: "casgevy", big: "2023", when: "2023", title: "The first CRISPR medicine", who: "Regulators in the UK and the US", text: "A CRISPR-based treatment for sickle cell disease was approved, the first gene-editing medicine to reach patients.", why: "Gene editing moved from the lab into the hospital.", layer: "Body" },
];

const STYLE: Record<Layer, { chip: string; dot: string; stroke: string }> = {
  Mind: { chip: "border-lime-glow/50 bg-lime-glow/10 text-lime-glow", dot: "bg-lime-glow", stroke: "var(--lime-glow)" },
  Body: { chip: "border-copper-400/50 bg-copper-400/10 text-copper-400", dot: "bg-copper-400", stroke: "var(--copper-400)" },
  Frame: { chip: "border-bone-100/40 bg-bone-100/10 text-bone-50", dot: "bg-bone-100", stroke: "var(--bone-100)" },
  "All three": { chip: "border-lime-glow/50 bg-gradient-to-r from-lime-glow/15 to-copper-400/15 text-bone-50", dot: "bg-gradient-to-br from-lime-glow to-copper-400", stroke: "var(--lime-glow)" },
};

type P = MotionValue<number>;

function Slide({ p, i, n, ev }: { p: P; i: number; n: number; ev: Ev }) {
  const w = 1 / n;
  const s = i * w;
  const e = s + w;
  const first = i === 0;
  const last = i === n - 1;
  const input = [s, first ? s : s + w * 0.22, last ? e : e - w * 0.22, e];
  const opacity = useTransform(p, input, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(p, input, [first ? 0 : 70, 0, 0, last ? 0 : -70]);
  const bigX = useTransform(p, input, [first ? 0 : -120, 0, 0, last ? 0 : 120]);
  const filter = useTransform(opacity, (o) => `blur(${(1 - o) * 12}px)`);
  const st = STYLE[ev.layer];

  return (
    <motion.div
      // FIXED: Adding z: 0.01 forces the browser to maintain the hardware-accelerated 
      // layer permanently, preventing the "snap" to transparency when it stabilizes.
      style={{ opacity, filter, z: 0.01 }}
      className="pointer-events-none absolute inset-0 grid items-center gap-6 px-6 pb-44 pt-28 md:grid-cols-[1fr_1.05fr] md:gap-12 md:px-14"
    >
      <OptionalMedia src={`/images/timeline/${ev.id}.jpg`} className="opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/20 to-ink-950/85" />
      <div style={{ "--stroke": st.stroke } as React.CSSProperties}>
        <motion.p
          style={{ x: bigX, z: 0.01 }} // Force 3D transform
          className="ghost-text display-tight select-none text-[clamp(4.5rem,15vw,14rem)] font-extrabold"
        >
          {ev.big}
        </motion.p>
      </div>

      <motion.div style={{ y, z: 0.01 }} className="glass max-w-xl rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn("rounded-full border px-3 py-1 font-mono text-[0.625rem] uppercase tracking-[0.2em]", st.chip)}>
            {ev.layer}
          </span>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-500">{ev.when}</span>
        </div>
        <h3 className="display-tight mt-4 text-[clamp(1.8rem,3.4vw,3.2rem)] font-extrabold text-bone-50">{ev.title}</h3>
        <p className="mt-2 font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.15em] text-copper-400">{ev.who}</p>
        <p className="mt-4 leading-relaxed text-bone-100">{ev.text}</p>
        <p className="mt-4 border-t border-bone-100/10 pt-4 text-sm leading-relaxed text-bone-300">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-lime-glow">Why it matters · </span>
          {ev.why}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function LifeTimeline() {
  const ref = useRef<HTMLElement>(null);
  const n = EVENTS.length;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(p, "change", (v) => setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n)))));

  const fill = useSpring(p, { stiffness: 120, damping: 30 });
  const copperGlow = useTransform(p, [0, 1], [1, 0]);
  const limeGlow = useTransform(p, [0, 1], [0, 1]);
  const ring = useTransform(p, [0, 1], [0, 540]);
  const ring2 = useTransform(p, [0, 1], [0, -360]);

  function jump(i: number) {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / n) * total, behavior: "smooth" });
  }

  return (
    // FIXED: Added the missing asterisk for multiplication (n * 85)
    <section ref={ref} className="relative" style={{ height: `${n * 85 + 100}dvh` }}>
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* the colour of time: copper (ancient) to lime (modern) */}
        <motion.div style={{ opacity: copperGlow }} className="pointer-events-none absolute -right-20 top-1/4 size-[46rem] rounded-full bg-copper-400/20 blur-[9.375rem]" />
        
        {/* Rest of your component code stays exactly the same below... */}
        <motion.div style={{ opacity: limeGlow }} className="pointer-events-none absolute -right-20 top-1/4 size-[46rem] rounded-full bg-lime-glow/20 blur-[9.375rem]" />
        <motion.div style={{ rotate: ring }} className="pointer-events-none absolute -left-[18rem] top-1/2 size-[44rem] -translate-y-1/2 rounded-full border border-dashed border-bone-100/15" />
        <motion.div style={{ rotate: ring2 }} className="pointer-events-none absolute -left-[12rem] top-1/2 size-[32rem] -translate-y-1/2 rounded-full border border-bone-100/10" />

        {/* top readout */}
        <div className="absolute inset-x-0 top-20 z-10 mx-auto flex max-w-[93.75rem] items-center justify-between px-6 font-mono text-[0.6875rem] uppercase tracking-[0.3em] md:px-14">
          <span className="text-lime-glow">The timeline of life</span>
          <span className="tabular-nums text-bone-300">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
        </div>

        {EVENTS.map((ev, i) => (
          <Slide key={ev.id} p={p} i={i} n={n} ev={ev} />
        ))}
        
        {/* bottom rail */}
        <div className="absolute inset-x-0 bottom-6 z-10 mx-auto max-w-[93.75rem] px-6 md:px-14">
          <div className="relative">
            <div className="absolute inset-x-1.5 top-[0.35rem] h-px bg-bone-100/15" />
            <motion.div style={{ scaleX: fill }} className="absolute inset-x-1.5 top-[0.35rem] h-px origin-left bg-lime-glow" />
            <div className="relative flex justify-between">
              {EVENTS.map((ev, i) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => jump(i)}
                  aria-label={`${ev.when}: ${ev.title}`}
                  className="group flex flex-col items-center gap-2"
                >
                  <span
                    className={cn(
                      "size-3 rounded-full border-2 border-ink-950 transition-all duration-300",
                      STYLE[ev.layer].dot,
                      i === active ? "scale-[1.8] shadow-[0_0_16px_3px_rgb(var(--glow)/0.6)]" : i < active ? "opacity-100" : "opacity-35",
                    )}
                  />
                  <span className={cn("hidden font-mono text-[0.5625rem] tracking-[0.1em] transition-colors lg:block", i === active ? "text-lime-glow" : "text-bone-500")}>
                    {ev.big}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-bone-500">
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-lime-glow" /> Mind</span>
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-copper-400" /> Body</span>
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-bone-100" /> Frame</span>
          </div>
        </div>
      </div>
    </section>
  );
}