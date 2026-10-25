import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const segmentColors = [
  "bg-red-400",
  "bg-copper-400",
  "bg-lime-dim",
  "bg-lime-glow",
];

const labels = ["", "Weak", "Fair", "Good", "Strong"];

export function PasswordMeter({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "A letter", ok: /[A-Za-z]/.test(password) },
    { label: "A number", ok: /[0-9]/.test(password) },
    {
      label: "Mixed case or a symbol",
      ok:
        (/[a-z]/.test(password) && /[A-Z]/.test(password)) ||
        /[^A-Za-z0-9]/.test(password),
    },
  ];

  const score = password ? checks.filter((c) => c.ok).length : 0;

  return (
    <div className="space-y-3" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i < score ? segmentColors[score - 1] : "bg-bone-100/10",
              )}
            />
          ))}
        </div>
        <span className="w-14 text-right font-mono text-[0.6875rem] uppercase tracking-widest text-bone-300">
          {labels[score]}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {checks.map((c) => (
          <li
            key={c.label}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              c.ok ? "text-lime-glow" : "text-bone-500",
            )}
          >
            <Check
              className={cn("size-3.5", c.ok ? "opacity-100" : "opacity-30")}
              aria-hidden
            />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}