"use client";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import * as React from "react";
import type { Intent, Saliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { meterIndicator, meterLabel, meterRoot, meterTrack } from "./meter.css";

export interface MeterProps {
  /** Colour intent of the filled indicator. Default `primary`. */
  intent?: Intent;
  /** Prominence of the indicator's fill within its intent. Default `high`. */
  saliency?: Saliency;
  /**
   * Visible label rendered above the track. base-ui wires it up as the meter's
   * accessible name (`aria-labelledby`). To name the meter *without* a visible
   * label, use `aria-label` / `aria-labelledby` instead.
   */
  label?: React.ReactNode;
  /** Accessible name when there's no visible `label`. */
  "aria-label"?: string;
  /** Accessible name via a referenced element's id, when there's no visible `label`. */
  "aria-labelledby"?: string;
  /** Lower bound of the range. Default `0`. */
  min?: number;
  /** Upper bound of the range. Default `100`. */
  max?: number;
  /** The current value; clamped to `[min, max]`. */
  value: number;
  /**
   * Human-readable text alternative for the current value, announced by screen
   * readers in place of the raw number. Either a fixed string (forwarded to
   * base-ui as `aria-valuetext`) or a function of the formatted value and the raw
   * value (forwarded as base-ui's `getAriaValueText`).
   */
  "aria-valuetext"?: string | ((formattedValue: string, value: number) => string);
  /** Extra className merged onto the root. */
  className?: string;
}

/**
 * Meter — a static, read-only gauge for a value within a known range (storage
 * used, score, capacity), built on base-ui's `Meter` for the semantics
 * (`role="meter"`, the `aria-value*` wiring, the value→percentage math) with the
 * system's colour scheme on top.
 *
 * The filled indicator is coloured by `intent` × `saliency` — the same vocabulary
 * as `Chip` / `Button` — reading the `text` colour ramp so the bar stays a solid,
 * visible ink at every saliency, over a neutral track.
 *
 * It is *not* a progress bar: use it for a measurement, not the completion of a
 * task.
 *
 * @example
 * <Meter label="Storage" value={72} aria-valuetext={(f) => `${f} of your quota`} />
 */
export function Meter({
  intent = "primary",
  saliency = "high",
  label,
  min = 0,
  max = 100,
  value,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-valuetext": ariaValueText,
}: MeterProps) {
  // base-ui's `aria-valuetext` takes a *string*; a *function* is its
  // `getAriaValueText`. Split the one prop across the two.
  const valueText = typeof ariaValueText === "string" ? ariaValueText : undefined;
  const getValueText = typeof ariaValueText === "function" ? ariaValueText : undefined;

  // base-ui computes sensible defaults for `aria-labelledby` (the rendered
  // `<Meter.Label>`) and `aria-valuetext` (the formatted value), and its prop
  // merge treats an explicit `undefined` as an override — so only forward these
  // when we actually have one, or we'd wipe the default association.
  const ariaProps: Record<string, string> = {};
  if (ariaLabel != null) ariaProps["aria-label"] = ariaLabel;
  if (ariaLabelledby != null) ariaProps["aria-labelledby"] = ariaLabelledby;
  if (valueText != null) ariaProps["aria-valuetext"] = valueText;

  return (
    <BaseMeter.Root
      className={cx(meterRoot, className)}
      min={min}
      max={max}
      value={value}
      getAriaValueText={getValueText}
      {...ariaProps}
    >
      {label != null && <BaseMeter.Label className={meterLabel}>{label}</BaseMeter.Label>}
      <BaseMeter.Track className={meterTrack}>
        <BaseMeter.Indicator className={meterIndicator({ intent, saliency })} />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
