import { Assembly } from "@/components/landing/assembly";
import { ChapterHud } from "@/components/landing/chapter-hud";
import { Convergence } from "@/components/landing/convergence";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { LabsRail } from "@/components/landing/labs-rail";
import { Numbers } from "@/components/landing/numbers";
import { Marquee } from "@/components/motion/marquee";

const CHAPTERS = [
  { id: "top", label: "Origin" },
  { id: "assembly", label: "Assembly" },
  { id: "convergence", label: "Convergence" },
  { id: "numbers", label: "Numbers" },
  { id: "labs", label: "The labs" },
  { id: "join", label: "Your turn" },
];

export default function HomePage() {
  return (
    <>
      <ChapterHud chapters={CHAPTERS} />

      <div id="top">
        <Hero />
        <div className="space-y-2 overflow-hidden border-y border-bone-100/10 py-8">
          <Marquee
            className="display-tight text-[clamp(3rem,9vw,8rem)] font-extrabold text-bone-50"
            items={["Neural", "Synthetic", "Autonomous", "Living"]}
          />
          <Marquee
            reverse
            className="display-tight ghost-text text-[clamp(3rem,9vw,8rem)] font-extrabold [--stroke:var(--lime-glow)]"
            items={["Emergent", "Engineered", "Adaptive", "Alive"]}
          />
        </div>
      </div>

      <Assembly />

      <div id="convergence">
        <Convergence />
      </div>

      <div id="numbers">
        <Numbers />
      </div>

      <LabsRail />

      <div id="join">
        <FinalCta />
      </div>
    </>
  );
}