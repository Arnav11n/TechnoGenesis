"use client";

import { useEffect, useState } from "react";
import { DESIGN_H, DESIGN_W } from "@/lib/design";

/**
 * Keeps the site looking the same on every screen:
 *  - blocks zoom shortcuts and pinch-zoom
 *  - scales the whole site in proportion to the window on screens 1024px wide or more
 * Open  /?size  to see your window size (used to set src/lib/design.ts).
 */
export function ViewportLock() {
  const [size, setSize] = useState<string | null>(null);

  useEffect(() => {
    const showSize = new URLSearchParams(window.location.search).has("size");

    const apply = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      let s = 1;
      if (w >= 1024) s = Math.max(0.6, Math.min(1.8, Math.min(w / DESIGN_W, h / DESIGN_H)));
      document.documentElement.style.fontSize = `${16 * s}px`;
      if (showSize) setSize(`${w} × ${h}`);
    };
    apply();

    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (["+", "=", "-", "_", "0"].includes(e.key) || ["NumpadAdd", "NumpadSubtract", "Numpad0"].includes(e.code)) {
        e.preventDefault();
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    const stop = (e: Event) => e.preventDefault();
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("gesturestart", stop);
    document.addEventListener("gesturechange", stop);
    document.addEventListener("touchmove", onTouch, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("gesturestart", stop);
      document.removeEventListener("gesturechange", stop);
      document.removeEventListener("touchmove", onTouch);
    };
  }, []);

  if (!size) return null;
  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-[300] rounded-md bg-black px-3 py-2 font-mono text-xs text-lime-300">
      Window size: {size}
    </div>
  );
}