"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { KineticText } from "@/components/motion/kinetic-text";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>0</span>;
}

const FACTS = [
  {
    n: 4,
    unit: "letters",
    text: "A, T, G and C. These four letters write the recipe for every living thing on Earth.",
    href: "/demos/evolution-lab",
    cta: "Open the Evolution Lab",
  },
  {
    n: 20,
    unit: "building blocks",
    text: "Amino acids. Cells chain them in different orders to make every protein in your body.",
    href: "/demos/evolution-lab",
    cta: "Open the Evolution Lab",
  },
  {
    n: 3,
    unit: "billion letters",
    text: "That is the length of one human genome. The Human Genome Project read all of it, finishing in 2003.",
    href: "/demos/evolution-lab",
    cta: "Open the Evolution Lab",
  },
  {
    n: 13,
    unit: "years",
    text: "That is how long reading the first human genome took (1990 to 2003). Today it can be done in about a day.",
    href: "/demos/evolution-lab",
    cta: "Open the Evolution Lab",
  },
];

export function Numbers() {
  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-14 md:py-44">
      <div className="pointer-events-none absolute -right-40 top-10 size-[34rem] rounded-full bg-copper-400/10 blur-[9.375rem]" />
      <div className="relative mx-auto max-w-[93.75rem]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">The numbers</p>
        <h2 className="display-tight mt-5 max-w-5xl text-[clamp(2.8rem,8vw,8rem)] font-extrabold text-bone-50">
          <KineticText text="Small numbers." />{" "}
          <span className="ghost-text [--stroke:var(--lime-glow)]">
            <KineticText text="Huge consequences." delay={0.3} />
          </span>
        </h2>

        <Stagger className="mt-20 grid gap-x-10 gap-y-16 md:grid-cols-2" gap={0.12}>
          {FACTS.map((f, i) => (
            <StaggerItem key={f.unit + i} className={i % 2 === 1 ? "md:mt-20" : ""}>
              <div className="border-t border-bone-100/15 pt-6">
                <p className="display-tight text-[clamp(5rem,13vw,11rem)] font-extrabold text-bone-50">
                  <CountUp to={f.n} />
                </p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">{f.unit}</p>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-bone-300">{f.text}</p>
                <Link
                  href={f.href}
                  className="mt-5 inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-50 transition-colors hover:text-lime-glow"
                >
                  {f.cta} <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}