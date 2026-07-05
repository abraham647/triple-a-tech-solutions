#!/usr/bin/env node
// scripts/generate-sitemap.mjs — writes public/sitemap.xml from the shared route source.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BASE_URL = "https://triple-a-tech-solutions.lovable.app";

const routes = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/prerender/staticRoutes.json"), "utf8")
);

const lastmod = new Date().toISOString().slice(0, 10);

const urls = routes.map((e) =>
  [
    "  <url>",
    `    <loc>${BASE_URL}${e.path === "/" ? "/" : e.path}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n")
);

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  "</urlset>",
].join("\n");

fs.writeFileSync(path.join(ROOT, "public/sitemap.xml"), xml);
console.log(`✔ sitemap.xml written (${routes.length} entries)`);
