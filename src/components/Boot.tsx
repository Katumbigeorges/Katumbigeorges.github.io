import { useEffect, useState } from "react";
import { ctfStats } from "../data";

const LINES = [
  "[ ok ] loading moonw4lk.sys",
  "[ ok ] mounting /dev/curiosity",
  `[ ok ] importing ctf_results (${ctfStats[2].value.toLocaleString()} pts)`,
  "[ ok ] arming easter eggs",
  "[ ok ] access granted — welcome, visitor",
];

const STEP_MS = 190;

/**
 * Fast fake boot sequence, shown once per browser session.
 * Skippable with any key/click; skipped entirely for reduced motion.
 */
export default function Boot() {
  // Starts hidden so the prerendered HTML and the first client render agree —
  // deciding this during render would be a hydration mismatch. The real
  // decision happens on mount, one frame later, which nobody can perceive.
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem("booted") === "1") return;
    } catch {
      return; // storage blocked — skip the boot rather than replay it every route
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem("booted", "1");
    } catch {
      /* private mode — boot will just replay */
    }

    const timers: number[] = [];
    for (let i = 1; i <= LINES.length; i++) {
      timers.push(window.setTimeout(() => setShown(i), STEP_MS * i));
    }
    timers.push(window.setTimeout(() => setFading(true), STEP_MS * LINES.length + 350));
    timers.push(window.setTimeout(() => setVisible(false), STEP_MS * LINES.length + 750));

    // a modifier alone shouldn't count as "press any key"
    const skip = (e: Event) => {
      if (e instanceof KeyboardEvent && ["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
      setVisible(false);
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99] flex items-center justify-center bg-ink-950 transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="w-full max-w-md px-6 font-mono text-sm leading-7">
        {LINES.slice(0, shown).map((l) => (
          <p key={l} className="text-slate-400">
            <span className="text-acid">{l.slice(0, 6)}</span>
            {l.slice(6)}
          </p>
        ))}
        <span className="ml-0.5 inline-block h-4 w-2 bg-acid animate-blink" />
        <p className="mt-4 text-xs text-ash">press any key to skip</p>
      </div>
    </div>
  );
}
