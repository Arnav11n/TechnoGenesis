import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageSlot } from "@/components/ui/image-slot";
import { KineticText } from "@/components/motion/kinetic-text";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { DEMOS, type Demo } from "@/lib/demos";

export const metadata: Metadata = { title: "The labs" };

function Card({ demo, index }: { demo: Demo; index: number }) {
  const inner = (
    <>
      <ImageSlot
        src={`/images/labs/${demo.slug}.jpg`}
        alt={demo.title}
        label={demo.title}
        hint={`public/images/labs/${demo.slug}.jpg · 4:3`}
        tag={`FIG. ${String(index + 1).padStart(2, "0")}`}
        ratio="16/10"
      />
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone="lime">{demo.field}</Badge>
        <Badge tone={demo.level === "Easy" ? "neutral" : "copper"}>{demo.level}</Badge>
      </div>
      <h3 className="display-tight mt-4 text-3xl font-extrabold text-bone-50">{demo.title}</h3>
      <p className="mt-3 leading-relaxed text-bone-300">{demo.tagline}</p>
      <div className="mt-6 flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-[0.2em]">
        <span className="flex items-center gap-2 text-bone-500">
          <Clock className="size-3.5" />
          About {demo.minutes} min
        </span>
        {demo.ready ? (
          <span className="flex items-center gap-2 text-bone-50 transition-colors group-hover:text-lime-glow">
            Open
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </span>
        ) : (
          <span className="text-copper-400">Building next</span>
        )}
      </div>
    </>
  );

  const cls = "glass group relative block h-full overflow-hidden rounded-3xl p-4 transition-all duration-500";

  return demo.ready ? (
    <Link href={`/demos/${demo.slug}`} className={`${cls} hover:-translate-y-1 hover:border-lime-glow/50`}>
      {inner}
    </Link>
  ) : (
    <div className={`${cls} opacity-60`}>{inner}</div>
  );
}

export default function DemosPage() {
  const open = DEMOS.filter((d) => d.ready).length;

  return (
    <div className="relative overflow-hidden px-6 pb-32 pt-32 md:px-14 md:pt-40">
      <div className="pointer-events-none absolute -left-40 top-40 size-[36rem] rounded-full bg-lime-glow/10 blur-[9.375rem]" />
      <div className="pointer-events-none absolute -right-40 top-[40rem] size-[30rem] rounded-full bg-copper-400/10 blur-[9.375rem]" />

      <div className="relative mx-auto max-w-[93.75rem]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">The labs</p>
        <h1 className="display-tight mt-5 text-[clamp(3.4rem,11vw,10.5rem)] font-extrabold text-bone-50">
          <KineticText text="Learn by" />{" "}
          <span className="ghost-text [--stroke:var(--lime-glow)]">
            <KineticText text="playing." delay={0.3} />
          </span>
        </h1>

        <Reveal delay={0.2}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-300">
            Every lab can be used in under a minute with no setup. Each one has simple steps and a
            plain-English explanation of what is really happening inside.
          </p>
          <p className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-bone-500">
            {open} of {DEMOS.length} labs open
          </p>
        </Reveal>

        <Stagger className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3" gap={0.08}>
          {DEMOS.map((d, i) => (
            <StaggerItem key={d.slug} className="h-full">
              <Card demo={d} index={i} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  );
}