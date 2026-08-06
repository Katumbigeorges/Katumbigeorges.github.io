import { lazy, Suspense, useEffect, useState } from "react";

const Terminal = lazy(() => import("./Terminal"));

/**
 * Keeps only the trigger wiring in the main bundle; the terminal itself is a
 * separate chunk fetched the first time someone actually opens it.
 *
 * After that first open the component stays mounted and renders null when
 * closed, so scrollback, command history and theme changes survive closing —
 * unmounting it would silently reset the session.
 */
export default function TerminalHost() {
  const [open, setOpen] = useState(false);
  // once true, never goes back to false: the chunk is already downloaded
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const openTerminal = () => {
      setMounted(true);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key === "`") ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        setMounted(true);
        setOpen((v) => !v);
      }
      // Escape only closes; it must never trigger the chunk fetch
      if (e.key === "Escape") setOpen((v) => (v ? false : v));
    };
    window.addEventListener("open-terminal", openTerminal);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("open-terminal", openTerminal);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Nothing is rendered on the server or on the first client render, so
  // prerendered HTML and hydration always agree.
  if (!mounted) return null;

  return (
    <Suspense fallback={null}>
      <Terminal open={open} setOpen={setOpen} />
    </Suspense>
  );
}
