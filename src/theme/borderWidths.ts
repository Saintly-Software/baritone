import { BORDER_WIDTH_KEYS, type BorderWidthKey } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined border-width vocabulary — an *open* vocabulary mirroring the
 * `font-weight` one in {@link module:./fontWeights}.
 *
 * The built-in steps (`thin`, `thick`) are a closed, token-backed scale baked into
 * the theme contract. But a brand often wants a rule outside that set — a hairline
 * `0.5px`, an emphatic `4px` — and the exact set only exists at *its* build/runtime.
 * So, like `font-weight`, the open half can't ride the vanilla-extract contract; it's
 * a naming convention (`--borderWidth-<name>` custom properties, published by the
 * theme) plus this augmentable type seam.
 *
 * Baritone ships `BorderWidthRegistry` empty, so a border-width prop (e.g. Divider's
 * `thickness`) starts as a loose `string`. An app declares its own names by augmenting
 * the interface, which tightens the prop to the built-ins plus their declared names
 * with autocompletion — while Baritone stays ignorant of what those names are.
 *
 * The declared names must line up with the values handed to the theme (the
 * `borderWidths` option on {@link createDesignSystemTheme} / {@link createInlineTheme} /
 * `BaritoneTheme`), which emits one `--borderWidth-<name>` per entry. The built-in
 * steps are always emitted, so they need no registry entry.
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
 * The CSS custom property that holds the `border-width` length for a given `name`.
 * This is the contract between the value side (the theme publishes
 * `--borderWidth-<name>`) and the component side (a border-width prop reads
 * `var(--borderWidth-<name>)`). Mirrors {@link fontWeightVarName}.
 */
export function borderWidthVarName(name: string): string {
  return `--borderWidth-${name}`;
}

/**
 * The `--borderWidth-<name>` custom properties a theme publishes: the built-in steps
 * (`thin`, `thick`) — routed through the contract vars so a runtime theme/brand swap
 * still flows through — plus one entry per consumer-supplied value. Spread into a theme
 * class's `vars` (build time) or a `style` object (runtime).
 *
 * The built-in step names are reserved: entries by those names in `widths` are ignored
 * (they stay token-backed). Customise the built-in steps through the theme tokens
 * instead.
 */
export function borderWidthVars(widths: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const width of BORDER_WIDTH_KEYS) {
    out[borderWidthVarName(width)] = vars.borderWidth[width];
  }
  for (const [name, value] of Object.entries(widths)) {
    if ((BORDER_WIDTH_KEYS as readonly string[]).includes(name)) continue;
    out[borderWidthVarName(name)] = value;
  }
  return out;
}
