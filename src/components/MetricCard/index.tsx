"use client";
import * as React from "react";
import { textIntentRecipe, textSizeRecipe, typographyWeight } from "../../styles/recipes/text.css";
import type { Intent, TextSize } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { Card, type CardElement } from "../Card";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import { Text } from "../Text";
import {
  metricHero,
  metricIcon,
  metricInteractive,
  metricOverlay,
  metricRoot,
  metricTrend,
  metricTrendGlyph,
} from "./metricCard.css";

export type MetricTrendDirection = "up" | "down" | "flat";

const TREND_VERB: Record<MetricTrendDirection, string> = {
  up: "increased",
  down: "decreased",
  flat: "unchanged",
};

const TREND_SENTIMENT: Record<MetricTrendDirection, Intent> = {
  up: "positive",
  down: "negative",
  flat: "neutral",
};

export interface MetricTrend {
  direction: MetricTrendDirection;

  value: React.ReactNode;

  sentiment?: Intent;

  label?: string;
}

export type MetricCardIconState = Record<string, never>;

interface MetricCardBaseProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick" | "title"> {
  value: React.ReactNode;

  label: React.ReactNode;

  caption?: React.ReactNode;

  trend?: MetricTrend;

  icon?: IconSlot<MetricCardIconState>;

  intent?: Intent;

  valueSize?: TextSize;

  as?: CardElement;

  "aria-label"?: string;
  ref?: React.Ref<HTMLElement>;
}

export interface MetricCardStaticProps extends MetricCardBaseProps {
  href?: never;
  onClick?: never;
  target?: never;
  rel?: never;
  render?: never;
  disabled?: never;
}

export interface MetricCardClickableProps extends MetricCardBaseProps {
  onClick: React.MouseEventHandler<HTMLElement>;

  disabled?: boolean;
  href?: never;
  target?: never;
  rel?: never;
  render?: never;
}

export interface MetricCardLinkableProps extends MetricCardBaseProps {
  href: string;

  target?: string;

  rel?: string;

  render?: RenderProp;

  disabled?: boolean;
  onClick?: never;
}

export type MetricCardProps =
  | MetricCardStaticProps
  | MetricCardClickableProps
  | MetricCardLinkableProps;

type InternalMetricCardProps = MetricCardBaseProps & {
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  target?: string;
  rel?: string;
  render?: RenderProp;
  disabled?: boolean;
};

export function MetricCard(props: MetricCardProps) {
  const {
    value,
    label,
    caption,
    trend,
    icon,
    intent,
    valueSize = "3xl",
    as = "div",
    href,
    onClick,
    target,
    rel,
    render,
    disabled,
    className,
    "aria-label": ariaLabel,
    ref,
    ...rest
  }: InternalMetricCardProps = props;

  const interactive = href != null || onClick != null;

  const valueNode = (
    <span
      className={cx(
        textSizeRecipe({ size: valueSize }),
        typographyWeight({ weight: "bold" }),
        textIntentRecipe({ intent, saliency: "high" }),
      )}
    >
      {value}
    </span>
  );
  const labelNode = (
    <Text as="span" size="md">
      {label}
    </Text>
  );

  const control: MetricControlConfig | null = interactive
    ? { href, onClick, target, rel, render, disabled, ariaLabel }
    : null;

  const hero = control ? (
    <MetricControl control={control}>
      {valueNode}
      {labelNode}
    </MetricControl>
  ) : (
    <div className={metricHero}>
      {valueNode}
      {labelNode}
    </div>
  );

  const iconNode = renderIcon(icon);
  return (
    <Card as={as} ref={ref} className={cx(interactive && metricInteractive, className)} {...rest}>
      <div className={metricRoot}>
        {iconNode != null && (
          <span className={metricIcon} aria-hidden="true">
            {iconNode}
          </span>
        )}
        {hero}
        {trend != null && <MetricTrendBadge trend={trend} />}
        {caption != null && (
          <Text size="sm" saliency="low">
            {caption}
          </Text>
        )}
      </div>
    </Card>
  );
}

function trendAccessibleLabel({ direction, value, label }: MetricTrend): string {
  if (label != null) return label;
  if (direction === "flat") return TREND_VERB.flat;
  return typeof value === "string" ? `${TREND_VERB[direction]} ${value}` : TREND_VERB[direction];
}

function MetricTrendBadge({ trend }: { trend: MetricTrend }) {
  const { direction, value, sentiment } = trend;
  const accessibleLabel = trendAccessibleLabel(trend);

  return (
    <span
      role="img"
      aria-label={accessibleLabel}
      className={cx(
        metricTrend,
        textSizeRecipe({ size: "sm" }),
        textIntentRecipe({ intent: sentiment ?? TREND_SENTIMENT[direction], saliency: "mid" }),
      )}
    >
      <TrendGlyph direction={direction} />
      <span aria-hidden="true">{value}</span>
    </span>
  );
}

function TrendGlyph({ direction }: { direction: MetricTrendDirection }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={metricTrendGlyph}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {direction === "up" && <path d="M12 6l7 11H5z" />}
      {direction === "down" && <path d="M12 18l-7-11h14z" />}
      {direction === "flat" && <rect x="5" y="11" width="14" height="2" rx="1" />}
    </svg>
  );
}

interface MetricControlConfig {
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  target?: string;
  rel?: string;
  render?: RenderProp;
  disabled?: boolean;
  ariaLabel?: string;
}

function MetricControl({
  control,
  children,
}: {
  control: MetricControlConfig;
  children: React.ReactNode;
}) {
  const { href, onClick, target, rel, render, disabled, ariaLabel } = control;

  const handleActivate = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  const elementProps: Record<string, unknown> = {
    className: metricOverlay,
    "aria-disabled": disabled || undefined,
    "aria-label": ariaLabel,
    onClick: handleActivate,
    children,
  };
  if (href != null) {
    elementProps.href = href;
    if (target != null) elementProps.target = target;
    if (rel != null) elementProps.rel = rel;
  } else {
    elementProps.type = "button";
  }

  return useRender({
    render,
    defaultElement: href != null ? "a" : "button",
    props: elementProps,
  });
}

MetricCard.displayName = "MetricCard";
