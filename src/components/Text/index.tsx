"use client";
import * as React from "react";
import { InternalText } from "../../internal/components/InternalText";
import type { TypographyDecorationVariants } from "../../styles/recipes/text.css";
import type { MarginProps, PaddingProps, TypographyAtomProps } from "../../styles/spacingProps";
import type { Intent, Saliency } from "../../theme/constants";
import type { FontSizeName } from "../../theme/fontSizes";
import type { FontName } from "../../theme/fonts";
import type { FontWeightName } from "../../theme/fontWeights";
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
   * Typography size, by name. The built-in scale (`xs`–`9xl`, shared with
   * `Heading`) is always available; other names are consumer-defined — published
   * via the theme's `sizes` option and declared on `FontSizeRegistry`. Drives
   * `font-size` and, unless `lineHeight` is set, its paired default line-height.
   * Default `md`. See {@link FontSizeName}.
   */
  size?: FontSizeName;
  /** Override the inherited colour with this intent (resolves saliency to `mid`). */
  intent?: Intent;
  /** Override the inherited colour at this saliency. Falls back to `mid` when standalone. */
  saliency?: Saliency;
  /**
   * Font weight, by name. The built-in steps (`default`/`semibold`/`bold`/
   * `superbold`) are always available; other names are consumer-defined via the
   * theme's `weights` option + `FontWeightRegistry`. See {@link FontWeightName}.
   */
  weight?: FontWeightName;
  /** Render the text in italics. */
  italic?: TypographyDecorationVariants["italic"];
  /**
   * Font family, by name. `sans` (default) and `mono` are always available; other
   * names are defined by the consuming app — it publishes families through the
   * theme's `fonts` option and declares the names on `FontRegistry`. See
   * {@link FontName}.
   */
  font?: FontName;
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
 * `size` picks a font-size and, by default, its paired line-height; typography can
 * be further tuned with `weight`, `italic`, `lineHeight` (leading), `font` (the
 * family), and `letterSpacing` (tracking) — `size`, `weight`, `lineHeight`, `font`,
 * and `letterSpacing` are all open-ended, consumer-defined vocabularies (built-ins
 * plus any names the theme publishes) — plus the `textAlign`, `whiteSpace`,
 * `overflowWrap`, and `textTransform` layout atoms.
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
