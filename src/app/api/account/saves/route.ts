import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logInteraction } from "@/lib/interactions";
import { PARTS } from "@/lib/sim/robot-parts";

const MAX = 30;

const partOf = (cat: string) => {
  const ids = PARTS.filter((p) => p.cat === cat).map((p) => p.id);
  return z.string().refine((v) => ids.includes(v));
};
const text = (n: number) => z.string().trim().min(1).max(n);

const robotSchema = z.object({
  kind: z.literal("robot"),
  body: partOf("body"),
  move: partOf("move"),
  brain: partOf("brain"),
  power: partOf("power"),
  stats: z.record(z.string(), z.number()),
  passed: z.number().int().min(0).max(5),
});

const creatureSchema = z.object({
  kind: z.literal("creature"),
  card: z.object({
    name: text(40),
    kind: text(70),
    mind: text(220),
    body: text(220),
    frame: text(220),
    power: text(220),
    weakness: text(220),
    real: text(260),
    mix: z.object({ ai: z.number(), bio: z.number(), robo: z.number() }),
  }),
});

const schema = z.discriminatedUnion("kind", [robotSchema, creatureSchema]);

async function currentUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const d = parsed.data;

  if (d.kind === "robot") {
    const count = await prisma.robotConfig.count({ where: { userId } });
    if (count >= MAX) {
      return NextResponse.json({ error: "Your account is full. Delete a saved robot first." }, { status: 409 });
    }
    await prisma.robotConfig.create({
      data: {
        userId,
        name: `Bio-Bot ${count + 1}`,
        chassis: d.body,
        locomotion: d.move,
        powerCore: d.power,
        aiCore: d.brain,
        stats: JSON.stringify(d.stats),
        terrainScore: d.passed,
      },
    });
    await logInteraction(userId, "ROBOT_SAVED", "Saved a Bio-Bot build", "robot-builder");
  } else {
    const count = await prisma.savedCreature.count({ where: { userId } });
    if (count >= MAX) {
      return NextResponse.json({ error: "Your account is full. Delete a saved creature first." }, { status: 409 });
    }
    await prisma.savedCreature.create({
      data: { userId, name: d.card.name, data: JSON.stringify(d.card) },
    });
    await logInteraction(userId, "EXPERIMENT_SAVED", `Saved the creature "${d.card.name}"`, "creature-designer");
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const id = url.searchParams.get("id") ?? "";
  if (!id || (kind !== "robot" && kind !== "creature")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (kind === "robot") await prisma.robotConfig.deleteMany({ where: { id, userId } });
  else await prisma.savedCreature.deleteMany({ where: { id, userId } });

  return NextResponse.json({ ok: true });
}