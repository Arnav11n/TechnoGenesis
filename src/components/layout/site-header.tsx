"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/demos", label: "The labs" },
  { href: "/timeline", label: "Timeline" },
  { href: "/futures", label: "Futures" },
  { href: "/questions", label: "Big questions" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open
          ? "border-b border-bone-100/10 bg-ink-950/75 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[93.75rem] items-center justify-between px-6 md:px-14">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex size-3">
            <span className="absolute inset-0 animate-ping rounded-full bg-lime-glow/60" />
            <span className="relative size-3 rounded-full bg-lime-glow" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-bone-50">TechnoGenesis</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:text-lime-glow",
                pathname.startsWith(link.href) ? "text-lime-glow" : "text-bone-300",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle className="mr-2" />
          {status === "loading" ? (
            <div className="h-9 w-28" />
          ) : session ? (
            <Button href="/account" size="sm">
              Your account
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button href="/signup" size="sm">
                Join free
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-lg p-2 text-bone-100"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 pb-6">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-lg py-3 font-display text-2xl text-bone-50">
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex gap-3">
                {session ? (
                  <Button href="/account" className="flex-1">
                    Your account
                  </Button>
                ) : (
                  <>
                    <Button href="/login" variant="outline" className="flex-1">
                      Sign in
                    </Button>
                    <Button href="/signup" className="flex-1">
                      Join free
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}