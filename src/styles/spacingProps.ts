import type { LetterSpacingName } from "../theme/letterSpacings";
import type { LineHeightName } from "../theme/lineHeights";
import type { Atoms } from "./sprinkles.css";

/**
 * Margin props wired to the spacing scale (responsive-capable), shared by the
 * layout primitives so they present an identical margin API. Also accepts `auto`.
 */
export interface MarginProps {
  /** Margin (all sides), from the spacing scale (or `auto`). */
  m?: Atoms["m"];
  /** Inline margin (left + right). */
  mx?: Atoms["mx"];
  /** Block margin (top + bottom). */
  my?: Atoms["my"];
  mt?: Atoms["mt"];
  mr?: Atoms["mr"];
  mb?: Atoms["mb"];
  ml?: Atoms["ml"];
}

/**
 * Padding props wired to the spacing scale (responsive-capable), shared by the
 * layout primitives so they present an identical padding API.
 */
export interface PaddingProps {
  /** Padding (all sides), from the spacing scale. */
  p?: Atoms["p"];
  /** Inline padding (left + right). */
  px?: Atoms["px"];
  /** Block padding (top + bottom). */
  py?: Atoms["py"];
  pt?: Atoms["pt"];
  pr?: Atoms["pr"];
  pb?: Atoms["pb"];
  pl?: Atoms["pl"];
}

/**
 * Text-layout props surfaced on the typography components. `textAlign`,
 * `whiteSpace`, `overflowWrap`, and `textTransform` map straight to a CSS
 * property via the sprinkles (responsive-capable). `letterSpacing` and
 * `lineHeight` are open-ended, consumer-defined vocabularies (like `font`), so
 * they're routed through CSS vars instead of enumerated atoms.
 */
export interface TypographyAtomProps {
  /** `text-align` — logical `start`/`center`/`end` (RTL-safe) or physical `left`/`right`. */
  textAlign?: Atoms["textAlign"];
  /**
   * `white-space` — collapsing and wrapping mode: `nowrap` single-lines; `pre`
   * preserves newlines and spaces without wrapping; `pre-wrap` preserves them
   * while wrapping; `pre-line` collapses spaces but keeps newlines;
   * `break-spaces` is `pre-wrap` that also wraps trailing spaces.
   */
  whiteSpace?: Atoms["whiteSpace"];
  /**
   * `overflow-wrap` — `break-word` breaks a long token only when it would
   * overflow; `anywhere` also lets the break count toward min-content sizing.
   */
  overflowWrap?: Atoms["overflowWrap"];
  /** `text-transform` — `uppercase`/`lowercase`/`capitalize` to recase the rendered text. */
  textTransform?: Atoms["textTransform"];
  /**
   * Letter-spacing (tracking), by name. Built-in `em`-based steps
   * (`tighter`…`widest`) are always available; other names come from the
   * theme's `letterSpacings` option, declared on {@link LetterSpacingName}'s
   * registry. `widest` suits small uppercase labels/eyebrows.
   */
  letterSpacing?: LetterSpacingName;
  /**
   * Line-height (leading), by name — overrides the size's paired default.
   * Built-in unitless steps (`none`…`loose`) are always available; other names
   * come from the theme's `lineHeights` option, declared on
   * {@link LineHeightName}'s registry. Left unset, `size` supplies it.
   */
  lineHeight?: LineHeightName;
}
