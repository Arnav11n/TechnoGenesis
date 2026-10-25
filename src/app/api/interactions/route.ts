import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEMOS } from "@/lib/demos";
import { logInteraction } from "@/lib/interactions";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ demo: z.string().max(40) });
const none = () => new NextResponse(null, { status: 204 });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return none();
  if (!rateLimit(`view:${userId}`, 60, 60_000).ok) return none();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return none();
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return none();

  const demo = DEMOS.find((d) => d.slug === parsed.data.demo);
  if (!demo) return none();

  const recent = await prisma.interaction.findFirst({
    where: {
      userId,
      type: "DEMO_VIEWED",
      demo: demo.slug,
      createdAt: { gt: new Date(Date.now() - 10 * 60_000) },
    },
    select: { id: true },
  });
  if (!recent) await logInteraction(userId, "DEMO_VIEWED", `Opened ${demo.title}`, demo.slug);
  return none();
}