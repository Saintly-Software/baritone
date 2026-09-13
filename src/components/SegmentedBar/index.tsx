"use client";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { srOnly } from "../SrOnly/srOnly.css";
import { Text, type TextProps } from "../Text";
import {
  segmentedBarFill,
  segmentedBarHeader,
  segmentedBarLegend,
  segmentedBarLegendLabel,
  segmentedBarLegendNumeric,
  segmentedBarLegendRow,
  segmentedBarRemainder,
  segmentedBarRoot,
  segmentedBarSegment,
  segmentedBarSwatch,
  segmentedBarTrack,
  segmentFillVar,
} from "./segmentedBar.css";

/**
 * The intents handed to segments that don't name a colour, ordered so adjacent
 * ones sit far apart in hue. Assignment is by **position**, only safe for a fixed
 * set of segments; give each an explicit `intent`/`color` if the set can change.
 */
const DEFAULT_SEGMENT_INTENTS = [
  "primary",
  "positive",
  "secondary",
  "warning",
  "negative",
  "neutral",
] as const satisfies readonly Intent[];

/** Colour from the system palette — the default, shared with `Chip`/`Meter`. */
export interface SegmentedBarSegmentIntentColour {
  /** Colour intent of the slice and its legend swatch. Defaults by position. */
  intent?: Intent;
  /** Prominence of the fill within its intent. Default `high`. */
  saliency?: Saliency;
  /** Unsupported alongside `intent`/`saliency` — see {@link SegmentedBarSegmentCustomColour}. */
  color?: never;
}

/**
 * The colour **escape hatch**, for a segment whose fill is data (a user-picked
 * category colour) rather than a design decision. Prefer `intent`/`saliency`,
 * which re-theme with the system and are contrast-checked; this is frozen at
 * whatever you pass. Mutually exclusive with `intent`/`saliency`.
 */
export interface SegmentedBarSegmentCustomColour {
  /**
   * Paint the slice and its legend swatch any CSS colour, replacing
   * `intent` × `saliency`. Takes anything CSS `color` does — a hex/rgb/oklch
   * value, a custom property, `currentColor`.
   */
  color: NonNullable<React.CSSProperties["color"]>;
  /** Unsupported alongside `color` — the custom fill replaces the palette scheme. */
  intent?: never;
  /** Unsupported alongside `color` — the custom fill replaces the palette scheme. */
  saliency?: never;
}

/** The content of one segment, independent of how it's coloured. */
export interface SegmentedBarSegmentBase {
  /**
   * Stable identity for the segment — its React key. Defaults to the index, which
   * is fine for a fixed list; give real ids when segments can be added, removed,
   * or reordered.
   */
  id?: string;
  /** What the segment is, shown in the legend (e.g. `"Music"`). */
  label: React.ReactNode;
  /**
   * The segment's magnitude, in whatever unit the bar measures. Its share of the
   * bar is this over the `total` (which defaults to the sum of every segment).
   * Negative values are treated as `0`.
   */
  value: number;
}

/**
 * One segment of the bar: its content, plus a colour from either the palette
 * ({@link SegmentedBarSegmentIntentColour}, the default) or a caller-supplied CSS
 * colour ({@link SegmentedBarSegmentCustomColour}).
 */
export type SegmentedBarSegment = SegmentedBarSegmentBase &
  (SegmentedBarSegmentIntentColour | SegmentedBarSegmentCustomColour);

/**
 * Overrides for the bar's `Text` slots. All partial: you're layering props onto
 * the slot's own defaults, so `slotProps={{ value: { weight: "bold" } }}` just
 * re-tunes that piece while the rest stays as-is.
 */
export interface SegmentedBarSlotProps {
  /** Props for the label `Text` above the track. */
  label?: Partial<TextProps>;
  /** Props for the total read-out `Text` at the end of the header row. */
  total?: Partial<TextProps>;
  /** Props for each legend row's label `Text`. */
  segmentLabel?: Partial<TextProps>;
  /** Props for each legend row's percentage `Text`. */
  percent?: Partial<TextProps>;
  /** Props for each legend row's value `Text`. */
  value?: Partial<TextProps>;
}

export interface SegmentedBarProps {
  /**
   * The parts, in display order — left to right in the track, top to bottom in
   * the legend. Segments are rendered in the order given; sort them yourself if
   * you want them largest-first.
   */
  segments: SegmentedBarSegment[];
  /**
   * The denominator for every share. Defaults to the sum of the values. Pass a
   * larger number to leave the difference as unfilled track; a `total` below the
   * sum is ignored.
   */
  total?: number;
  /**
   * Visible label rendered above the track. Also names the legend list for
   * assistive tech. To name the bar *without* a visible label, use `aria-label` /
   * `aria-labelledby` instead.
   */
  label?: React.ReactNode;
  /** Show the `total` at the end of the header row. */
  showTotal?: boolean;
  /** Accessible name for the legend list when there's no visible `label`. */
  "aria-label"?: string;
  /** Accessible name via a referenced element's id, when there's no visible `label`. */
  "aria-labelledby"?: string;
  /**
   * Show the legend beneath the track. Default `true`. `false` hides it visually
   * only — it stays in the accessibility tree, since the track is `aria-hidden`
   * and the legend carries the numbers.
   */
  showLegend?: boolean;
  /** Show each segment's percentage share in its legend row. Default `true`. */
  showPercent?: boolean;
  /** Show each segment's raw value in its legend row. Default `true`. */
  showValue?: boolean;
  /** Track thickness. Default `md`. */
  size?: Size;
  /**
   * `Intl.NumberFormat` options for the displayed values (e.g.
   * `{ style: "currency", currency: "USD" }`). Percentages are formatted
   * separately, as whole percents.
   */
  format?: Intl.NumberFormatOptions;
  /** Locale for `format` and the percentages. Defaults to the runtime locale. */
  locale?: Intl.LocalesArgument;
  /** Overrides for the inner `Text` slots. */
  slotProps?: SegmentedBarSlotProps;
  /** Extra className merged onto the root. */
  className?: string;
}

/**
 * A single bar divided into the parts that make up a whole, with a legend naming
 * each part — "what is this total made of": time by project, spend by category.
 * Segments are coloured by `intent` × `saliency` (defaulting by position), or a
 * `color` escape hatch for data colours. Shares are computed from the values, so
 * pass counts, not percentages; a `total` larger than their sum leaves a
 * remainder unfilled. The track is `aria-hidden`; the legend is the real list, so
 * `showLegend={false}` only hides it visually. Use `Meter` for one value against
 * a range, this for one whole split into parts.
 *
 * @example
 * <SegmentedBar
 *   label="This week by area"
 *   segments={[
 *     { id: "sanity", label: "Sanity", value: 6 },
 *     { id: "music", label: "Music", value: 4 },
 *     { id: "health", label: "Health", value: 1 },
 *   ]}
 * />
 */
export function SegmentedBar({
  segments,
  total,
  label,
  showTotal = false,
  showLegend = true,
  showPercent = true,
  showValue = true,
  size = "md",
  format,
  locale,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  slotProps,
}: SegmentedBarProps) {
  const generatedLabelId = React.useId();
  const labelId = label != null ? generatedLabelId : undefined;

  const values = segments.map((segment) => Math.max(0, segment.value));
  const sum = values.reduce((acc, value) => acc + value, 0);
  const denominator = Math.max(sum, total ?? 0);
  const remainder = denominator - sum;

  const valueFormatter = new Intl.NumberFormat(locale, format);
  const percentFormatter = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  const legendNameAttrs: Record<string, string> = {};
  if (labelId != null) legendNameAttrs["aria-labelledby"] = labelId;
  else if (ariaLabelledby != null) legendNameAttrs["aria-labelledby"] = ariaLabelledby;
  else if (ariaLabel != null) legendNameAttrs["aria-label"] = ariaLabel;

  return (
    <div className={cx(segmentedBarRoot, className)}>
      {(label != null || showTotal) && (
        <div className={segmentedBarHeader}>
          {label != null && (
            <Text id={labelId} size="sm" saliency="high" {...slotProps?.label}>
              {label}
            </Text>
          )}
          {showTotal && (
            <Text
              size="sm"
              saliency="low"
              {...slotProps?.total}
              className={cx(segmentedBarLegendNumeric, slotProps?.total?.className)}
            >
              {valueFormatter.format(denominator)}
            </Text>
          )}
        </div>
      )}

      <div className={segmentedBarTrack({ size })} aria-hidden="true">
        {segments.map((segment, index) => {
          const value = values[index] ?? 0;
          if (value <= 0) return null;
          return (
            <span
              key={segment.id ?? index}
              className={segmentClassName(segment, index)}
              style={{ flexGrow: value, ...segmentFillStyle(segment) }}
            />
          );
        })}
        {remainder > 0 && (
          <span className={segmentedBarRemainder} style={{ flexGrow: remainder }} />
        )}
      </div>

      <ul
        role="list"
        className={cx(segmentedBarLegend, !showLegend && srOnly)}
        {...legendNameAttrs}
      >
        {segments.map((segment, index) => {
          const value = values[index] ?? 0;
          return (
            <li key={segment.id ?? index} role="listitem" className={segmentedBarLegendRow}>
              <span
                aria-hidden="true"
                className={cx(segmentedBarSwatch, fillClassName(segment, index))}
                style={segmentFillStyle(segment)}
              />
              <Text
                size="sm"
                {...slotProps?.segmentLabel}
                className={cx(segmentedBarLegendLabel, slotProps?.segmentLabel?.className)}
              >
                {segment.label}
              </Text>
              {showPercent && (
                <Text
                  size="sm"
                  saliency="low"
                  {...slotProps?.percent}
                  className={cx(segmentedBarLegendNumeric, slotProps?.percent?.className)}
                >
                  {percentFormatter.format(denominator > 0 ? value / denominator : 0)}
                </Text>
              )}
              {showValue && (
                <Text
                  size="sm"
                  weight="semibold"
                  {...slotProps?.value}
                  className={cx(segmentedBarLegendNumeric, slotProps?.value?.className)}
                >
                  {valueFormatter.format(value)}
                </Text>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The colour class for a segment's marks. A custom `color` still gets the recipe:
 * the class only *sets* the fill var, and the inline declaration below overrides
 * it — so both paths stay one class plus one variable, with no ordering to reason
 * about.
 */
function fillClassName(segment: SegmentedBarSegment, index: number): string {
  return segmentedBarFill({
    intent: segment.intent ?? DEFAULT_SEGMENT_INTENTS[index % DEFAULT_SEGMENT_INTENTS.length],
    saliency: segment.saliency ?? "high",
  });
}

/** The slice's own geometry, plus its colour class. */
function segmentClassName(segment: SegmentedBarSegment, index: number): string {
  return cx(segmentedBarSegment, fillClassName(segment, index));
}

/** The `color` escape hatch, as an inline override of the shared fill var. */
function segmentFillStyle(segment: SegmentedBarSegment) {
  return segment.color != null ? assignInlineVars({ [segmentFillVar]: segment.color }) : undefined;
}

SegmentedBar.displayName = "SegmentedBar";
