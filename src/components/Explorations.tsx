import { OrbitalImageWheel } from "./unlumen-ui/orbital-image-wheel";
import { STACK_WHEEL_IMAGES } from "../lib/stack-tools";
import "./Explorations.css";

export default function Explorations() {
  return (
    <section
      id="resume"
      className="ex-resume section-veil surface-dark min-h-svh"
      aria-labelledby="ex-heading"
    >
      <OrbitalImageWheel
        images={STACK_WHEEL_IMAGES}
        autoplay
        autoplaySecondsPerItem={3.6}
        wheelSize={1680}
        itemWidth={196}
        itemHeight={252}
        dim={62}
        blur={0}
        darknessStrength={0.48}
        cropRatio={0.62}
        autoplayLift={72}
        captionOffset={8}
        className="ex-wheel h-full"
        header={
          <header className="ex-copy">
            <p className="ex-eyebrow">Stack</p>
            <h2 id="ex-heading" className="ex-heading">
              The tools we <span className="font-display italic">work</span>{" "}
              with
            </h2>
            <p className="ex-sub">
              Automation wired into the stack you already run.
            </p>
          </header>
        }
      />
    </section>
  );
}
