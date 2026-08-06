import { useEffect, useRef, useState } from "react";
import { competitions, ctfStats } from "../data";
import { useBodyScrollLock, useCountUp, useReveal } from "../hooks";

function Stat({ value, suffix, label, of }: (typeof ctfStats)[number]) {
  const { ref, value: n } = useCountUp(value);
  return (
    <div className="rounded-xl border border-ink-600 bg-ink-900/60 p-6 text-center">
      <div className="font-display text-4xl font-bold text-acid text-glow sm:text-5xl">
        <span ref={ref}>{n.toLocaleString()}</span>
        <span className="text-2xl text-acid/80">{suffix}</span>
      </div>
      <div className="mt-2 font-mono text-xs uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-xs text-ash">{of}</div>
    </div>
  );
}

export default function Ops() {
  const ref = useReveal<HTMLDivElement>();
  const [zoom, setZoom] = useState(false);
  const certSrc = "htb-cyber-apocalypse-2026-certificate.jpg";
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useBodyScrollLock(zoom);

  // Escape closes the lightbox; focus moves in on open and back out on close
  useEffect(() => {
    if (!zoom) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setZoom(false);
      }
      if (e.key === "Tab") {
        // only one focusable inside — keep it there
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
    };
  }, [zoom]);

  return (
    <section id="ops" ref={ref} className="relative py-16 sm:py-24">
      <div className="container-page">
        <div className="reveal">
          <span className="section-label">
            <span className="text-acid/70">02.</span> ops
          </span>
          <h2 className="section-title">Competitions & operations</h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            Where the work gets tested under pressure — CTFs and AI-security competitions,
            with public write-ups afterwards.
          </p>
        </div>

        {/* stat counters */}
        <div className="reveal mt-10 grid gap-4 sm:grid-cols-3">
          {ctfStats.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>

        {/* certificate + featured competition */}
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="reveal lg:col-span-3">
            <button
              ref={openerRef}
              onClick={() => setZoom(true)}
              className="group relative block w-full overflow-hidden rounded-xl border border-ink-600 transition-all hover:border-acid/50 hover:shadow-glow"
              aria-label="View full certificate"
            >
              <img
                src={certSrc}
                alt="HTB Cyber Apocalypse CTF 2026 — official Certificate of Participation for Georges Katumbi, Team Moonw4lk: 689th of 6,744 teams, 30/136 challenges, 21,325 points."
                className="block h-auto w-full"
                width={1400}
                height={990}
                loading="lazy"
              />
              <span className="absolute right-3 top-3 rounded-md bg-ink-950/80 px-2 py-1 font-mono text-xs text-acid opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                click to enlarge ⤢
              </span>
            </button>
            <p className="mt-2 text-center font-mono text-xs text-ash">
              HTB Cyber Apocalypse 2026 — Certificate of Participation · Team Moonw4lk
            </p>
          </div>

          <div className="reveal space-y-4 lg:col-span-2">
            {competitions.map((c) => (
              <article key={c.name} className="card">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-acid">{c.event}</span>
                  <span className="font-mono text-xs text-ash">{c.date}</span>
                </div>
                <h3 className="font-display text-base font-semibold text-white">{c.name}</h3>
                <p className="mt-1 font-mono text-xs text-acid/90">{c.result}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
                {c.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex min-h-[44px] items-center gap-1 font-mono text-sm text-acid hover:underline"
                  >
                    {l.label} ↗
                  </a>
                ))}
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* lightbox */}
      {zoom && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur"
          // only a click on the backdrop itself closes — clicking the
          // certificate you came to look at must not dismiss it
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setZoom(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="HTB Cyber Apocalypse 2026 certificate"
        >
          <img
            src={certSrc}
            alt="HTB Cyber Apocalypse CTF 2026 certificate, full size"
            width={1400}
            height={990}
            className="max-h-[90vh] w-auto max-w-[95vw] rounded-lg border border-acid/40 shadow-glow-lg"
          />
          <button
            ref={closeRef}
            onClick={() => setZoom(false)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-md border border-ink-600 bg-ink-900/80 font-mono text-lg text-slate-200 hover:border-acid/60 hover:text-acid"
            aria-label="Close certificate"
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}
