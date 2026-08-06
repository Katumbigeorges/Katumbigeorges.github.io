import { useEffect, useState } from "react";
import MatrixRain from "./MatrixRain";
import { foundSecret } from "../secrets";
import { useBodyScrollLock } from "../hooks";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Konami code → full-screen matrix takeover for a few seconds. */
export default function GodMode() {
  const [active, setActive] = useState(false);
  useBodyScrollLock(active);

  useEffect(() => {
    // rolling buffer instead of an index: a stray extra ↑ (or any misfire)
    // can't desync the match the way a naive reset does
    let buf: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buf = [...buf, key].slice(-KONAMI.length);
      if (buf.length === KONAMI.length && buf.every((k, i) => k === KONAMI[i])) {
        buf = [];
        setActive(true);
        foundSecret("konami");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 8000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[95] cursor-pointer bg-ink-950"
      onClick={() => setActive(false)}
      role="dialog"
      aria-modal="true"
      aria-label="God mode"
    >
      <MatrixRain full />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="font-mono text-sm tracking-[0.4em] text-acid/70">↑ ↑ ↓ ↓ ← → ← → B A</p>
        <h2 className="font-display text-4xl font-bold text-acid text-glow sm:text-6xl">
          GOD MODE UNLOCKED
        </h2>
        <p className="font-mono text-sm text-slate-400">
          you clearly grew up right. flag{"{"}k0n4m1_n3v3r_d13s{"}"}
        </p>
        <button
          onClick={() => setActive(false)}
          autoFocus
          className="mt-6 rounded-md border border-ink-600 px-4 py-2 font-mono text-xs text-slate-300 transition-colors hover:border-acid/60 hover:text-acid"
        >
          return to reality (or press esc)
        </button>
      </div>
    </div>
  );
}
