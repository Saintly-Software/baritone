import type { LetterSpacingName } from "../theme/letterSpacings";
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
 * Text-layout props surfaced on the typography components. `textAlign`,
 * `whiteSpace`, `overflowWrap`, and `textTransform` map straight to a single CSS
 * property via the sprinkles, so they behave like the other atoms props
 * (responsive-capable). `letterSpacing` is the exception: its vocabulary is
 * open-ended and consumer-defined (like `font`), so it's routed through the
 * `--textLetterSpacing` var rather than an enumerated atom.
 */
export interface TypographyAtomProps {
  /** `text-align` — logical `start`/`center`/`end` (RTL-safe) or physical `left`/`right`. */
  textAlign?: Atoms["textAlign"];
  /** `white-space` — e.g. `nowrap` to keep text on a single line. */
  whiteSpace?: Atoms["whiteSpace"];
  /** `overflow-wrap` — `break-word` to break long unbroken tokens. */
  overflowWrap?: Atoms["overflowWrap"];
  /** `text-transform` — `uppercase`/`lowercase`/`capitalize` to recase the rendered text. */
  textTransform?: Atoms["textTransform"];
  /**
   * Letter-spacing (tracking), by name. The built-in `em`-based steps
   * (`tighter`…`widest`) are always available; other names are consumer-defined —
   * the theme publishes them through its `letterSpacings` option (as
   * `--letterSpacing-<name>` custom properties) and declares the names on
   * {@link LetterSpacingName}'s registry. Resolves to `var(--letterSpacing-<name>)`.
   * `widest` suits small uppercase labels/eyebrows.
   */
  letterSpacing?: LetterSpacingName;
}
