import { Outlet } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import TerminalHost from "./components/TerminalHost";
import GodMode from "./components/GodMode";
import Boot from "./components/Boot";
import SecretToast from "./components/SecretToast";
import { useCardSpotlight } from "./hooks";

export default function Layout() {
  useCardSpotlight();

  return (
    <div className="relative min-h-screen">
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <Boot />
      <Nav />
      <main id="content">
        <Outlet />
      </main>
      <Footer />
      <TerminalHost />
      <GodMode />
      <SecretToast />
    </div>
  );
}
