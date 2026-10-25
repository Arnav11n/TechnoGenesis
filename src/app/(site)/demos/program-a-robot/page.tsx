import type { Metadata } from "next";
import { DemoShell } from "@/components/demos/demo-shell";
import { ProgramRobot } from "@/components/demos/program-robot";

export const metadata: Metadata = { title: "Program a Robot" };

export default function ProgramARobotPage() {
  return (
    <DemoShell
      title="Program a Robot"
      field="AI × Robotics"
      level="Easy"
      intro="A robot only does what its program tells it. Here you write the program yourself, and in the last level you give the robot a sensor and a repeat counter so it can find its own way."
      steps={[
        "Add commands to your program, then press Run program.",
        "If the robot misses the flag or hits a wall, remove or change commands and try again.",
        "Complete all 4 levels. Level 4 needs the Smart step, several blocks and the Repeat counter.",
      ]}
      explain="Robots follow instructions one at a time, so planning matters. The Smart step in level 4 is a tiny version of how real robots work: sense the world, decide what to do, act, then repeat. That sense-decide-act loop, run many times a second, is what lets a robot vacuum avoid furniture or a self-driving car stay in its lane."
    >
      <ProgramRobot />
    </DemoShell>
  );
}