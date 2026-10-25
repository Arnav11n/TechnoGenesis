import type { Metadata } from "next";
import { CreatureDesigner } from "@/components/demos/creature-designer";
import { DemoShell } from "@/components/demos/demo-shell";

export const metadata: Metadata = { title: "Creature Designer" };

export default function CreatureDesignerPage() {
  return (
    <DemoShell
      title="Creature Designer"
      field="All three"
      level="Easy"
      intro="Describe a living machine in one sentence, and an AI turns it into a trading card split into the three parts every creature on this site has: a mind, a body and a frame."
      steps={[
        "Type an idea, or tap one of the examples.",
        "Press Create my creature and wait a few seconds.",
        "Read the card. It shows the mix of AI, biotech and robotics, plus a real technology that is a first step toward your idea.",
      ]}
      explain="A language AI invents the card from your sentence, following strict instructions: use simple words, stay safe, and point to a real technology instead of making things up. It can still make mistakes, so treat the Closest real thing line as a starting point to check, not a fact. The coloured emblem is drawn by code from the creature's name, so the same name always gives the same emblem."
    >
      <CreatureDesigner />
    </DemoShell>
  );
}