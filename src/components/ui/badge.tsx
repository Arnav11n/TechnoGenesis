import { cn } from "@/lib/utils";

type Tone = "lime" | "copper" | "neutral";

const tones: Record<Tone, string> = {
  lime: "border-lime-glow/30 bg-lime-glow/10 text-lime-glow",
  copper: "border-copper-400/30 bg-copper-400/10 text-copper-400",
  neutral: "border-bone-100/15 bg-white/5 text-bone-300",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.2em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}