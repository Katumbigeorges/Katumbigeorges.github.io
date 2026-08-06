import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes";
import "./index.css";
import { foundSecret, restoreTheme } from "./secrets";

export const createRoot = ViteReactSSG({ routes }, () => {
  // Browser-only setup. This callback never runs during prerender.
  if (typeof window === "undefined") return;

  restoreTheme();

  // ── console easter egg ─────────────────────────────────────────────────
  const acid = "color:#9fef00;font-family:monospace;";
  const dim = "color:#64748b;font-family:monospace;";
  console.log(
    "%c\n  ┌─────────────────────────────────────┐\n  │  moonw4lk — you opened the console. │\n  │  respect.                           │\n  └─────────────────────────────────────┘\n",
    acid,
  );
  console.log("%c$ hack()  %c← go on, you know you want to", acid, dim);

  window.hack = () => {
    console.log("%c[+] bypassing auth .......... done", acid);
    console.log("%c[+] dumping credentials ..... done (they were all 'hunter2')", acid);
    console.log("%c[+] covering tracks ......... done", acid);
    console.log(
      "%c[✓] flag{c0ns0l3_c0wb0y}",
      "color:#c6ff5a;font-family:monospace;font-weight:bold;",
    );
    console.log("%cthe terminal on the page tracks all of them — run `secrets` there.", dim);
    foundSecret("console");
    return "pwned. georgeskatumbi90@gmail.com if you want to talk shop.";
  };
});

declare global {
  interface Window {
    hack: () => string;
  }
}
