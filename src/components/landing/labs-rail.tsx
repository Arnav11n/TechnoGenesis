"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageSlot } from "@/components/ui/image-slot";
import { DEMOS } from "@/lib/demos";

/** As you scroll down, the lab cards slide sideways. */
export function LabsRail() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const distRef = useRef(0);
  const x = useMotionValue(0);
  const progress = useMotionValue(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const c = Math.min(1, Math.max(0, v));
    x.set(-distRef.current * c);
    progress.set(c);
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const d = Math.max(0, track.scrollWidth - window.innerWidth);
      distRef.current = d;
      setDist(d);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section
      ref={ref}
      id="labs"
      className="relative"
      style={{ height: dist ? `calc(100dvh + ${dist}px)` : "320dvh" }}
    >
      <div className="sticky top-0 flex h-dvh flex-col justify-center gap-10 overflow-hidden pt-16">
        <div className="pointer-events-none absolute -left-40 top-1/3 size-[32rem] rounded-full bg-lime-glow/10 blur-[9.375rem]" />

        <div className="relative flex items-end justify-between px-6 md:px-14">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">The labs</p>
            <h2 className="display-tight mt-4 text-[clamp(2.6rem,7vw,6.5rem)] font-extrabold text-bone-50">
              Pick one. <span className="ghost-text [--stroke:var(--lime-glow)]">Play.</span>
            </h2>
          </div>
          <Link
            href="/demos"
            className="hidden items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-300 transition-colors hover:text-lime-glow md:flex"
          >
            See all <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <motion.div ref={trackRef} style={{ x }} className="relative flex w-max gap-6 px-6 md:px-14">
          {DEMOS.map((d, i) => {
            const inner = (
              <>
                <ImageSlot
                  src={`/images/labs/${d.slug}.jpg`}
                  alt={d.title}
                  label={d.title}
                  hint={`public/images/labs/${d.slug}.jpg · 4:3`}
                  tag={`FIG. ${String(i + 1).padStart(2, "0")}`}
                  ratio="4/3"
                />
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone="lime">{d.field}</Badge>
                  <Badge tone={d.level === "Easy" ? "neutral" : "copper"}>{d.level}</Badge>
                </div>
                <h3 className="display-tight mt-4 text-3xl font-extrabold text-bone-50">{d.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-bone-300">{d.tagline}</p>
                <p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.2em]">
                  {d.ready ? (
                    <span className="flex items-center gap-2 text-bone-50 group-hover:text-lime-glow">
                      Open <ArrowUpRight className="size-4" />
                    </span>
                  ) : (
                    <span className="text-copper-400">Building next</span>
                  )}
                </p>
              </>
            );
            const cls = "glass group block w-[min(80vw,24rem)] shrink-0 rounded-3xl p-4 transition-colors";
            return d.ready ? (
              <Link key={d.slug} href={`/demos/${d.slug}`} className={`${cls} hover:border-lime-glow/50`}>
                {inner}
              </Link>
            ) : (
              <div key={d.slug} className={`${cls} opacity-60`}>
                {inner}
              </div>
            );
          })}
        </motion.div>

        <div className="relative px-6 md:px-14">
          <div className="h-1 overflow-hidden rounded-full bg-bone-100/10">
            <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-lime-glow" />
          </div>
        </div>
      </div>
    </section>
  );
}