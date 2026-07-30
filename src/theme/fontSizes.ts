import { TEXT_SIZES, type TextSize } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined font-size vocabulary — an *open* vocabulary mirroring the
 * `font` one in {@link module:./fonts}.
 *
 * The built-in ramp (`xs`…`9xl`) is a closed, token-backed scale baked into the
 * theme contract (see `text.size`). But a brand often wants a size outside that
 * ramp — a hero display step, a dense data figure — and the exact set only exists
 * at *its* build/runtime. So, like `font`, the open half can't ride the
 * vanilla-extract contract; it's a naming convention (`--fontSize-<name>` custom
 * properties, published by the theme) plus this augmentable type seam.
 *
 * Baritone ships `FontSizeRegistry` empty, so the `size` prop starts as a loose
 * `string`. An app declares its own names by augmenting the interface, which
 * tightens `size` to the built-ins plus their declared names with autocompletion
 * — while Baritone stays ignorant of what those names are.
 *
 * The declared names must line up with the values handed to the theme (the
 * `sizes` option on {@link createDesignSystemTheme} / {@link createInlineTheme} /
 * `BaritoneTheme`), which emits one `--fontSize-<name>` per entry. The built-in
 * sizes are always emitted, so they need no registry entry.
 *
 * A consumer-defined size supplies only a `font-size`; its line-height defaults to
 * the `md` step (the built-in sizes keep their tuned per-size line-heights). Pair a
 * display size with an explicit `lineHeight` for tighter leading.
 *
 * @example
 * // Somewhere in the consuming app (e.g. a `baritone.d.ts`):
 * declare module "@saintly-software/baritone" {
 *   interface FontSizeRegistry {
 *     hero: true;
 *     figure: true;
 *   }
 * }
 * // Now `<Heading size="hero">` type-checks and autocompletes; `size="huge"` errors.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface FontSizeRegistry {}

/** The size names Baritone always publishes, independent of the registry. */
export type BuiltinFontSizeName = TextSize;

/**
 * The names accepted by the `size` prop on `Text`/`Heading`. Resolves to a loose
 * `string` until a consumer augments {@link FontSizeRegistry}, then tightens to
 * the built-ins plus their declared names.
 */
export type FontSizeName = keyof FontSizeRegistry extends never
  ? string
  : BuiltinFontSizeName | (keyof FontSizeRegistry & string);

/**
 * The CSS custom property that holds the `font-size` for a given `name`. This is
 * the contract between the value side (the theme publishes `--fontSize-<name>`)
 * and the component side (the `size` prop reads `var(--fontSize-<name>)`). Mirrors
 * {@link fontVarName}.
 */
export function fontSizeVarName(name: string): string {
  return `--fontSize-${name}`;
}

/**
 * The `--fontSize-<name>` custom properties a theme publishes: the built-in ramp
 * (`xs`…`9xl`) — routed through the contract vars so a runtime theme/brand swap
 * still flows through — plus one entry per consumer-supplied value. Spread into a
 * theme class's `vars` (build time) or a `style` object (runtime).
 *
 * The built-in size names are reserved: entries by those names in `sizes` are
 * ignored (they stay token-backed). Customise the built-in ramp through the theme
 * tokens (`BrandSeed.fontScale`) instead.
 */
export function fontSizeVars(sizes: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const size of TEXT_SIZES) {
    out[fontSizeVarName(size)] = vars.text.size[size].fontSize;
  }
  for (const [name, value] of Object.entries(sizes)) {
    // The built-in sizes stay token-backed (`vars.text.size.*`) so bare text and
    // e.g. `size="lg"` never diverge; the registry can't shadow them. Customise the
    // built-ins through the theme tokens instead.
    if ((TEXT_SIZES as readonly string[]).includes(name)) continue;
    out[fontSizeVarName(name)] = value;
  }
  return out;
}
