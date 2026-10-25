import { cn } from "@/lib/utils";

/** Endlessly scrolling row of words. */
export function Marquee({
  items,
  className,
  reverse = false,
}: {
  items: string[];
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className="flex w-max animate-marquee whitespace-nowrap"
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center pr-12">
            {item}
            <span className="ml-12 size-2 rounded-full bg-lime-glow" />
          </span>
        ))}
      </div>
    </div>
  );
}