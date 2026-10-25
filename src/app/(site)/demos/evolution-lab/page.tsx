import type { Metadata } from "next";
import { DemoShell } from "@/components/demos/demo-shell";
import { EvolutionLab } from "@/components/demos/evolution-lab";

export const metadata: Metadata = { title: "Evolution Lab" };

export default function EvolutionLabPage() {
  return (
    <DemoShell
      title="Evolution Lab"
      field="Biotech"
      level="Easy"
      intro="Evolution sounds slow and complicated, but the idea is simple: the animals that are hardest to catch are the ones that have babies. Here you play the hungry bird and watch a bug species change."
      steps={[
        "Click the bugs you can see to eat them. After 12 bugs, night falls.",
        "The survivors have babies that look like them. Play a few days and watch the colours change.",
        "Switch the background colour and watch the bugs adapt again.",
      ]}
      explain="This is natural selection, the engine of evolution. Each bug's colour is its gene. Bugs that blend into the background are harder to spot, so more of them survive and pass their colour on. Each baby is a copy of a parent with a tiny random change, called a mutation. Over many days the whole group shifts. Nobody designed it. Engineers use the same trick in AI, called evolutionary algorithms: keep the designs that work, mutate them, and repeat."
    >
      <EvolutionLab />
    </DemoShell>
  );
}