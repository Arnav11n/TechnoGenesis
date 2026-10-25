"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A frame for any picture. Until the file exists it shows a placeholder.
 * Once it exists, the picture gets the site's look: green tint, scan lines,
 * corner marks and a figure tag, so every photo feels like it belongs.
 */
export function ImageSlot({
  src,
  alt,
  label,
  hint,
  tag,
  ratio = "16/9",
  className,
}: {
  src: string;
  alt: string;
  label: string;
  hint?: string;
  tag?: string;
  ratio?: string;
  className?: string;
}) {
  const [ok, setOk] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setOk(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setOk(true);
  }, [src]);

  return (
    <div
      className={cn("group hairline relative overflow-hidden rounded-2xl bg-ink-800/40", className)}
      style={{ aspectRatio: ratio }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setOk(true)}
        onError={() => setOk(false)}
        className={cn(
          "absolute inset-0 size-full object-cover transition-all duration-700 group-hover:scale-105",
          ok ? "opacity-100 contrast-110 grayscale-[0.55]" : "opacity-0",
        )}
      />

      {ok ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-lime-glow opacity-60 mix-blend-color" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_3px,rgb(var(--glow)/0.08)_3px_4px)]" />
          <span className="pointer-events-none absolute left-2.5 top-2.5 size-4 border-l-2 border-t-2 border-lime-glow" />
          <span className="pointer-events-none absolute bottom-2.5 right-2.5 size-4 border-b-2 border-r-2 border-lime-glow" />
          {tag && (
            <span className="pointer-events-none absolute bottom-3 left-4 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-bone-50">
              {tag}
            </span>
          )}
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(rgb(var(--glow)/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--glow)/0.07)_1px,transparent_1px)] bg-[size:1.75rem_1.75rem] p-6 text-center">
          <div className="space-y-2">
            <ImageIcon className="mx-auto size-6 text-lime-glow" />
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-bone-300">{label}</p>
            {hint && <p className="font-mono text-[0.625rem] tracking-[0.1em] text-bone-500">{hint}</p>}
          </div>
        </div>
      )}
    </div>
  );
}