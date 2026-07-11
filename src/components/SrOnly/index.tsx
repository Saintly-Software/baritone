"use client";
import * as React from "react";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { srOnly } from "./srOnly.css";

export interface SrOnlyProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** The text (or content) to expose to assistive tech but hide visually. */
  children?: React.ReactNode;

  /**
   * Render as a different element / merge into a given one (base-ui `render`
   * pattern). Defaults to a `<span>`.
   */
  render?: RenderProp;

  ref?: React.Ref<HTMLElement>;
}

/**
 * SrOnly — visually-hidden text that stays in the accessibility tree. Use it to
 * give screen-reader users context that's redundant (or purely visual) for
 * sighted users: a label for an icon-only control, extra wording on a link
 * ("read more <SrOnly>about pricing</SrOnly>"), or a status announcement.
 *
 * The content is present in the DOM and announced by assistive tech, but hidden
 * from view via the clip/rect technique (`srOnly`) rather than `display: none`,
 * which would drop it from the a11y tree entirely. Renders a `<span>` by default.
 */
export function SrOnly({ className, children, render, ref, ...rest }: SrOnlyProps) {
  return useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(srOnly, className),
      children,
      ...rest,
    },
  });
}

SrOnly.displayName = "SrOnly";
