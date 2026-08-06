import type { RouteRecord } from "vite-react-ssg";
import Layout from "./Layout";
import Home from "./pages/Home";
import { writeups } from "./data";

/**
 * Only the home page is eager. Everything else is `lazy` so its chunk stays out
 * of the first load — the write-up route in particular pulls in the whole
 * article corpus, which has no business in the home-page bundle.
 *
 * Each page module exports `Component`, which is what vite-react-ssg's `lazy`
 * resolves. `entry` tells the SSG build which file to trace for CSS/preloads.
 */
export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <Layout />,
    entry: "src/Layout.tsx",
    children: [
      {
        index: true,
        element: <Home />,
        entry: "src/pages/Home.tsx",
      },
      {
        path: "writeups",
        lazy: () => import("./pages/WriteupsIndex"),
        entry: "src/pages/WriteupsIndex.tsx",
      },
      {
        // Slugs are "<category>/<name>", so the route needs two params.
        path: "writeups/:category/:slug",
        lazy: () => import("./pages/Writeup"),
        entry: "src/pages/Writeup.tsx",
        getStaticPaths: () => writeups.map((w) => `writeups/${w.slug}`),
      },
      {
        path: "colophon",
        lazy: () => import("./pages/Colophon"),
        entry: "src/pages/Colophon.tsx",
      },
    ],
  },
];
