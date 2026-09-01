import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import SecondaryNav from "../components/SecondaryNav";

export default function NotFound() {
  return (
    <PageTransition>
      <SecondaryNav />
      <main className="surface-dark relative z-10 flex min-h-svh flex-col items-center justify-center bg-black px-6 text-center">
        <h1 className="mb-8 font-display text-7xl leading-[0.9] tracking-tight italic md:text-9xl">
          Lost in <span className="text-muted">the wire.</span>
        </h1>
        <p className="mb-12 max-w-md text-sm text-muted md:text-base">
          This route isn&apos;t connected - head home and pick a live system.
        </p>
        <Link
          to="/"
          className="group relative inline-flex transition-transform duration-300 hover:scale-105"
        >
          <span
            className="accent-gradient-animated absolute -inset-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
          <span className="relative rounded-full bg-text-primary px-7 py-3.5 text-sm font-medium text-bg transition-colors duration-300 group-hover:bg-bg group-hover:text-text-primary">
            Back home
          </span>
        </Link>
      </main>
    </PageTransition>
  );
}
