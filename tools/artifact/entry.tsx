import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Shell from "@/components/galaxy/Shell";
import { Begin, Craft, Dream, Studio, Work } from "@/components/galaxy/pages";
import { usePathname } from "./navigation";
import "@/app/globals.css";

/** The five routes, resolved from the hash rather than from the file system. */
function Routes() {
  const path = usePathname();
  if (path === "/capabilities") return <Craft />;
  if (path === "/work") return <Work />;
  if (path === "/studio") return <Studio />;
  if (path === "/contact") return <Begin />;
  return <Dream />;
}

const host = document.getElementById("root");
if (host) {
  createRoot(host).render(
    <StrictMode>
      <Shell><Routes /></Shell>
    </StrictMode>,
  );
}
