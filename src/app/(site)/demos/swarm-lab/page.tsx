import type { Metadata } from "next";
import { DemoShell } from "@/components/demos/demo-shell";
import { SwarmLab } from "@/components/demos/swarm-lab";

export const metadata: Metadata = { title: "Swarm Lab" };

export default function SwarmLabPage() {
  return (
    <DemoShell
      title="Swarm Lab"
      field="AI × Robotics"
      level="Easy"
      intro="Birds, fish and robots can move together like one living thing, even though nobody is in charge. Each one follows just three simple rules. This lab lets you change those rules and watch the crowd behaviour appear."
      steps={[
        "Move your mouse over the swarm. It follows you.",
        "Drag the three sliders and watch the swarm change.",
        "Press No teamwork and watch the order collapse, then Natural flock to bring it back.",
      ]}
      explain="Each little robot only looks at its close neighbours and follows three rules: stay close, don't bump, and head the same way. From these tiny rules, big organised behaviour appears. Scientists call this emergence, and it is the main idea behind this whole site: when simple parts combine, something new appears. Engineers use the same rules to control drone swarms and groups of rescue robots. This classic model is called boids, invented by Craig Reynolds in 1986."
    >
      <SwarmLab />
    </DemoShell>
  );
}