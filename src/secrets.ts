// ── secrets: the site-wide achievement layer ─────────────────────────────────
// Every easter egg reports here; a toast celebrates each find and progress
// persists in localStorage so hunters can collect them across visits.

export type SecretId = "sudo-flag" | "console" | "konami" | "theme" | "hack" | "identity";

export const SECRETS: { id: SecretId; label: string; hint: string }[] = [
  { id: "sudo-flag", label: "privilege escalation", hint: "root reads what guests cannot." },
  { id: "console", label: "console cowboy", hint: "developers talk to the console." },
  { id: "konami", label: "god mode", hint: "an old cheat code never dies." },
  { id: "theme", label: "chameleon", hint: "not everything has to be green." },
  { id: "hack", label: "script kiddie", hint: "sometimes you just have to run it." },
  { id: "identity", label: "identity crisis", hint: "some names glitch when poked enough." },
];

const KEY = "secrets.found";

export function secretsFound(): SecretId[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => SECRETS.some((s) => s.id === x)) : [];
  } catch {
    return [];
  }
}

export function foundSecret(id: SecretId) {
  const found = secretsFound();
  if (found.includes(id)) return;
  found.push(id);
  try {
    localStorage.setItem(KEY, JSON.stringify(found));
  } catch {
    /* private mode — toast still fires, progress just won't persist */
  }
  const secret = SECRETS.find((s) => s.id === id);
  window.dispatchEvent(
    new CustomEvent("secret-found", {
      detail: { id, label: secret?.label ?? id, found: found.length, total: SECRETS.length },
    }),
  );
}

// ── theme engine ─────────────────────────────────────────────────────────────

export const THEMES = ["phosphor", "amber", "ice", "blood"] as const;
export type Theme = (typeof THEMES)[number];

const THEME_KEY = "site-theme";

export function currentTheme(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return (THEMES as readonly string[]).includes(t ?? "") ? (t as Theme) : "phosphor";
}

export function applyTheme(theme: Theme) {
  if (theme === "phosphor") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
  try {
    if (theme === "phosphor") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("theme-change"));
}

export function restoreTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t && (THEMES as readonly string[]).includes(t) && t !== "phosphor") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch {
    /* ignore */
  }
}
