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
   * `Heading`) is always available; other names come from the theme's `sizes`
   * option. Drives `font-size` and its paired line-height unless `lineHeight` is
   * set. Default `md`. See {@link FontSizeName}.
   */
  size?: FontSizeName;
  /** Override the inherited colour with this intent (resolves saliency to `mid`). */
  intent?: Intent;
  /** Override the inherited colour at this saliency. Falls back to `mid` when standalone. */
  saliency?: Saliency;
  /**
   * Font weight, by name. The built-in steps (`default`/`semibold`/`bold`/
   * `superbold`) are always available; other names come from the theme's
   * `weights` option. See {@link FontWeightName}.
   */
  weight?: FontWeightName;
  /** Render the text in italics. */
  italic?: TypographyDecorationVariants["italic"];
  /**
   * Font family, by name. `sans` (default) and `mono` are always available;
   * other names are published by the consuming app via the theme's `fonts`
   * option. See {@link FontName}.
   */
  font?: FontName;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * `Text` props. The polymorphism knobs are mutually exclusive:
 *   - `as` — a shorthand for a few plain tags (`div` default, `p`, `label`, `span`), or
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
 * or an arbitrary element with `render`). Colour is inherited from the ambient
 * `--textColor` published by a surrounding `surface`/`component` (falling back
 * to neutral/mid when standalone), so text in a coloured surface matches
 * automatically; pass `intent`/`saliency` to override. Also exposes its
 * resolved colour to descendant `Icon`s via `--iconColor`.
 *
 * `size` picks a font-size and, by default, its paired line-height; further tune
 * with `weight`, `italic`, `lineHeight`, `font`, and `letterSpacing` — all
 * open-ended, consumer-defined vocabularies — plus the `textAlign`, `whiteSpace`,
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
