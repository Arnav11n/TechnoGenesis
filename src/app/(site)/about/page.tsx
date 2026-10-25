import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Manifesto } from "@/components/about/manifesto";
import { OrbitDiagram, ProcessSteps, StatStrip } from "@/components/about/about-visuals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ui/image-slot";
import { OptionalMedia } from "@/components/ui/optional-media";
import { KineticText } from "@/components/motion/kinetic-text";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

export const metadata: Metadata = { title: "About and goals" };

const goals = [
  { n: "01", title: "Make it understandable", text: "Every lab opens with one plain sentence and three short steps, so anyone can use it in under a minute." },
  { n: "02", title: "Make it hands-on", text: "You learn by changing things: evolve bugs, train a network, steer a swarm. Reading comes second." },
  { n: "03", title: "Make it honest", text: "Our examples are real and named. When a lab simplifies reality, it tells you so." },
];

const layers = [
  { key: "mind", name: "The Mind", field: "Artificial intelligence", text: "Software that learns from examples instead of following a fixed script.", labs: ["Neural Network Playground", "Program a Robot"] },
  { key: "body", name: "The Body", field: "Biotechnology", text: "Living cells and molecules that can be read, edited and designed.", labs: ["Evolution Lab", "Creature Designer"] },
  { key: "frame", name: "The Frame", field: "Robotics", text: "Machines that sense the world, move through it and act on it.", labs: ["Bio-Bot Builder", "Swarm Lab"] },
];

const steps = [
  { n: "1", title: "Pick one idea", text: "Each lab teaches exactly one idea, such as learning from mistakes, natural selection or emergence." },
  { n: "2", title: "Strip it down", text: "We remove everything that is not needed, until the idea can be explained in a single sentence." },
  { n: "3", title: "Make it playable", text: "Then we turn the idea into something you can click, drag and break, with a plain explanation of what is really happening." },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      {/* hero */}
      <section className="relative px-6 pb-20 pt-32 md:px-14 md:pt-40">
        <OptionalMedia kind="video" src="/videos/about-loop.mp4" className="opacity-25" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/60 to-ink-950" />
        <div className="pointer-events-none absolute -right-40 top-20 size-[38rem] rounded-full bg-lime-glow/10 blur-[9.375rem]" />
        <div className="relative mx-auto grid max-w-[93.75rem] items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Badge tone="lime">About and goals</Badge>
            <h1 className="display-tight mt-6 text-[clamp(3.2rem,10vw,10rem)] font-extrabold text-bone-50">
              <div>
                <KineticText text="Why this" />
              </div>
              <div className="ghost-text [--stroke:var(--lime-glow)] md:ml-[6vw]">
                <KineticText text="exists." delay={0.3} />
              </div>
            </h1>
            <Reveal delay={0.4}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-bone-300">
                AI, biotechnology and robotics are usually taught as three separate subjects. We think they are
                one story, and the fastest way to understand it is to play with it.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <OrbitDiagram />
          </Reveal>
        </div>
      </section>

      <div className="border-y border-bone-100/10 py-6">
        <Marquee
          className="display-tight ghost-text text-[clamp(2.4rem,6vw,5rem)] font-extrabold [--stroke:var(--bone-100)]"
          items={["Learn", "Grow", "Build", "Evolve", "Adapt", "Emerge"]}
        />
      </div>

      {/* stats */}
      <section className="px-6 py-24 md:px-14">
        <div className="mx-auto max-w-[93.75rem]">
          <StatStrip
            items={[
              { n: 6, label: "Playable labs" },
              { n: 3, label: "Fields combined" },
              { n: 5, label: "Terrains in the robot test" },
              { n: 140, label: "Robots in the swarm" },
            ]}
          />
        </div>
      </section>

      {/* manifesto */}
      <section className="px-6 py-20 md:px-14 md:py-32">
        <div className="mx-auto max-w-[75rem]">
          <Manifesto text="For most of history, life was only grown. Today it can also be trained*, edited* and built*. TechnoGenesis is a place to see how, and to try it with your own hands." />
        </div>
      </section>

      {/* goals */}
      <section className="px-6 py-20 md:px-14">
        <div className="mx-auto max-w-[93.75rem]">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">Our goals</p>
          <Stagger className="mt-10 grid gap-5 md:grid-cols-3" gap={0.12}>
            {goals.map((g) => (
              <StaggerItem key={g.n} className="h-full">
                <div className="glass group relative h-full overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1 hover:border-lime-glow/50">
                  <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-lime-glow/0 blur-3xl transition-all duration-500 group-hover:bg-lime-glow/25" />
                  <span className="ghost-text [--stroke:var(--lime-glow)] font-display text-7xl font-extrabold leading-none">
                    {g.n}
                  </span>
                  <h3 className="display-tight mt-8 text-3xl font-extrabold text-bone-50">{g.title}</h3>
                  <p className="mt-4 leading-relaxed text-bone-300">{g.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* three layers */}
      <section className="px-6 py-24 md:px-14 md:py-32">
        <div className="mx-auto max-w-[93.75rem]">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">How the site is organised</p>
          <h2 className="display-tight mt-5 max-w-4xl text-[clamp(2.4rem,6vw,6rem)] font-extrabold text-bone-50">
            <KineticText text="Mind, body, frame." />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bone-300">
              The same three layers that assemble the robot on the home page organise the labs. Each field is one
              part of a living machine.
            </p>
          </Reveal>

          <Stagger className="mt-14 grid gap-5 lg:grid-cols-3" gap={0.14}>
            {layers.map((l, i) => (
              <StaggerItem key={l.key} className="h-full">
                <div className="glass group h-full rounded-3xl p-4 transition-all duration-500 hover:-translate-y-1 hover:border-lime-glow/50">
                  <ImageSlot
                    src={`/images/layers/${l.key}.jpg`}
                    alt={l.name}
                    label={l.name}
                    hint={`public/images/layers/${l.key}.jpg · 4:3`}
                    tag={`LAYER 0${i + 1}`}
                    ratio="4/3"
                  />
                  <div className="p-4">
                    <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow">{l.field}</p>
                    <h3 className="display-tight mt-2 text-4xl font-extrabold text-bone-50">{l.name}</h3>
                    <p className="mt-3 leading-relaxed text-bone-300">{l.text}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {l.labs.map((lab) => (
                        <Badge key={lab}>{lab}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* process */}
      <section className="px-6 py-24 md:px-14">
        <div className="mx-auto max-w-[93.75rem]">
          <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">How we make a lab</p>
          <h2 className="display-tight mx-auto mt-5 max-w-3xl text-center text-[clamp(2.4rem,6vw,5.5rem)] font-extrabold text-bone-50">
            <KineticText text="One idea at a time." />
          </h2>
          <div className="mt-20">
            <ProcessSteps steps={steps} />
          </div>
        </div>
      </section>

      <section className="px-6 py-32 text-center md:px-14 md:py-44">
        <h2 className="display-tight text-[clamp(2.8rem,9vw,9rem)] font-extrabold text-bone-50">
          <KineticText text="Ready to try?" />
        </h2>
        <Reveal delay={0.2}>
          <div className="mt-10">
            <Magnetic>
              <Button href="/demos" size="lg">
                Open the labs
                <ArrowUpRight className="size-4" />
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </section>
    </div>
  );
}