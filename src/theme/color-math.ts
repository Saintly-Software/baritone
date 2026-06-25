// Pure colour math used by the build-time contrast checker. Converts the oklch
// strings a theme is authored in into sRGB luminance so we can compute WCAG
// contrast ratios. Kept dependency-free and side-effect-free.

export interface Oklch {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

/**
 * Parse an `oklch(L C H [/ A])` string. Returns `null` for values we can't
 * statically evaluate (e.g. `transparent`, or expressions containing var()/calc
 * such as the runtime relative-colour hover states — those aren't checkable).
 */
export function parseOklch(input: string): Oklch | null {
  const value = input.trim();
  if (value === "transparent") return { l: 0, c: 0, h: 0, alpha: 0 };

  const match = /^oklch\(\s*([^)]*)\)$/i.exec(value);
  const body = match?.[1];
  if (body === undefined) return null;
  if (/var\(|calc\(|from /i.test(body)) return null;

  const [coords, alphaPart] = body.split("/");
  if (coords === undefined) return null;
  const parts = coords.trim().split(/\s+/);
  const [lTok, cTok, hTok] = parts;
  if (lTok === undefined || cTok === undefined || hTok === undefined) {
    return null;
  }

  const l = parsePercentOrNumber(lTok, 1);
  const c = parseNumber(cTok);
  const h = parseHue(hTok);
  const alpha = alphaPart === undefined ? 1 : parsePercentOrNumber(alphaPart.trim(), 1);

  if ([l, c, h, alpha].some((n) => Number.isNaN(n))) return null;
  return { l, c, h, alpha };
}

function parseNumber(token: string): number {
  return Number.parseFloat(token);
}

function parsePercentOrNumber(token: string, percentBasis: number): number {
  if (token.endsWith("%")) {
    return (Number.parseFloat(token) / 100) * percentBasis;
  }
  return Number.parseFloat(token);
}

function parseHue(token: string): number {
  return Number.parseFloat(token.replace(/deg$/i, ""));
}

interface LinearRgb {
  r: number;
  g: number;
  b: number;
}

/** oklch -> oklab -> linear sRGB (Björn Ottosson's matrices). */
export function oklchToLinearRgb({ l, c, h }: Oklch): LinearRgb {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lc = l_ * l_ * l_;
  const mc = m_ * m_ * m_;
  const sc = s_ * s_ * s_;

  return {
    r: 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    g: -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    b: -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  };
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** WCAG relative luminance from linear sRGB. */
export function relativeLuminance(rgb: LinearRgb): number {
  return 0.2126 * clamp01(rgb.r) + 0.7152 * clamp01(rgb.g) + 0.0722 * clamp01(rgb.b);
}

/**
 * Contrast ratio between two oklch colours. If the foreground is translucent it
 * is composited over the (assumed opaque) background first. Returns `null` when
 * either colour can't be parsed.
 */
export function contrastRatio(fg: string, bg: string): number | null {
  const fgColor = parseOklch(fg);
  const bgColor = parseOklch(bg);
  if (!fgColor || !bgColor) return null;

  const bgLinear = oklchToLinearRgb(bgColor);
  let fgLinear = oklchToLinearRgb(fgColor);

  if (fgColor.alpha < 1) {
    const a = fgColor.alpha;
    fgLinear = {
      r: fgLinear.r * a + bgLinear.r * (1 - a),
      g: fgLinear.g * a + bgLinear.g * (1 - a),
      b: fgLinear.b * a + bgLinear.b * (1 - a),
    };
  }

  const l1 = relativeLuminance(fgLinear);
  const l2 = relativeLuminance(bgLinear);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
