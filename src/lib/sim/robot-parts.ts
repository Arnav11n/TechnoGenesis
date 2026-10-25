export type Stat = "speed" | "strength" | "endurance" | "smarts" | "adapt";
export type Category = "body" | "move" | "brain" | "power";
export type TerrainId = "road" | "rocks" | "sand" | "water" | "rubble";

export const STATS: { id: Stat; label: string; hint: string }[] = [
  { id: "speed", label: "Speed", hint: "How fast it moves" },
  { id: "strength", label: "Strength", hint: "How much force and weight it can handle" },
  { id: "endurance", label: "Endurance", hint: "How long it works before the power runs out" },
  { id: "smarts", label: "Smarts", hint: "How well it senses and decides" },
  { id: "adapt", label: "Adaptability", hint: "How well it copes with surprises" },
];

export const CATEGORIES: { id: Category; title: string; blurb: string }[] = [
  { id: "body", title: "1 · Body", blurb: "What it is made of" },
  { id: "move", title: "2 · Movement", blurb: "How it gets around" },
  { id: "brain", title: "3 · Brain", blurb: "How it thinks" },
  { id: "power", title: "4 · Power", blurb: "What keeps it going" },
];

export type Part = {
  id: string;
  cat: Category;
  label: string;
  sub: string;
  field: "Robotics" | "Biotech" | "AI";
  stats: Partial<Record<Stat, number>>;
  bonus?: Partial<Record<TerrainId, number>>;
};

export const PARTS: Part[] = [
  { id: "steel", cat: "body", label: "Steel frame", sub: "Tough but heavy", field: "Robotics", stats: { strength: 5, speed: -1, endurance: 1 } },
  { id: "carbon", cat: "body", label: "Carbon fibre", sub: "Light and quick", field: "Robotics", stats: { strength: 3, speed: 2, endurance: 1 } },
  { id: "living", cat: "body", label: "Living tissue", sub: "Self-healing muscle", field: "Biotech", stats: { strength: 2, adapt: 4, endurance: 2 } },

  { id: "legs", cat: "move", label: "Legs", sub: "Great on rough ground", field: "Robotics", stats: { speed: 2, adapt: 2 }, bonus: { road: 0, rocks: 2, sand: 0, water: -3, rubble: 2 } },
  { id: "wheels", cat: "move", label: "Wheels", sub: "Fast on smooth ground", field: "Robotics", stats: { speed: 5 }, bonus: { road: 3, rocks: -3, sand: -2, water: -3, rubble: -3 } },
  { id: "treads", cat: "move", label: "Treads", sub: "Slow but unstoppable", field: "Robotics", stats: { strength: 2, speed: 2, endurance: 1 }, bonus: { road: 0, rocks: 1, sand: 2, water: -3, rubble: 1 } },
  { id: "rotors", cat: "move", label: "Rotors", sub: "Flies over everything", field: "Robotics", stats: { speed: 4, endurance: -2 }, bonus: { road: 1, rocks: 3, sand: 3, water: 3, rubble: 3 } },

  { id: "rules", cat: "brain", label: "Fixed rules", sub: "Simple if-then program", field: "AI", stats: { smarts: 2 } },
  { id: "neural", cat: "brain", label: "Neural network", sub: "Trained on examples", field: "AI", stats: { smarts: 5, adapt: 2 } },
  { id: "learner", cat: "brain", label: "Learning AI", sub: "Keeps improving, uses more power", field: "AI", stats: { smarts: 7, adapt: 4, endurance: -1 } },

  { id: "battery", cat: "power", label: "Battery", sub: "Reliable and strong", field: "Robotics", stats: { endurance: 3, strength: 1 } },
  { id: "solar", cat: "power", label: "Solar panels", sub: "Lasts long, slower", field: "Robotics", stats: { endurance: 4, speed: -1 } },
  { id: "biocell", cat: "power", label: "Glucose bio-cell", sub: "Runs on sugar, like you", field: "Biotech", stats: { endurance: 5, adapt: 1, strength: -1 } },
];

export type Terrain = {
  id: TerrainId;
  label: string;
  need: Partial<Record<Stat, number>>;
  tip: string;
};

export const TERRAINS: Terrain[] = [
  { id: "road", label: "Smooth road", need: { speed: 0.5, endurance: 0.3, smarts: 0.2 }, tip: "Speed matters most here. Wheels are brilliant on roads." },
  { id: "rocks", label: "Rocky hill", need: { strength: 0.3, adapt: 0.3, smarts: 0.2, speed: 0.2 }, tip: "Wheels get stuck. Legs or rotors cope with rocks." },
  { id: "sand", label: "Desert sand", need: { strength: 0.3, endurance: 0.4, speed: 0.3 }, tip: "The desert is long. Treads and strong power help." },
  { id: "water", label: "Flooded river", need: { smarts: 0.3, endurance: 0.3, adapt: 0.2, speed: 0.2 }, tip: "Most machines sink. Only rotors can fly over water." },
  { id: "rubble", label: "Collapsed building", need: { strength: 0.3, adapt: 0.3, smarts: 0.3, endurance: 0.1 }, tip: "Rescue work needs a clever, adaptable robot." },
];

const BASE: Record<Stat, number> = { speed: 2, strength: 2, endurance: 2, smarts: 0, adapt: 1 };

export type Sel = Record<Category, string>;

export function computeStats(sel: Sel): Record<Stat, number> {
  const out = { ...BASE };
  for (const id of Object.values(sel)) {
    const p = PARTS.find((x) => x.id === id);
    if (!p) continue;
    for (const k of Object.keys(p.stats) as Stat[]) out[k] += p.stats[k] ?? 0;
  }
  for (const k of Object.keys(out) as Stat[]) out[k] = Math.max(0, Math.min(10, out[k]));
  return out;
}

export const PASS = 5.5;

export function scoreTerrain(stats: Record<Stat, number>, sel: Sel, t: Terrain): number {
  let s = 0;
  for (const k of Object.keys(t.need) as Stat[]) s += (t.need[k] ?? 0) * stats[k];
  const mv = PARTS.find((p) => p.id === sel.move);
  s += mv?.bonus?.[t.id] ?? 0;
  return Math.max(0, Math.min(10, s));
}