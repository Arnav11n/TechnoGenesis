import { LiquidField } from "@/components/landing/liquid-field";
import { KineticText } from "@/components/motion/kinetic-text";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
      <LiquidField className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-ink-950/70" />

      <div className="relative text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">Error 404 · Signal lost</p>
        <h1 className="display-tight ghost-text [--stroke:var(--lime-glow)] mt-4 text-[clamp(8rem,30vw,24rem)] font-extrabold">
          <KineticText text="404" />
        </h1>
        <p className="mx-auto -mt-2 max-w-md text-lg leading-relaxed text-bone-100">
          This part of the organism has not grown yet.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" size="lg">Back to the start</Button>
          <Button href="/demos" variant="glass" size="lg">Open the labs</Button>
        </div>
      </div>
    </main>
  );
}