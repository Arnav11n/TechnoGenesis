import Link from "next/link";
import { AuthVisual } from "@/components/auth/auth-visual";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.2fr_1fr]">
      <aside className="relative hidden lg:block">
        <AuthVisual />
      </aside>

      <main className="relative flex min-h-dvh flex-col justify-between px-6 py-8 sm:px-14">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.25em] text-bone-300 transition-colors hover:text-lime-glow"
          >
            ← TechnoGenesis
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-md py-12">{children}</div>

        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-bone-500">
          Secure sign-in · Passwords are encrypted
        </p>
      </main>
    </div>
  );
}