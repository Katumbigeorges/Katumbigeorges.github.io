import { useRef, useState } from "react";
import { profile, socials } from "../data";
import { useScramble, useTypewriter } from "../hooks";
import { foundSecret } from "../secrets";
import MatrixRain from "./MatrixRain";

export default function Hero() {
  const { text: role, reduce } = useTypewriter(profile.roles);
  const name = useScramble<HTMLHeadingElement>(profile.name, 1100);
  const clicks = useRef(0);
  const [glitching, setGlitching] = useState(false);

  const pokeName = () => {
    clicks.current += 1;
    if (clicks.current >= 5) {
      clicks.current = 0;
      foundSecret("identity");
      setGlitching(true);
      setTimeout(() => setGlitching(false), 1400);
    }
  };

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden">
      <MatrixRain />
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(40rem 40rem at 70% 30%, rgb(var(--acid) / 0.08), transparent 60%)",
        }}
      />

      <div className="container-page relative z-10 py-28">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-900/60 px-3 py-1 font-mono text-xs text-slate-400 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-acid shadow-[0_0_10px_#9fef00]" />
            {profile.availability}
          </div>

          <p className="mb-3 font-mono text-sm text-slate-400">
            <span className="text-acid">$</span> whoami
          </p>

          <h1
            ref={name.ref}
            className={`font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl md:text-7xl ${
              glitching ? "glitch" : ""
            }`}
          >
            {/* a real button so the identity easter egg stays keyboard-reachable */}
            <button
              type="button"
              onClick={pokeName}
              aria-label={profile.name}
              className="cursor-default text-left"
            >
              {glitching ? profile.handle : name.text || " "}
            </button>
          </h1>

          <div className="mt-4 flex items-center font-mono text-xl text-slate-300 sm:text-2xl">
            <span className="text-acid/70">&gt;&nbsp;</span>
            <span className="text-acid text-glow">{role}</span>
            {!reduce && (
              <span className="ml-1 inline-block h-6 w-2.5 translate-y-0.5 bg-acid animate-blink" />
            )}
          </div>

          <p className="mt-7 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            {profile.tagline}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#projects" className="btn btn-primary">
              ./view_projects
            </a>
            <a href="#contact" className="btn btn-ghost">
              ./contact
            </a>
            <a
              href={socials.github}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              GitHub ↗
            </a>
            <a href={socials.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost">
              LinkedIn ↗
            </a>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-terminal"))}
              className="btn btn-ghost group"
              title="Ctrl+` or Ctrl/Cmd+K works too"
            >
              <span className="text-acid">&gt;_</span> open terminal
            </button>
          </div>

          <div className="mt-10 flex items-center gap-4 font-mono text-xs text-ash">
            <span>location:</span>
            <span className="text-slate-400">{profile.location}</span>
            <span aria-hidden="true">·</span>
            <span>team:</span>
            <span className="text-acid">Moonw4lk</span>
          </div>
        </div>
      </div>

      <a
        href="#whoami"
        className="absolute bottom-6 left-1/2 z-10 flex min-h-[44px] -translate-x-1/2 items-center px-4 font-mono text-xs text-slate-400 transition-colors hover:text-acid"
        aria-label="Scroll down"
      >
        <span className="animate-blink">▼</span>&nbsp;scroll
      </a>
    </section>
  );
}
