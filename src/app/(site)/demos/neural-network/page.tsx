import type { Metadata } from "next";
import { DemoShell } from "@/components/demos/demo-shell";
import { NeuralPlayground } from "@/components/demos/neural-playground";

export const metadata: Metadata = { title: "Neural Network Playground" };

export default function NeuralNetworkPage() {
  return (
    <DemoShell
      title="Neural Network Playground"
      field="AI"
      level="Easy"
      intro="This lab shows how an artificial brain learns from mistakes. You give it dots of two colours, and it works out where one colour ends and the other begins."
      steps={[
        "Press Start with the Ring and the Small brain. Watch it get stuck.",
        "Press Try the big brain, then Start again. This time it learns the ring.",
        "Pick the Spiral for a harder challenge.",
      ]}
      explain="An artificial brain is made of tiny calculators called cells. Each cell looks at the numbers it is given, weighs them and passes a result on. To train it, we show it a dot, check its guess, and nudge every weight so it is a little less wrong, thousands of times. A small brain has too few cells to draw a curved shape, so it gets stuck. A bigger brain can bend its answer around the dots. The percentage is measured on the dots you see, to keep the idea simple."
    >
      <NeuralPlayground />
    </DemoShell>
  );
}