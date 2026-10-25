import { KineticText } from "@/components/motion/kinetic-text";
import { Reveal } from "@/components/motion/reveal";

export function PageHero({
  kicker,
  a,
  b,
  text,
}: {
  kicker: string;
  a: string;
  b: string;
  text: string;
}) {
  return (
    <section className="relative px-6 pb-16 pt-36 md:px-14 md:pt-44">
      <div className="pointer-events-none absolute -right-40 top-20 size-[34rem] rounded-full bg-lime-glow/10 blur-[9.375rem]" />
      <div className="relative mx-auto max-w-[93.75rem]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">{kicker}</p>
        <h1 className="display-tight mt-5 text-[clamp(3rem,10vw,9.5rem)] font-extrabold text-bone-50">
          <div>
            <KineticText text={a} />
          </div>
          <div className="ghost-text [--stroke:var(--lime-glow)] md:ml-[6vw]">
            <KineticText text={b} delay={0.3} />
          </div>
        </h1>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-300">{text}</p>
        </Reveal>
      </div>
    </section>
  );
}