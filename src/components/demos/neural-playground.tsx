"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mlp, makeDataset, type Dataset, type DatasetId } from "@/lib/sim/neural-net";
import { cn } from "@/lib/utils";

const PATTERNS: { id: DatasetId; label: string; sub: string }[] = [
  { id: "blobs", label: "Two groups", sub: "Easy" },
  { id: "circle", label: "Ring", sub: "Medium" },
  { id: "spiral", label: "Spiral", sub: "Hard" },
];

const BRAINS = {
  small: { label: "Small brain", sub: "2 cells", sizes: [2, 2, 1] },
  big: { label: "Big brain", sub: "24 cells", sizes: [2, 8, 8, 8, 1] },
};
type BrainId = keyof typeof BRAINS;

type RGB = [number, number, number];

function cssRgb(name: string, fallback: RGB): RGB {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const m = /^#([0-9a-f]{6})$/i.exec(v);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function accuracyOf(net: Mlp, data: Dataset) {
  let ok = 0;
  for (let k = 0; k < data.ys.length; k++) {
    const p = net.forward(data.xs[k][0], data.xs[k][1]);
    if ((p > 0.5 ? 1 : 0) === data.ys[k]) ok++;
  }
  return ok / data.ys.length;
}

function Choice({
  on,
  label,
  sub,
  onClick,
}: {
  on: boolean;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "rounded-xl border px-4 py-2.5 text-left transition-all",
        on ? "border-lime-glow bg-lime-glow text-ink-950" : "border-bone-100/20 text-bone-100 hover:border-lime-glow/60",
      )}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className={cn("block text-[0.6875rem]", on ? "text-ink-950/70" : "text-bone-500")}>{sub}</span>
    </button>
  );
}

export function NeuralPlayground() {
  const [datasetId, setDatasetId] = useState<DatasetId>("circle");
  const [brainId, setBrainId] = useState<BrainId>("small");
  const [running, setRunning] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [stats, setStats] = useState({ round: 0, acc: 0.5 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const netRef = useRef<Mlp | null>(null);
  const dataRef = useRef<Dataset | null>(null);
  const stepsRef = useRef(0);
  const runningRef = useRef(false);
  const dirtyRef = useRef(true);
  const colorsRef = useRef<{ a: RGB; b: RGB; bg: RGB }>({ a: [200, 255, 58], b: [227, 154, 99], bg: [4, 7, 6] });

  runningRef.current = running;

  useEffect(() => {
    const net = new Mlp([...BRAINS[brainId].sizes], Math.floor(Math.random() * 100000) + 1);
    const data = makeDataset(datasetId, 3);
    netRef.current = net;
    dataRef.current = data;
    stepsRef.current = 0;
    dirtyRef.current = true;
    setRunning(false);
    setStats({ round: 0, acc: accuracyOf(net, data) });
  }, [datasetId, brainId, resetCount]);

  useEffect(() => {
    const readColors = () => {
      colorsRef.current = {
        a: cssRgb("--lime-glow", [200, 255, 58]),
        b: cssRgb("--copper-400", [227, 154, 99]),
        bg: cssRgb("--ink-950", [4, 7, 6]),
      };
      dirtyRef.current = true;
    };
    readColors();
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const G = 40;
    const map = document.createElement("canvas");
    map.width = G;
    map.height = G;
    const mctx = map.getContext("2d");
    if (!mctx) return;
    const img = mctx.createImageData(G, G);

    const draw = () => {
      const cv = canvasRef.current;
      const net = netRef.current;
      const data = dataRef.current;
      if (!cv || !net || !data) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const { a, b, bg } = colorsRef.current;
      const S = cv.width;

      for (let gy = 0; gy < G; gy++) {
        for (let gx = 0; gx < G; gx++) {
          const x = ((gx + 0.5) / G) * 2 - 1;
          const y = 1 - ((gy + 0.5) / G) * 2;
          const p = net.forward(x, y);
          const o = (gy * G + gx) * 4;
          img.data[o] = a[0] * (1 - p) + b[0] * p;
          img.data[o + 1] = a[1] * (1 - p) + b[1] * p;
          img.data[o + 2] = a[2] * (1 - p) + b[2] * p;
          img.data[o + 3] = 40 + Math.abs(2 * p - 1) * 170;
        }
      }
      mctx.putImageData(img, 0, 0);

      ctx.fillStyle = `rgb(${bg})`;
      ctx.fillRect(0, 0, S, S);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(map, 0, 0, S, S);

      data.xs.forEach(([x, y], k) => {
        ctx.beginPath();
        ctx.arc(((x + 1) / 2) * S, ((1 - y) / 2) * S, 7, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${data.ys[k] ? b : a})`;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgb(${bg})`;
        ctx.stroke();
      });
    };

    let raf = 0;
    let frames = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const net = netRef.current;
      const data = dataRef.current;
      if (!net || !data) return;

      if (runningRef.current) {
        for (let s = 0; s < 8; s++) {
          const idx = Array.from({ length: 16 }, () => (Math.random() * data.ys.length) | 0);
          net.train(data.xs, data.ys, idx, 0.03);
          stepsRef.current++;
        }
        dirtyRef.current = true;
        frames++;
        if (frames % 6 === 0) {
          const acc = accuracyOf(net, data);
          setStats({ round: stepsRef.current, acc });
          if (acc >= 0.97) {
            runningRef.current = false;
            setRunning(false);
          }
        }
      }
      if (dirtyRef.current) {
        dirtyRef.current = false;
        draw();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
    };
  }, []);

  const pct = Math.round(stats.acc * 100);
  const learned = stats.acc >= 0.95;
  const stuck = !learned && stats.round > 500;

  let message = "Press Start. The brain begins by guessing at random.";
  if (stats.round > 0) {
    message = "Learning. Every wrong guess makes the brain adjust a little.";
    if (learned) message = "It learned the pattern! The background colours now match the dots.";
    else if (stuck && brainId === "small")
      message = "Stuck. This brain has only 2 cells, which is too few to draw this shape.";
    else if (stuck) message = "This one is hard. Keep going, or try an easier pattern.";
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-lime-glow/30 bg-lime-glow/[0.06] p-5">
        <p className="font-display text-xl font-bold leading-snug text-bone-100">
          The brain has to guess whether each spot is green or orange. At first it guesses badly. Every mistake
          teaches it a little, until the colours match the dots.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <canvas
            ref={canvasRef}
            width={560}
            height={560}
            aria-label="Map of the brain's guesses"
            className="aspect-square w-full rounded-2xl border border-bone-100/15"
          />
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-bone-300">
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-lime-glow" /> Green dots
            </span>
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-copper-400" /> Orange dots
            </span>
            <span className="text-bone-500">Background colour = the brain&apos;s guess</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">1 · Pick a pattern</p>
            <div className="grid grid-cols-3 gap-2">
              {PATTERNS.map((p) => (
                <Choice key={p.id} on={datasetId === p.id} label={p.label} sub={p.sub} onClick={() => setDatasetId(p.id)} />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">2 · Pick a brain</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(BRAINS) as BrainId[]).map((id) => (
                <Choice key={id} on={brainId === id} label={BRAINS[id].label} sub={BRAINS[id].sub} onClick={() => setBrainId(id)} />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setRunning((r) => !r)} disabled={learned}>
              {running ? <Pause className="size-4" /> : <Play className="size-4" />}
              {running ? "Pause" : stats.round > 0 ? "Keep learning" : "Start"}
            </Button>
            <Button variant="outline" size="lg" onClick={() => setResetCount((c) => c + 1)}>
              <RotateCcw className="size-4" /> Start over
            </Button>
          </div>

          <div className="hairline rounded-2xl p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-bone-500">Right answers</p>
                <p className="mt-1 font-display text-5xl font-extrabold tabular-nums text-lime-glow">{pct}%</p>
              </div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-500">
                Practice rounds: <span className="text-bone-50">{stats.round}</span>
              </p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bone-100/10">
              <div className="h-full bg-lime-glow transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <p className="min-h-[3rem] leading-relaxed text-bone-100">{message}</p>

          {stuck && brainId === "small" && <Button onClick={() => setBrainId("big")}>Try the big brain</Button>}
          {learned && datasetId !== "spiral" && (
            <Button variant="outline" onClick={() => setDatasetId(datasetId === "blobs" ? "circle" : "spiral")}>
              Try a harder pattern
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}