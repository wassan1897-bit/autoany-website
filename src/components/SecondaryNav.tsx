import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function SecondaryNav() {
  return (
    <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-black/5 bg-white/50 px-4 backdrop-blur-md dark:border-white/10 dark:bg-black/30 sm:px-6 md:px-10 lg:px-14">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="group flex items-center gap-2 text-sm font-medium text-black transition-colors hover:text-black/70 dark:text-white dark:hover:text-white/70"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Home
        </Link>
      </div>

      <div className="flex items-center">
        <a
          href="mailto:hello@autoany.io"
          className="liquid-glass group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105"
        >
          Let's Talk
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}
