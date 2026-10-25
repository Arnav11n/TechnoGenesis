import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const KEEP = 100;

/** Saves one question and its answer for the signed-in person. Does nothing if signed out. */
export async function saveChat(userText: string, reply: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return;

    const now = Date.now();
    await prisma.chatMessage.create({ data: { userId, role: "user", text: userText, createdAt: new Date(now) } });
    await prisma.chatMessage.create({ data: { userId, role: "model", text: reply, createdAt: new Date(now + 1) } });

    const old = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: KEEP,
      select: { id: true },
    });
    if (old.length) {
      await prisma.chatMessage.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
    }
  } catch (e) {
    console.error("[chat] could not save", e);
  }
}