"use client";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { linkBase } from "./link.css";

export interface LinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  // Colour is locked to the primary text token, not the `color` attribute.
  "color"
> {
  /**
   * Render as a different element/component (base-ui `render` pattern). This is
   * what makes the Link router-agnostic: pass your router's link component so it
   * keeps the system's styling while owning navigation, e.g.
   * `render={<NextLink href="/about" />}` or `render={<RouterLink to="/about" />}`.
   * Renders a plain `<a>` when omitted.
   */
  render?: RenderProp;
  ref?: React.Ref<HTMLAnchorElement>;
  children?: React.ReactNode;
}

/**
 * Link — a router-agnostic inline link. Renders an `<a>` by default; supply your
 * framework's link via `render` to integrate with any router without giving up
 * the system's styling. The colour is locked to the `primary` intent text token
 * and the text is always underlined (the underline, not colour alone, is what
 * signals a link), with oklch-derived hover/active states and the shared focus
 * ring.
 */
export function Link({ render, className, children, ref, ...rest }: LinkProps) {
  return useRender({
    render,
    defaultElement: "a",
    props: {
      ref,
      className: cx(linkBase, focusRingRecipe({ type: "visible" }), className),
      children,
      ...rest,
    },
  });
}
