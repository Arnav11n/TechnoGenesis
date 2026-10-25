"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Headline where every letter slides up into place, then lights up on hover. */
export function KineticText({
  text,
  className,
  delay = 0,
  stagger = 0.03,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");

  return (
    <motion.span
      aria-label={text}
      className={cn("inline", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map((word, wi) => (
        <span
          key={wi}
          aria-hidden
          className="mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-bottom last:mr-0"
        >
          {word.split("").map((char, ci) => (
            <motion.span
              key={ci}
              className="inline-block transition-colors duration-300 hover:text-lime-glow"
              variants={{
                hidden: { y: "110%", rotate: 6 },
                show: {
                  y: "0%",
                  rotate: 0,
                  transition: { duration: 0.9, ease },
                },
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}