import { contrastRatio } from "./color-math";
import {
  BODY_SIZES,
  INTENTS,
  SALIENCIES,
  SURFACE_SALIENCIES,
  TITLE_SIZES,
  type BodySize,
  type BorderWidthKey,
  type Intent,
  type RadiusKey,
  type Saliency,
  type SpaceKey,
  type TitleSize,
} from "./constants";
import type { ThemeTokensInput } from "./contract.css";
import {
  borderWidth,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  motion,
  radius,
  space,
  zIndex,
} from "./scales";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function record<K extends string, V>(keys: readonly K[], make: (key: K) => V): Record<K, V> {
  return Object.fromEntries(keys.map((k) => [k, make(k)])) as Record<K, V>;
}

const ok = (l: number, c: number, h: number, a?: number): string =>
  a === undefined
    ? `oklch(${round(l)} ${round(c)} ${h})`
    : `oklch(${round(l)} ${round(c)} ${h} / ${a})`;

const round = (n: number) => Math.round(n * 1000) / 1000;

// Near-black / near-white ink used for text-on-colour. The actual choice per
// background is made by `pickInk`, so contrast is correct by construction.
const INK = ok(0.18, 0.01, 260);
const PAPER = ok(0.98, 0.008, 260);

/** Choose whichever ink contrasts best against a background. */
function pickInk(bg: string): string {
  const onPaper = contrastRatio(PAPER, bg) ?? 0;
  const onInk = contrastRatio(INK, bg) ?? 0;
  return onPaper >= onInk ? PAPER : INK;
}

type ColourfulIntent = Exclude<Intent, "neutral">;

// The colourful intents only (neutral is a separate near-greyscale ramp). Used
// to build the per-intent maps a brand seed can override.
const COLOURFUL_INTENTS = INTENTS.filter((i): i is ColourfulIntent => i !== "neutral");

// Hue + base chroma per colourful intent. Neutral is handled separately as a
// near-greyscale ramp. These are the built-in defaults; a `BrandSeed` can
// override any of them (see `buildDefaultTokens`).
const DEFAULT_SEED: Record<ColourfulIntent, { h: number; c: number }> = {
  primary: { h: 258, c: 0.16 },
  secondary: { h: 295, c: 0.17 },
  warning: { h: 75, c: 0.15 },
  negative: { h: 27, c: 0.18 },
  positive: { h: 150, c: 0.13 },
};

const NEUTRAL_H = 260;
const NEUTRAL_C = 0.005;

/** The bold "high" background lightness per colourful intent (built-in default). */
const DEFAULT_BOLD_L: Record<ColourfulIntent, number> = {
  primary: 0.53,
  secondary: 0.55,
  warning: 0.82,
  negative: 0.56,
  positive: 0.62,
};

type Triplet = { bgc: string; text: string; border: string };
type Block = { default: Triplet; disabled: Triplet };

/**
 * A small "brand seed": the handful of knobs most brands actually customise.
 * Everything is optional and merged over the built-in defaults, so a consumer
 * can supply just a brand hue for `primary` (or new fonts) and inherit the rest
 * — including the derived interaction states and the build-time contrast check.
 */
export interface BrandSeed {
  /**
   * Hue + base chroma per colourful intent, merged over the built-in seeds.
   * Override just `primary` and leave the rest; the `neutral` intent is a
   * near-greyscale ramp and isn't seeded here.
   */
  intents?: Partial<Record<ColourfulIntent, Partial<{ h: number; c: number }>>>;
  /** The bold "high" background lightness (0–1) per colourful intent. */
  boldL?: Partial<Record<ColourfulIntent, number>>;
  /** Font families. */
  fonts?: Partial<{ sans: string; mono: string }>;
  /**
   * Radius-scale overrides. Also drive the `borderRadius` of surfaces (`lg`),
   * components and form controls (`md`).
   */
  radius?: Partial<Record<RadiusKey, string>>;
  /** Spacing-scale overrides. */
  space?: Partial<Record<SpaceKey, string>>;
  /** Border-width-scale overrides. */
  borderWidth?: Partial<Record<BorderWidthKey, string>>;
}

/** Fully-resolved seed (defaults filled in) threaded through the colour math. */
interface ResolvedSeed {
  intents: Record<ColourfulIntent, { h: number; c: number }>;
  boldL: Record<ColourfulIntent, number>;
}

function resolveSeed(brand: BrandSeed): ResolvedSeed {
  return {
    intents: record(COLOURFUL_INTENTS, (i) => ({
      h: brand.intents?.[i]?.h ?? DEFAULT_SEED[i].h,
      c: brand.intents?.[i]?.c ?? DEFAULT_SEED[i].c,
    })),
    boldL: record(COLOURFUL_INTENTS, (i) => brand.boldL?.[i] ?? DEFAULT_BOLD_L[i]),
  };
}

// ---------------------------------------------------------------------------
// Component colours
// ---------------------------------------------------------------------------

function disabledTriplet(isDark: boolean, transparentBg: boolean): Triplet {
  const bgc = transparentBg
    ? "transparent"
    : isDark
      ? ok(0.26, 0, NEUTRAL_H)
      : ok(0.95, 0, NEUTRAL_H);
  return {
    bgc,
    text: isDark ? ok(0.5, 0, NEUTRAL_H) : ok(0.65, 0, NEUTRAL_H),
    border: isDark ? ok(0.34, 0, NEUTRAL_H) : ok(0.86, 0, NEUTRAL_H),
  };
}

function neutralComponentBlock(saliency: Saliency, isDark: boolean): Block {
  let def: Triplet;
  if (saliency === "high") {
    const bgc = isDark ? ok(0.84, 0, NEUTRAL_H) : ok(0.3, 0, NEUTRAL_H);
    def = { bgc, text: pickInk(bgc), border: bgc };
  } else if (saliency === "mid") {
    const bgc = isDark ? ok(0.3, 0, NEUTRAL_H) : ok(0.93, 0, NEUTRAL_H);
    def = { bgc, text: pickInk(bgc), border: bgc };
  } else {
    def = {
      bgc: "transparent",
      text: isDark ? ok(0.86, 0, NEUTRAL_H) : ok(0.3, 0, NEUTRAL_H),
      border: isDark ? ok(0.42, 0, NEUTRAL_H) : ok(0.8, 0, NEUTRAL_H),
    };
  }
  return { default: def, disabled: disabledTriplet(isDark, saliency === "low") };
}

function colourComponentBlock(
  seed: ResolvedSeed,
  intent: ColourfulIntent,
  saliency: Saliency,
  isDark: boolean,
): Block {
  const { h, c } = seed.intents[intent];
  let def: Triplet;
  if (saliency === "high") {
    const bgc = ok(seed.boldL[intent], c, h);
    def = { bgc, text: pickInk(bgc), border: bgc };
  } else if (saliency === "mid") {
    const bgc = isDark ? ok(0.3, c * 0.35, h) : ok(0.93, c * 0.22, h);
    const border = isDark ? ok(0.4, c * 0.5, h) : ok(0.84, c * 0.4, h);
    def = { bgc, text: pickInk(bgc), border };
  } else {
    def = {
      bgc: "transparent",
      text: isDark ? ok(0.82, c * 0.9, h) : ok(0.45, c, h),
      border: isDark ? ok(0.5, c * 0.6, h) : ok(0.74, c * 0.55, h),
    };
  }
  return { default: def, disabled: disabledTriplet(isDark, saliency === "low") };
}

function componentColor(seed: ResolvedSeed, isDark: boolean) {
  return record(INTENTS, (intent) =>
    record(SALIENCIES, (saliency) =>
      intent === "neutral"
        ? neutralComponentBlock(saliency, isDark)
        : colourComponentBlock(seed, intent, saliency, isDark),
    ),
  );
}

// ---------------------------------------------------------------------------
// Surface colours (high | low). Neutral is the common case; colourful intents
// exist for Notice/Toast.
// ---------------------------------------------------------------------------

function neutralSurfaceBlock(saliency: "high" | "low", isDark: boolean): Block {
  // low = the base page background; high = a washed/raised surface.
  const bgc =
    saliency === "low"
      ? isDark
        ? ok(0.16, 0, NEUTRAL_H)
        : ok(0.99, 0, NEUTRAL_H)
      : isDark
        ? ok(0.22, 0, NEUTRAL_H)
        : ok(0.965, 0, NEUTRAL_H);
  const border =
    saliency === "low"
      ? isDark
        ? ok(0.3, 0, NEUTRAL_H)
        : ok(0.9, 0, NEUTRAL_H)
      : isDark
        ? ok(0.34, 0, NEUTRAL_H)
        : ok(0.88, 0, NEUTRAL_H);
  return {
    default: { bgc, text: pickInk(bgc), border },
    disabled: disabledTriplet(isDark, false),
  };
}

function colourSurfaceBlock(
  seed: ResolvedSeed,
  intent: ColourfulIntent,
  saliency: "high" | "low",
  isDark: boolean,
): Block {
  const { h, c } = seed.intents[intent];
  const bgc =
    saliency === "low"
      ? isDark
        ? ok(0.24, c * 0.4, h)
        : ok(0.96, c * 0.3, h)
      : isDark
        ? ok(0.3, c * 0.6, h)
        : ok(0.9, c * 0.5, h);
  const border =
    saliency === "low"
      ? isDark
        ? ok(0.4, c * 0.5, h)
        : ok(0.82, c * 0.5, h)
      : isDark
        ? ok(0.46, c * 0.7, h)
        : ok(0.72, c * 0.7, h);
  return {
    default: { bgc, text: pickInk(bgc), border },
    disabled: disabledTriplet(isDark, false),
  };
}

function surfaceColor(seed: ResolvedSeed, isDark: boolean) {
  return record(INTENTS, (intent) =>
    record(SURFACE_SALIENCIES, (saliency) =>
      intent === "neutral"
        ? neutralSurfaceBlock(saliency, isDark)
        : colourSurfaceBlock(seed, intent, saliency, isDark),
    ),
  );
}

// ---------------------------------------------------------------------------
// Text colours
// ---------------------------------------------------------------------------

function textColor(seed: ResolvedSeed, isDark: boolean) {
  return record(INTENTS, (intent) =>
    record(SALIENCIES, (saliency): string => {
      if (intent === "neutral") {
        if (isDark) {
          return saliency === "high"
            ? ok(0.97, NEUTRAL_C, NEUTRAL_H)
            : saliency === "mid"
              ? ok(0.85, NEUTRAL_C, NEUTRAL_H)
              : ok(0.62, NEUTRAL_C, NEUTRAL_H);
        }
        return saliency === "high"
          ? ok(0.2, NEUTRAL_C, NEUTRAL_H)
          : saliency === "mid"
            ? ok(0.32, NEUTRAL_C, NEUTRAL_H)
            : ok(0.6, NEUTRAL_C, NEUTRAL_H);
      }
      const { h, c } = seed.intents[intent];
      if (isDark) {
        return saliency === "high"
          ? ok(0.86, c, h)
          : saliency === "mid"
            ? ok(0.78, c, h)
            : ok(0.62, c * 0.85, h);
      }
      return saliency === "high"
        ? ok(0.42, c, h)
        : saliency === "mid"
          ? ok(0.47, c, h)
          : ok(0.62, c * 0.8, h);
    }),
  );
}

// ---------------------------------------------------------------------------
// Form colours
// ---------------------------------------------------------------------------

function formColor(seed: ResolvedSeed, isDark: boolean) {
  const neutral = {
    background: isDark ? ok(0.18, 0, NEUTRAL_H) : ok(0.99, 0, NEUTRAL_H),
    border: isDark ? ok(0.4, 0, NEUTRAL_H) : ok(0.78, 0, NEUTRAL_H),
    placeholder: isDark ? ok(0.62, 0, NEUTRAL_H) : ok(0.5, 0, NEUTRAL_H),
  };
  const stateColor = (intent: ColourfulIntent) => {
    const { h, c } = seed.intents[intent];
    return {
      background: isDark ? ok(0.2, c * 0.3, h) : ok(0.98, c * 0.2, h),
      border: isDark ? ok(0.6, c, h) : ok(0.52, c, h),
      placeholder: isDark ? ok(0.62, 0, NEUTRAL_H) : ok(0.5, 0, NEUTRAL_H),
    };
  };
  return {
    neutral,
    warning: stateColor("warning"),
    invalid: stateColor("negative"),
    valid: stateColor("positive"),
  };
}

// ---------------------------------------------------------------------------
// Focus rings
// ---------------------------------------------------------------------------

function focusRings(seed: ResolvedSeed, isDark: boolean) {
  return record(INTENTS, (intent): string => {
    if (intent === "neutral") {
      // Neutral focus borrows primary for visibility.
      const { h, c } = seed.intents.primary;
      return ok(isDark ? 0.7 : 0.56, c, h);
    }
    const { h, c } = seed.intents[intent];
    return ok(isDark ? 0.7 : seed.boldL[intent], c, h);
  });
}

// ---------------------------------------------------------------------------
// Typography variants
// ---------------------------------------------------------------------------

function bodyVariant(size: BodySize) {
  return {
    fontSize: fontSize[size],
    lineHeight: size === "xl" ? lineHeight.relaxed : lineHeight.normal,
    fontWeight: fontWeight.regular,
  };
}

function titleVariant(size: TitleSize) {
  const large = ["2xl", "3xl", "3.5xl", "4xl"].includes(size);
  const tight = !["sm", "base"].includes(size);
  return {
    fontSize: fontSize[size],
    lineHeight: tight ? lineHeight.tight : lineHeight.normal,
    fontWeight: large ? fontWeight.bold : fontWeight.semibold,
  };
}

function shadows(isDark: boolean) {
  if (isDark) {
    return {
      sm: `0 1px 2px 0 ${ok(0, 0, 0, 0.5)}`,
      md: `0 4px 12px -2px ${ok(0, 0, 0, 0.55)}`,
      lg: `0 12px 32px -4px ${ok(0, 0, 0, 0.6)}`,
    };
  }
  return {
    sm: `0 1px 2px 0 ${ok(0.2, 0.02, 260, 0.1)}`,
    md: `0 4px 12px -2px ${ok(0.2, 0.02, 260, 0.12)}`,
    lg: `0 12px 32px -4px ${ok(0.2, 0.02, 260, 0.16)}`,
  };
}

// ---------------------------------------------------------------------------
// Assembled default tokens
// ---------------------------------------------------------------------------

/**
 * Produce a complete, accessible set of default token *values* for a scheme,
 * optionally seeded with a brand's intent hues/chroma, fonts, and scale
 * overrides. This doubles as the reference theme and a copy-paste starting point
 * for theme authors: supply a small {@link BrandSeed} and inherit the full,
 * contrast-checked token set. Interaction (hover/active) states are NOT here —
 * they're computed at use-site from `default` via relative-colour math.
 *
 * @example
 * buildDefaultTokens("light", {
 *   intents: { primary: { h: 292, c: 0.17 } }, // brand purple
 *   fonts: { sans: '"Inter", system-ui, sans-serif' },
 * });
 */
export function buildDefaultTokens(
  scheme: "light" | "dark",
  brand: BrandSeed = {},
): ThemeTokensInput {
  const isDark = scheme === "dark";
  const seed = resolveSeed(brand);
  const radiusScale = { ...radius, ...brand.radius };
  const spaceScale = { ...space, ...brand.space };
  const borderWidthScale = { ...borderWidth, ...brand.borderWidth };
  return {
    surface: {
      color: surfaceColor(seed, isDark),
      borderRadius: radiusScale.lg,
      focus: focusRings(seed, isDark),
    },
    component: {
      color: componentColor(seed, isDark),
      borderRadius: radiusScale.md,
      focus: focusRings(seed, isDark),
    },
    form: {
      color: formColor(seed, isDark),
      borderRadius: radiusScale.md,
      focus: focusRings(seed, isDark),
    },
    text: {
      color: textColor(seed, isDark),
      variant: {
        body: record(BODY_SIZES, (size) => bodyVariant(size)),
        title: record(TITLE_SIZES, (size) => titleVariant(size)),
      },
    },
    font: {
      sans: brand.fonts?.sans ?? fontFamily.sans,
      mono: brand.fonts?.mono ?? fontFamily.mono,
      weight: { ...fontWeight },
    },
    space: spaceScale,
    radius: radiusScale,
    borderWidth: borderWidthScale,
    shadow: shadows(isDark),
    zIndex: { ...zIndex },
    motion: {
      duration: { ...motion.duration },
      easing: { ...motion.easing },
    },
  };
}
