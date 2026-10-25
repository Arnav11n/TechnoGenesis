import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { logInteraction } from "@/lib/interactions";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

// A fake hash, so "unknown email" takes as long as "wrong password".
const DUMMY_HASH =
  "$2a$12$CwTycUXWue0Thq9StjUM0uJ8.4yq3wqk0pZ3yQ7mQ1k2l4o5gQ8gS";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new Error("INVALID_INPUT");
        const { email, password } = parsed.data;

        const limit = rateLimit(`login:${email}`, 10, 15 * 60 * 1000);
        if (!limit.ok) throw new Error("RATE_LIMITED");

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.passwordHash) {
          await bcrypt.compare(password, DUMMY_HASH);
          throw new Error("INVALID_CREDENTIALS");
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("ACCOUNT_LOCKED");
        }

        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
          const failed = user.failedLoginCount + 1;
          const shouldLock = failed >= MAX_FAILED_ATTEMPTS;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: shouldLock ? 0 : failed,
              lockedUntil: shouldLock
                ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
                : null,
            },
          });
          throw new Error(shouldLock ? "ACCOUNT_LOCKED" : "INVALID_CREDENTIALS");
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
        });
        await logInteraction(user.id, "LOGGED_IN", "Signed in", "site");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    },
  },
};