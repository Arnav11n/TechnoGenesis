"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** A glowing dot with a trailing ring that grows over links and buttons. */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, { stiffness: 600, damping: 40, mass: 0.3 });
  const dotY = useSpring(y, { stiffness: 600, damping: 40, mass: 0.3 });
  const ringX = useSpring(x, { stiffness: 140, damping: 18, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 140, damping: 18, mass: 0.6 });

  useEffect(() => {
    // Only on devices with a real mouse, never on touch screens.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement | null;
      setHover(!!target?.closest("a, button, input, [role='button']"));
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: dotX, y: dotY }}
        className="pointer-events-none fixed left-0 top-0 z-[90]"
      >
        <div className="-ml-1 -mt-1 size-2 rounded-full bg-lime-glow" />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        className="pointer-events-none fixed left-0 top-0 z-[90]"
      >
        <motion.div
          animate={{ scale: hover ? 1.9 : 1, opacity: hover ? 1 : 0.7 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="-ml-5 -mt-5 size-10 rounded-full border border-lime-glow/70 bg-lime-glow/[0.06]"
        />
      </motion.div>
    </>
  );
}