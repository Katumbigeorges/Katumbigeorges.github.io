import { Link } from "react-router-dom";
import { repos } from "../data";

export default function Footer() {
  return (
    <footer className="border-t border-ink-700 py-8">
      <div className="container-page flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p className="font-mono text-xs text-slate-400">
          <span className="text-acid">$</span> echo "built &amp; shipped by Georges Katumbi"
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-3 font-mono text-xs text-ash">
          <Link to="/colophon" className="inline-block py-1.5 text-slate-400 hover:text-acid">
            colophon
          </Link>
          <span aria-hidden="true">·</span>
          <a href="/feed.xml" className="inline-block py-1.5 text-slate-400 hover:text-acid">
            rss
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={repos.site}
            className="inline-block py-1.5 text-slate-400 hover:text-acid"
            target="_blank"
            rel="noreferrer"
          >
            source
          </a>
        </p>
      </div>
    </footer>
  );
}
