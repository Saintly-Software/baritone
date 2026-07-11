// Canonical vocabulary for the design system. These tuples drive both the
// theme contract shape and the generated recipe variants, so the type-safe
// variant API and the CSS variables can never drift apart.

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

export const BODY_SIZES = ["xs", "sm", "base", "lg", "xl"] as const;
export type BodySize = (typeof BODY_SIZES)[number];

export const TITLE_SIZES = ["sm", "base", "lg", "xl", "2xl", "3xl", "3.5xl", "4xl"] as const;
export type TitleSize = (typeof TITLE_SIZES)[number];

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

export const Z_INDEX_KEYS = ["base", "dropdown", "sticky", "overlay", "modal", "toast"] as const;
export type ZIndexKey = (typeof Z_INDEX_KEYS)[number];

/** Semantic heading levels — the number maps 1:1 to the `h1`–`h6` tag. */
export const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;
export type HeadingLevel = (typeof HEADING_LEVELS)[number];

/**
 * Form `state` -> semantic `intent`. Drives the focus-ring colour and the
 * border/background token a control reads. `neutral` has no intent of its own,
 * so its focus ring borrows `primary` (per spec).
 */
export const FORM_STATE_INTENT: Record<FormState, Intent> = {
  neutral: "primary",
  warning: "warning",
  invalid: "negative",
  valid: "positive",
};

/** Default semantic heading level -> visual `title` variant. */
export const HEADING_LEVEL_VARIANT: Record<HeadingLevel, TitleSize> = {
  1: "3.5xl",
  2: "3xl",
  3: "2xl",
  4: "xl",
  5: "lg",
  6: "base",
};
