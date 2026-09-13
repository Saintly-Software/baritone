import type { LetterSpacingName } from "../theme/letterSpacings";
import type { LineHeightName } from "../theme/lineHeights";
import type { Atoms } from "./sprinkles.css";

/**
 * Margin props wired to the spacing scale (each responsive-capable). Shared by
 * the layout primitives (`Box`, `Flex`, …) so they present an identical margin
 * API. Values also accept `auto`.
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
 * Padding props wired to the spacing scale (each responsive-capable). Shared by
 * the layout primitives (`Box`, `Flex`, …) so they present an identical padding
 * API.
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
 * Text-layout props on the typography components. `textAlign` / `whiteSpace` /
 * `overflowWrap` / `textTransform` map straight to a CSS property via the
 * sprinkles; `letterSpacing` / `lineHeight` have open, consumer-defined
 * vocabularies, so they route through the `--textLetterSpacing` /
 * `--textLineHeight` vars instead.
 */
export interface TypographyAtomProps {
  /** `text-align` — logical `start`/`center`/`end` (RTL-safe) or physical `left`/`right`. */
  textAlign?: Atoms["textAlign"];
  /** `white-space` — `nowrap` / `pre` / `pre-wrap` / `pre-line` / `break-spaces`. */
  whiteSpace?: Atoms["whiteSpace"];
  /**
   * `overflow-wrap` — `break-word` breaks a long token only on overflow;
   * `anywhere` also lets the break count toward min-content sizing.
   */
  overflowWrap?: Atoms["overflowWrap"];
  /** `text-transform` — `uppercase`/`lowercase`/`capitalize`. */
  textTransform?: Atoms["textTransform"];
  /**
   * Letter-spacing (tracking), by name. Built-in steps (`tighter`…`widest`) plus
   * consumer-defined names (see {@link LetterSpacingName}). Resolves to
   * `var(--letterSpacing-<name>)`.
   */
  letterSpacing?: LetterSpacingName;
  /**
   * Line-height (leading), by name — an override for the size's paired default.
   * Built-in steps (`none`…`loose`) plus consumer-defined names (see
   * {@link LineHeightName}). Left unset, `size` supplies the line-height.
   */
  lineHeight?: LineHeightName;
}
