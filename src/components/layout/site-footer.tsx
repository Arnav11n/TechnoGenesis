import Link from "next/link";

const col = "space-y-3 font-mono text-xs uppercase tracking-[0.2em]";
const link = "block text-bone-300 hover:text-lime-glow";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-bone-100/10 px-6 pb-10 pt-20 md:px-14">
      <div className="mx-auto grid max-w-[93.75rem] gap-12 md:grid-cols-[2fr_1fr_1fr]">
        <p className="max-w-sm text-bone-300">
          An interactive exploration of how artificial intelligence, biotechnology and robotics are
          creating new forms of life.
        </p>

        <div className={col}>
          <p className="text-bone-500">Explore</p>
          <Link href="/demos" className={link}>The labs</Link>
          <Link href="/about" className={link}>About and goals</Link>
          <Link href="/timeline" className={link}>Timeline of life</Link>
          <Link href="/futures" className={link}>Futures</Link>
          <Link href="/questions" className={link}>Big questions</Link>
        </div>

        <div className={col}>
          <p className="text-bone-500">Account</p>
          <Link href="/login" className={link}>Sign in</Link>
          <Link href="/signup" className={link}>Create account</Link>
        </div>
      </div>

      <p
        aria-hidden
        className="display-tight text-outline mt-20 select-none text-center text-[clamp(3rem,13vw,13rem)] font-extrabold text-bone-100/15"
      >
        TechnoGenesis
      </p>

      <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-bone-100/10 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-500 md:flex-row">
        <p>© {new Date().getFullYear()} TechnoGenesis · The birth of a new world</p>
        <p>Built with Next.js · React · three.js · WebGL · Framer Motion · SQLite</p>
      </div>
    </footer>
  );
}