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

/** Which way a metric moved — picks the trend's arrow glyph. */
export type MetricTrendDirection = "up" | "down" | "flat";

/** The direction each trend announces when no explicit `label` is given. */
const TREND_VERB: Record<MetricTrendDirection, string> = {
  up: "increased",
  down: "decreased",
  flat: "unchanged",
};

/** The colour sentiment a direction implies by default (override for inverted metrics). */
const TREND_SENTIMENT: Record<MetricTrendDirection, Intent> = {
  up: "positive",
  down: "negative",
  flat: "neutral",
};

/**
 * A trend / delta shown beneath the metric (e.g. `▲ 12%`). The arrow is
 * decorative; the badge is one image with a text alternative, so a screen reader
 * hears "increased 12%".
 */
export interface MetricTrend {
  /** Which way the metric moved. Picks the arrow (`▲` / `▼` / `—`). */
  direction: MetricTrendDirection;
  /** The magnitude beside the arrow (e.g. `"12%"`, `"+3"`). */
  value: React.ReactNode;
  /**
   * Colour sentiment. Defaults from `direction`; set it explicitly for inverted
   * metrics (churn, latency, cost) where a fall is good.
   */
  sentiment?: Intent;
  /**
   * The text alternative announced in place of the glyph + value. Defaults to
   * `"{increased|decreased|unchanged} {value}"`; supply it when `value` isn't
   * plain text.
   */
  label?: string;
}

/** State a MetricCard `icon` render function can branch on — empty today. */
export type MetricCardIconState = Record<string, never>;

/** Props shared by every MetricCard mode (static / clickable / linkable). */
interface MetricCardBaseProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick" | "title"> {
  /**
   * The measured figure, rendered large. Deliberately **not** a heading, so a
   * wall of tiles doesn't bury the page's real headings under bare numbers — name
   * the group with a real heading and a `CardList` instead.
   */
  value: React.ReactNode;
  /**
   * What the value measures (e.g. `"Active goals"`). With the value, it forms the
   * metric's accessible name when the card is interactive ("Active goals, 2").
   */
  label: React.ReactNode;
  /**
   * Optional supporting line beneath the label, small and muted. Stays outside an
   * interactive card's control, so it isn't folded into the link/button name.
   */
  caption?: React.ReactNode;
  /**
   * An optional trend / delta badge (`▲ 12%`) beneath the label. Like `caption`,
   * it stays outside an interactive card's control.
   */
  trend?: MetricTrend;
  /**
   * Optional leading glyph above the value — a bare glyph, an `<Icon>`, or a
   * render function. Decorative (`aria-hidden`); the `label` names the metric.
   */
  icon?: IconSlot<MetricCardIconState>;
  /**
   * Tints the **value** (not the surface) — e.g. `positive` / `negative` for a
   * good / bad number. The label and caption keep the neutral text ramp.
   */
  intent?: Intent;
  /** Visual size of the value figure, from the shared type scale. Default `3xl`. */
  valueSize?: TextSize;
  /** Semantic element for the underlying `Card`. Default `div`. */
  as?: CardElement;
  /**
   * Overrides the composed accessible name of an interactive card. Use it when
   * `value` / `label` aren't plain text (so the auto-composed name would be
   * empty or unclear), e.g. `aria-label="Active goals: 2"`.
   */
  "aria-label"?: string;
  ref?: React.Ref<HTMLElement>;
}

/** A static, non-interactive MetricCard (the default). */
export interface MetricCardStaticProps extends MetricCardBaseProps {
  href?: never;
  onClick?: never;
  target?: never;
  rel?: never;
  render?: never;
  disabled?: never;
}

/**
 * A clickable MetricCard. The value + label become the one real `<button>`,
 * stretched across the whole surface via an `::after` overlay
 * (https://inclusive-components.design/cards/).
 */
export interface MetricCardClickableProps extends MetricCardBaseProps {
  /** Activation handler. Turns the value + label into the card's `<button>`. Swallowed while disabled. */
  onClick: React.MouseEventHandler<HTMLElement>;
  /** Uses `aria-disabled` (never the native attribute), so it stays focusable. */
  disabled?: boolean;
  href?: never;
  target?: never;
  rel?: never;
  render?: never;
}

/**
 * A linkable MetricCard. Like the clickable card, the value + label become the
 * one real `<a>` (or your router's link via `render`), stretched across the whole
 * surface.
 */
export interface MetricCardLinkableProps extends MetricCardBaseProps {
  /** Destination. Turns the value + label into the card's `<a>`. */
  href: string;
  /** Anchor target (e.g. `_blank`). */
  target?: string;
  /** Anchor rel (e.g. `noreferrer`). */
  rel?: string;
  /** Render as a different element/component — e.g. a router `<Link>` (base-ui `render` pattern). */
  render?: RenderProp;
  /** Uses `aria-disabled` (never the native attribute), so it stays focusable. */
  disabled?: boolean;
  onClick?: never;
}

/**
 * MetricCard props — a discriminated union over the three modes:
 *   - **static** (default): a read-only stat,
 *   - **clickable**: pass `onClick` to make the stat a `<button>`,
 *   - **linkable**: pass `href` to make the stat an `<a>`.
 */
export type MetricCardProps =
  | MetricCardStaticProps
  | MetricCardClickableProps
  | MetricCardLinkableProps;

/** Internal superset (all modes' props readable) for the root implementation. */
type InternalMetricCardProps = MetricCardBaseProps & {
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  target?: string;
  rel?: string;
  render?: RenderProp;
  disabled?: boolean;
};

/**
 * A `Card` variant for the "big number + label" stat / KPI tile. Renders a large
 * `value`, a `label` naming it, and an optional `caption`, `trend`, and leading
 * `icon`. The `value` is not a heading; drop tiles into a `<CardList>` under a
 * real section heading so they're announced as a named list. Made interactive
 * (`onClick` / `href`), the value + label become the single control naming the
 * card, with disabled modelled the focusable way (per AGENTS.md).
 *
 * @example
 * <CardList aria-labelledby="goals-h">
 *   <MetricCard value={2} label="Active" href="/goals?status=active" />
 *   <MetricCard value={1} label="Paused" href="/goals?status=paused" />
 *   <MetricCard value={1} label="Complete" href="/goals?status=complete" />
 * </CardList>
 */
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

/**
 * The trend's text alternative: an explicit `label`, else a phrase composed from
 * the direction and magnitude ("increased 12%"). A `flat` trend announces just
 * "unchanged" — its magnitude (typically "0%") adds nothing.
 */
function trendAccessibleLabel({ direction, value, label }: MetricTrend): string {
  if (label != null) return label;
  if (direction === "flat") return TREND_VERB.flat;
  return typeof value === "string" ? `${TREND_VERB[direction]} ${value}` : TREND_VERB[direction];
}

/**
 * The trend / delta badge — arrow glyph plus magnitude, exposed as a single
 * `role="img"` with a composed text alternative ("increased 12%"). Colour follows
 * the trend's `sentiment`.
 */
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

/** Decorative trend arrow — an up / down triangle, or a dash for a flat trend. */
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

/** The activation an interactive MetricCard hands down to its hero control. */
interface MetricControlConfig {
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  target?: string;
  rel?: string;
  render?: RenderProp;
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * The metric's single primary control — the value + label as the one real
 * link/button, stretched over the card via `metricOverlay`'s `::after`. Disabled
 * uses `aria-disabled` + swallowed activation (per AGENTS.md); an optional
 * `render` carries a router link.
 */
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
