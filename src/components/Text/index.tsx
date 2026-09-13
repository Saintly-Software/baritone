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
   * Typography size, by name — built-in (`xs`–`9xl`) or consumer-defined. Drives
   * `font-size` and, unless `lineHeight` is set, its paired line-height. Default
   * `md`. See {@link FontSizeName}.
   */
  size?: FontSizeName;
  /** Override the inherited colour with this intent (resolves saliency to `mid`). */
  intent?: Intent;
  /** Override the inherited colour at this saliency. Falls back to `mid` when standalone. */
  saliency?: Saliency;
  /**
   * Font weight, by name — built-in (`default`/`semibold`/`bold`/`superbold`) or
   * consumer-defined. See {@link FontWeightName}.
   */
  weight?: FontWeightName;
  /** Render the text in italics. */
  italic?: TypographyDecorationVariants["italic"];
  /**
   * Font family, by name — `sans` (default) / `mono` or consumer-defined. See
   * {@link FontName}.
   */
  font?: FontName;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * `Text` props. The polymorphism knobs are mutually exclusive: `as` (a plain tag
 * shorthand) or `render` (the base-ui escape hatch) — never both.
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
 * Body copy. Renders as a `<div>` by default (`as` for another tag, `render` for
 * anything). Its colour is inherited from the ambient `--textColor` of a
 * surrounding surface (`intent`/`saliency` to override), and exposed to descendant
 * `Icon`s via `--iconColor`. `size` picks a font-size and its paired line-height;
 * tune further with `weight` / `italic` / `lineHeight` / `font` / `letterSpacing`
 * (all open, consumer-defined vocabularies) and the typography layout atoms.
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
