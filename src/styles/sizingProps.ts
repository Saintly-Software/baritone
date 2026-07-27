import type { Atoms } from "./sprinkles.css";

/**
 * Height-axis sizing props wired to the atoms scale (each responsive-capable).
 * Shared by the layout primitives (`Box`, `Flex`, `Grid`, …) so they present an
 * identical height API. Values are the spacing tokens, the intrinsic keywords
 * (`full`, `fit-content`, …), and the viewport-fill keywords — `screen`
 * (`100dvh`, tracks the mobile URL bar), `screen-s` (`100svh`), `screen-l`
 * (`100lvh`).
 *
 * The width axis stays per-primitive: `Box` / `Flex` take a friendly `width`
 * shorthand, while `Flex` also exposes raw `maxWidth` / `minWidth`.
 */
export interface SizingProps {
  /** `height`, from the atoms sizing scale (incl. `screen` viewport fill). */
  height?: Atoms["height"];
  /** `min-height`, from the atoms sizing scale (incl. `screen` viewport fill). */
  minHeight?: Atoms["minHeight"];
  /** `max-height`, from the atoms sizing scale (incl. `screen` viewport fill). */
  maxHeight?: Atoms["maxHeight"];
}
