import type { Metadata } from "next";
import { PageHero } from "@/components/pages/page-hero";
import { QuestionsClient } from "@/components/pages/questions-client";

export const metadata: Metadata = { title: "Big questions" };

export default function QuestionsPage() {
  return (
    <>
      <PageHero
        kicker="Big questions"
        a="Just because we can,"
        b="should we?"
        text="Powerful technology raises hard questions. Here are six, each with the strongest case on both sides. Open one and decide for yourself."
      />
      <QuestionsClient />
    </>
  );
}