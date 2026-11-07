import { createThemeContract } from "@vanilla-extract/css";
import {
  BORDER_WIDTH_KEYS,
  FORM_STATES,
  INTENTS,
  LETTER_SPACING_KEYS,
  LINE_HEIGHT_KEYS,
  RADIUS_KEYS,
  SALIENCIES,
  SHADOW_KEYS,
  SPACE_KEYS,
  SURFACE_SALIENCIES,
  TEXT_SIZES,
  TEXT_WEIGHTS,
} from "./constants";

function record<K extends string, V>(keys: readonly K[], make: (key: K) => V): Record<K, V> {
  return Object.fromEntries(keys.map((key) => [key, make(key)])) as Record<K, V>;
}

const s = (): string => "";

const colorTriplet = () => ({ bgc: s(), text: s(), border: s() });
const stateBlock = () => ({ default: colorTriplet(), disabled: colorTriplet() });

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
    size: record(TEXT_SIZES, () => ({ fontSize: s(), lineHeight: s() })),
    fontStep: { lower: s(), upper: s() },
    weight: record(TEXT_WEIGHTS, () => s()),
    letterSpacing: record(LETTER_SPACING_KEYS, () => s()),
    lineHeight: record(LINE_HEIGHT_KEYS, () => s()),
  },
  font: {
    sans: s(),
    mono: s(),
  },
  space: record(SPACE_KEYS, () => s()),
  radius: record(RADIUS_KEYS, () => s()),
  borderWidth: record(BORDER_WIDTH_KEYS, () => s()),
  shadow: record(SHADOW_KEYS, () => s()),
  motion: {
    duration: { fast: s(), base: s(), slow: s() },
    easing: { standard: s() },
  },
  oklchOperator: s(),
};

export const vars = createThemeContract(tokenShape);

export type DesignTokens = typeof tokenShape;

export type ThemeTokensInput = Omit<DesignTokens, "oklchOperator">;
