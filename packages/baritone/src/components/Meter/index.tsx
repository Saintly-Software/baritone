"use client";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import type { Intent, Saliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Text, type TextProps } from "../Text";
import { meterFillVar, meterHeader, meterIndicator, meterRoot, meterTrack } from "./meter.css";

export interface MeterSlotProps {
  label?: Partial<TextProps>;

  value?: Partial<TextProps>;

  description?: Partial<TextProps>;

  bar?: {
    color?: React.CSSProperties["color"];
  };
}

export interface MeterProps {
  intent?: Intent;

  saliency?: Saliency;

  label?: React.ReactNode;

  description?: React.ReactNode;

  showValue?: boolean;

  formatValue?: (formattedValue: string, value: number) => React.ReactNode;

  format?: Intl.NumberFormatOptions;

  locale?: Intl.LocalesArgument;

  "aria-label"?: string;

  "aria-labelledby"?: string;

  min?: number;

  max?: number;

  value: number;

  "aria-valuetext"?: string | ((formattedValue: string, value: number) => string);

  slotProps?: MeterSlotProps;

  className?: string;
}

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
  const valueText = typeof ariaValueText === "string" ? ariaValueText : undefined;
  const getValueText = typeof ariaValueText === "function" ? ariaValueText : undefined;

  const generatedDescriptionId = React.useId();
  const descriptionId = description != null ? generatedDescriptionId : undefined;

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
