import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SECTIONS } from "../data";

const LINKS = SECTIONS;

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const onHome = useLocation().pathname === "/";
  // off the home page the sections don't exist, so anchors need to go back to it
  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scrollspy — highlight the section currently in view
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const openTerminal = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("open-terminal"));
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-ink-700 bg-ink-950/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <a
          href={onHome ? "#home" : "/"}
          className="group flex min-h-[44px] items-center font-mono text-sm font-medium text-slate-200"
        >
          <span className="text-acid">katumbi</span>
          <span className="text-ash">@</span>
          <span className="text-slate-300">moonw4lk</span>
          <span className="text-ash">:~$</span>
          <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 bg-acid animate-blink" />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={href(l.id)}
                className={`rounded-md px-3 py-2 font-mono text-sm transition-colors hover:text-acid ${
                  active === l.id ? "text-acid" : "text-slate-400"
                }`}
                aria-current={active === l.id ? "true" : undefined}
              >
                <span className="text-acid/60">/</span>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <button
              onClick={openTerminal}
              title="Open terminal (Ctrl+`)"
              className="ml-2 rounded-md border border-ink-600 px-3 py-1.5 font-mono text-xs text-slate-300 transition-colors hover:border-acid/60 hover:text-acid"
            >
              &gt;_ terminal
            </button>
          </li>
        </ul>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-ink-600 text-slate-300 md:hidden"
        >
          <span className="font-mono text-lg leading-none">{open ? "×" : "≡"}</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-700 bg-ink-950/95 md:hidden">
          <ul className="container-page flex flex-col py-3">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={href(l.id)}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-2 py-3 font-mono text-sm hover:text-acid ${
                    active === l.id ? "text-acid" : "text-slate-300"
                  }`}
                >
                  <span className="text-acid/60">/</span>
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={openTerminal}
                className="block w-full rounded-md px-2 py-3 text-left font-mono text-sm text-slate-300 hover:text-acid"
              >
                <span className="text-acid/60">&gt;_</span> terminal
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
