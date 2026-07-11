import { createThemeContract } from "@vanilla-extract/css";
import {
  BODY_SIZES,
  BORDER_WIDTH_KEYS,
  FONT_WEIGHTS,
  FORM_STATES,
  INTENTS,
  RADIUS_KEYS,
  SALIENCIES,
  SHADOW_KEYS,
  SPACE_KEYS,
  SURFACE_SALIENCIES,
  TITLE_SIZES,
  Z_INDEX_KEYS,
} from "./constants";

function record<K extends string, V>(keys: readonly K[], make: (key: K) => V): Record<K, V> {
  return Object.fromEntries(keys.map((key) => [key, make(key)])) as Record<K, V>;
}

// Leaf placeholder. createThemeContract only cares about the *shape*; it
// generates a unique CSS variable for every leaf regardless of value.
const s = (): string => "";

const colorTriplet = () => ({ bgc: s(), text: s(), border: s() });
const stateBlock = () => ({ default: colorTriplet(), disabled: colorTriplet() });
const fontVariant = () => ({
  fontSize: s(),
  lineHeight: s(),
  fontWeight: s(),
});

/**
 * The canonical token shape. This is the single source of truth for both the
 * CSS-variable contract (`vars`) and the value type a theme author supplies
 * (`DesignTokens`).
 */
export const tokenShape = {
  surface: {
    color: record(INTENTS, () => record(SURFACE_SALIENCIES, () => stateBlock())),
    borderRadius: s(),
    focus: record(INTENTS, () => s()),
  },
  component: {
    color: record(INTENTS, () => record(SALIENCIES, () => stateBlock())),
    borderRadius: s(),
    focus: record(INTENTS, () => s()),
  },
  form: {
    color: record(FORM_STATES, () => ({
      background: s(),
      border: s(),
      placeholder: s(),
    })),
    borderRadius: s(),
    focus: record(INTENTS, () => s()),
  },
  text: {
    color: record(INTENTS, () => record(SALIENCIES, () => s())),
    variant: {
      body: record(BODY_SIZES, () => fontVariant()),
      title: record(TITLE_SIZES, () => fontVariant()),
    },
  },
  font: {
    sans: s(),
    mono: s(),
    weight: record(FONT_WEIGHTS, () => s()),
  },
  space: record(SPACE_KEYS, () => s()),
  radius: record(RADIUS_KEYS, () => s()),
  borderWidth: record(BORDER_WIDTH_KEYS, () => s()),
  shadow: record(SHADOW_KEYS, () => s()),
  zIndex: record(Z_INDEX_KEYS, () => s()),
  motion: {
    duration: { fast: s(), base: s(), slow: s() },
    easing: { standard: s() },
  },
  // Per-scheme interaction direction for the relative-colour math:
  // -1 = darken on hover/active (light themes), +1 = lighten (dark themes).
  oklchOperator: s(),
};

/**
 * The CSS-variable contract. Every leaf is a `var(--…)` reference with no
 * value; a theme (via `createDesignSystemTheme`) supplies the values.
 */
export const vars = createThemeContract(tokenShape);

/** Full set of token *values* a theme author supplies. */
export type DesignTokens = typeof tokenShape;

/**
 * Token values supplied to the theme factory. `oklchOperator` is derived from
 * the `scheme` option, so authors don't provide it.
 */
export type ThemeTokensInput = Omit<DesignTokens, "oklchOperator">;
