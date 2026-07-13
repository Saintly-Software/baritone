"use client";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import type { Intent, Saliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Text, type TextProps } from "../Text";
import { meterFillVar, meterHeader, meterIndicator, meterRoot, meterTrack } from "./meter.css";

/**
 * Overrides for the meter's inner pieces. The three `Text` slots are partial:
 * you're layering props onto the slot's own defaults, so
 * `slotProps={{ value: { saliency: "high" }, label: { variant: "base" } }}`
 * just re-tunes those pieces while the rest of the meter stays as-is. Set
 * `children` here to override a slot's content entirely (rarely needed — prefer
 * the top-level `label` / `description` props).
 */
export interface MeterSlotProps {
  /** Props for the label `Text` above the track. */
  label?: Partial<TextProps>;
  /** Props for the value read-out `Text` at the end of the header row. */
  value?: Partial<TextProps>;
  /** Props for the description `Text` beneath the track. */
  description?: Partial<TextProps>;
  /**
   * Overrides for the filled indicator (the "bar"). Not a `Text` slot — the one
   * knob here is `color`, an escape hatch that paints the bar any CSS colour,
   * overriding `intent` × `saliency`. Accepts anything CSS `color` takes (a
   * hex/rgb value, a custom property, `currentColor`). Prefer `intent` /
   * `saliency` so the bar stays on the system palette — reach for this only when
   * you genuinely need a colour outside it, and mind contrast against the track.
   */
  bar?: {
    /** Paint the indicator any CSS colour, overriding `intent` × `saliency`. */
    color?: React.CSSProperties["color"];
  };
}

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
  /**
   * Supporting text rendered beneath the track (units, context, a caption). Wired
   * to the meter as its `aria-describedby`, so screen readers announce it after
   * the value.
   */
  description?: React.ReactNode;
  /**
   * Show the current value as text at the end of the header row. The displayed
   * string is the formatted value (respecting `format` / `locale`), or whatever
   * `formatValue` returns. Decorative — it's `aria-hidden`, the value already
   * reaching assistive tech via `aria-valuenow` / `aria-valuetext`.
   */
  showValue?: boolean;
  /**
   * Customise the node shown by `showValue`. Receives the formatted value (per
   * `format` / `locale`) and the raw value; return whatever should render.
   */
  formatValue?: (formattedValue: string, value: number) => React.ReactNode;
  /**
   * `Intl.NumberFormat` options for the displayed value and the default
   * `aria-valuetext` (e.g. `{ style: "unit", unit: "gigabyte" }`).
   */
  format?: Intl.NumberFormatOptions;
  /** Locale for `format`. Defaults to the runtime locale. */
  locale?: Intl.LocalesArgument;
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
  /**
   * Overrides for the inner pieces: the label / value / description `Text`s, plus
   * `bar.color` as a colour escape hatch for the indicator.
   */
  slotProps?: MeterSlotProps;
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
 * visible ink at every saliency, over a neutral track. A `label` sits above the
 * track (opposite an optional `showValue` read-out) and an optional `description`
 * sits below; each renders as a `Text` you can tune through `slotProps`.
 *
 * It is *not* a progress bar: use it for a measurement, not the completion of a
 * task.
 *
 * @example
 * <Meter label="Storage" value={72} showValue description="of your 100 GB quota" />
 */
export function Meter({
  intent = "primary",
  saliency = "high",
  label,
  description,
  showValue = false,
  formatValue,
  format,
  locale,
  min = 0,
  max = 100,
  value,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-valuetext": ariaValueText,
  slotProps,
}: MeterProps) {
  // base-ui's `aria-valuetext` takes a *string*; a *function* is its
  // `getAriaValueText`. Split the one prop across the two.
  const valueText = typeof ariaValueText === "string" ? ariaValueText : undefined;
  const getValueText = typeof ariaValueText === "function" ? ariaValueText : undefined;

  const generatedDescriptionId = React.useId();
  const descriptionId = description != null ? generatedDescriptionId : undefined;

  // base-ui computes sensible defaults for `aria-labelledby` (the rendered
  // `<Meter.Label>`) and `aria-valuetext` (the formatted value), and its prop
  // merge treats an explicit `undefined` as an override — so only forward these
  // when we actually have one, or we'd wipe the default association.
  const ariaProps: Record<string, string> = {};
  if (ariaLabel != null) ariaProps["aria-label"] = ariaLabel;
  if (ariaLabelledby != null) ariaProps["aria-labelledby"] = ariaLabelledby;
  if (valueText != null) ariaProps["aria-valuetext"] = valueText;
  if (descriptionId != null) ariaProps["aria-describedby"] = descriptionId;

  return (
    <BaseMeter.Root
      className={cx(meterRoot, className)}
      min={min}
      max={max}
      value={value}
      format={format}
      locale={locale}
      getAriaValueText={getValueText}
      {...ariaProps}
    >
      {(label != null || showValue) && (
        <div className={meterHeader}>
          {label != null && (
            <BaseMeter.Label render={<Text variant="sm" saliency="high" {...slotProps?.label} />}>
              {label}
            </BaseMeter.Label>
          )}
          {showValue && (
            <BaseMeter.Value render={<Text variant="sm" saliency="low" {...slotProps?.value} />}>
              {formatValue}
            </BaseMeter.Value>
          )}
        </div>
      )}
      <BaseMeter.Track className={meterTrack}>
        <BaseMeter.Indicator
          className={meterIndicator({ intent, saliency })}
          style={
            slotProps?.bar?.color != null
              ? assignInlineVars({ [meterFillVar]: slotProps.bar.color })
              : undefined
          }
        />
      </BaseMeter.Track>
      {description != null && (
        <Text id={descriptionId} variant="sm" saliency="low" {...slotProps?.description}>
          {description}
        </Text>
      )}
    </BaseMeter.Root>
  );
}
