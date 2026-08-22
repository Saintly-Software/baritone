import { SIZES, type Size } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined *control size* vocabulary — an *open* vocabulary mirroring
 * the typographic ones in {@link module:./fontSizes} / {@link module:./fontWeights},
 * but for the "control" element family: `Button`, `TextInput`, `Select`, and
 * `Combobox`. These share **one** size ramp on purpose, so a button lines up beside
 * an input at the same `size`.
 *
 * The built-in ramp (`sm`/`md`/`lg`) is a closed, token-backed scale baked into the
 * theme contract (see `sizing.control`). But an app often wants a step outside that
 * ramp — a dense `xs`, a chunky `xl` — and the exact set only exists at *its*
 * build/runtime. So, like the typographic vocabularies, the open half can't ride the
 * vanilla-extract contract; it's a naming convention (`--controlSize-<name>-<field>`
 * custom properties, published by the theme) plus this augmentable type seam.
 *
 * Unlike a font-size (a single scalar), a control size is a **bundle** of correlated
 * dimensions — control height, inline padding, font-size, and (optionally) the gap
 * between icon and label. Each field is published as its own `--controlSize-<name>-<field>`
 * custom property; the recipes read them through single indirection vars.
 *
 * Baritone ships `ControlSizeRegistry` empty, so the `size` prop starts as a loose
 * `string`. An app declares its own names by augmenting the interface, which tightens
 * `size` to the built-ins plus their declared names with autocompletion — while
 * Baritone stays ignorant of what those names are.
 *
 * The declared names must line up with the values handed to the theme (the
 * `controlSizes` option on {@link createDesignSystemTheme} / {@link createInlineTheme} /
 * `BaritoneTheme`), which emits one `--controlSize-<name>-<field>` per field. The
 * built-in sizes are always emitted, so they need no registry entry.
 *
 * @example
 * // Somewhere in the consuming app (e.g. a `baritone.d.ts`):
 * declare module "@saintly-software/baritone" {
 *   interface ControlSizeRegistry {
 *     cozy: true;
 *   }
 * }
 * // Now `<Button size="cozy">` / `<TextInput size="cozy">` type-check and
 * // autocomplete; `size="huge"` errors.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface ControlSizeRegistry {}

/**
 * A consumer-defined control size: the bundle of dimensions a `size` name resolves
 * to across the control family. `height`, `paddingInline`, and `fontSize` are
 * required; `gap` (icon↔label spacing) is optional and falls back to the built-in
 * `md` gap when omitted.
 */
export type ControlSizeValue = {
  height: string;
  paddingInline: string;
  fontSize: string;
  gap?: string;
};

/** The control-size names Baritone always publishes, independent of the registry. */
export type BuiltinControlSizeName = Size;

/**
 * The names accepted by the `size` prop on the control family (`Button`,
 * `TextInput`, `Select`, `Combobox`). Resolves to a loose `string` until a consumer
 * augments {@link ControlSizeRegistry}, then tightens to the built-ins plus their
 * declared names.
 */
export type ControlSizeName = keyof ControlSizeRegistry extends never
  ? string
  : BuiltinControlSizeName | (keyof ControlSizeRegistry & string);

/**
 * The CSS custom property that holds one `field` of a control size's bundle for a
 * given `name`. This is the contract between the value side (the theme publishes
 * `--controlSize-<name>-<field>`) and the component side (the `size` prop reads
 * `var(--controlSize-<name>-<field>)`). Mirrors {@link fontSizeVarName}.
 */
export function controlSizeVarName(name: string, field: string): string {
  return `--controlSize-${name}-${field}`;
}

/**
 * The custom properties the *control-size vocabulary* publishes — one
 * `--controlSize-<name>-<field>` per bundle field. The built-in ramp
 * (`sm`/`md`/`lg`) is routed through the contract vars (`sizing.control.*`) so a
 * runtime theme/brand swap still flows through; each consumer entry adds its own
 * fields. Spread into a theme class's `vars` (build time) or a `style` object
 * (runtime).
 *
 * The built-in size names are reserved: entries by those names in `controlSizes`
 * are ignored (they stay token-backed). Customise the built-in ramp through the
 * theme tokens (`BrandSeed.controlSizeScale`) instead.
 */
export function controlSizeVars(
  sizes: Record<string, ControlSizeValue> = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const size of SIZES) {
    out[controlSizeVarName(size, "height")] = vars.sizing.control[size].height;
    out[controlSizeVarName(size, "paddingInline")] = vars.sizing.control[size].paddingInline;
    out[controlSizeVarName(size, "fontSize")] = vars.sizing.control[size].fontSize;
    out[controlSizeVarName(size, "gap")] = vars.sizing.control[size].gap;
  }
  for (const [name, value] of Object.entries(sizes)) {
    // The built-in sizes stay token-backed (`sizing.control.*`) so bare controls
    // and e.g. `size="md"` never diverge; the registry can't shadow them. Customise
    // the built-ins through the theme tokens instead.
    if ((SIZES as readonly string[]).includes(name)) continue;
    out[controlSizeVarName(name, "height")] = value.height;
    out[controlSizeVarName(name, "paddingInline")] = value.paddingInline;
    out[controlSizeVarName(name, "fontSize")] = value.fontSize;
    // A missing `gap` leaves the var unpublished, so the recipe falls back to the
    // built-in `md` gap.
    if (value.gap !== undefined) out[controlSizeVarName(name, "gap")] = value.gap;
  }
  return out;
}
