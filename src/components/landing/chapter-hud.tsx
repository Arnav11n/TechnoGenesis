"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/+*";

/** Letters scramble, then settle on the new word. */
function Scramble({ text }: { text: string }) {
  const [out, setOut] = useState(text);

  useEffect(() => {
    const total = 18;
    let frame = 0;
    let last = 0;
    let raf = 0;
    const run = (now: number) => {
      if (now - last > 35) {
        last = now;
        frame++;
        const reveal = Math.floor((frame / total) * text.length);
        setOut(
          text
            .split("")
            .map((c, i) => (c === " " || i < reveal ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(""),
        );
      }
      if (frame < total) raf = requestAnimationFrame(run);
      else setOut(text);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return <>{out}</>;
}

/** A rail fixed to the right edge that follows you down the page and changes. */
export function ChapterHud({ chapters }: { chapters: { id: string; label: string }[] }) {
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      let idx = 0;
      chapters.forEach((c, i) => {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) idx = i;
      });
      setActive(idx);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [chapters]);

  const n = chapters.length;

  return (
    <div className="glass fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-5 rounded-full px-2 py-5 lg:flex">
      <p className="rotate-180 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-lime-glow [writing-mode:vertical-rl]">
        0{active + 1} / 0{n} — <Scramble text={chapters[active].label} />
      </p>

      <div className="relative flex flex-col items-center gap-4 py-1">
        <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-bone-100/15" />
        <motion.div
          style={{ scaleY: fill }}
          className="absolute inset-y-2 left-1/2 w-px origin-top -translate-x-1/2 bg-lime-glow"
        />
        {chapters.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={`Go to ${c.label}`}
            onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: "smooth" })}
            className={cn(
              "relative z-10 size-2.5 rounded-full border transition-all duration-300",
              i === active
                ? "scale-150 border-lime-glow bg-lime-glow shadow-[0_0_14px_2px_rgb(var(--glow)/0.7)]"
                : i < active
                  ? "border-lime-glow bg-lime-glow/60"
                  : "border-bone-100/40 bg-ink-950 hover:border-lime-glow",
            )}
          />
        ))}
      </div>
    </div>
  );
}