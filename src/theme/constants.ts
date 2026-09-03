// Canonical vocabulary for the design system: these tuples drive both the
// theme contract and the generated recipe variants, so they can't drift apart.

export const INTENTS = [
  "primary",
  "secondary",
  "neutral",
  "warning",
  "negative",
  "positive",
] as const;
export type Intent = (typeof INTENTS)[number];

/** Saliency for `component` and `text` element types. */
export const SALIENCIES = ["high", "mid", "low"] as const;
export type Saliency = (typeof SALIENCIES)[number];

/** Surfaces only have two saliency levels (no `mid`). */
export const SURFACE_SALIENCIES = ["high", "low"] as const;
export type SurfaceSaliency = (typeof SURFACE_SALIENCIES)[number];

/** Form controls use `state` instead of intent/saliency. */
export const FORM_STATES = ["neutral", "warning", "invalid", "valid"] as const;
export type FormState = (typeof FORM_STATES)[number];

// The full typography size scale a `size` prop can take — a Tailwind-style ramp
// shared by `Text` and `Heading` (they differ only in semantics, not in sizes
// available). Mirrors the keys of the `text.size` token scale.
export const TEXT_SIZES = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
  "7xl",
  "8xl",
  "9xl",
] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

/** Named font-weight steps a `Text` can select via its `weight` prop. */
export const TEXT_WEIGHTS = ["default", "semibold", "bold", "superbold"] as const;
export type TextWeight = (typeof TEXT_WEIGHTS)[number];

/**
 * Named letter-spacing (tracking) steps for `Text`/`Heading`'s `letterSpacing`
 * prop. Mirrors the `text.letterSpacing` token scale; `normal` is the zero step.
 */
export const LETTER_SPACING_KEYS = [
  "tighter",
  "tight",
  "normal",
  "wide",
  "wider",
  "widest",
] as const;
export type LetterSpacingKey = (typeof LETTER_SPACING_KEYS)[number];

/**
 * Named line-height (leading) steps for `Text`/`Heading`'s `lineHeight` prop —
 * unitless multipliers (Tailwind's leading scale) mirroring `text.lineHeight`.
 * Distinct from the per-size line-heights baked into `text.size` (`size`'s
 * default); this is the standalone override vocabulary.
 */
export const LINE_HEIGHT_KEYS = ["none", "tight", "snug", "normal", "relaxed", "loose"] as const;
export type LineHeightKey = (typeof LINE_HEIGHT_KEYS)[number];

/** Component sizing knob (padding / font / control height). */
export const SIZES = ["sm", "md", "lg"] as const;
export type Size = (typeof SIZES)[number];

/**
 * Where a control's visible label sits relative to the control. `start`/`end`
 * are inline-logical (RTL-safe), `top` stacks the label above.
 */
export const LABEL_POSITIONS = ["top", "start", "end"] as const;
export type LabelPosition = (typeof LABEL_POSITIONS)[number];

export const SPACE_KEYS = ["0", "1", "2", "3", "4", "6", "8", "12", "16"] as const;
export type SpaceKey = (typeof SPACE_KEYS)[number];

export const RADIUS_KEYS = ["none", "sm", "md", "lg", "full"] as const;
export type RadiusKey = (typeof RADIUS_KEYS)[number];

export const BORDER_WIDTH_KEYS = ["thin", "thick"] as const;
export type BorderWidthKey = (typeof BORDER_WIDTH_KEYS)[number];

export const SHADOW_KEYS = ["sm", "md", "lg"] as const;
export type ShadowKey = (typeof SHADOW_KEYS)[number];

/** Semantic heading levels — the number maps 1:1 to the `h1`–`h6` tag. */
export const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;
export type HeadingLevel = (typeof HEADING_LEVELS)[number];

/**
 * Form `state` -> semantic `intent`, driving the focus-ring colour and the
 * border/background token a control reads. `neutral` borrows `primary` (per spec).
 */
export const FORM_STATE_INTENT: Record<FormState, Intent> = {
  neutral: "primary",
  warning: "warning",
  invalid: "negative",
  valid: "positive",
};

/** Default semantic heading level -> visual `size`. */
export const HEADING_LEVEL_SIZE: Record<HeadingLevel, TextSize> = {
  1: "4xl",
  2: "3xl",
  3: "2xl",
  4: "xl",
  5: "lg",
  6: "md",
};

/**
 * Default `font-weight` per heading level. Weight is orthogonal to `size` (no
 * body/title families), so `Heading` applies this by default; override via `weight`.
 */
export const HEADING_LEVEL_WEIGHT: Record<HeadingLevel, TextWeight> = {
  1: "bold",
  2: "bold",
  3: "bold",
  4: "semibold",
  5: "semibold",
  6: "semibold",
};
