"use client";
import * as React from "react";
import { textIntentRecipe, textVariantRecipe } from "../../styles/recipes/text.css";
import type { Intent, TitleSize } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { Card, type CardElement } from "../Card";
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
 * A trend / delta shown beneath the metric — the change since some baseline
 * (e.g. `▲ 12%`). The arrow glyph is decorative; the whole badge is exposed as a
 * single image with a text alternative, so a screen reader hears "increased 12%",
 * never "up-pointing triangle, 12 percent".
 */
export interface MetricTrend {
  /** Which way the metric moved. Picks the arrow (`▲` / `▼` / `—`). */
  direction: MetricTrendDirection;
  /** The magnitude beside the arrow (e.g. `"12%"`, `"+3"`). */
  value: React.ReactNode;
  /**
   * Colour sentiment. Defaults from `direction` (`up` → positive, `down` →
   * negative, `flat` → neutral); set it explicitly for *inverted* metrics where a
   * fall is good — churn, latency, cost — so "down" can read as positive (green).
   */
  sentiment?: Intent;
  /**
   * The text alternative announced in place of the glyph + value. Defaults to
   * `"{increased|decreased|unchanged} {value}"` when `value` is a string; supply
   * it when `value` isn't plain text, or to phrase it differently.
   */
  label?: string;
}

/** Props shared by every MetricCard mode (static / clickable / linkable). */
interface MetricCardBaseProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick" | "title"> {
  /**
   * The measured figure — the hero of the card, rendered large. It is
   * deliberately **not** a heading: a wall of metric tiles would otherwise fill
   * the document outline with bare numbers ("2", "1", "3"…) that mean nothing out
   * of context and drown the real section headings. Name the group of metrics
   * with a real heading (and a `CardList`) instead — see the component docs.
   */
  value: React.ReactNode;
  /**
   * What the value measures (e.g. `"Active goals"`). Sits beneath the value and,
   * together with it, forms the metric's accessible name when the card is
   * interactive ("Active goals, 2").
   */
  label: React.ReactNode;
  /**
   * Optional supporting line beneath the label (e.g. `"tasks completed"`),
   * rendered small and muted. It stays *outside* an interactive card's control,
   * so it's read as ordinary content rather than folded into the link/button name.
   */
  caption?: React.ReactNode;
  /**
   * An optional trend / delta badge (`▲ 12%`) shown beneath the label — the
   * change since some baseline. Like `caption`, it stays *outside* an interactive
   * card's control, so the link/button is still named by just the value + label.
   */
  trend?: MetricTrend;
  /**
   * Optional leading glyph — typically an `<Icon>`. Treated as decorative
   * (`aria-hidden`): the `label` already names the metric, so the icon would only
   * add noise to a screen reader.
   */
  icon?: React.ReactNode;
  /**
   * Tints the **value** (not the surface) — e.g. `positive` / `negative` for a
   * good / bad number. The label and caption keep the neutral text ramp.
   */
  intent?: Intent;
  /** Visual size of the value figure, from the title scale. Default `3xl`. */
  valueSize?: TitleSize;
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
 * stretched across the whole surface (via an `::after` overlay) so the entire
 * card activates — the accessible pattern from
 * https://inclusive-components.design/cards/.
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
 * MetricCard — a `Card` variant for the "big number + label" stat / KPI tile
 * (dashboards, summaries). Built on `Card` for the surface, it renders a large
 * `value`, a `label` naming it, and an optional `caption` and leading `icon`.
 *
 * **Accessibility.** The `value` is *not* a heading, so a grid of tiles doesn't
 * bury the page's real headings under bare numbers. Metrics are meant to live in
 * a **named list**: drop them into a `<CardList>` (each becomes a `listitem`
 * under a real section heading), so a screen-reader user hears "Goals, list, 3
 * items — Active 2, Paused 1, …" rather than a stream of disconnected numbers.
 * Made interactive (`onClick` / `href`), the value + label become the single
 * control naming the card ("Active goals, 2"); disabled is modelled the focusable
 * way (`aria-disabled` + swallowed activation), per AGENTS.md.
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

  // The value figure — big, high-saliency, and tinted by `intent`. Rendered on a
  // plain `<span>` (via the title typography recipe, the same one `Heading` uses)
  // so it *looks* like a title without being one in the document outline.
  const valueNode = (
    <span
      className={cx(
        textVariantRecipe({ family: "title", size: valueSize }),
        textIntentRecipe({ intent, saliency: "high" }),
      )}
    >
      {value}
    </span>
  );
  const labelNode = (
    <Text as="span" variant="base">
      {label}
    </Text>
  );

  // The value + label are one unit. When interactive they become the single real
  // control (stretched over the whole card); otherwise they're a plain wrapper.
  // The activation is bundled into one `control` object (rather than a `disabled`
  // JSX attribute) — mirroring Card's `CardPrimaryLink`, this also keeps the
  // aria-disabled guard from mistaking the wrapper for a native control.
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

  return (
    <Card as={as} ref={ref} className={cx(interactive && metricInteractive, className)} {...rest}>
      <div className={metricRoot}>
        {icon != null && (
          <span className={metricIcon} aria-hidden="true">
            {icon}
          </span>
        )}
        {hero}
        {trend != null && <MetricTrendBadge trend={trend} />}
        {caption != null && (
          <Text variant="sm" saliency="low">
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
 * The trend / delta badge — the arrow glyph plus the magnitude, exposed as a
 * single `role="img"` carrying a composed text alternative ("increased 12%"), so
 * the decorative arrow is never announced as a glyph name. Its colour follows the
 * trend's `sentiment` (defaulted from the direction).
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
        textVariantRecipe({ family: "body", size: "sm" }),
        textIntentRecipe({ intent: sentiment ?? TREND_SENTIMENT[direction], saliency: "mid" }),
      )}
    >
      <TrendGlyph direction={direction} />
      {/* Redundant under `role="img"`, but keeps the magnitude out of the a11y
          tree on the rare engine that doesn't prune an image's descendants. */}
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
 * The metric's single primary control — the value + label rendered as the one
 * real link/button, stretched over the whole card via `metricOverlay`'s `::after`.
 * Disabled is modelled the focusable way (per AGENTS.md): `aria-disabled` plus
 * swallowing the activation — and an `<a>`'s navigation — never the native
 * attribute. An optional `render` carries a router link.
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
