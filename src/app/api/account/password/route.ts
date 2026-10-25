import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logInteraction } from "@/lib/interactions";
import { rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validators";

const schema = z.object({
  current: z.string().min(1, "Enter your current password.").max(72),
  next: signupSchema.shape.password,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  if (!rateLimit(`pw:${userId}`, 5, 15 * 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }

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

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const ok = await bcrypt.compare(parsed.data.current, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Your current password is not correct." }, { status: 400 });

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(parsed.data.next, 12) },
  });
  await logInteraction(userId, "PASSWORD_CHANGED", "Changed your password", "account");

  return NextResponse.json({ ok: true });
}