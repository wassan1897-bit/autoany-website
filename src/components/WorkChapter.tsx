import "./WorkChapter.css";

export default function WorkChapter() {
  return (
    <section id="work" className="work-ch-stage" aria-labelledby="work-heading">
      <header className="work-ch-copy">
        <p className="work-ch-kicker">Selected work</p>
        <h2 id="work-heading" className="work-ch-title">
          AI Content Engine Studio
        </h2>
      </header>

      <figure className="work-ch-still">
        <img
          src="/assets/systems/01-ai-content-engine.png"
          alt="Content workflow architecture: brief intake, research agent, content draft, Google Drive assets, publish ready"
        />
      </figure>
    </section>
  );
}
