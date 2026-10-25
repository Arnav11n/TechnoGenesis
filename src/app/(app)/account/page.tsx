import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  Avatar,
  PasswordForm,
  ProfileForm,
  SavedCreatures,
  SavedRobots,
} from "@/components/account/account-panels";
import { KineticText } from "@/components/motion/kinetic-text";
import { Badge } from "@/components/ui/badge";
import { DEMOS } from "@/lib/demos";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatDate, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Your account" };

const TYPE_LABEL: Record<string, string> = {
  SIGNED_UP: "Joined",
  LOGGED_IN: "Sign-in",
  DEMO_VIEWED: "Lab",
  EXPERIMENT_SAVED: "Saved",
  ROBOT_SAVED: "Saved",
  EVENT_BOOKMARKED: "Bookmark",
  PROFILE_UPDATED: "Profile",
  PASSWORD_CHANGED: "Security",
};

type Card = { name: string; kind: string; power: string; mix: { ai: number; bio: number; robo: number } };

export default async function AccountPage() {
  const user = await requireUser();

  const [me, activity, robots, creatures, answers, views] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true, bio: true, interests: true, avatarHue: true, createdAt: true },
    }),
    prisma.interaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.robotConfig.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.savedCreature.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.surveyResponse.findMany({ where: { userId: user.id }, select: { choice: true } }),
    prisma.interaction.findMany({
      where: { userId: user.id, type: "DEMO_VIEWED" },
      distinct: ["demo"],
      select: { demo: true },
    }),
  ]);

  // Happens if the database was reset while a browser still holds an old sign-in.
  if (!me) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="glass max-w-md rounded-3xl p-8 text-center">
          <h1 className="display-tight text-4xl font-extrabold text-bone-50">Please sign in again.</h1>
          <p className="mt-4 text-bone-300">
            Your sign-in is from an older copy of the database. Sign out, then create your account again.
          </p>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </div>
      </main>
    );
  }

  const creatureItems = creatures.flatMap((c) => {
    try {
      return [{ id: c.id, card: JSON.parse(c.data) as Card }];
    } catch {
      return [];
    }
  });

  const robotItems = robots.map((r) => ({
    id: r.id,
    name: r.name,
    chassis: r.chassis,
    locomotion: r.locomotion,
    aiCore: r.aiCore,
    powerCore: r.powerCore,
    terrainScore: r.terrainScore,
    createdAt: formatDate(r.createdAt),
  }));

  const hopeful = answers.filter((a) => a.choice === 0).length;
  const careful = answers.length - hopeful;
  const first = (me.name ?? "explorer").split(" ")[0];

  const stats = [
    { n: `${views.length}/${DEMOS.length}`, label: "Labs opened" },
    { n: String(robots.length), label: "Robots saved" },
    { n: String(creatures.length), label: "Creatures saved" },
    { n: `${answers.length}/6`, label: "Questions answered" },
  ];

  return (
    <div className="relative overflow-hidden px-6 pb-24 pt-28 md:px-14">
      <div className="pointer-events-none absolute -right-40 top-10 size-[36rem] rounded-full bg-lime-glow/10 blur-[9.375rem]" />
      <div className="pointer-events-none absolute -left-40 top-[40rem] size-[30rem] rounded-full bg-copper-400/10 blur-[9.375rem]" />

      <div className="relative mx-auto max-w-[81.25rem]">
        <Badge tone="lime">Your account</Badge>
        <h1 className="display-tight mt-5 text-[clamp(3rem,9vw,8rem)] font-extrabold text-bone-50">
          <KineticText text={`Welcome, ${first}.`} />
        </h1>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-bone-100/10 bg-bone-100/10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-ink-950 p-6 text-center">
              <p className="display-tight text-5xl font-extrabold tabular-nums text-bone-50">{s.n}</p>
              <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-lime-glow">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[24rem_1fr]">
          {/* left column */}
          <div className="space-y-8">
            <section className="glass rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <Avatar name={me.name ?? "?"} hue={me.avatarHue} size={72} />
                <div className="min-w-0">
                  <p className="truncate font-display text-2xl font-bold text-bone-50">{me.name}</p>
                  <p className="truncate text-sm text-bone-300">{me.email}</p>
                  <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-bone-500">
                    Member since {formatDate(me.createdAt)}
                  </p>
                </div>
              </div>
              <div className="mt-6 border-t border-bone-100/10 pt-6">
                <ProfileForm
                  initial={{
                    name: me.name ?? "",
                    bio: me.bio ?? "",
                    interests: me.interests ? me.interests.split(",").filter(Boolean) : [],
                    hue: me.avatarHue,
                  }}
                />
              </div>
            </section>

            <section className="glass rounded-3xl p-6">
              <p className="mb-5 font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow">Security</p>
              <PasswordForm />
            </section>
          </div>

          {/* right column */}
          <div className="space-y-8">
            <section className="glass rounded-3xl p-6 md:p-8">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow">Saved robots</p>
              <div className="mt-5">
                <SavedRobots items={robotItems} />
              </div>
            </section>

            <section className="glass rounded-3xl p-6 md:p-8">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow">Saved creatures</p>
              <div className="mt-5">
                <SavedCreatures items={creatureItems} />
              </div>
            </section>

            <section className="glass rounded-3xl p-6 md:p-8">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow">Your big questions</p>
              {answers.length === 0 ? (
                <p className="mt-4 text-bone-300">
                  You have not answered any yet.{" "}
                  <Link href="/questions" className="text-lime-glow underline-offset-4 hover:underline">
                    Start the questions
                  </Link>
                  .
                </p>
              ) : (
                <div className="mt-5">
                  <div className="flex h-3 overflow-hidden rounded-full bg-bone-100/10">
                    <div className="bg-lime-glow" style={{ width: `${(hopeful / answers.length) * 100}%` }} />
                    <div className="bg-copper-400" style={{ width: `${(careful / answers.length) * 100}%` }} />
                  </div>
                  <div className="mt-3 flex justify-between font-mono text-[0.6875rem] uppercase tracking-[0.2em]">
                    <span className="text-lime-glow">Hopeful · {hopeful}</span>
                    <span className="text-copper-400">Careful · {careful}</span>
                  </div>
                  <Link
                    href="/questions"
                    className="mt-5 inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-50 hover:text-lime-glow"
                  >
                    Revisit the questions <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              )}
            </section>

            <section className="glass rounded-3xl p-6 md:p-8">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-lime-glow">Recent activity</p>
              <ul className="mt-5 divide-y divide-bone-100/10">
                {activity.length === 0 && <li className="py-3 text-bone-300">Nothing yet.</li>}
                {activity.map((a) => (
                  <li key={a.id} className="flex items-center gap-4 py-3">
                    <span className="w-20 shrink-0 rounded-full border border-bone-100/20 px-3 py-1 text-center font-mono text-[0.625rem] uppercase tracking-[0.15em] text-bone-300">
                      {TYPE_LABEL[a.type] ?? "Event"}
                    </span>
                    <span className="flex-1 text-bone-100">{a.label}</span>
                    <span className="shrink-0 font-mono text-[0.6875rem] text-bone-500">{timeAgo(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}