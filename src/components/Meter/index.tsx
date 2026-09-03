"use client";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import type { Intent, Saliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Text, type TextProps } from "../Text";
import { meterFillVar, meterHeader, meterIndicator, meterRoot, meterTrack } from "./meter.css";

/**
 * Overrides for the meter's inner pieces. The three `Text` slots are partial —
 * `slotProps={{ value: { saliency: "high" }, label: { size: "md" } }}` layers
 * onto each slot's defaults. Set `children` to override a slot's content
 * entirely (rarely needed — prefer the top-level `label`/`description` props).
 */
export interface MeterSlotProps {
  /** Props for the label `Text` above the track. */
  label?: Partial<TextProps>;
  /** Props for the value read-out `Text` at the end of the header row. */
  value?: Partial<TextProps>;
  /** Props for the description `Text` beneath the track. */
  description?: Partial<TextProps>;
  /**
   * Overrides for the filled indicator (the "bar"). The only knob is `color`,
   * an escape hatch that paints the bar any CSS colour, overriding `intent` ×
   * `saliency`. Prefer `intent`/`saliency` for the system palette; reach for
   * this only when you need a colour outside it, and mind track contrast.
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
   * Visible label above the track, wired as the meter's accessible name
   * (`aria-labelledby`). For no visible label, use `aria-label` instead.
   */
  label?: React.ReactNode;
  /**
   * Supporting text beneath the track (units, context, a caption), wired as
   * the meter's `aria-describedby` so it's announced after the value.
   */
  description?: React.ReactNode;
  /**
   * Show the current value as text at the end of the header row (the
   * formatted value, or whatever `formatValue` returns). Decorative and
   * `aria-hidden` — the value already reaches AT via `aria-valuenow`/`aria-valuetext`.
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
   * Text alternative for the current value, announced in place of the raw
   * number. A fixed string forwards to base-ui as `aria-valuetext`; a function
   * of the formatted and raw value forwards as `getAriaValueText`.
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
 * (`role="meter"`, `aria-value*`, the value→percentage math) with the
 * system's colour scheme on top.
 *
 * The filled indicator is coloured by `intent` × `saliency` (same vocabulary
 * as `Chip`/`Button`) over a neutral track. A `label` sits above the track
 * (opposite an optional `showValue` read-out) and an optional `description`
 * sits below; each renders as a `Text` you can tune through `slotProps`.
 *
 * It is *not* a progress bar: use it for a measurement, not task completion.
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
  // base-ui's `aria-valuetext` takes a string; a function is `getAriaValueText`.
  const valueText = typeof ariaValueText === "string" ? ariaValueText : undefined;
  const getValueText = typeof ariaValueText === "function" ? ariaValueText : undefined;

  const generatedDescriptionId = React.useId();
  const descriptionId = description != null ? generatedDescriptionId : undefined;

  // base-ui defaults `aria-labelledby`/`aria-valuetext` on its own, and treats
  // an explicit `undefined` as an override — so only forward these when set.
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
            <BaseMeter.Label render={<Text size="sm" saliency="high" {...slotProps?.label} />}>
              {label}
            </BaseMeter.Label>
          )}
          {showValue && (
            <BaseMeter.Value render={<Text size="sm" saliency="low" {...slotProps?.value} />}>
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
        <Text id={descriptionId} size="sm" saliency="low" {...slotProps?.description}>
          {description}
        </Text>
      )}
    </BaseMeter.Root>
  );
}
