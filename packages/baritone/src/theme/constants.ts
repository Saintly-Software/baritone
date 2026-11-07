export const INTENTS = [
  "primary",
  "secondary",
  "neutral",
  "warning",
  "negative",
  "positive",
] as const;
export type Intent = (typeof INTENTS)[number];

export const SALIENCIES = ["high", "mid", "low"] as const;
export type Saliency = (typeof SALIENCIES)[number];

export const SURFACE_SALIENCIES = ["high", "low"] as const;
export type SurfaceSaliency = (typeof SURFACE_SALIENCIES)[number];

export const FORM_STATES = ["neutral", "warning", "invalid", "valid"] as const;
export type FormState = (typeof FORM_STATES)[number];

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

export const TEXT_WEIGHTS = ["default", "semibold", "bold", "superbold"] as const;
export type TextWeight = (typeof TEXT_WEIGHTS)[number];

export const LETTER_SPACING_KEYS = [
  "tighter",
  "tight",
  "normal",
  "wide",
  "wider",
  "widest",
] as const;
export type LetterSpacingKey = (typeof LETTER_SPACING_KEYS)[number];

export const LINE_HEIGHT_KEYS = ["none", "tight", "snug", "normal", "relaxed", "loose"] as const;
export type LineHeightKey = (typeof LINE_HEIGHT_KEYS)[number];

export const SIZES = ["sm", "md", "lg"] as const;
export type Size = (typeof SIZES)[number];

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

export const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;
export type HeadingLevel = (typeof HEADING_LEVELS)[number];

export const FORM_STATE_INTENT: Record<FormState, Intent> = {
  neutral: "primary",
  warning: "warning",
  invalid: "negative",
  valid: "positive",
};

export const HEADING_LEVEL_SIZE: Record<HeadingLevel, TextSize> = {
  1: "4xl",
  2: "3xl",
  3: "2xl",
  4: "xl",
  5: "lg",
  6: "md",
};

export const HEADING_LEVEL_WEIGHT: Record<HeadingLevel, TextWeight> = {
  1: "bold",
  2: "bold",
  3: "bold",
  4: "semibold",
  5: "semibold",
  6: "semibold",
};
