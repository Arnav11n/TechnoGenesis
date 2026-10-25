"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

function Word({
  word,
  p,
  start,
  end,
  accent,
}: {
  word: string;
  p: MotionValue<number>;
  start: number;
  end: number;
  accent: boolean;
}) {
  const opacity = useTransform(p, [start, end], [0.12, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className={accent ? "mr-[0.25em] inline-block text-lime-glow" : "mr-[0.25em] inline-block"}
    >
      {word}
    </motion.span>
  );
}

/** Text that lights up word by word as you scroll. Put * after a word to make it lime. */
export function Manifesto({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.55"],
  });

  const words = text.split(" ");
  const n = words.length;

  return (
    <p
      ref={ref}
      className="display-tight text-[clamp(2rem,5.2vw,5rem)] font-extrabold leading-[1.02] text-bone-50"
    >
      {words.map((raw, i) => {
        const accent = raw.endsWith("*");
        const start = i / n;
        const end = Math.min(1, start + 2 / n);
        return (
          <Word
            key={i}
            word={accent ? raw.slice(0, -1) : raw}
            p={scrollYProgress}
            start={start}
            end={end}
            accent={accent}
          />
        );
      })}
    </p>
  );
}