"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/demos/save-button";

type Card = {
  name: string;
  kind: string;
  mind: string;
  body: string;
  frame: string;
  power: string;
  weakness: string;
  real: string;
  mix: { ai: number; bio: number; robo: number };
};

const IDEAS = [
  "A tiny doctor that swims inside the blood",
  "A tree that cleans the air and charges phones",
  "A rescue animal-robot that finds people after earthquakes",
  "A garden helper that grows food on Mars",
  "A coral robot that cleans the ocean",
];

const SAMPLE: Card = {
  name: "Aquabot Coral",
  kind: "Ocean-cleaning living robot",
  mind: "A small AI brain that learns to tell plastic from sea life by looking and touching.",
  body: "Living coral skin that heals itself and grows together with the reef.",
  frame: "Soft robotic arms and tiny propellers that let it glide between the rocks.",
  power: "It collects tiny pieces of plastic and stores them safely inside itself.",
  weakness: "It needs clean, warm water and can lose its way in strong currents.",
  real: "Some robots already collect floating rubbish from harbours, and scientists are breeding corals that cope with warmer seas.",
  mix: { ai: 30, bio: 40, robo: 30 },
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A unique badge drawn from the creature's name. */
function Emblem({ name }: { name: string }) {
  const h = hash(name);
  const points = 5 + (h % 5);
  const inner = 22 + ((h >> 5) % 16);
  const dot = 7 + ((h >> 9) % 7);
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? 46 : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 120 120" className="size-28" aria-hidden>
      <circle cx={60} cy={60} r={57} fill="none" strokeWidth={1} strokeDasharray="2 5" className="stroke-lime-glow/60" />
      <polygon points={pts.join(" ")} strokeWidth={2} strokeLinejoin="round" className="fill-lime-glow/15 stroke-lime-glow" />
      <circle cx={60} cy={60} r={dot} className="fill-copper-400" />
    </svg>
  );
}

function CardView({ card }: { card: Card }) {
  const m = card.mix;
  const rows = [
    { k: "Mind · AI", v: card.mind, c: "text-lime-glow" },
    { k: "Body · Biotech", v: card.body, c: "text-copper-400" },
    { k: "Frame · Robotics", v: card.frame, c: "text-bone-50" },
  ];

  return (
    <div style={{ perspective: 1200 }} className="mx-auto w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, rotateY: 80, scale: 0.9 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl bg-gradient-to-br from-lime-glow via-copper-400 to-lime-glow p-[2px]"
      >
        <div className="rounded-[22px] bg-ink-900 p-6">
          <div className="flex flex-col items-center text-center">
            <Emblem name={card.name} />
            <h3 className="display-tight mt-3 break-words text-4xl font-extrabold text-bone-50">{card.name}</h3>
            <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">{card.kind}</p>
          </div>

          <div className="mt-6">
            <div className="flex h-2 overflow-hidden rounded-full">
              <div className="bg-lime-glow" style={{ width: `${m.ai}%` }} />
              <div className="bg-copper-400" style={{ width: `${m.bio}%` }} />
              <div className="bg-bone-100" style={{ width: `${m.robo}%` }} />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[0.625rem] uppercase tracking-[0.15em]">
              <span className="text-lime-glow">AI {m.ai}%</span>
              <span className="text-copper-400">Bio {m.bio}%</span>
              <span className="text-bone-100">Robot {m.robo}%</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {rows.map((r) => (
              <div key={r.k}>
                <p className={`font-mono text-[0.625rem] uppercase tracking-[0.25em] ${r.c}`}>{r.k}</p>
                <p className="mt-1 text-sm leading-relaxed text-bone-100">{r.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-lime-glow/40 bg-lime-glow/[0.06] p-3">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-lime-glow">Superpower</p>
              <p className="mt-1 text-sm text-bone-100">{card.power}</p>
            </div>
            <div className="rounded-xl border border-copper-400/40 bg-copper-400/[0.06] p-3">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-copper-400">Weakness</p>
              <p className="mt-1 text-sm text-bone-100">{card.weakness}</p>
            </div>
          </div>

          <p className="hairline mt-4 rounded-xl p-3 text-xs leading-relaxed text-bone-300">
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-bone-50">Closest real thing today · </span>
            {card.real}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function CreatureDesigner() {
  const [idea, setIdea] = useState("");
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(text: string) {
    const t = text.trim();
    if (t.length < 3 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "creature", idea: t }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.card) throw new Error(data.error ?? "Something went wrong.");
      setCard(data.card as Card);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the AI.");
    } finally {
      setLoading(false);
    }
  }

  function surprise() {
    const pick = IDEAS[Math.floor(Math.random() * IDEAS.length)];
    setIdea(pick);
    create(pick);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-lime-glow/30 bg-lime-glow/[0.06] p-5">
          <p className="font-display text-xl font-bold leading-snug text-bone-100">
            Describe a creature that is part AI, part living and part robot. An AI will turn your idea into a trading
            card.
          </p>
        </div>

        <div>
          <label
            htmlFor="idea"
            className="mb-2 block font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow"
          >
            1 · Your idea
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="For example: a tiny doctor that swims inside the blood"
            className="w-full resize-none rounded-xl border border-bone-100/15 bg-ink-800/60 px-4 py-3 text-bone-50 outline-none transition-all placeholder:text-bone-500 focus:border-lime-glow focus:ring-4 focus:ring-lime-glow/10"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {IDEAS.slice(0, 3).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setIdea(s)}
                className="rounded-full border border-bone-100/20 px-3 py-1.5 text-left text-xs text-bone-300 transition-colors hover:border-lime-glow/60 hover:text-lime-glow"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={() => create(idea)} loading={loading} disabled={idea.trim().length < 3}>
            {!loading && <Sparkles className="size-4" />}
            {loading ? "Growing your creature" : "Create my creature"}
          </Button>
          <Button variant="outline" size="lg" onClick={surprise} disabled={loading}>
            <Shuffle className="size-4" /> Surprise me
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-200">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setCard(SAMPLE);
              }}
              className="mt-2 text-lime-glow underline-offset-4 hover:underline"
            >
              Show a sample card instead
            </button>
          </div>
        )}
      </div>

      <div className="min-h-[24rem]">
        {card && !loading ? (
          <div key={card.name + card.kind}>
            <CardView card={card} />
            <div className="mt-5 flex justify-center">
              <SaveButton data={{ kind: "creature", card }} />
            </div>
          </div>
        ) : (
          <div className="hairline grid h-full min-h-[24rem] place-items-center rounded-3xl p-8 text-center">
            <div>
              <Sparkles className={`mx-auto size-8 text-lime-glow ${loading ? "animate-pulse-slow" : ""}`} />
              <p className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-bone-300">
                {loading ? "Growing your creature..." : "Your card appears here"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}