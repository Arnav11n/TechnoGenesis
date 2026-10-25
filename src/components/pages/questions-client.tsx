"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askGenesis } from "@/lib/genesis";
import { KineticText } from "@/components/motion/kinetic-text";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  {
    short: "Editing genes",
    q: "Should we be allowed to edit human genes?",
    intro: "Tools like CRISPR can already change DNA. The first CRISPR medicine, for sickle cell disease, was approved in 2023.",
    aLabel: "The hopeful case",
    a: "Editing could cure inherited diseases that cause great suffering, and it can be tested carefully before reaching patients.",
    bLabel: "The worry",
    b: "Edits to eggs or embryos are passed to future generations who cannot agree to them. Treatments may be expensive, and edits can sometimes hit the wrong spot in the DNA.",
  },
  {
    short: "Living machines",
    q: "Can a machine be alive?",
    intro: "Scientists have built Xenobots, tiny programmable creatures assembled from frog cells. They sit between machine and animal.",
    aLabel: "Yes, in some sense",
    a: "Life is often described as growing, reacting to the world, using energy and adapting. Living machines may meet some of these tests.",
    bLabel: "Not really",
    b: "Others argue that life needs more, such as reproducing and evolving by itself. A built thing with living parts may still be a tool, not a creature.",
  },
  {
    short: "AI mistakes",
    q: "Who is responsible when an AI makes a mistake?",
    intro: "AI systems now help with medicine, driving and hiring. When they get something wrong, someone has to answer for it.",
    aLabel: "The builders",
    a: "The people who design and train a system know its limits best, so they should make it safe and honest about what it cannot do.",
    bLabel: "The users",
    b: "The people who choose to rely on a system in a real situation decide how it is used, so they must check its work and stay in charge.",
  },
  {
    short: "Jobs",
    q: "Will AI and robots take people's jobs?",
    intro: "New machines have changed work many times before, from farm tools to computers.",
    aLabel: "New jobs appear",
    a: "In the past, technology removed some jobs and created others. Machines can take over dull or dangerous tasks and free people for better ones.",
    bLabel: "Change can be too fast",
    b: "Even if new jobs appear, people may need years to retrain, and the change can be hard on workers in the meantime.",
  },
  {
    short: "Building life",
    q: "Is it okay to build living machines?",
    intro: "Engineering living cells could clean pollution or deliver medicine from inside the body.",
    aLabel: "It could help a lot",
    a: "Tiny living tools might do jobs no metal machine can, with strict safety rules and testing at every step.",
    bLabel: "It needs caution",
    b: "Living things can spread and change in ways that are hard to predict, so careful limits and oversight matter.",
  },
  {
    short: "AI medicine",
    q: "Should AI design medicines without people checking?",
    intro: "AlphaFold showed that AI can predict protein shapes. That helps scientists design new medicines faster.",
    aLabel: "Speed saves lives",
    a: "AI can search millions of options far faster than a human team, which could bring treatments sooner.",
    bLabel: "Checking still matters",
    b: "AI can sound confident and still be wrong. Lab tests and clinical trials with human experts protect patients.",
  },
];

function visitorId() {
  try {
    let id = localStorage.getItem("tg-visitor");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("tg-visitor", id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2, 12);
  }
}

function saveAnswer(question: number, choice: 0 | 1) {
  fetch("/api/survey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId: visitorId(), question, choice }),
  }).catch(() => {});
}

type Choice = 0 | 1 | null;

function buildGenesisPrompt(choices: Choice[]) {
  const parts: string[] = [];
  let hopeful = 0;
  let careful = 0;
  choices.forEach((c, k) => {
    if (c === null) return;
    if (c === 0) hopeful++;
    else careful++;
    parts.push(QUESTIONS[k].short + ": " + (c === 0 ? "hopeful" : "careful"));
  });
  if (parts.length === 0) {
    return "I am looking at the Big Questions page. Which of the six questions is the hardest, and why?";
  }
  const lean = hopeful > careful ? "hopeful" : careful > hopeful ? "careful" : "evenly balanced";
  return (
    "On the Big Questions page I answered: " + parts.join(", ") + ". Overall I lean " + lean +
    ". Can you challenge my thinking with one good question?"
  ).slice(0, 480);
}


/** A scale that tips toward the side you choose. */
function Balance({ choice }: { choice: Choice }) {
  const target = choice === 0 ? -14 : choice === 1 ? 14 : 0;
  const ang = useSpring(0, { stiffness: 70, damping: 9 });
  useEffect(() => {
    ang.set(target);
  }, [target, ang]);
  const rightY = useTransform(ang, (a) => `${7 * Math.sin((a * Math.PI) / 180)}rem`);
  const leftY = useTransform(ang, (a) => `${-7 * Math.sin((a * Math.PI) / 180)}rem`);

  const pan = (side: "l" | "r") => (
    <motion.div
      style={{ y: side === "l" ? leftY : rightY }}
      className="absolute top-[3.1rem] -translate-x-1/2"
      // pans hang from the ends of the beam
    >
      <div className="mx-auto h-14 w-24" style={{ borderLeft: "1px solid var(--hairline)", width: 0 }} />
      <div
        className={cn(
          "-ml-12 mt-0 grid h-10 w-24 place-items-center rounded-b-full border-x border-b font-mono text-[0.625rem] uppercase tracking-[0.15em]",
          side === "l" ? "border-lime-glow bg-lime-glow/20 text-lime-glow" : "border-copper-400 bg-copper-400/20 text-copper-400",
        )}
      >
        {side === "l" ? "Hopeful" : "Careful"}
      </div>
    </motion.div>
  );

  return (
    <div className="relative mx-auto h-64 w-[20rem] max-w-full" aria-hidden>
      <div className="absolute bottom-0 left-1/2 h-[13rem] w-1.5 -translate-x-1/2 rounded bg-bone-100/30" />
      <div className="absolute bottom-0 left-1/2 h-1.5 w-32 -translate-x-1/2 rounded bg-bone-100/30" />
      <motion.div
        style={{ rotate: ang }}
        className="absolute left-[15%] top-[3rem] h-1.5 w-[70%] rounded-full bg-bone-100"
      />
      <div className="absolute left-1/2 top-[2.65rem] size-4 -translate-x-1/2 rounded-full bg-lime-glow shadow-[0_0_16px_3px_rgb(var(--glow)/0.6)]" />
      <div className="absolute left-[15%]">{pan("l")}</div>
      <div className="absolute left-[85%]">{pan("r")}</div>
    </div>
  );
}

function Floaters() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] overflow-hidden" aria-hidden>
      {[
        { l: "8%", t: "12%", s: "11rem", d: 9 },
        { l: "78%", t: "6%", s: "16rem", d: 12 },
        { l: "52%", t: "46%", s: "9rem", d: 10 },
      ].map((f, i) => (
        <motion.span
          key={i}
          className="ghost-text [--stroke:var(--lime-glow)] absolute font-display font-extrabold opacity-25"
          style={{ left: f.l, top: f.t, fontSize: f.s }}
          animate={{ y: [0, -28, 0], rotate: [-6, 6, -6] }}
          transition={{ duration: f.d, repeat: Infinity, ease: "easeInOut" }}
        >
          ?
        </motion.span>
      ))}
    </div>
  );
}

export function QuestionsClient() {
  const [i, setI] = useState(0);
  const [choices, setChoices] = useState<Choice[]>(QUESTIONS.map(() => null));
  const [showSummary, setShowSummary] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const lastKey = useRef(`${i}-${showSummary}`);
  useEffect(() => {
    const key = `${i}-${showSummary}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    const t = setTimeout(() => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    return () => clearTimeout(t);
  }, [i, showSummary]);

  const item = QUESTIONS[i];
  const choice = choices[i];
  const answered = choices.filter((c) => c !== null).length;
  const hopeful = choices.filter((c) => c === 0).length;
  const careful = choices.filter((c) => c === 1).length;

  function pick(c: 0 | 1) {
    saveAnswer(i, c);
    setChoices((prev) => prev.map((v, k) => (k === i ? c : v)));
  }

  const card = (side: 0 | 1) => {
    const label = side === 0 ? item.aLabel : item.bLabel;
    const text = side === 0 ? item.a : item.b;
    const on = choice === side;
    const dim = choice !== null && !on;
    const tone = side === 0 ? "lime-glow" : "copper-400";
    return (
      <motion.button
        type="button"
        onClick={() => pick(side)}
        aria-pressed={on}
        whileHover={{ y: -4 }}
        animate={{ opacity: dim ? 0.45 : 1, scale: on ? 1.02 : 1 }}
        className={cn(
          "relative rounded-2xl border p-6 text-left transition-colors",
          side === 0
            ? on ? "border-lime-glow bg-lime-glow/15" : "border-lime-glow/40 bg-lime-glow/[0.04]"
            : on ? "border-copper-400 bg-copper-400/15" : "border-copper-400/40 bg-copper-400/[0.04]",
        )}
      >
        <p className={`font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-${tone}`}>{label}</p>
        <p className="mt-3 leading-relaxed text-bone-100">{text}</p>
        <p className={cn("mt-5 flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em]", `text-${tone}`)}>
          {on ? <><Check className="size-4" /> You lean this way</> : "I lean this way"}
        </p>
      </motion.button>
    );
  };

  return (
    <section className="relative px-6 pb-32 md:px-14">
      <Floaters />
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute left-1/2 top-40 size-[40rem] -translate-x-1/2 rounded-full blur-[10rem]"
        style={{ background: i % 2 === 0 ? "rgb(var(--glow) / 0.12)" : "rgba(227,154,99,0.12)" }}
      />

      <div className="relative mx-auto grid max-w-[87.5rem] gap-10 lg:grid-cols-[17rem_1fr]">
        {/* question list */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow">
            {answered} of {QUESTIONS.length} considered
          </p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-bone-100/10">
            <motion.div
              className="h-full bg-lime-glow"
              animate={{ width: `${(answered / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <ul className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible" data-lenis-prevent>
            {QUESTIONS.map((x, k) => (
              <li key={x.q} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setI(k);
                    setShowSummary(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                    k === i && !showSummary
                      ? "border-lime-glow bg-lime-glow text-ink-950"
                      : "border-bone-100/15 text-bone-300 hover:border-lime-glow/60",
                  )}
                >
                  <span className="font-mono text-xs">{String(k + 1).padStart(2, "0")}</span>
                  <span className="flex-1 whitespace-nowrap lg:whitespace-normal">{x.short}</span>
                  {choices[k] !== null && <Check className="size-4" />}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* stage */}
        <div ref={stageRef} className="min-h-[40rem] scroll-mt-28">
          <AnimatePresence mode="wait">
            {!showSummary ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">
                  Question {i + 1} of {QUESTIONS.length}
                </p>
                <h2 className="display-tight mt-4 text-[clamp(2.2rem,5vw,4.6rem)] font-extrabold text-bone-50">
                  <KineticText text={item.q} stagger={0.012} />
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-bone-300">{item.intro}</p>

                <div className="mt-8">
                  <Balance choice={choice} />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {card(0)}
                  {card(1)}
                </div>
                <p className="mt-4 text-sm text-bone-500">
                  Both sides are views that thoughtful people hold. Pick the one you lean toward, and watch the scale.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <Button variant="outline" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>
                    <ArrowLeft className="size-4" /> Previous
                  </Button>
                  {i < QUESTIONS.length - 1 ? (
                    <Button onClick={() => setI((v) => v + 1)}>
                      Next question <ArrowRight className="size-4" />
                    </Button>
                  ) : (
                    <Button onClick={() => setShowSummary(true)} disabled={answered === 0}>
                      See how I think <ArrowRight className="size-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="summary"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-3xl p-8 md:p-12"
              >
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">Your thinking</p>
                <h2 className="display-tight mt-4 text-[clamp(2.4rem,5vw,4.4rem)] font-extrabold text-bone-50">
                  {hopeful > careful ? "You lean hopeful." : careful > hopeful ? "You lean careful." : "You are perfectly balanced."}
                </h2>
                <div className="mt-8 flex h-4 overflow-hidden rounded-full bg-bone-100/10">
                  <motion.div className="bg-lime-glow" initial={{ width: 0 }} animate={{ width: `${(hopeful / Math.max(1, answered)) * 100}%` }} transition={{ duration: 0.9 }} />
                  <motion.div className="bg-copper-400" initial={{ width: 0 }} animate={{ width: `${(careful / Math.max(1, answered)) * 100}%` }} transition={{ duration: 0.9 }} />
                </div>
                <div className="mt-3 flex justify-between font-mono text-[0.6875rem] uppercase tracking-[0.2em]">
                  <span className="text-lime-glow">Hopeful · {hopeful}</span>
                  <span className="text-copper-400">Careful · {careful}</span>
                </div>
                <p className="mt-8 max-w-xl leading-relaxed text-bone-300">
                  Neither answer is wrong. Good decisions about new technology usually need both: the hope to build
                  useful things and the care to check them. Want to explore a question further?
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={() => askGenesis(buildGenesisPrompt(choices))}>Talk it through with Genesis</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setChoices(QUESTIONS.map(() => null));
                      setI(0);
                      setShowSummary(false);
                    }}
                  >
                    Start again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}