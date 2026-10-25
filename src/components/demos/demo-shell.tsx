import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { KineticText } from "@/components/motion/kinetic-text";
import { Reveal } from "@/components/motion/reveal";
import { TrackView } from "@/components/demos/track-view";

export function DemoShell({
  title,
  field,
  level,
  intro,
  steps,
  explain,
  children,
}: {
  title: string;
  field: string;
  level: "Easy" | "Medium";
  intro: string;
  steps: string[];
  explain: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden px-6 pb-32 pt-28 md:px-14 md:pt-32">
      <TrackView />
      <div className="pointer-events-none absolute -right-40 top-20 size-[34rem] rounded-full bg-lime-glow/10 blur-[8.75rem]" />

      <div className="relative mx-auto max-w-[93.75rem]">
        <Link
          href="/demos"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-bone-300 transition-colors hover:text-lime-glow"
        >
          <ArrowLeft className="size-4" />
          All labs
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Badge tone="lime">{field}</Badge>
          <Badge tone={level === "Easy" ? "neutral" : "copper"}>{level}</Badge>
        </div>

        <h1 className="display-tight mt-5 text-[clamp(2.8rem,8vw,7.5rem)] font-extrabold text-bone-50">
          <KineticText text={title} />
        </h1>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bone-300">
            {intro}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[22rem_1fr] lg:gap-10">
          <aside className="space-y-6">
            <Reveal>
              <div className="glass rounded-2xl p-6">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow">
                  How to use it
                </p>
                <ol className="mt-5 space-y-4">
                  {steps.map((s, i) => (
                    <li key={i} className="flex gap-4 text-sm leading-relaxed text-bone-100">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-lime-glow font-mono text-xs font-bold text-ink-950">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="hairline rounded-2xl p-6">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-copper-400">
                  What is really happening
                </p>
                <p className="mt-4 text-sm leading-relaxed text-bone-300">
                  {explain}
                </p>
              </div>
            </Reveal>
          </aside>

          <Reveal delay={0.15}>
            <div className="glass min-w-0 rounded-3xl p-5 md:p-8">{children}</div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}