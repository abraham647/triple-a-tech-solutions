import type React from "react";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Products from "@/pages/Products";
import Careers from "@/pages/Careers";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import staticRoutes from "./staticRoutes.json";

export interface PrerenderRoute {
  path: string;
  Component: React.ComponentType<any>;
}

const componentMap: Record<string, React.ComponentType<any>> = {
  "/": Index,
  "/about": About,
  "/products": Products,
  "/careers": Careers,
  "/privacy": PrivacyPolicy,
  "/terms": Terms,
};

export const prerenderRoutes: PrerenderRoute[] = (
  staticRoutes as { path: string }[]
)
  .filter((r) => componentMap[r.path])
  .map((r) => ({ path: r.path, Component: componentMap[r.path] }));
