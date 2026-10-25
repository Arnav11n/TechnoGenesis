"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/password-field";
import { PARTS } from "@/lib/sim/robot-parts";
import { cn } from "@/lib/utils";

const partLabel = (id: string) => PARTS.find((p) => p.id === id)?.label ?? id;

export function Avatar({ name, hue, size = 80 }: { name: string; hue: number; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-display font-extrabold text-[#08150e]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `conic-gradient(from 0deg, hsl(${hue} 85% 62%), hsl(${(hue + 70) % 360} 85% 58%), hsl(${hue} 85% 62%))`,
        boxShadow: `0 0 ${size / 2}px hsl(${hue} 85% 55% / 0.4)`,
      }}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
}

const INTERESTS = [
  { id: "ai", label: "AI" },
  { id: "biotech", label: "Biotech" },
  { id: "robotics", label: "Robotics" },
];

const fieldCls =
  "w-full rounded-xl border border-bone-100/15 bg-ink-800/60 px-4 py-3 text-bone-50 outline-none transition-all placeholder:text-bone-500 hover:border-bone-100/25 focus:border-lime-glow focus:ring-4 focus:ring-lime-glow/10";
const labelCls = "mb-2 block font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-300";

type Msg = { ok: boolean; text: string } | null;

function Note({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <p role="status" className={cn("text-sm", msg.ok ? "text-lime-glow" : "text-red-300")}>
      {msg.text}
    </p>
  );
}

export function ProfileForm({
  initial,
}: {
  initial: { name: string; bio: string; interests: string[]; hue: number };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio);
  const [interests, setInterests] = useState<string[]>(initial.interests);
  const [hue, setHue] = useState(initial.hue);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, interests, avatarHue: hue }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      setMsg({ ok: true, text: "Saved." });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-5">
        <Avatar name={name} hue={hue} size={64} />
        <div className="flex-1">
          <label htmlFor="hue" className={labelCls}>Avatar colour</label>
          <input
            id="hue"
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="w-full accent-lime-glow"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pname" className={labelCls}>Name</label>
        <input id="pname" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} className={fieldCls} />
      </div>

      <div>
        <label htmlFor="pbio" className={labelCls}>About you</label>
        <textarea
          id="pbio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="One or two sentences"
          className={cn(fieldCls, "resize-none")}
        />
      </div>

      <div>
        <p className={labelCls}>What interests you</p>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => {
            const on = interests.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                aria-pressed={on}
                onClick={() => setInterests(on ? interests.filter((x) => x !== i.id) : [...interests, i.id])}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-all",
                  on
                    ? "border-lime-glow bg-lime-glow text-ink-950"
                    : "border-bone-100/20 text-bone-100 hover:border-lime-glow/60",
                )}
              >
                {i.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" loading={busy}>Save profile</Button>
        <Note msg={msg} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not change the password.");
      setMsg({ ok: true, text: "Password changed." });
      setCurrent("");
      setNext("");
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Could not change the password." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <PasswordField label="Current password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      <PasswordField
        label="New password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number."
        value={next}
        onChange={(e) => setNext(e.target.value)}
      />
      <div className="flex items-center gap-4">
        <Button type="submit" variant="outline" loading={busy} disabled={!current || !next}>
          Change password
        </Button>
        <Note msg={msg} />
      </div>
    </form>
  );
}

function useRemove(kind: "robot" | "creature") {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  async function remove(id: string) {
    setBusy(id);
    try {
      await fetch(`/api/account/saves?kind=${kind}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }
  return { busy, remove };
}

type RobotItem = {
  id: string;
  name: string;
  chassis: string;
  locomotion: string;
  aiCore: string;
  powerCore: string;
  terrainScore: number | null;
  createdAt: string;
};

export function SavedRobots({ items }: { items: RobotItem[] }) {
  const { busy, remove } = useRemove("robot");

  if (items.length === 0) {
    return (
      <p className="text-bone-300">
        No saved robots yet.{" "}
        <Link href="/demos/robot-builder" className="text-lime-glow underline-offset-4 hover:underline">
          Build one in the Bio-Bot Builder
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((r) => (
        <div key={r.id} className="hairline rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-xl font-bold text-bone-50">{r.name}</p>
              <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-bone-500">{r.createdAt}</p>
            </div>
            <button
              type="button"
              aria-label={`Delete ${r.name}`}
              disabled={busy === r.id}
              onClick={() => remove(r.id)}
              className="rounded-full p-2 text-bone-500 transition-colors hover:text-red-300 disabled:opacity-40"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {[
              ["Body", r.chassis],
              ["Movement", r.locomotion],
              ["Brain", r.aiCore],
              ["Power", r.powerCore],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-bone-500">{k}</dt>
                <dd className="text-bone-100">{partLabel(v)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t border-bone-100/10 pt-3 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-lime-glow">
            Passed {r.terrainScore ?? 0} of 5 terrains
          </p>
        </div>
      ))}
    </div>
  );
}

type Card = {
  name: string;
  kind: string;
  power: string;
  mix: { ai: number; bio: number; robo: number };
};

export function SavedCreatures({ items }: { items: { id: string; card: Card }[] }) {
  const { busy, remove } = useRemove("creature");

  if (items.length === 0) {
    return (
      <p className="text-bone-300">
        No saved creatures yet.{" "}
        <Link href="/demos/creature-designer" className="text-lime-glow underline-offset-4 hover:underline">
          Design one in the Creature Designer
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(({ id, card }) => (
        <div key={id} className="rounded-2xl bg-gradient-to-br from-lime-glow via-copper-400 to-lime-glow p-[1.5px]">
          <div className="h-full rounded-[15px] bg-ink-900 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="display-tight text-2xl font-extrabold text-bone-50">{card.name}</p>
                <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-lime-glow">{card.kind}</p>
              </div>
              <button
                type="button"
                aria-label={`Delete ${card.name}`}
                disabled={busy === id}
                onClick={() => remove(id)}
                className="rounded-full p-2 text-bone-500 transition-colors hover:text-red-300 disabled:opacity-40"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="mt-4 flex h-1.5 overflow-hidden rounded-full">
              <div className="bg-lime-glow" style={{ width: `${card.mix.ai}%` }} />
              <div className="bg-copper-400" style={{ width: `${card.mix.bio}%` }} />
              <div className="bg-bone-100" style={{ width: `${card.mix.robo}%` }} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-bone-300">{card.power}</p>
          </div>
        </div>
      ))}
    </div>
  );
}