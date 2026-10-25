import type { Metadata } from "next";
import { ChoiceBlock, FuturesScroll } from "@/components/pages/futures-client";
import { PageHero } from "@/components/pages/page-hero";

export const metadata: Metadata = { title: "Futures" };

export default function FuturesPage() {
  return (
    <>
      <PageHero
        kicker="Futures"
        a="Three possible"
        b="2040s."
        text="Nobody knows exactly what comes next, so here are three imagined futures for AI, biotechnology and robotics. They are not predictions. Scroll, and each one wipes over the last."
      />
      <div className="px-6 pb-6 text-center font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-bone-500 md:px-14">
        Scroll to change the future ↓
      </div>
      <FuturesScroll />
      <ChoiceBlock />
    </>
  );
}