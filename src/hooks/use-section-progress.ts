"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue } from "framer-motion";

/** Progress (0 to 1) through a tall section that contains a sticky screen. */
export function useSectionProgress(ref: RefObject<HTMLElement | null>) {
  const p = useMotionValue(0);

  useEffect(() => {
    const calc = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      p.set(total <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / total)));
    };
    calc();
    window.addEventListener("scroll", calc, { passive: true });
    window.addEventListener("resize", calc);
    window.addEventListener("load", calc);
    const ro = new ResizeObserver(calc);
    if (ref.current) ro.observe(ref.current);
    return () => {
      window.removeEventListener("scroll", calc);
      window.removeEventListener("resize", calc);
      window.removeEventListener("load", calc);
      ro.disconnect();
    };
  }, [ref, p]);

  return p;
}