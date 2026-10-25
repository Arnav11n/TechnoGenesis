import type { Metadata } from "next";
import { DemoShell } from "@/components/demos/demo-shell";
import { RobotBuilder } from "@/components/demos/robot-builder";

export const metadata: Metadata = { title: "Bio-Bot Builder" };

export default function RobotBuilderPage() {
  return (
    <DemoShell
      title="Bio-Bot Builder"
      field="All three"
      level="Easy"
      intro="Future robots will mix machine parts, living tissue and AI brains. In this lab you design one, then see where it succeeds and where it struggles, because every choice has a trade-off."
      steps={[
        "Pick a body, a way of moving, a brain and a power source. The robot and its stats change instantly.",
        "Press Run the test to send it through five terrains.",
        "Read the tips on any failure, swap a part, and run it again.",
      ]}
      explain="Engineers constantly trade one quality for another: light parts are faster but weaker, flying uses more energy, smarter brains need more power. Here each part adds or removes points from five stats, and each terrain cares about a different mix. Living tissue and bio-cells come from biotechnology, the brains come from AI, and the frame and movement are robotics. The numbers are simplified, but the trade-offs are real engineering ideas."
    >
      <RobotBuilder />
    </DemoShell>
  );
}