"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type RGB = [number, number, number];
type Agent = { x: number; y: number; vx: number; vy: number; hot: boolean };
type Mode = "follow" | "flee" | "ignore";

const W = 960;
const H = 540;
const COUNT = 140;

const PRESETS = [
  { label: "Natural flock", coh: 50, sep: 50, ali: 60 },
  { label: "No teamwork", coh: 0, sep: 40, ali: 0 },
  { label: "One big blob", coh: 95, sep: 20, ali: 20 },
];

const MODES: { id: Mode; label: string }[] = [
  { id: "follow", label: "Swarm follows my mouse" },
  { id: "flee", label: "Swarm runs from my mouse" },
  { id: "ignore", label: "Ignore my mouse" },
];

function cssRgb(name: string, fallback: RGB): RGB {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const m = /^#([0-9a-f]{6})$/i.exec(v);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function Slider({
  label,
  low,
  high,
  value,
  onChange,
}: {
  label: string;
  low: string;
  high: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-lg font-bold text-bone-50">{label}</p>
        <span className="font-mono text-xs tabular-nums text-lime-glow">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-lime-glow"
      />
      <div className="flex justify-between text-[0.6875rem] text-bone-500">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

export function SwarmLab() {
  const [coh, setCoh] = useState(50);
  const [sep, setSep] = useState(50);
  const [ali, setAli] = useState(60);
  const [mode, setMode] = useState<Mode>("follow");
  const [paused, setPaused] = useState(false);
  const [order, setOrder] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ coh, sep, ali, mode, paused });
  params.current = { coh, sep, ali, mode, paused };
  const mouse = useRef({ x: 0, y: 0, on: false });

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let acc: RGB = [200, 255, 58];
    let cop: RGB = [227, 154, 99];
    let bg: RGB = [4, 7, 6];
    const readColors = () => {
      acc = cssRgb("--lime-glow", acc);
      cop = cssRgb("--copper-400", cop);
      bg = cssRgb("--ink-950", bg);
      ctx.fillStyle = `rgb(${bg})`;
      ctx.fillRect(0, 0, W, H);
    };
    readColors();
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const agents: Agent[] = Array.from({ length: COUNT }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      return { x: Math.random() * W, y: Math.random() * H, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, hot: i % 6 === 0 };
    });

    const step = () => {
      const { coh, sep, ali, mode } = params.current;
      const m = mouse.current;
      const cF = (coh / 100) * 0.01;
      const sF = (sep / 100) * 0.08;
      const aF = (ali / 100) * 0.1;
      const R2 = 70 * 70;
      const S2 = 22 * 22;

      for (const a of agents) {
        let cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0, n = 0;
        for (const b of agents) {
          if (a === b) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > R2) continue;
          n++;
          cx += b.x;
          cy += b.y;
          ax += b.vx;
          ay += b.vy;
          if (d2 < S2) {
            sx -= dx;
            sy -= dy;
          }
        }
        if (n) {
          a.vx += (cx / n - a.x) * cF + (ax / n - a.vx) * aF;
          a.vy += (cy / n - a.y) * cF + (ay / n - a.vy) * aF;
        }
        a.vx += sx * sF;
        a.vy += sy * sF;

        if (m.on && mode !== "ignore") {
          const dx = m.x - a.x;
          const dy = m.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          if (mode === "follow") {
            if (d < 380) {
              a.vx += (dx / d) * 0.09;
              a.vy += (dy / d) * 0.09;
            }
          } else if (d < 150) {
            const f = (1 - d / 150) * 0.7;
            a.vx -= (dx / d) * f;
            a.vy -= (dy / d) * f;
          }
        }

        const M = 50;
        if (a.x < M) a.vx += 0.2;
        else if (a.x > W - M) a.vx -= 0.2;
        if (a.y < M) a.vy += 0.2;
        else if (a.y > H - M) a.vy -= 0.2;

        const sp = Math.hypot(a.vx, a.vy) || 0.0001;
        const s = Math.min(3.2, Math.max(1.4, sp));
        a.vx = (a.vx / sp) * s;
        a.vy = (a.vy / sp) * s;
        a.x += a.vx;
        a.y += a.vy;
      }
    };

    const draw = () => {
      ctx.fillStyle = `rgba(${bg},0.28)`;
      ctx.fillRect(0, 0, W, H);

      for (const a of agents) {
        const ang = Math.atan2(a.vy, a.vx);
        ctx.fillStyle = `rgb(${a.hot ? cop : acc})`;
        ctx.beginPath();
        ctx.moveTo(a.x + Math.cos(ang) * 7, a.y + Math.sin(ang) * 7);
        ctx.lineTo(a.x + Math.cos(ang + 2.5) * 5, a.y + Math.sin(ang + 2.5) * 5);
        ctx.lineTo(a.x + Math.cos(ang - 2.5) * 5, a.y + Math.sin(ang - 2.5) * 5);
        ctx.closePath();
        ctx.fill();
      }

      const m = mouse.current;
      if (m.on && params.current.mode !== "ignore") {
        ctx.beginPath();
        ctx.arc(m.x, m.y, 14, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgb(${acc})`;
        ctx.stroke();
      }
    };

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(cv);

    let raf = 0;
    let frame = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || params.current.paused) return;
      step();
      draw();
      frame++;
      if (frame % 20 === 0) {
        let sx = 0, sy = 0, ss = 0;
        for (const a of agents) {
          sx += a.vx;
          sy += a.vy;
          ss += Math.hypot(a.vx, a.vy);
        }
        setOrder(Math.round((Math.hypot(sx, sy) / (ss || 1)) * 100));
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  function preset(p: (typeof PRESETS)[number]) {
    setCoh(p.coh);
    setSep(p.sep);
    setAli(p.ali);
  }

  const verdict =
    order >= 80
      ? "The swarm moves as one creature."
      : order >= 40
        ? "Partly organised. Some groups move together."
        : "Chaos. Everyone is doing their own thing.";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-lime-glow/30 bg-lime-glow/[0.06] p-5">
        <p className="font-display text-xl font-bold leading-snug text-bone-100">
          Every little robot follows just 3 rules. Nobody is in charge. Yet together they move like a flock of birds.
        </p>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        aria-label="A swarm of small robots"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mouse.current = {
            x: ((e.clientX - r.left) / r.width) * W,
            y: ((e.clientY - r.top) / r.height) * H,
            on: true,
          };
        }}
        onPointerLeave={() => {
          mouse.current.on = false;
        }}
        className="aspect-video w-full cursor-crosshair rounded-2xl border border-bone-100/15"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="hairline rounded-xl p-4">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-bone-500">Robots</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-bone-50">{COUNT}</p>
        </div>
        <div className="hairline rounded-xl p-4">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-bone-500">Rules each one follows</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-bone-50">3</p>
        </div>
        <div className="hairline rounded-xl p-4">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-bone-500">How organised?</p>
          <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-lime-glow">{order}%</p>
        </div>
      </div>
      <p className="text-bone-100">{verdict}</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">The 3 rules</p>
          <Slider label="Stick together" low="Loners" high="Huddle" value={coh} onChange={setCoh} />
          <Slider label="Keep some space" low="Crowded" high="Spread out" value={sep} onChange={setSep} />
          <Slider label="Copy the neighbours" low="Own way" high="Same direction" value={ali} onChange={setAli} />
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">Quick settings</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => preset(p)}
                  className="rounded-full border border-bone-100/20 px-4 py-2 text-sm text-bone-100 transition-colors hover:border-lime-glow/60 hover:text-lime-glow"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">Your mouse</p>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  aria-pressed={mode === m.id}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-all",
                    mode === m.id
                      ? "border-lime-glow bg-lime-glow text-ink-950"
                      : "border-bone-100/20 text-bone-100 hover:border-lime-glow/60",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-bone-300 transition-colors hover:text-lime-glow"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </div>
    </div>
  );
}