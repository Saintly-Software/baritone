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
 * decorative; the badge exposes one text alternative ("increased 12%").
 */
export interface MetricTrend {
  /** Which way the metric moved. Picks the arrow (`▲` / `▼` / `—`). */
  direction: MetricTrendDirection;
  /** The magnitude beside the arrow (e.g. `"12%"`, `"+3"`). */
  value: React.ReactNode;
  /**
   * Colour sentiment. Defaults from `direction`; override for inverted metrics
   * (churn, latency, cost) where a fall is good, so "down" reads positive.
   */
  sentiment?: Intent;
  /**
   * Text alternative for the glyph + value. Defaults to `"increased 12%"`-style
   * phrasing for string values; set it explicitly when `value` isn't plain text.
   */
  label?: string;
}

/**
 * The state a MetricCard `icon` render function can branch on. The glyph is
 * fixed and decorative, so there's nothing to branch on yet — kept empty so
 * the render-function form still works.
 */
export type MetricCardIconState = Record<string, never>;

/** Props shared by every MetricCard mode (static / clickable / linkable). */
interface MetricCardBaseProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick" | "title"> {
  /**
   * The measured figure, rendered large. Deliberately **not** a heading: a grid
   * of tiles would otherwise fill the doc outline with bare numbers ("2", "1"…).
   * Name the group with a real heading (and a `CardList`) instead.
   */
  value: React.ReactNode;
  /**
   * What the value measures (e.g. `"Active goals"`). Together with `value`,
   * forms the card's accessible name when interactive ("Active goals, 2").
   */
  label: React.ReactNode;
  /**
   * Optional supporting line beneath the label (e.g. `"tasks completed"`), small
   * and muted. Stays *outside* an interactive card's control, so it isn't
   * folded into the link/button name.
   */
  caption?: React.ReactNode;
  /**
   * Optional trend / delta badge (`▲ 12%`) shown beneath the label. Like
   * `caption`, stays *outside* an interactive card's control.
   */
  trend?: MetricTrend;
  /**
   * Optional leading glyph, shown above the value. Pass a bare glyph
   * (auto-wrapped in `Icon`), an explicit `<Icon>`, or a render function for
   * full control. Decorative (`aria-hidden`) — `label` already names the metric.
   */
  icon?: IconSlot<MetricCardIconState>;
  /**
   * Tints the **value** only (not the surface), e.g. `positive`/`negative` for
   * a good/bad number. Label and caption stay on the neutral ramp.
   */
  intent?: Intent;
  /** Visual size of the value figure, from the shared type scale. Default `3xl`. */
  valueSize?: TextSize;
  /** Semantic element for the underlying `Card`. Default `div`. */
  as?: CardElement;
  /**
   * Overrides the composed accessible name of an interactive card. Use it when
   * `value`/`label` aren't plain text, e.g. `aria-label="Active goals: 2"`.
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
 * stretched across the whole surface via an `::after` overlay so the entire
 * card activates — the pattern from https://inclusive-components.design/cards/.
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
 * one real `<a>` (or a router link via `render`), stretched across the surface.
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
 * MetricCard — a `Card` variant for the "big number + label" stat/KPI tile.
 * Renders a large `value`, a `label`, and optional `caption`/`icon`.
 *
 * **Accessibility.** `value` is *not* a heading — group metrics in a
 * `<CardList>` instead so a screen reader hears real headings, not bare
 * numbers. Interactive (`onClick`/`href`) cards name themselves from value +
 * label; disabled uses `aria-disabled` + swallowed activation, per AGENTS.md.
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

  // High-saliency span tinted by `intent` — not a heading (see `value` doc).
  // Weight is explicit since it's no longer tied to `size`.
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

  // Value + label are one unit — the single real control when interactive, else
  // a plain wrapper. Bundled into one `control` object (mirroring Card's
  // `CardPrimaryLink`) so aria-disabled doesn't mistake the wrapper for a native control.
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

  // Guard on the resolved node, not the raw slot — a slot can resolve to nothing.
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
 * The trend's text alternative: explicit `label`, else direction + magnitude
 * ("increased 12%"). `flat` announces just "unchanged" — its magnitude adds nothing.
 */
function trendAccessibleLabel({ direction, value, label }: MetricTrend): string {
  if (label != null) return label;
  if (direction === "flat") return TREND_VERB.flat;
  return typeof value === "string" ? `${TREND_VERB[direction]} ${value}` : TREND_VERB[direction];
}

/**
 * The trend/delta badge — the arrow glyph plus magnitude, exposed as one
 * `role="img"` with a composed text alternative so the arrow is never
 * announced as a glyph name. Colour follows `sentiment` (defaulted from direction).
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
      {/* Redundant under role="img", but guards engines that don't prune an image's descendants. */}
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
 * The metric's single primary control — value + label as the one real
 * link/button, stretched over the card via `metricOverlay`'s `::after`.
 * Disabled uses `aria-disabled` + swallowed activation (never the native
 * attribute), per AGENTS.md. An optional `render` carries a router link.
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
    // Default `type` to `button` so a clickable card in a form doesn't submit it.
    elementProps.type = "button";
  }

  return useRender({
    render,
    defaultElement: href != null ? "a" : "button",
    props: elementProps,
  });
}

MetricCard.displayName = "MetricCard";
