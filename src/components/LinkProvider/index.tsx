"use client";
import * as React from "react";
import type { RenderProp } from "../../utils/render";

export interface LinkRenderProps {
  href: string;

  className?: string;
  children?: React.ReactNode;

  [key: string]: unknown;
}

export type LinkRenderFn = (props: LinkRenderProps) => React.ReactNode;

export function isInternalHref(href: string): boolean {
  if (href.startsWith("//")) return false;
  if (href.startsWith("#")) return false;
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(href)) return false;
  return true;
}

interface LinkRenderContextValue {
  render: LinkRenderFn;

  isInternal: (href: string) => boolean;
}

const LinkRenderContext = React.createContext<LinkRenderContextValue | null>(null);

export interface LinkProviderProps {
  render: LinkRenderFn;

  isInternal?: (href: string) => boolean;
  children: React.ReactNode;
}

export function LinkProvider({ render, isInternal = isInternalHref, children }: LinkProviderProps) {
  const value = React.useMemo<LinkRenderContextValue>(
    () => ({ render, isInternal }),
    [render, isInternal],
  );
  return <LinkRenderContext.Provider value={value}>{children}</LinkRenderContext.Provider>;
}

export function useLinkRender(
  explicitRender: RenderProp | undefined,
  link: { href?: string; target?: string; download?: unknown },
): RenderProp | undefined {
  const ctx = React.useContext(LinkRenderContext);

  if (explicitRender != null) return explicitRender;
  if (ctx == null || link.href == null) return undefined;
  if (link.download != null && link.download !== false) return undefined;
  if (link.target != null && link.target !== "_self") return undefined;
  if (!ctx.isInternal(link.href)) return undefined;

  return ctx.render as RenderProp;
}
