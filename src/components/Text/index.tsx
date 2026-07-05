"use client";
import * as React from "react";
import { textIntentRecipe, textVariantRecipe } from "../../styles/recipes/text.css";
import type { BodySize, Intent, Saliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";

/** Element tags a `Text` can render as via the `as` shorthand. */
export type TextElement = "div" | "p" | "label" | "span";

interface TextOwnProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Body typography variant. Default `base`. */
  variant?: BodySize;
  /** Override the inherited colour with this intent (resolves saliency to `mid`). */
  intent?: Intent;
  /** Override the inherited colour at this saliency. Falls back to `mid` when standalone. */
  saliency?: Saliency;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * `Text` props. The polymorphism knobs are mutually exclusive:
 *   - `as` — a shorthand to pick one of a few plain element tags (`div` default,
 *     `p`, `label`, `span`), or
 *   - `render` — the full base-ui `render` escape hatch (any element/component).
 *
 * Pass one or the other, never both.
 */
export type TextProps = TextOwnProps &
  (
    | {
        /** Render as a different element tag. Default `div`. Mutually exclusive with `render`. */
        as?: TextElement;
        render?: never;
      }
    | {
        as?: never;
        /** Render as a different element/component (base-ui `render` pattern). Mutually exclusive with `as`. */
        render?: RenderProp;
      }
  );

/**
 * Text — body copy. Renders a `body` typography variant, as a `<div>` by default
 * (pick another tag with `as`, or an arbitrary element with `render`). By default
 * its colour is inherited from the ambient `--textColor` published by a
 * surrounding `surface`/`component` (falling back to the neutral/mid token when
 * standalone), so text in a coloured surface matches automatically; pass `intent`
 * and/or `saliency` to override. It also exposes its resolved colour to descendant
 * `Icon`s via `--iconColor`, so inline icons match the text.
 */
export function Text(props: TextProps) {
  const {
    variant = "base",
    intent,
    saliency,
    as,
    render,
    className,
    children,
    ref,
    ...rest
  } = props as TextOwnProps & { as?: TextElement; render?: RenderProp };

  return useRender({
    render,
    defaultElement: as ?? "div",
    props: {
      ref,
      className: cx(
        textIntentRecipe({ intent, saliency }),
        textVariantRecipe({ family: "body", size: variant }),
        className,
      ),
      children,
      ...rest,
    },
  });
}
