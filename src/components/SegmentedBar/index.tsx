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
 * The intents handed to segments that don't name a colour, in order. Six
 * positions, ordered so *adjacent* ones sit far apart in hue — the pairs most
 * likely to touch in the track are the ones that most need telling apart.
 *
 * Assignment is by **position**, which is only safe for a fixed set of segments.
 * If the set can change (a filter, a "top N" that reshuffles), give each segment
 * an explicit `intent` or `color` keyed off its identity — otherwise dropping one
 * segment repaints every segment after it, and the colours stop meaning anything
 * across renders.
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
 * The colour **escape hatch**, for a segment whose fill is data rather than a
 * design decision: a per-area colour a user picked, a category colour that comes
 * down with the row. These are values the palette can't enumerate, because they
 * aren't the system's to choose.
 *
 * Prefer `intent`/`saliency` — an intent segment re-themes with the rest of the
 * system, this one is frozen at whatever you pass, and nothing checks it for
 * contrast against the track or its neighbours.
 *
 * Mutually exclusive with `intent`/`saliency` rather than overriding them: it
 * replaces the token-driven scheme outright, so accepting both would leave one
 * silently doing nothing.
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
   * The denominator for every share. Defaults to the sum of the values (so the
   * track always fills). Pass a larger number — a target, a capacity, a whole
   * that the segments only partly account for — to leave the difference as
   * unfilled track. A `total` *below* the sum is ignored: the shares have to add
   * up to at most the whole.
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
   * Show the legend beneath the track. Default `true`.
   *
   * Setting it to `false` hides the legend **visually only** — it stays in the
   * accessibility tree, because the track itself is a picture (`aria-hidden`) and
   * the legend is the only thing carrying the actual numbers. A bar with neither
   * would announce nothing at all.
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
 * SegmentedBar — a single bar divided into the parts that make up a whole, with a
 * legend naming each part. The shape for "what is this total made of": time by
 * project, spend by category, storage by file type.
 *
 * Each segment is coloured by `intent` × `saliency` — the same vocabulary as
 * `Chip` / `Meter` — defaulting to a fixed sequence of intents so a bar is legible
 * with nothing but labels and values. A segment whose colour is *data* (a
 * user-chosen category colour) can take a `color` escape hatch instead.
 *
 * Shares are computed from the values, so callers pass counts, not percentages;
 * pass a `total` larger than their sum to leave a remainder unfilled.
 *
 * **Accessibility.** The track is a picture of the legend, so it's `aria-hidden`
 * and the legend is a real list — one item per segment, each announcing its label,
 * share, and value. Colour is therefore never the only thing carrying identity.
 * That's also why `showLegend={false}` only hides it visually.
 *
 * It is *not* a `Meter`: use `Meter` for one value against a range, and this for
 * one whole split into parts.
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

  // Negative values would eat into their neighbours' shares, so they're floored
  // at zero rather than silently distorting the bar.
  const values = segments.map((segment) => Math.max(0, segment.value));
  const sum = values.reduce((acc, value) => acc + value, 0);
  // A `total` under the sum can't be honoured — the parts would add up to more
  // than the whole — so the sum is the floor.
  const denominator = Math.max(sum, total ?? 0);
  const remainder = denominator - sum;

  const valueFormatter = new Intl.NumberFormat(locale, format);
  const percentFormatter = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  // The legend names the list, so the naming attributes land there rather than on
  // the root (a plain `<div>` with no role, where they'd announce nothing).
  const legendNameAttrs: Record<string, string> = {};
  if (labelId != null) legendNameAttrs["aria-labelledby"] = labelId;
  else if (ariaLabelledby != null) legendNameAttrs["aria-labelledby"] = ariaLabelledby;
  else if (ariaLabel != null) legendNameAttrs["aria-label"] = ariaLabel;

  return (
    <div className={cx(segmentedBarRoot, className)}>
      {(label != null || showTotal) && (
        <div className={segmentedBarHeader}>
          {label != null && (
            <Text id={labelId} variant="sm" saliency="high" {...slotProps?.label}>
              {label}
            </Text>
          )}
          {showTotal && (
            <Text
              variant="sm"
              saliency="low"
              {...slotProps?.total}
              className={cx(segmentedBarLegendNumeric, slotProps?.total?.className)}
            >
              {valueFormatter.format(denominator)}
            </Text>
          )}
        </div>
      )}

      {/* The track duplicates the legend exactly, so it's a picture: hidden from
          assistive tech rather than announced as a second, wordless copy. */}
      <div className={segmentedBarTrack({ size })} aria-hidden="true">
        {segments.map((segment, index) => {
          const value = values[index] ?? 0;
          // A zero-value segment gets no slice at all — with `minWidth` it would
          // otherwise show as a sliver of a share it doesn't have. It keeps its
          // legend row, where "0%" says so in words.
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
            // `list-style: none` can drop the implicit listitem role in Safari, so
            // the role is set explicitly to keep the list semantics.
            <li key={segment.id ?? index} role="listitem" className={segmentedBarLegendRow}>
              <span
                aria-hidden="true"
                className={cx(segmentedBarSwatch, fillClassName(segment, index))}
                style={segmentFillStyle(segment)}
              />
              <Text
                variant="sm"
                {...slotProps?.segmentLabel}
                className={cx(segmentedBarLegendLabel, slotProps?.segmentLabel?.className)}
              >
                {segment.label}
              </Text>
              {showPercent && (
                <Text
                  variant="sm"
                  saliency="low"
                  {...slotProps?.percent}
                  className={cx(segmentedBarLegendNumeric, slotProps?.percent?.className)}
                >
                  {percentFormatter.format(denominator > 0 ? value / denominator : 0)}
                </Text>
              )}
              {showValue && (
                <Text
                  variant="sm"
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
