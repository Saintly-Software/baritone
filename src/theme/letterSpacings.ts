import { LETTER_SPACING_KEYS, type LetterSpacingKey } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined letter-spacing (tracking) vocabulary — a second *open*
 * vocabulary in Baritone, mirroring `font` in {@link module:./fonts}.
 *
 * The built-in steps (`tighter`…`widest`) are a closed, token-backed scale, but a
 * brand often needs tracking values outside that ramp that only exist at *its*
 * build/runtime — so, like `font`, this rides a naming convention
 * (`--letterSpacing-<name>` custom properties) plus this augmentable type seam
 * rather than the vanilla-extract contract.
 *
 * `LetterSpacingRegistry` ships empty, so `letterSpacing` starts as a loose
 * `string`; an app augments the interface to declare its own names, tightening the
 * prop to the built-ins plus those names with autocompletion. Declared names must
 * match the `letterSpacings` option passed to {@link createDesignSystemTheme} /
 * {@link createInlineTheme} / `BaritoneTheme`, which emits one
 * `--letterSpacing-<name>` per entry (built-ins are always emitted, so need no
 * registry entry).
 *
 * @example
 * declare module "@saintly-software/baritone" {
 *   interface LetterSpacingRegistry {
 *     eyebrow: true;
 *   }
 * }
 * // `<Text letterSpacing="eyebrow">` now type-checks; `letterSpacing="loose"` errors.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface LetterSpacingRegistry {}

/** The tracking names Baritone always publishes, independent of the registry. */
export type BuiltinLetterSpacingName = LetterSpacingKey;

/**
 * The names accepted by the `letterSpacing` prop on `Text`/`Heading`: a loose
 * `string` until a consumer augments {@link LetterSpacingRegistry}, then the built-ins plus their declared names.
 */
export type LetterSpacingName = keyof LetterSpacingRegistry extends never
  ? string
  : BuiltinLetterSpacingName | (keyof LetterSpacingRegistry & string);

/**
 * The CSS custom property holding the tracking value for a given `name` — the
 * contract between the theme (publishes `--letterSpacing-<name>`) and the component
 * (`letterSpacing` prop reads `var(--letterSpacing-<name>)`). Mirrors {@link fontVarName}.
 */
export function letterSpacingVarName(name: string): string {
  return `--letterSpacing-${name}`;
}

/**
 * The `--letterSpacing-<name>` custom properties a theme publishes: the built-in
 * `tighter`…`widest` (routed through the contract vars so a runtime brand swap still
 * flows through) plus one entry per consumer-supplied value. Spread into a theme
 * class's `vars` (build time) or a `style` object (runtime).
 *
 * Built-in step names are reserved: entries by those names in `letterSpacings` are
 * ignored (they stay token-backed) — customise built-in tracking via theme tokens
 * (`brand.letterSpacing`) instead.
 */
export function letterSpacingVars(
  letterSpacings: Record<string, string> = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of LETTER_SPACING_KEYS) {
    out[letterSpacingVarName(key)] = vars.text.letterSpacing[key];
  }
  for (const [name, value] of Object.entries(letterSpacings)) {
    // Built-in steps stay token-backed (`vars.text.letterSpacing.*`) so bare text and
    // `letterSpacing="widest"` never diverge; the registry can't shadow them.
    if ((LETTER_SPACING_KEYS as readonly string[]).includes(name)) continue;
    out[letterSpacingVarName(name)] = value;
  }
  return out;
}
