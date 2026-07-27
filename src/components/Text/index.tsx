"use client";
import * as React from "react";
import { InternalText } from "../../internal/components/InternalText";
import type {
  TypographyDecorationVariants,
  TypographyWeightVariants,
} from "../../styles/recipes/text.css";
import type { MarginProps, PaddingProps, TypographyAtomProps } from "../../styles/spacingProps";
import type { Intent, Saliency, TextSize } from "../../theme/constants";
import type { RenderProp } from "../../utils/render";

/** Element tags a `Text` can render as via the `as` shorthand. */
export type TextElement = "div" | "p" | "label" | "span";

interface TextOwnProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    MarginProps,
    PaddingProps,
    TypographyAtomProps {
  /**
   * Typography size. Accepts the full shared scale (`xs`–`9xl`) — `Text` and
   * `Heading` render the same sizes and differ only in semantics. Default `md`.
   */
  size?: TextSize;
  /** Override the inherited colour with this intent (resolves saliency to `mid`). */
  intent?: Intent;
  /** Override the inherited colour at this saliency. Falls back to `mid` when standalone. */
  saliency?: Saliency;
  /** Font weight, from the `text.weight` tokens. Overrides the size's default weight. */
  weight?: TypographyWeightVariants["weight"];
  /** Render the text in italics. */
  italic?: TypographyDecorationVariants["italic"];
  /** Render the text in the monospace font family. */
  mono?: boolean;
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
 * Text — body copy. Renders as a `<div>` by default (pick another tag with `as`,
 * or an arbitrary element with `render`). By default its colour is inherited from
 * the ambient `--textColor` published by a surrounding `surface`/`component`
 * (falling back to the neutral/mid token when standalone), so text in a coloured
 * surface matches automatically; pass `intent` and/or `saliency` to override. It
 * also exposes its resolved colour to descendant `Icon`s via `--iconColor`, so
 * inline icons match the text.
 *
 * `size` picks a font-size + line-height from the shared scale; typography can be
 * further tuned with `weight`, `italic`, and `mono`, plus the `textAlign`,
 * `whiteSpace`, and `overflowWrap` layout atoms.
 */
export function Text(props: TextProps) {
  const {
    as,
    render,
    size = "md",
    ...rest
  } = props as TextOwnProps & {
    as?: TextElement;
    render?: RenderProp;
  };

  return <InternalText {...rest} size={size} render={render} defaultElement={as ?? "div"} />;
}
