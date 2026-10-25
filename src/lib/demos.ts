export type DemoLevel = "Easy" | "Medium";

export type Demo = {
  slug: string;
  title: string;
  tagline: string;
  field: string;
  level: DemoLevel;
  minutes: number;
  ready: boolean;
};

export const DEMOS: Demo[] = [
  {
    slug: "neural-network",
    title: "Neural Network Playground",
    tagline: "Teach an artificial brain to colour in a pattern, and see why a bigger brain learns more.",
    field: "AI",
    level: "Easy",
    minutes: 3,
    ready: true,
  },
  {
    slug: "evolution-lab",
    title: "Evolution Lab",
    tagline: "Be a hungry bird and watch a bug species change colour, generation by generation.",
    field: "Biotech",
    level: "Easy",
    minutes: 3,
    ready: true,
  },
  {
    slug: "robot-builder",
    title: "Bio-Bot Builder",
    tagline: "Mix living tissue, steel, neural brains and bio-power, then test your robot on five terrains.",
    field: "All three",
    level: "Easy",
    minutes: 5,
    ready: true,
  },
  {
    slug: "swarm-lab",
    title: "Swarm Lab",
    tagline: "Steer a crowd of tiny robots with three simple rules and watch them act like one creature.",
    field: "AI × Robotics",
    level: "Easy",
    minutes: 3,
    ready: true,
  },
  {
    slug: "program-a-robot",
    title: "Program a Robot",
    tagline: "Give a robot step-by-step commands, then teach it to use a sensor and decide for itself.",
    field: "AI × Robotics",
    level: "Easy",
    minutes: 4,
    ready: true,
  },
  {
    slug: "creature-designer",
    title: "Creature Designer",
    tagline: "Describe a living machine and an AI turns it into a trading card.",
    field: "All three",
    level: "Easy",
    minutes: 3,
    ready: true,
  },
];