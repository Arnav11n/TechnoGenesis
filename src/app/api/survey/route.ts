import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const LABELS = ["Editing genes", "Living machines", "AI mistakes", "Jobs", "Building life", "AI medicine"];

const schema = z.object({
  visitorId: z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/),
  question: z.number().int().min(0).max(5),
  choice: z.number().int().min(0).max(1),
});

/** Saves one answer. Works for signed-in and anonymous visitors. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`survey:${ip}`, 60, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const { visitorId, question, choice } = parsed.data;

  await prisma.surveyResponse.upsert({
    where: { visitorId_question: { visitorId, question } },
    create: { visitorId, question, choice, userId },
    update: { choice, ...(userId ? { userId } : {}) },
  });

  return NextResponse.json({ ok: true });
}

/** Totals only, no personal data. Open /api/survey in the browser to see the results. */
export async function GET() {
  const rows = await prisma.surveyResponse.groupBy({
    by: ["question", "choice"],
    _count: { _all: true },
  });
  const questions = LABELS.map((label, question) => ({ question, label, hopeful: 0, careful: 0 }));
  for (const r of rows) {
    const q = questions[r.question];
    if (!q) continue;
    if (r.choice === 0) q.hopeful = r._count._all;
    else q.careful = r._count._all;
  }
  const people = await prisma.surveyResponse.findMany({ distinct: ["visitorId"], select: { visitorId: true } });
  return NextResponse.json({ respondents: people.length, questions });
}