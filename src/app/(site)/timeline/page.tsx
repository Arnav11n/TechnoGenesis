import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { LifeTimeline } from "@/components/pages/life-timeline";
import { PageHero } from "@/components/pages/page-hero";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ui/image-slot";
import { KineticText } from "@/components/motion/kinetic-text";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

export const metadata: Metadata = { title: "Timeline of life" };

const TODAY = [
  { id: "medicine", tag: "Body", title: "Gene-editing medicine", text: "A CRISPR treatment for sickle cell disease is approved and given to patients in hospitals." },
  { id: "proteins", tag: "Mind × Body", title: "AI that predicts proteins", text: "AlphaFold's predicted protein structures are shared in a free public database that any scientist can search." },
  { id: "factories", tag: "Frame", title: "Robots at work", text: "Millions of industrial robots work in factories around the world today." },
  { id: "assistants", tag: "Mind", title: "AI assistants", text: "Language AIs answer questions in plain words. The Genesis chat in the corner of this site is one of them." },
];

export default function TimelinePage() {
  return (
    <>
      <PageHero
        kicker="Timeline of life"
        a="From one cell"
        b="to living machines."
        text="Thirteen real discoveries that taught humans to understand, read, copy and edit life, and to build minds and bodies of their own. Scroll slowly. The colour of time changes as you go."
      />
      <div className="px-6 pb-6 text-center font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-bone-500 md:px-14">
        Scroll to travel through time ↓
      </div>

      <LifeTimeline />

      <section className="relative overflow-hidden px-6 py-32 md:px-14 md:py-44">
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-glow/10 blur-[10rem]" />
        <div className="relative mx-auto max-w-[93.75rem]">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">Today</p>
          <h2 className="display-tight mt-5 text-[clamp(3rem,9vw,9rem)] font-extrabold text-bone-50">
            <KineticText text="It's already" />{" "}
            <span className="ghost-text [--stroke:var(--lime-glow)]">
              <KineticText text="here." delay={0.3} />
            </span>
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bone-300">
              None of this is science fiction. These things exist right now.
            </p>
          </Reveal>

          <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4" gap={0.12}>
            {TODAY.map((t) => (
              <StaggerItem key={t.id} className="h-full">
                <div className="glass group h-full rounded-3xl p-4 transition-all duration-500 hover:-translate-y-1 hover:border-lime-glow/50">
                  <ImageSlot
                    src={`/images/today/${t.id}.jpg`}
                    alt={t.title}
                    label={t.title}
                    hint={`public/images/today/${t.id}.jpg · 4:3`}
                    tag="TODAY"
                    ratio="4/3"
                  />
                  <div className="p-3">
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-lime-glow">{t.tag}</p>
                    <h3 className="display-tight mt-2 text-2xl font-extrabold text-bone-50">{t.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-bone-300">{t.text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1}>
            <div className="mt-14 flex flex-wrap gap-4">
              <Button href="/futures" size="lg">
                See where it could go <ArrowUpRight className="size-4" />
              </Button>
              <Button href="/demos" variant="outline" size="lg">
                Try it yourself
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}