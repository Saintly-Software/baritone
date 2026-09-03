"use client";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import {
  textIntentRecipe,
  textSizeRecipe,
  typographyDecoration,
  type TypographyDecorationVariants,
} from "../../../styles/recipes/text.css";
import { atoms } from "../../../styles/sprinkles.css";
import type { MarginProps, PaddingProps, TypographyAtomProps } from "../../../styles/spacingProps";
import {
  textFontVar,
  textLetterSpacingVar,
  textLineHeightVar,
  textSizeVar,
  textWeightVar,
} from "../../../styles/vars.css";
import type { Intent, Saliency } from "../../../theme/constants";
import {
  fontSizeVarName,
  sizeLineHeightVarName,
  type FontSizeName,
} from "../../../theme/fontSizes";
import { fontVarName, type FontName } from "../../../theme/fonts";
import { fontWeightVarName, type FontWeightName } from "../../../theme/fontWeights";
import { letterSpacingVarName } from "../../../theme/letterSpacings";
import { lineHeightVarName } from "../../../theme/lineHeights";
import { cx } from "../../../utils/cx";
import { composeRefs, useRender, type RenderProp } from "../../../utils/render";
import { isDev, warnIfVarUnset } from "../../warnUnsetVar";

function warnIfFontUnset(el: HTMLElement | null, name: string): void {
  warnIfVarUnset(
    el,
    fontVarName(name),
    () =>
      `[baritone] font="${name}": the CSS variable ${fontVarName(name)} isn't set in this ` +
      `element's theme, so the text falls back to the theme's \`sans\` family. Publish the family ` +
      `via the theme's \`fonts\` option (e.g. \`fonts: { ${name}: '"My Font", sans-serif' }\` on ` +
      "`createInlineTheme` / `createDesignSystemTheme` / `BaritoneTheme`), or use a built-in " +
      "(`sans` / `mono`). Declare the name on `FontRegistry` for autocompletion.",
  );
}

function warnIfLetterSpacingUnset(el: HTMLElement | null, name: string): void {
  warnIfVarUnset(
    el,
    letterSpacingVarName(name),
    () =>
      `[baritone] letterSpacing="${name}": the CSS variable ${letterSpacingVarName(name)} isn't ` +
      `set in this element's theme, so the text falls back to \`normal\` tracking. Publish the ` +
      `value via the theme's \`letterSpacings\` option (e.g. \`letterSpacings: { ${name}: '0.2em' }\` ` +
      "on `createInlineTheme` / `createDesignSystemTheme` / `BaritoneTheme`), or use a built-in " +
      "(`tighter`…`widest`). Declare the name on `LetterSpacingRegistry` for autocompletion.",
  );
}

function warnIfFontSizeUnset(el: HTMLElement | null, name: string): void {
  warnIfVarUnset(
    el,
    fontSizeVarName(name),
    () =>
      `[baritone] size="${name}": the CSS variable ${fontSizeVarName(name)} isn't set in this ` +
      `element's theme, so the text falls back to the \`md\` size. Publish the size via the theme's ` +
      `\`sizes\` option (e.g. \`sizes: { ${name}: '4rem' }\` on \`createInlineTheme\` / ` +
      "`createDesignSystemTheme` / `BaritoneTheme`), or use a built-in (`xs`…`9xl`). Declare the " +
      "name on `FontSizeRegistry` for autocompletion.",
  );
}

function warnIfFontWeightUnset(el: HTMLElement | null, name: string): void {
  warnIfVarUnset(
    el,
    fontWeightVarName(name),
    () =>
      `[baritone] weight="${name}": the CSS variable ${fontWeightVarName(name)} isn't set in this ` +
      `element's theme, so the text falls back to the \`default\` weight. Publish the weight via the ` +
      `theme's \`weights\` option (e.g. \`weights: { ${name}: '900' }\` on \`createInlineTheme\` / ` +
      "`createDesignSystemTheme` / `BaritoneTheme`), or use a built-in " +
      "(`default` / `semibold` / `bold` / `superbold`). Declare the name on `FontWeightRegistry` " +
      "for autocompletion.",
  );
}

function warnIfLineHeightUnset(el: HTMLElement | null, name: string): void {
  warnIfVarUnset(
    el,
    lineHeightVarName(name),
    () =>
      `[baritone] lineHeight="${name}": the CSS variable ${lineHeightVarName(name)} isn't set in ` +
      `this element's theme, so the leading falls back to the \`md\` size's line-height. Publish the ` +
      `value via the theme's \`lineHeights\` option (e.g. \`lineHeights: { ${name}: '2' }\` on ` +
      "`createInlineTheme` / `createDesignSystemTheme` / `BaritoneTheme`), or use a built-in " +
      "(`none`…`loose`). Declare the name on `LineHeightRegistry` for autocompletion.",
  );
}

/**
 * `InternalText` — the shared typography primitive behind `Text` and `Heading`.
 * It owns the class composition (colour, typography base, spacing atoms) plus
 * the base-ui `render` polymorphism. The open-ended typographic knobs (`size`,
 * `weight`, `lineHeight`, `font`, `letterSpacing`) resolve through `--text…`
 * inline vars to a `var(--<x>-<name>)` the active theme published. `Text` and
 * `Heading` differ only in the values they feed in, then delegate here.
 */
export interface InternalTextProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    MarginProps,
    PaddingProps,
    TypographyAtomProps {
  /**
   * Typography size, by name. Drives `font-size` and, unless `lineHeight` is
   * given, its paired default line-height. Built-ins `xs`…`9xl` are always
   * available; other names are consumer-defined via the theme's `sizes` option.
   */
  size: FontSizeName;
  /** Override the inherited colour with this intent (resolves saliency to `mid`). */
  intent?: Intent;
  /** Override the inherited colour at this saliency. Falls back to `mid` when standalone. */
  saliency?: Saliency;
  /**
   * Font weight, by name. Built-ins `default`/`semibold`/`bold`/`superbold` are
   * always available; other names are consumer-defined via the theme's
   * `weights` option.
   */
  weight?: FontWeightName;
  /** Render the text in italics. */
  italic?: TypographyDecorationVariants["italic"];
  /**
   * Font family, by name. Built-ins `sans` (default) and `mono` are always
   * available; any other name must be published by the active theme's `fonts`
   * option and declared on `FontRegistry` for type-safety.
   */
  font?: FontName;
  /** The tag rendered when `render` isn't supplied. */
  defaultElement: keyof React.JSX.IntrinsicElements;
  /** base-ui `render` escape hatch (any element/component). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

export function InternalText({
  size,
  intent,
  saliency,
  weight,
  italic,
  font,
  lineHeight,
  textAlign,
  whiteSpace,
  overflowWrap,
  textTransform,
  letterSpacing,
  defaultElement,
  render,
  className,
  style,
  children,
  ref,
  m,
  mx,
  my,
  mt,
  mr,
  mb,
  ml,
  p,
  px,
  py,
  pt,
  pr,
  pb,
  pl,
  ...rest
}: InternalTextProps) {
  // Point the `--text…` vars at the theme's `var(--<x>-<name>)`. These are
  // inline vars, not variant classes, since every vocabulary here is open-ended
  // and consumer-defined (see `theme/*`). `size` is always set; its leading
  // comes from the size's own `--sizeLineHeight-<size>` by default, or
  // `lineHeight`'s `--lineHeight-<name>` when set (distinct namespaces, so they
  // may share a name). `weight`/`font`/`letterSpacing` set their vars only when
  // passed. Consumer `style` spreads last so it can still override.
  const resolvedStyle = {
    ...assignInlineVars({
      [textSizeVar]: `var(${fontSizeVarName(size)})`,
      [textLineHeightVar]:
        lineHeight !== undefined
          ? `var(${lineHeightVarName(lineHeight)})`
          : `var(${sizeLineHeightVarName(size)})`,
      ...(weight !== undefined ? { [textWeightVar]: `var(${fontWeightVarName(weight)})` } : {}),
      ...(font !== undefined ? { [textFontVar]: `var(${fontVarName(font)})` } : {}),
      ...(letterSpacing !== undefined
        ? { [textLetterSpacingVar]: `var(${letterSpacingVarName(letterSpacing)})` }
        : {}),
    }),
    ...style,
  };

  // Dev-only: warn when a knob points at a var the theme never published.
  // Composes an internal ref to read the node's computed style after mount; a
  // no-op in production, so the consumer's `ref` passes through untouched.
  // `lineHeight` is only checked when set — a size-derived leading falling
  // back to `md` is intended, not a mistake.
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const mergedRef = React.useMemo(() => (isDev() ? composeRefs(nodeRef, ref) : ref), [ref]);
  React.useEffect(() => {
    if (!isDev()) return;
    warnIfFontSizeUnset(nodeRef.current, size);
    if (weight !== undefined) warnIfFontWeightUnset(nodeRef.current, weight);
    if (lineHeight !== undefined) warnIfLineHeightUnset(nodeRef.current, lineHeight);
    if (font !== undefined) warnIfFontUnset(nodeRef.current, font);
    if (letterSpacing !== undefined) warnIfLetterSpacingUnset(nodeRef.current, letterSpacing);
  }, [size, weight, lineHeight, font, letterSpacing]);

  return useRender({
    render,
    defaultElement,
    props: {
      ref: mergedRef,
      className: cx(
        textIntentRecipe({ intent, saliency }),
        textSizeRecipe(),
        typographyDecoration({ italic }),
        atoms({
          m,
          mx,
          my,
          mt,
          mr,
          mb,
          ml,
          p,
          px,
          py,
          pt,
          pr,
          pb,
          pl,
          textAlign,
          whiteSpace,
          overflowWrap,
          textTransform,
        }),
        className,
      ),
      style: resolvedStyle,
      children,
      ...rest,
    },
  });
}
