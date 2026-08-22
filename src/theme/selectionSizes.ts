import { SIZES, type Size } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined *selection-control size* vocabulary — the sibling of
 * {@link module:./controlSizes} for the selection-control family: `Checkbox`,
 * `Radio` (`RadioGroup`), and `Switch`. It is a **separate, independent** ramp from
 * the control one (and much smaller): these controls line up as a group, not beside
 * buttons and inputs, so a `size` name here resolves to its own set of dimensions.
 *
 * The built-in ramp (`sm`/`md`/`lg`) is a closed, token-backed scale baked into the
 * theme contract (see `sizing.selection`). An app can add steps outside that ramp;
 * like the other open vocabularies, the open half is a naming convention
 * (`--selectionSize-<name>-<field>` custom properties, published by the theme) plus
 * this augmentable type seam.
 *
 * A selection size's shared, always-published bundle is small: the **control-box**
 * height (checkbox/radio are square at this size; a switch's track height) and the
 * **label** font-size. Each control derives its remaining geometry from the box —
 * the checkbox check / radio dot inner size, and the switch's pill width + thumb —
 * by its built-in ratio. For a custom size those derived pieces can be pinned
 * explicitly via the optional `glyph` / `switchWidth` / `switchThumb` fields when
 * the ratio-derived defaults don't suit.
 *
 * Baritone ships `SelectionSizeRegistry` empty, so the `size` prop starts as a loose
 * `string`; augmenting the interface tightens it to the built-ins plus declared
 * names. The declared names must line up with the `selectionSizes` option on
 * {@link createDesignSystemTheme} / {@link createInlineTheme} / `BaritoneTheme`.
 *
 * @example
 * declare module "@saintly-software/baritone" {
 *   interface SelectionSizeRegistry {
 *     cozy: true;
 *   }
 * }
 * // Now `<Checkbox size="cozy">` / `<Switch size="cozy">` type-check and autocomplete.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface SelectionSizeRegistry {}

/**
 * A consumer-defined selection-control size. `controlBox` (the box/track height) and
 * `fontSize` (the label) are required and shared by all three controls; the optional
 * fields pin a custom size's otherwise ratio-derived inner geometry:
 * `glyph` (checkbox check / radio dot), `switchWidth` (pill width), `switchThumb`
 * (thumb diameter).
 */
export type SelectionSizeValue = {
  controlBox: string;
  fontSize: string;
  glyph?: string;
  switchWidth?: string;
  switchThumb?: string;
};

/** The selection-size names Baritone always publishes, independent of the registry. */
export type BuiltinSelectionSizeName = Size;

/**
 * The names accepted by the `size` prop on the selection-control family (`Checkbox`,
 * `Radio`, `Switch`). Resolves to a loose `string` until a consumer augments
 * {@link SelectionSizeRegistry}, then tightens to the built-ins plus their declared
 * names.
 */
export type SelectionSizeName = keyof SelectionSizeRegistry extends never
  ? string
  : BuiltinSelectionSizeName | (keyof SelectionSizeRegistry & string);

/**
 * The CSS custom property that holds one `field` of a selection size's bundle for a
 * given `name`. Deliberately a distinct namespace from
 * {@link controlSizeVarName}'s `--controlSize-<name>-<field>`: the two vocabularies
 * are independent, so the same name may exist in both without one clobbering the
 * other. Mirrors {@link fontSizeVarName}.
 */
export function selectionSizeVarName(name: string, field: string): string {
  return `--selectionSize-${name}-${field}`;
}

/**
 * The custom properties the *selection-size vocabulary* publishes — one
 * `--selectionSize-<name>-<field>` per bundle field. The built-in ramp
 * (`sm`/`md`/`lg`) is routed through the contract vars (`sizing.selection.*`) so a
 * runtime theme/brand swap still flows through; each consumer entry adds its own
 * fields (the optional derived-geometry fields only when set). Spread into a theme
 * class's `vars` (build time) or a `style` object (runtime).
 *
 * The built-in size names are reserved: entries by those names in `selectionSizes`
 * are ignored (they stay token-backed). Customise the built-in ramp through the
 * theme tokens (`BrandSeed.selectionSizeScale`) instead.
 */
export function selectionSizeVars(
  sizes: Record<string, SelectionSizeValue> = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const size of SIZES) {
    out[selectionSizeVarName(size, "controlBox")] = vars.sizing.selection[size].controlBox;
    out[selectionSizeVarName(size, "fontSize")] = vars.sizing.selection[size].fontSize;
  }
  for (const [name, value] of Object.entries(sizes)) {
    // Built-in sizes stay token-backed so bare controls and e.g. `size="md"` never
    // diverge; the registry can't shadow them.
    if ((SIZES as readonly string[]).includes(name)) continue;
    out[selectionSizeVarName(name, "controlBox")] = value.controlBox;
    out[selectionSizeVarName(name, "fontSize")] = value.fontSize;
    // Derived-geometry overrides: published only when set, so each control's
    // ratio-derived default applies otherwise.
    if (value.glyph !== undefined) out[selectionSizeVarName(name, "glyph")] = value.glyph;
    if (value.switchWidth !== undefined) {
      out[selectionSizeVarName(name, "switchWidth")] = value.switchWidth;
    }
    if (value.switchThumb !== undefined) {
      out[selectionSizeVarName(name, "switchThumb")] = value.switchThumb;
    }
  }
  return out;
}
