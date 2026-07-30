"use client";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import {
  textIntentRecipe,
  textSizeRecipe,
  typographyDecoration,
  type TypographyDecorationVariants,
  typographyWeight,
  type TypographyWeightVariants,
} from "../../../styles/recipes/text.css";
import { atoms } from "../../../styles/sprinkles.css";
import type { MarginProps, PaddingProps, TypographyAtomProps } from "../../../styles/spacingProps";
import { fontSizeVar, fontWeightVar, lineHeightVar, textFontVar } from "../../../styles/vars.css";
import type { Intent, Saliency, TextSize } from "../../../theme/constants";
import { fontVarName, type FontName } from "../../../theme/fonts";
import { TEXT_STYLE_PROPS, textStyleVarName, type TextStyleName } from "../../../theme/textStyles";
import { cx } from "../../../utils/cx";
import { composeRefs, useRender, type RenderProp } from "../../../utils/render";

// Prod-safe by construction: a browser production bundle replaces
// `process.env.NODE_ENV` with `"production"`, so this folds to `false` and the
// whole dev-only path (ref composition + effect) dead-code-eliminates. React is a
// peer dep that already requires `process.env.NODE_ENV` to be defined, so reading
// it unguarded is safe wherever this runs. (Deliberately not the
// `typeof process === "undefined" || …` form — that returns `true` in a browser
// where `process` is undefined, which would leak the dev path into production.)
const isDev = (): boolean => process.env.NODE_ENV !== "production";

// Font names already warned about, so a page full of `<Text font="…">` with the
// same unset name warns once, not once per element.
const warnedUnsetFonts = new Set<string>();

/**
 * Dev-only guard for the open-ended `font` prop. When `font="<name>"` points at a
 * `--font-<name>` the active theme never published, the `font-family` declaration
 * is invalid, so the text silently inherits its ancestor's family instead of doing
 * anything visibly wrong — easy to ship by accident (a typo, or a name declared on
 * `FontRegistry` but never wired into the theme's `fonts`). So probe the resolved
 * value once per name and point the dev at the fix.
 *
 * Skipped under jsdom (unit tests): it doesn't resolve stylesheet custom
 * properties, so it would report every themed element as unset. This is a
 * real-browser aid (dev server, Storybook), which is where the mistake shows up.
 */
function warnIfFontUnset(el: HTMLElement | null, name: string): void {
  if (el == null || warnedUnsetFonts.has(name)) return;
  if (typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom")) return;
  if (getComputedStyle(el).getPropertyValue(fontVarName(name)).trim() !== "") return;
  warnedUnsetFonts.add(name);
  console.warn(
    `[baritone] font="${name}": the CSS variable ${fontVarName(name)} isn't set in this ` +
      `element's theme, so the text falls back to the inherited font. Publish the family via ` +
      `the theme's \`fonts\` option (e.g. \`fonts: { ${name}: '"My Font", sans-serif' }\` on ` +
      "`createInlineTheme` / `createDesignSystemTheme` / `BaritoneTheme`), or use a built-in " +
      "(`sans` / `mono`). Declare the name on `FontRegistry` for autocompletion.",
  );
}

// Text-style names already warned about, so a page full of the same unpublished
// `textStyle` warns once, not once per element.
const warnedUnpublishedTextStyles = new Set<string>();

/**
 * Dev-only guard for the open-ended `textStyle` prop — the `textStyle` analogue of
 * {@link warnIfFontUnset}. When `textStyle="<name>"` names a style the active theme
 * never published, none of its `--textStyle-<name>-*` vars resolve, so the bundle
 * silently does nothing (the text keeps the base size/weight/family) — easy to ship
 * by accident (a typo, or a name declared on `TextStyleRegistry` but never wired
 * into the theme's `textStyles`). So probe the resolved values once per name and
 * point the dev at the fix.
 *
 * Skipped under jsdom (unit tests): it doesn't resolve stylesheet custom
 * properties, so it would report every themed element as unpublished. This is a
 * real-browser aid (dev server, Storybook), which is where the mistake shows up.
 */
function warnIfTextStyleUnpublished(el: HTMLElement | null, name: string): void {
  if (el == null || warnedUnpublishedTextStyles.has(name)) return;
  if (typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom")) return;
  const cs = getComputedStyle(el);
  // A published style sets at least one of its `--textStyle-<name>-*` props; only
  // when every one is empty is the name truly unknown to the theme.
  if (
    TEXT_STYLE_PROPS.some((prop) => cs.getPropertyValue(textStyleVarName(name, prop)).trim() !== "")
  ) {
    return;
  }
  warnedUnpublishedTextStyles.add(name);
  console.warn(
    `[baritone] textStyle="${name}": no --textStyle-${name}-* variables are set in this ` +
      `element's theme, so the style has no effect (the text keeps the base size/weight/` +
      `family). Publish it via the theme's \`textStyles\` option (e.g. ` +
      `\`textStyles: { ${name}: { size: 'xl', lineHeight: 1.5 } }\` on ` +
      "`createInlineTheme` / `createDesignSystemTheme` / `BaritoneTheme`). Declare the name on " +
      "`TextStyleRegistry` for autocompletion.",
  );
}

/**
 * `InternalText` — the shared typography primitive behind `Text` and `Heading`.
 * It owns the whole class composition — colour (`textIntentRecipe`), size +
 * line-height (`textSizeRecipe`), the optional typographic recipes
 * (`typographyWeight` / `typographyDecoration`), the `font` family (via the
 * `--textFont` var), and the text-layout + spacing atoms — plus the base-ui
 * `render` polymorphism. The two
 * public components differ only in the values they feed in (default element,
 * default `size`/`weight`/`saliency`, and their semantic tag), so they resolve
 * those and delegate here.
 */
export interface InternalTextProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    MarginProps,
    PaddingProps,
    TypographyAtomProps {
  /**
   * Typography size — drives both font-size and line-height. Optional: when a
   * `textStyle` supplies the size, callers pass `undefined` so the bundle owns it
   * (the size recipe's base fallback governs); otherwise `Text`/`Heading` default
   * it (`md` / the level's size).
   */
  size?: TextSize;
  /**
   * A named *text style* — an app-defined bundle of typographic properties (size,
   * line-height, weight, family) published by the theme's `textStyles` option and
   * declared on `TextStyleRegistry`. It sets a baseline that explicit props
   * (`size`, `weight`, `font`) still override. See {@link TextStyleName}.
   */
  textStyle?: TextStyleName;
  /** Override the inherited colour with this intent (resolves saliency to `mid`). */
  intent?: Intent;
  /** Override the inherited colour at this saliency. Falls back to `mid` when standalone. */
  saliency?: Saliency;
  /** Font weight, from the `text.weight` tokens. Overrides the size's default weight. */
  weight?: TypographyWeightVariants["weight"];
  /** Render the text in italics. */
  italic?: TypographyDecorationVariants["italic"];
  /**
   * Font family, by name. Built-ins `sans` (default) and `mono` are always
   * available; any other name must be published by the active theme (its `fonts`
   * option emits a `--font-<name>` custom property) and declared on `FontRegistry`
   * for type-safety. Resolves to `var(--font-<name>)`.
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
  textStyle,
  intent,
  saliency,
  weight,
  italic,
  font,
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
  // `textStyle` and `font` both resolve to inline CSS vars (not variant classes),
  // because both vocabularies are open-ended and consumer-defined — see
  // `theme/textStyles.ts` / `theme/fonts.ts`. A `textStyle` points the size recipe's
  // four instance vars at the theme's per-style values (`--textStyle-<name>-<prop>`);
  // omitted props resolve to guaranteed-invalid so the recipe falls back to the base
  // token. An explicit `font` spreads *after*, so its `--textFont` wins over the
  // bundle's family; consumer `style` spreads last so it can still override anything.
  const resolvedStyle =
    textStyle === undefined && font === undefined
      ? style
      : {
          ...(textStyle !== undefined
            ? assignInlineVars({
                [fontSizeVar]: `var(${textStyleVarName(textStyle, "fontSize")})`,
                [lineHeightVar]: `var(${textStyleVarName(textStyle, "lineHeight")})`,
                [fontWeightVar]: `var(${textStyleVarName(textStyle, "fontWeight")})`,
                [textFontVar]: `var(${textStyleVarName(textStyle, "fontFamily")})`,
              })
            : {}),
          ...(font !== undefined
            ? assignInlineVars({ [textFontVar]: `var(${fontVarName(font)})` })
            : {}),
          ...style,
        };

  // Dev-only: warn when `font`/`textStyle` point at vars the theme never published.
  // Compose an internal ref onto the node so we can read its computed style after
  // mount; in production this is a no-op and the consumer's `ref` passes through.
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const mergedRef = React.useMemo(() => (isDev() ? composeRefs(nodeRef, ref) : ref), [ref]);
  React.useEffect(() => {
    if (isDev() && font !== undefined) warnIfFontUnset(nodeRef.current, font);
  }, [font]);
  React.useEffect(() => {
    if (isDev() && textStyle !== undefined) warnIfTextStyleUnpublished(nodeRef.current, textStyle);
  }, [textStyle]);

  return useRender({
    render,
    defaultElement,
    props: {
      ref: mergedRef,
      className: cx(
        textIntentRecipe({ intent, saliency }),
        textSizeRecipe({ size }),
        typographyWeight({ weight }),
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
          letterSpacing,
        }),
        className,
      ),
      style: resolvedStyle,
      children,
      ...rest,
    },
  });
}
