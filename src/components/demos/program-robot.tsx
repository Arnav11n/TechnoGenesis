"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Eye, Flag, Minus, Play, Plus, RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Cmd = "F" | "L" | "R" | "S";

type Level = {
  title: string;
  goal: string;
  map: string[];
  start: { r: number; c: number; d: number }; // d: 0 up, 1 right, 2 down, 3 left
  slots: number;
  smart: boolean;
  maxRepeat: number;
};

const LEVELS: Level[] = [
  {
    title: "First steps",
    goal: "Drive the robot forward to the flag.",
    map: ["S...G", ".....", ".....", ".....", "....."],
    start: { r: 0, c: 0, d: 1 },
    slots: 6,
    smart: false,
    maxRepeat: 1,
  },
  {
    title: "Turn the corner",
    goal: "The flag is in the opposite corner. You will need to turn.",
    map: ["S...#", "....#", "....#", "....#", "....G"],
    start: { r: 0, c: 0, d: 1 },
    slots: 12,
    smart: false,
    maxRepeat: 1,
  },
  {
    title: "Around the wall",
    goal: "Walls block the direct path. Find a way around them.",
    map: ["S.#..", "..#..", "..#..", ".....", "..#.G"],
    start: { r: 0, c: 0, d: 1 },
    slots: 12,
    smart: false,
    maxRepeat: 1,
  },
  {
    title: "The spiral",
    goal: "The flag is at the centre of a long spiral corridor. Each block is one action, and you only get 4 slots, but you can repeat your whole program up to 5 times. Work out how many blocks and repeats the robot needs.",
    map: ["S....", "####.", "..G#.", ".###.", "....."],
    start: { r: 0, c: 0, d: 1 },
    slots: 4,
    smart: true,
    maxRepeat: 5,
  },
];

const DR = [-1, 0, 1, 0];
const DC = [0, 1, 0, -1];

type Step = { r: number; c: number; rot: number; note: string };
type Outcome = "goal" | "bump" | "end";

function simulate(level: Level, prog: Cmd[], repeat: number) {
  const H = level.map.length;
  const W = level.map[0].length;
  let { r, c, d } = level.start;
  let rot = d * 90;
  const steps: Step[] = [{ r, c, rot, note: "Start" }];
  const isWall = (rr: number, cc: number) =>
    rr < 0 || cc < 0 || rr >= H || cc >= W || level.map[rr][cc] === "#";
  let outcome: Outcome = "end";

  outer: for (let k = 0; k < repeat; k++) {
    for (const cmd of prog) {
      if (cmd === "L") {
        d = (d + 3) % 4;
        rot -= 90;
        steps.push({ r, c, rot, note: "Turn left" });
      } else if (cmd === "R") {
        d = (d + 1) % 4;
        rot += 90;
        steps.push({ r, c, rot, note: "Turn right" });
      } else {
        const nr = r + DR[d];
        const nc = c + DC[d];
        if (isWall(nr, nc)) {
          if (cmd === "F") {
            outcome = "bump";
            steps.push({ r, c, rot, note: "Bump! A wall is in the way." });
            break outer;
          }
          d = (d + 1) % 4;
          rot += 90;
          steps.push({ r, c, rot, note: "Sensor sees a wall, so turn right" });
        } else {
          r = nr;
          c = nc;
          steps.push({
            r,
            c,
            rot,
            note: cmd === "S" ? "Sensor sees a free path, so move forward" : "Move forward",
          });
        }
      }
      if (level.map[r][c] === "G") {
        outcome = "goal";
        break outer;
      }
    }
  }
  return { steps, outcome, repeat };
}

const CMD_INFO: Record<Cmd, { label: string; Icon: typeof ArrowUp }> = {
  F: { label: "Forward", Icon: ArrowUp },
  L: { label: "Turn left", Icon: RotateCcw },
  R: { label: "Turn right", Icon: RotateCw },
  S: { label: "Smart step", Icon: Eye },
};

function messageFor(outcome: Outcome, repeat: number) {
  if (outcome === "goal") return "The robot reached the flag!";
  if (outcome === "bump") return "The robot bumped into a wall. Change your program and try again.";
  return repeat > 1
    ? "The robot ran out of steps before reaching the flag. Add more blocks, or repeat the program more times."
    : "The program finished, but the robot is not at the flag yet.";
}

export function ProgramRobot() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [prog, setProg] = useState<Cmd[]>([]);
  const [repeat, setRepeat] = useState(1);
  const [sim, setSim] = useState<ReturnType<typeof simulate> | null>(null);
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<number[]>([]);

  const level = LEVELS[levelIdx];
  const cur: Step = sim
    ? sim.steps[Math.min(shown, sim.steps.length - 1)]
    : { ...level.start, rot: level.start.d * 90, note: "Ready" };
  const finished = !!sim && !running && shown >= sim.steps.length - 1;

  useEffect(() => {
    if (!running || !sim) return;
    if (shown >= sim.steps.length - 1) {
      setRunning(false);
      if (sim.outcome === "goal") setDone((d) => (d.includes(levelIdx) ? d : [...d, levelIdx]));
      return;
    }
    const t = setTimeout(() => setShown((s) => s + 1), level.maxRepeat > 1 ? 220 : 450);
    return () => clearTimeout(t);
  }, [running, shown, sim, level.maxRepeat, levelIdx]);

  function reset() {
    setSim(null);
    setShown(0);
    setRunning(false);
  }

  function goLevel(i: number) {
    setLevelIdx(i);
    setProg([]);
    setRepeat(1);
    reset();
  }

  function add(c: Cmd) {
    if (running || prog.length >= level.slots) return;
    setProg([...prog, c]);
    reset();
  }

  function run() {
    if (prog.length === 0) return;
    setSim(simulate(level, prog, repeat));
    setShown(0);
    setRunning(true);
  }

  const cmds: Cmd[] = level.smart ? ["F", "L", "R", "S"] : ["F", "L", "R"];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l, i) => (
          <button
            key={l.title}
            type="button"
            onClick={() => goLevel(i)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-all",
              i === levelIdx
                ? "border-lime-glow bg-lime-glow text-ink-950"
                : done.includes(i)
                  ? "border-lime-glow/60 text-lime-glow"
                  : "border-bone-100/20 text-bone-300 hover:border-lime-glow/60",
            )}
          >
            <span className="mr-2 font-mono text-xs font-bold">{i + 1}</span>
            {l.title}
            {done.includes(i) && " ✓"}
          </button>
        ))}
      </div>

      <p className="max-w-3xl text-lg leading-relaxed text-bone-100">{level.goal}</p>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <div>
          <div className="hairline relative mx-auto aspect-square w-full max-w-[26rem] overflow-hidden rounded-2xl bg-ink-900/60">
            <div className="grid size-full grid-cols-5 grid-rows-5">
              {level.map.flatMap((row, r) =>
                row.split("").map((ch, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={cn(
                      "relative grid place-items-center border border-bone-100/5",
                      ch === "#" && "bg-bone-100/20",
                      ch === "G" && "bg-lime-glow/15",
                    )}
                  >
                    {ch === "#" && <span className="size-2/3 rounded-sm bg-bone-100/25" />}
                    {ch === "G" && <Flag className="size-1/2 text-lime-glow" />}
                    {ch === "S" && <span className="absolute size-1/4 rounded-full bg-bone-100/25" />}
                  </div>
                )),
              )}
            </div>

            <motion.div
              className="absolute z-10 grid place-items-center"
              style={{ width: "20%", height: "20%" }}
              animate={{ left: `${cur.c * 20}%`, top: `${cur.r * 20}%` }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
            >
              <motion.div
                animate={{ rotate: cur.rot }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className="grid size-[72%] place-items-center rounded-xl bg-lime-glow text-ink-950 shadow-[0_0_24px_2px_rgb(var(--glow)/0.55)]"
              >
                <ArrowUp className="size-1/2" strokeWidth={3} />
              </motion.div>
            </motion.div>
          </div>
          <p className="mt-3 min-h-[1.5rem] text-center font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-300">
            {cur.note}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">1 · Pick commands</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {cmds.map((c) => {
                const { label, Icon } = CMD_INFO[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => add(c)}
                    disabled={running || prog.length >= level.slots}
                    className="flex items-center gap-2 rounded-xl border border-bone-100/20 px-4 py-3 text-sm text-bone-100 transition-all hover:border-lime-glow/60 hover:text-lime-glow disabled:opacity-40"
                  >
                    <Icon className="size-4" /> {label}
                  </button>
                );
              })}
            </div>
            {level.smart && (
              <p className="mt-3 text-sm text-bone-300">
                <span className="text-lime-glow">Smart step:</span> look ahead. If the way is free, move forward. If
                there is a wall, turn right instead. It counts as one action.
              </p>
            )}
          </div>

          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">
              2 · Your program ({prog.length} of {level.slots})
            </p>
            <div className="hairline mt-3 flex min-h-[4.5rem] flex-wrap gap-2 rounded-xl p-3">
              {prog.length === 0 && <span className="self-center text-sm text-bone-500">Empty. Add a command above.</span>}
              {prog.map((c, i) => {
                const { label, Icon } = CMD_INFO[c];
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={running}
                    onClick={() => {
                      setProg(prog.filter((_, k) => k !== i));
                      reset();
                    }}
                    title="Click to remove"
                    className="flex items-center gap-1.5 rounded-lg bg-lime-glow px-3 py-2 text-xs font-semibold text-ink-950 transition-opacity hover:opacity-70"
                  >
                    <Icon className="size-3.5" /> {label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-bone-500">Click a command in your program to remove it.</p>
          </div>

          {level.maxRepeat > 1 && (
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-lime-glow">3 · Repeat it</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Repeat fewer times"
                    disabled={running || repeat <= 1}
                    onClick={() => {
                      setRepeat(repeat - 1);
                      reset();
                    }}
                    className="grid size-10 place-items-center rounded-full border border-bone-100/20 text-bone-100 transition-colors hover:border-lime-glow/60 disabled:opacity-40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-14 text-center font-display text-3xl font-extrabold tabular-nums text-bone-50">
                    {repeat}×
                  </span>
                  <button
                    type="button"
                    aria-label="Repeat more times"
                    disabled={running || repeat >= level.maxRepeat}
                    onClick={() => {
                      setRepeat(repeat + 1);
                      reset();
                    }}
                    className="grid size-10 place-items-center rounded-full border border-bone-100/20 text-bone-100 transition-colors hover:border-lime-glow/60 disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <p className="text-sm text-bone-300">
                  {prog.length} blocks × {repeat} = at most{" "}
                  <span className="text-bone-50">{prog.length * repeat}</span> actions
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={run} disabled={running || prog.length === 0}>
              <Play className="size-4" /> Run program
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setProg([]);
                reset();
              }}
              disabled={running}
            >
              <Trash2 className="size-4" /> Clear
            </Button>
          </div>

          {finished && sim && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-2xl border p-5",
                sim.outcome === "goal" ? "border-lime-glow/50 bg-lime-glow/10" : "border-copper-400/50 bg-copper-400/10",
              )}
            >
              <p className="font-display text-xl font-bold text-bone-50">{messageFor(sim.outcome, sim.repeat)}</p>
              {sim.outcome === "goal" && levelIdx < LEVELS.length - 1 && (
                <Button className="mt-4" onClick={() => goLevel(levelIdx + 1)}>
                  Next level
                </Button>
              )}
              {sim.outcome === "goal" && levelIdx === LEVELS.length - 1 && (
                <p className="mt-2 text-bone-300">
                  You programmed a robot that senses and decides on its own, and repeats a small plan until the job
                  is done. That loop of sense, decide and act is how real robots work.
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}