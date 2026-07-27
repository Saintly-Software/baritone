import type { Atoms } from "./sprinkles.css";

/**
 * CSS-positioning props wired to the atoms scale (each responsive-capable).
 * Shared by the layout primitives (`Box`, `Flex`, `Grid`, …) so a sticky bar or
 * an absolutely-placed region doesn't have to drop to raw CSS. `position` takes
 * the CSS keywords (`sticky`, `relative`, …); the inset props take a spacing
 * token or `auto`.
 *
 * The common case is a sticky region: `position="sticky" top="0"`.
 */
export interface PositionProps {
  /** `position` — `static` | `relative` | `absolute` | `sticky` | `fixed`. */
  position?: Atoms["position"];
  /** `inset` shorthand (all four edges), from the spacing scale (or `auto`). */
  inset?: Atoms["inset"];
  /** `top`, from the spacing scale (or `auto`). */
  top?: Atoms["top"];
  /** `right`, from the spacing scale (or `auto`). */
  right?: Atoms["right"];
  /** `bottom`, from the spacing scale (or `auto`). */
  bottom?: Atoms["bottom"];
  /** `left`, from the spacing scale (or `auto`). */
  left?: Atoms["left"];
}
