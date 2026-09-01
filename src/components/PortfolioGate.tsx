import GateWorkflow from "./GateWorkflow";
import "./PortfolioGate.css";

export default function PortfolioGate() {
  return (
    <section className="gate-scene" aria-label="Entering the portfolio">
      <GateWorkflow />

      <div className="gate-lock">
        <p data-open-in className="gate-kicker">
          Automation makes your
        </p>
        <h2 className="gate-pay">
          <span data-open-in className="gate-pay-ghost">
            business
          </span>{" "}
          <span data-open-in className="gate-pay-fill">
            run itself.
          </span>
        </h2>
      </div>

      <div className="gate-cue pointer-events-none absolute inset-x-0 bottom-[4vh] z-10 flex flex-col items-center text-center">
        <span className="gate-cue-word font-display text-2xl italic sm:text-[2rem]">
          Keep scrolling
        </span>
        <span className="gate-cue-rail">
          <span className="gate-cue-spark" />
        </span>
        <svg className="gate-cue-chevron" viewBox="0 0 24 24" aria-hidden>
          <path d="M5 8.5 L12 15.5 L19 8.5" />
        </svg>
      </div>
    </section>
  );
}
