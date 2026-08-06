import { useEffect, useRef, useState } from "react";

type Toast = { key: number; label: string; found: number; total: number };

/**
 * Bottom-right toasts announcing each unlocked secret.
 * The live region stays mounted at all times — screen readers only announce
 * changes to a region that already existed when the change happens.
 */
export default function SecretToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    const onFound = (e: Event) => {
      const { label, found, total } = (e as CustomEvent).detail;
      const key = ++seq.current; // monotonic: never collides, even if storage is blocked
      setToasts((t) => [...t, { key, label, found, total }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.key !== key)), 4200);
    };
    window.addEventListener("secret-found", onFound);
    return () => window.removeEventListener("secret-found", onFound);
  }, []);

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[110] flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.key}
          className="animate-fade-up rounded-lg border border-acid/40 bg-ink-950/95 px-4 py-3 font-mono text-sm shadow-glow backdrop-blur"
        >
          <span className="text-acid">▲ secret unlocked</span>
          <span className="text-slate-300"> — {t.label}</span>
          <span className="ml-2 text-slate-400">
            [{t.found}/{t.total}]
          </span>
          {t.found === t.total && (
            <p className="mt-1 text-xs text-acid-soft">all secrets found. you win the internet.</p>
          )}
        </div>
      ))}
    </div>
  );
}
