import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ messages: [] });

  const rows = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  return NextResponse.json({ messages: rows.reverse().map((r) => ({ role: r.role, text: r.text })) });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ ok: true });
  await prisma.chatMessage.deleteMany({ where: { userId } });
  return NextResponse.json({ ok: true });
}