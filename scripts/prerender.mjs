#!/usr/bin/env node
// scripts/prerender.mjs — run AFTER `vite build` (dist/index.html is the template).
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const TEMPLATE_PATH = path.join(DIST, "index.html");

async function main() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error("✖ dist/index.html not found — run `vite build` first.");
    process.exit(1);
  }
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  // Ensure VITE_* vars reach SSR-transformed modules (Supabase client reads them at import).
  const fileEnv = loadEnv("production", ROOT, "VITE_");
  const pick = (k, fb) => fileEnv[k] || process.env[k] || fb;
  const define = {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      pick("VITE_SUPABASE_URL", "https://placeholder.supabase.co")
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      pick("VITE_SUPABASE_PUBLISHABLE_KEY", "placeholder")
    ),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
      pick("VITE_SUPABASE_PROJECT_ID", "placeholder")
    ),
  };

  const vite = await createServer({
    mode: "production",
    define,
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true },
    appType: "custom",
    logLevel: "warn",
  });

  try {
    const { prerenderRoutes } = await vite.ssrLoadModule(
      "/src/prerender/routes.tsx"
    );
    const { renderRoute, injectIntoTemplate } = await vite.ssrLoadModule(
      "/src/prerender/render.tsx"
    );

    let written = 0;
    for (const route of prerenderRoutes) {
      try {
        const { bodyHtml, headHtml } = await renderRoute({
          path: route.path,
          Component: route.Component,
        });
        writeRoute(injectIntoTemplate(template, { headHtml, bodyHtml }), route.path);
        written++;
      } catch (err) {
        console.warn(`⚠ prerender skipped ${route.path}: ${err.message}`);
      }
    }
    console.log(`✔ prerendered ${written} routes`);
  } finally {
    await vite.close();
  }
}

function writeRoute(html, routePath) {
  const rel =
    routePath === "/"
      ? "index.html"
      : path.join(routePath.replace(/^\//, ""), "index.html");
  const outPath = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, "utf8");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✖ prerender failed:", err);
    process.exit(1);
  });
