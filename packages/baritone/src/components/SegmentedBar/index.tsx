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

const DEFAULT_SEGMENT_INTENTS = [
  "primary",
  "positive",
  "secondary",
  "warning",
  "negative",
  "neutral",
] as const satisfies readonly Intent[];

export interface SegmentedBarSegmentIntentColour {
  intent?: Intent;

  saliency?: Saliency;

  color?: never;
}

export interface SegmentedBarSegmentCustomColour {
  color: NonNullable<React.CSSProperties["color"]>;

  intent?: never;

  saliency?: never;
}

export interface SegmentedBarSegmentBase {
  id?: string;

  label: React.ReactNode;

  value: number;
}

export type SegmentedBarSegment = SegmentedBarSegmentBase &
  (SegmentedBarSegmentIntentColour | SegmentedBarSegmentCustomColour);

export interface SegmentedBarSlotProps {
  label?: Partial<TextProps>;

  total?: Partial<TextProps>;

  segmentLabel?: Partial<TextProps>;

  percent?: Partial<TextProps>;

  value?: Partial<TextProps>;
}

export interface SegmentedBarProps {
  segments: SegmentedBarSegment[];

  total?: number;

  label?: React.ReactNode;

  showTotal?: boolean;

  "aria-label"?: string;

  "aria-labelledby"?: string;

  showLegend?: boolean;

  showPercent?: boolean;

  showValue?: boolean;

  size?: Size;

  format?: Intl.NumberFormatOptions;

  locale?: Intl.LocalesArgument;

  slotProps?: SegmentedBarSlotProps;

  className?: string;
}

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

function fillClassName(segment: SegmentedBarSegment, index: number): string {
  return segmentedBarFill({
    intent: segment.intent ?? DEFAULT_SEGMENT_INTENTS[index % DEFAULT_SEGMENT_INTENTS.length],
    saliency: segment.saliency ?? "high",
  });
}

function segmentClassName(segment: SegmentedBarSegment, index: number): string {
  return cx(segmentedBarSegment, fillClassName(segment, index));
}

function segmentFillStyle(segment: SegmentedBarSegment) {
  return segment.color != null ? assignInlineVars({ [segmentFillVar]: segment.color }) : undefined;
}

SegmentedBar.displayName = "SegmentedBar";
