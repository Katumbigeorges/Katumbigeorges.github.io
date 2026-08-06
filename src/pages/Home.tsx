import { Head } from "vite-react-ssg";
import { SITE_URL, siteMeta } from "../data";
import Hero from "../components/Hero";
import Whoami from "../components/Whoami";
import Arsenal from "../components/Arsenal";
import Ops from "../components/Ops";
import Writeups from "../components/Writeups";
import Projects from "../components/Projects";
import Research from "../components/Research";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <>
      <Head>
        <title>{siteMeta.title}</title>
        <meta name="description" content={siteMeta.description} />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:title" content={siteMeta.title} />
        <meta property="og:description" content={siteMeta.social} />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta name="twitter:title" content={siteMeta.title} />
        <meta name="twitter:description" content={siteMeta.social} />
      </Head>

      <Hero />
      <div className="relative">
        <Whoami />
        <Ops />
        <Writeups />
        <Projects />
        <Arsenal />
        <Research />
        <Contact />
      </div>
    </>
  );
}
