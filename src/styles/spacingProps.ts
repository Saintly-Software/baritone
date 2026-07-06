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
