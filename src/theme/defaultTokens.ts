import { contrastRatio } from "./color-math";
import {
  BODY_SIZES,
  INTENTS,
  SALIENCIES,
  SURFACE_SALIENCIES,
  TITLE_SIZES,
  type BodySize,
  type Intent,
  type Saliency,
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

// Hue + base chroma per colourful intent. Neutral is handled separately as a
// near-greyscale ramp.
const SEED: Record<Exclude<Intent, "neutral">, { h: number; c: number }> = {
  primary: { h: 258, c: 0.16 },
  secondary: { h: 295, c: 0.17 },
  warning: { h: 75, c: 0.15 },
  negative: { h: 27, c: 0.18 },
  positive: { h: 150, c: 0.13 },
};

const NEUTRAL_H = 260;
const NEUTRAL_C = 0.005;

/** The bold "high" background lightness per colourful intent. */
const BOLD_L: Record<Exclude<Intent, "neutral">, number> = {
  primary: 0.53,
  secondary: 0.55,
  warning: 0.82,
  negative: 0.56,
  positive: 0.62,
};

type Triplet = { bgc: string; text: string; border: string };
type Block = { default: Triplet; disabled: Triplet };

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
  intent: Exclude<Intent, "neutral">,
  saliency: Saliency,
  isDark: boolean,
): Block {
  const { h, c } = SEED[intent];
  let def: Triplet;
  if (saliency === "high") {
    const bgc = ok(BOLD_L[intent], c, h);
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

function componentColor(isDark: boolean) {
  return record(INTENTS, (intent) =>
    record(SALIENCIES, (saliency) =>
      intent === "neutral"
        ? neutralComponentBlock(saliency, isDark)
        : colourComponentBlock(intent, saliency, isDark),
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
  intent: Exclude<Intent, "neutral">,
  saliency: "high" | "low",
  isDark: boolean,
): Block {
  const { h, c } = SEED[intent];
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

function surfaceColor(isDark: boolean) {
  return record(INTENTS, (intent) =>
    record(SURFACE_SALIENCIES, (saliency) =>
      intent === "neutral"
        ? neutralSurfaceBlock(saliency, isDark)
        : colourSurfaceBlock(intent, saliency, isDark),
    ),
  );
}

// ---------------------------------------------------------------------------
// Text colours
// ---------------------------------------------------------------------------

function textColor(isDark: boolean) {
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
      const { h, c } = SEED[intent];
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

function formColor(isDark: boolean) {
  const neutral = {
    background: isDark ? ok(0.18, 0, NEUTRAL_H) : ok(0.99, 0, NEUTRAL_H),
    border: isDark ? ok(0.4, 0, NEUTRAL_H) : ok(0.78, 0, NEUTRAL_H),
    placeholder: isDark ? ok(0.62, 0, NEUTRAL_H) : ok(0.5, 0, NEUTRAL_H),
  };
  const stateColor = (intent: Exclude<Intent, "neutral">) => {
    const { h, c } = SEED[intent];
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

function focusRings(isDark: boolean) {
  return record(INTENTS, (intent): string => {
    if (intent === "neutral") {
      // Neutral focus borrows primary for visibility.
      const { h, c } = SEED.primary;
      return ok(isDark ? 0.7 : 0.56, c, h);
    }
    const { h, c } = SEED[intent];
    return ok(isDark ? 0.7 : BOLD_L[intent], c, h);
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
 * Produce a complete, accessible set of default token *values* for a scheme.
 * This doubles as the reference theme and a copy-paste starting point for theme
 * authors. Interaction (hover/active) states are NOT here — they're computed at
 * use-site from `default` via relative-colour math.
 */
export function buildDefaultTokens(scheme: "light" | "dark"): ThemeTokensInput {
  const isDark = scheme === "dark";
  return {
    surface: {
      color: surfaceColor(isDark),
      borderRadius: radius.lg,
      focus: focusRings(isDark),
    },
    component: {
      color: componentColor(isDark),
      borderRadius: radius.md,
      focus: focusRings(isDark),
    },
    form: {
      color: formColor(isDark),
      borderRadius: radius.md,
      focus: focusRings(isDark),
    },
    text: {
      color: textColor(isDark),
      variant: {
        body: record(BODY_SIZES, (size) => bodyVariant(size)),
        title: record(TITLE_SIZES, (size) => titleVariant(size)),
      },
    },
    font: { sans: fontFamily.sans, mono: fontFamily.mono },
    space: { ...space },
    radius: { ...radius },
    borderWidth: { ...borderWidth },
    shadow: shadows(isDark),
    zIndex: { ...zIndex },
    motion: {
      duration: { ...motion.duration },
      easing: { ...motion.easing },
    },
  };
}
