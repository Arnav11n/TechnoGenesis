"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A background picture or looping video that only appears if the file exists.
 * If the file is missing, nothing is shown and nothing breaks.
 */
export function OptionalMedia({
  src,
  kind = "image",
  className,
}: {
  src: string;
  kind?: "image" | "video";
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  if (!ok) return null;
  const cls = cn(
    "pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-1000",
    loaded ? "opacity-100" : "opacity-0",
    className,
  );

  return kind === "video" ? (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
      onLoadedData={() => setLoaded(true)}
      onError={() => setOk(false)}
      className={cls}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt=""
      aria-hidden
      onLoad={() => setLoaded(true)}
      onError={() => setOk(false)}
      className={cls}
    />
  );
}