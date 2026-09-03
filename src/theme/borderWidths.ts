import { BORDER_WIDTH_KEYS, type BorderWidthKey } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined border-width vocabulary — an *open* vocabulary mirroring
 * the `font-weight` one in {@link module:./fontWeights}.
 *
 * The built-in steps (`thin`, `thick`) are closed and token-backed. A brand's
 * custom rule (a hairline `0.5px`, an emphatic `4px`) only exists at *its*
 * build/runtime, so this open half can't ride the vanilla-extract contract —
 * instead it's a naming convention (`--borderWidth-<name>` custom properties
 * published by the theme) plus this augmentable type seam.
 *
 * `BorderWidthRegistry` ships empty, so a border-width prop (e.g. Divider's
 * `thickness`) starts as a loose `string` until an app augments it with its own
 * names. Those names must match the `borderWidths` option handed to the theme
 * ({@link createDesignSystemTheme} / {@link createInlineTheme} /
 * `BaritoneTheme`), which emits one `--borderWidth-<name>` per entry (built-in
 * steps are always emitted).
 *
 * @example
 * // Somewhere in the consuming app (e.g. a `baritone.d.ts`):
 * declare module "@saintly-software/baritone" {
 *   interface BorderWidthRegistry {
 *     hair: true;
 *     heavy: true;
 *   }
 * }
 * // Now `<Divider thickness="heavy">` type-checks and autocompletes; `thickness="fat"` errors.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface BorderWidthRegistry {}

/** The border-width names Baritone always publishes, independent of the registry. */
export type BuiltinBorderWidthName = BorderWidthKey;

/**
 * The names accepted by a border-width prop (e.g. Divider's `thickness`). Resolves to
 * a loose `string` until a consumer augments {@link BorderWidthRegistry}, then tightens
 * to the built-ins plus their declared names.
 */
export type BorderWidthName = keyof BorderWidthRegistry extends never
  ? string
  : BuiltinBorderWidthName | (keyof BorderWidthRegistry & string);

/**
 * The CSS custom property holding the `border-width` length for a given `name`
 * — the contract between the theme (publishes it) and a border-width prop
 * (reads it via `var(...)`). Mirrors {@link fontWeightVarName}.
 */
export function borderWidthVarName(name: string): string {
  return `--borderWidth-${name}`;
}

/**
 * The `--borderWidth-<name>` custom properties a theme publishes: the built-in
 * steps (routed through the contract vars so a runtime theme/brand swap still
 * flows through) plus one entry per consumer-supplied value. Spread into a
 * theme class's `vars` (build time) or a `style` object (runtime).
 *
 * Built-in step names are reserved — entries by those names in `widths` are
 * ignored. Customise them through the theme tokens instead.
 */
export function borderWidthVars(widths: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const width of BORDER_WIDTH_KEYS) {
    out[borderWidthVarName(width)] = vars.borderWidth[width];
  }
  for (const [name, value] of Object.entries(widths)) {
    // The built-in steps stay token-backed (`vars.borderWidth.*`) so a bare
    // rule and `thickness="thick"` never diverge; the registry can't shadow them.
    if ((BORDER_WIDTH_KEYS as readonly string[]).includes(name)) continue;
    out[borderWidthVarName(name)] = value;
  }
  return out;
}
