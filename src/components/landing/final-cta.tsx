import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KineticText } from "@/components/motion/kinetic-text";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

const labs = [
  {
    href: "/demos/neural-network",
    tag: "Mind",
    title: "Train a brain",
    text: "Teach an artificial brain to colour in a pattern and watch it learn live.",
  },
  {
    href: "/demos/robot-builder",
    tag: "All three",
    title: "Build a robot",
    text: "Mix steel, living tissue and AI brains, then test your robot on five terrains.",
  },
  {
    href: "/demos/creature-designer",
    tag: "All three",
    title: "Design a creature",
    text: "Describe a living machine and an AI turns it into a trading card.",
  },
];

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-bone-100/10 px-6 py-32 md:px-14 md:py-48">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-glow/15 blur-[10rem]" />

      <div className="relative mx-auto max-w-[93.75rem]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">Your turn</p>
        <h2 className="display-tight mt-5 text-[clamp(3.2rem,12vw,12rem)] font-extrabold text-bone-50">
          <div>
            <KineticText text="Don't just read" />
          </div>
          <div className="ghost-text [--stroke:var(--lime-glow)] md:ml-[8vw]">
            <KineticText text="about it." delay={0.3} />
          </div>
          <div className="text-lime-glow md:ml-[2vw]">
            <KineticText text="Build one." delay={0.6} />
          </div>
        </h2>

        <Stagger className="mt-20 grid gap-5 md:grid-cols-3" gap={0.15}>
          {labs.map((lab) => (
            <StaggerItem key={lab.title}>
              <Link
                href={lab.href}
                className="glass group relative block overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1 hover:border-lime-glow/50"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-lime-glow/0 blur-3xl transition-all duration-500 group-hover:bg-lime-glow/25" />
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow">{lab.tag}</p>
                <h3 className="display-tight mt-4 text-4xl font-extrabold text-bone-50">{lab.title}</h3>
                <p className="mt-5 leading-relaxed text-bone-300">{lab.text}</p>
                <span className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-bone-50 transition-colors group-hover:text-lime-glow">
                  Enter
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <div className="mt-16 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Button href="/signup" size="lg">
                Create a free account
                <ArrowUpRight className="size-4" />
              </Button>
            </Magnetic>
            <p className="text-sm text-bone-300">Accounts save your experiments and builds.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}