import React from "react";
import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

export interface RenderInput {
  path: string;
  Component: React.ComponentType<any>;
  routePattern?: string;
}

export interface RenderOutput {
  bodyHtml: string;
  headHtml: string;
}

export async function renderRoute(input: RenderInput): Promise<RenderOutput> {
  const routePattern = input.routePattern ?? input.path;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const helmetContext: { helmet?: any } = {};

  const prevCanUseDOM = (HelmetProvider as any).canUseDOM;
  (HelmetProvider as any).canUseDOM = false;

  const prevConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const first = typeof args[0] === "string" ? args[0] : "";
    if (first.includes("useLayoutEffect does nothing on the server")) return;
    prevConsoleError(...(args as []));
  };

  try {
    const bodyHtml = renderToString(
      React.createElement(
        HelmetProvider,
        { context: helmetContext },
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(
            TooltipProvider,
            null,
            React.createElement(
              MemoryRouter,
              { initialEntries: [input.path] },
              React.createElement(
                Routes,
                null,
                React.createElement(Route, {
                  path: routePattern,
                  element: React.createElement(input.Component),
                })
              )
            )
          )
        )
      )
    );

    const h = helmetContext.helmet;
    const headHtml = h
      ? [
          h.title.toString(),
          h.meta.toString(),
          h.link.toString(),
          h.script.toString(),
        ].join("\n")
      : "";
    return { bodyHtml, headHtml };
  } finally {
    (HelmetProvider as any).canUseDOM = prevCanUseDOM;
    console.error = prevConsoleError;
  }
}

const DEFAULT_HEAD_PATTERNS: RegExp[] = [
  /<title>[^<]*<\/title>/i,
  /<meta\s+name="description"[^>]*>/i,
  /<link\s+rel="canonical"[^>]*>/gi,
  /<meta\s+property="og:title"[^>]*>/gi,
  /<meta\s+property="og:description"[^>]*>/gi,
  /<meta\s+property="og:url"[^>]*>/gi,
  /<meta\s+property="og:type"[^>]*>/gi,
  /<meta\s+name="twitter:title"[^>]*>/gi,
  /<meta\s+name="twitter:description"[^>]*>/gi,
];

export function injectIntoTemplate(
  template: string,
  parts: { headHtml: string; bodyHtml: string }
): string {
  let html = template;
  for (const re of DEFAULT_HEAD_PATTERNS) html = html.replace(re, "");
  html = html.replace("</head>", `${parts.headHtml}\n</head>`);
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${parts.bodyHtml}</div>`
  );
  return html;
}
