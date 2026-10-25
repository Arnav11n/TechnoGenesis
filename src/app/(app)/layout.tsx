import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ChatWidget } from "@/components/layout/chat-widget";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const links = [
  { href: "/demos", label: "The labs" },
  { href: "/timeline", label: "Timeline" },
  { href: "/futures", label: "Futures" },
  { href: "/questions", label: "Big questions" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-bone-100/10 bg-ink-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[93.75rem] items-center justify-between px-6 md:px-14">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative flex size-3">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime-glow/60" />
              <span className="relative size-3 rounded-full bg-lime-glow" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-bone-50">TechnoGenesis</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-mono text-xs uppercase tracking-[0.2em] text-bone-300 transition-colors hover:text-lime-glow"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <ChatWidget />
    </>
  );
}