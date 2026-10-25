import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logInteraction } from "@/lib/interactions";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(50, "Name must be 50 characters or fewer."),
  bio: z.string().trim().max(200, "Bio must be 200 characters or fewer.").default(""),
  interests: z.array(z.enum(["ai", "biotech", "robotics"])).max(3),
  avatarHue: z.number().int().min(0).max(360),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const d = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: { name: d.name, bio: d.bio || null, interests: d.interests.join(","), avatarHue: d.avatarHue },
  });
  await logInteraction(userId, "PROFILE_UPDATED", "Updated your profile", "account");

  return NextResponse.json({ ok: true });
}