"use client";
import { Collapsible } from "@base-ui/react/collapsible";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import type { HeadingLevel, Intent, SurfaceSaliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { Heading } from "../Heading";
import { Text } from "../Text";
import {
  cardActionsRecipe,
  cardBleed,
  cardChevron,
  cardCollapsiblePaddingRecipe,
  cardCollapsiblePanel,
  cardCollapsiblePanelContent,
  cardCollapsibleRoot,
  cardCollapsibleTrigger,
  cardDivider,
  cardFooter,
  cardHeader,
  cardHeaderIcon,
  cardHeaderLeading,
  cardHeaderText,
  cardHeaderTrailing,
  cardRoot,
  cardRow,
  cardRowActions,
  cardRowDesc,
  cardRows,
  cardRowTerm,
  cardRowText,
} from "./card.css";

export type CardPadding = "none" | "sm" | "md" | "lg";

/** Semantic root element for a (static) Card. */
export type CardElement = "div" | "section" | "main" | "article";

/** Props shared by every Card mode (static / clickable / linkable). */
interface CardBaseProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
  /** Default `neutral` (most surfaces are neutral). */
  intent?: Intent;
  /** `low` (default neutral surface) or `high` (washed). Default `low`. */
  saliency?: SurfaceSaliency;
  /** Internal padding from the spacing scale. Default `md`. */
  padding?: CardPadding;
  /** Rendered above the content — typically a `<Card.Header />`. */
  header?: React.ReactNode;
  /** Rendered below the content — typically a `<Card.Footer />`. */
  footer?: React.ReactNode;
  /** Uses `aria-disabled` rather than `disabled`. */
  disabled?: boolean;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * A static, non-interactive Card (the default). Pick the semantic element with
 * `as`, or make it a single collapsible disclosure with `collapsible`.
 */
export interface CardStaticProps extends CardBaseProps {
  /** Semantic root element. Default `div`. */
  as?: CardElement;
  /**
   * Make the card a single collapsible disclosure: the `header` becomes the
   * trigger (always visible) and the content + `footer` collapse away, so only
   * the header shows when closed. Built on base-ui's `Collapsible`. The header
   * lives inside the trigger `<button>`, so keep its content non-interactive.
   */
  collapsible?: boolean;
  /** Controlled open state (collapsible only). */
  open?: boolean;
  /** Uncontrolled initial open state (collapsible only). Default closed. */
  defaultOpen?: boolean;
  /** Called when the open state changes (collapsible only). */
  onOpenChange?: (open: boolean) => void;
  href?: never;
  onClick?: never;
}

/**
 * A clickable Card — the whole surface is a `<button>`. Because the card *is* a
 * single control, don't nest other interactive elements (footer buttons, links)
 * inside it.
 */
export interface CardClickableProps extends CardBaseProps {
  /** Activation handler. Makes the whole card a `<button>`. Swallowed while disabled. */
  onClick: React.MouseEventHandler<HTMLElement>;
  href?: never;
  as?: never;
  collapsible?: never;
  open?: never;
  defaultOpen?: never;
  onOpenChange?: never;
}

/**
 * A linkable Card — the whole surface is an `<a>` (or your router's link via
 * `render`). As with the clickable card, don't nest other interactive elements
 * inside it.
 */
export interface CardLinkableProps extends CardBaseProps {
  /** Destination. Makes the whole card an `<a>`. */
  href: string;
  /** Anchor target (e.g. `_blank`). */
  target?: string;
  /** Anchor rel (e.g. `noreferrer`). */
  rel?: string;
  onClick?: never;
  as?: never;
  collapsible?: never;
  open?: never;
  defaultOpen?: never;
  onOpenChange?: never;
}

/**
 * Card props — a discriminated union over the three modes:
 *   - **static** (default): a container; pick its element with `as`, or make it
 *     `collapsible`,
 *   - **clickable**: pass `onClick` to render the whole card as a `<button>`,
 *   - **linkable**: pass `href` to render the whole card as an `<a>`.
 */
export type CardProps = CardStaticProps | CardClickableProps | CardLinkableProps;

/** Internal superset (all modes' props readable) for the root implementation. */
type InternalCardProps = CardBaseProps & {
  as?: CardElement;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  collapsible?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Card — a "surface" element type. Two saliency levels (low/high). Supports the
 * neutral intent by default; other intents exist for surfaces like Notice.
 *
 * Composes `header` / `footer` props (or `<Card.Header>` / `<Card.Footer>`
 * children) around its content, plus `<Card.Bleed>` (full-width content),
 * `<Card.Divider>` (edge-to-edge rule), and `<Card.Rows>` (a `dl` of key/value
 * `<Card.Row>`s). Use `as` to pick the semantic element.
 *
 * It can also *be* a control: pass `onClick` to render the whole card as a
 * `<button>`, or `href` to render it as an `<a>` (with hover/active states and
 * the focusable `aria-disabled` model). Or set `collapsible` to make the header
 * a disclosure trigger that collapses the content + footer away.
 */
function CardRoot(props: CardProps) {
  const {
    intent,
    saliency,
    padding = "md",
    header,
    footer,
    disabled,
    render,
    className,
    children,
    ref,
    as = "div",
    href,
    onClick,
    target,
    rel,
    collapsible,
    open,
    defaultOpen,
    onOpenChange,
    ...rest
  }: InternalCardProps = props;

  // A collapsible card is a self-contained disclosure (header trigger + collapsing
  // panel), structurally unlike the flat surface, so it gets its own branch.
  if (collapsible) {
    return (
      <Collapsible.Root
        ref={ref as React.Ref<HTMLDivElement>}
        open={open}
        defaultOpen={defaultOpen}
        // Always intercept so a disabled card can veto the toggle (base-ui skips
        // the commit when `cancel()` ran) — the trigger stays focusable, it just
        // won't open/close. Mirrors Accordion's per-item veto.
        onOpenChange={(nextOpen, details) => {
          if (disabled) {
            details.cancel();
            return;
          }
          onOpenChange?.(nextOpen);
        }}
        aria-disabled={disabled || undefined}
        className={cx(
          surfaceRecipe({ intent, saliency, padding: "none" }),
          cardCollapsibleRoot,
          className,
        )}
        {...rest}
      >
        <Collapsible.Trigger
          // `aria-disabled` (never the native attribute) keeps the trigger
          // tabbable; the veto above stops it toggling. See AGENTS.md.
          aria-disabled={disabled || undefined}
          className={cx(
            cardCollapsiblePaddingRecipe({ padding }),
            cardCollapsibleTrigger,
            focusRingRecipe({ type: "visible" }),
          )}
        >
          {header}
          <ChevronGlyph className={cardChevron} />
        </Collapsible.Trigger>
        <Collapsible.Panel className={cardCollapsiblePanel}>
          <div
            className={cx(cardCollapsiblePaddingRecipe({ padding }), cardCollapsiblePanelContent)}
          >
            {children}
            {footer}
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    );
  }

  const interactive = href != null || onClick != null;

  // A clickable/linkable card has no native `disabled`, so swallow the activation
  // ourselves (preventing an `<a>`'s navigation too) while it stays focusable —
  // mirrors Chip / ToggleButton.
  const handleActivate = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  const elementProps: Record<string, unknown> = {
    ref,
    className: cx(
      surfaceRecipe({ intent, saliency, padding, interactive }),
      focusRingRecipe({ type: "visible" }),
      cardRoot,
      className,
    ),
    "aria-disabled": disabled || undefined,
    children: (
      <>
        {header}
        {children}
        {footer}
      </>
    ),
    ...rest,
  };

  if (href != null) {
    elementProps.href = href;
    if (target != null) elementProps.target = target;
    if (rel != null) elementProps.rel = rel;
    elementProps.onClick = handleActivate;
  } else if (onClick != null) {
    // Default `type` to `button` so a card in a form doesn't submit it.
    elementProps.type = "button";
    elementProps.onClick = handleActivate;
  }

  return useRender({
    render,
    defaultElement: href != null ? "a" : onClick != null ? "button" : as,
    props: elementProps,
  });
}

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Title text/content, rendered as a `Heading`. */
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Document-outline level for the rendered title heading. Default `3`. */
  level?: HeadingLevel;
  /** Leading glyph before the title — typically an `<Icon>`. */
  icon?: React.ReactNode;
  /** Trailing element after the title — typically a status `<Chip>`. */
  chip?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

function CardHeader({
  title,
  subtitle,
  level = 3,
  icon,
  chip,
  className,
  children,
  ref,
  ...rest
}: CardHeaderProps) {
  const hasText = title != null || subtitle != null;
  const hasTrailing = chip != null || children != null;
  return (
    <div ref={ref} className={cx(cardHeader, className)} {...rest}>
      {/* Leading group (icon + text) also acts as the flex spacer that pushes the
          trailing group to the end, so it's always rendered. */}
      <div className={cardHeaderLeading}>
        {icon != null && <span className={cardHeaderIcon}>{icon}</span>}
        {hasText && (
          <div className={cardHeaderText}>
            {title != null && (
              <Heading level={level} variant="lg">
                {title}
              </Heading>
            )}
            {subtitle != null && (
              <Text variant="sm" saliency="low">
                {subtitle}
              </Text>
            )}
          </div>
        )}
      </div>
      {hasTrailing && (
        <div className={cardHeaderTrailing}>
          {chip}
          {children}
        </div>
      )}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Actions row, typically a `<Card.Actions>`, rendered after any `children`. */
  actions?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

function CardFooter({ actions, className, children, ref, ...rest }: CardFooterProps) {
  return (
    <div ref={ref} className={cx(cardFooter, className)} {...rest}>
      {children}
      {actions}
    </div>
  );
}

export interface CardActionsProps {
  /** Which side the actions anchor to. Default `end`. */
  side?: "start" | "end";
  /** The buttons (or other controls) to render in the row. */
  actions: React.ReactNode[];
  /** Extra className merged onto the row. */
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Card.Actions — a row of buttons anchored to one `side` (`start` / `end`). Pass
 * the buttons as the `actions` array. Drop it into a `<Card.Footer actions>` or a
 * rich `<Card.Row>`'s `actions`.
 */
function CardActions({ side, actions, className, ref }: CardActionsProps) {
  return (
    <div ref={ref} className={cx(cardActionsRecipe({ side }), className)}>
      {/* `Children.toArray` assigns stable keys to the positional list. */}
      {React.Children.toArray(actions)}
    </div>
  );
}

export interface CardRowsProps {
  /** The rows — each a `<Card.Row>`. */
  rows: React.ReactNode[];
  /** Extra className merged onto the `<dl>`. */
  className?: string;
  ref?: React.Ref<HTMLDListElement>;
}

/**
 * Card.Rows — a description list (`<dl>`) of `<Card.Row>`s, passed as a child of
 * `Card` (unlike the `header` / `footer` props). Each row is a term/value pair or
 * a rich title/subtitle + actions row.
 */
function CardRows({ rows, className, ref }: CardRowsProps) {
  return (
    <dl ref={ref} className={cx(cardRows, className)}>
      {React.Children.toArray(rows)}
    </dl>
  );
}

/** A plain term/value row: a `<dt>` label and its `<dd>` value. */
interface CardRowTermProps {
  /** The label, rendered in the `<dt>`. */
  term: React.ReactNode;
  /** The value, rendered end-aligned in the `<dd>`. */
  description: React.ReactNode;
  title?: never;
  subtitle?: never;
  actions?: never;
}

/** A rich row: a title (+ optional subtitle) on the start, actions on the end. */
interface CardRowRichProps {
  /** The row title, rendered in the `<dt>`. */
  title: React.ReactNode;
  /** Optional supporting line beneath the title. */
  subtitle?: React.ReactNode;
  /** Trailing actions, rendered in the `<dd>` — typically a `<Card.Actions>`. */
  actions: React.ReactNode;
  term?: never;
  description?: never;
}

/**
 * Card.Row — one row of a `<Card.Rows>`. Two shapes (a discriminated union):
 *   - **term/value** — pass `term` + `description` for a `<dt>`/`<dd>` pair,
 *   - **rich** — pass `title` (+ optional `subtitle`) + `actions` for a row with
 *     a title stack on the start and actions on the end.
 *
 * Both render a `<div>` wrapping a `<dt>`/`<dd>` (valid inside a `<dl>`), so the
 * list stays a proper description list either way.
 */
function CardRow(props: CardRowProps) {
  // The `never` fields make the public union mutually exclusive; internally we
  // read both shapes off a loose view and branch on which was supplied.
  const { term, description, title, subtitle, actions } = props as {
    term?: React.ReactNode;
    description?: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
  };

  if (title !== undefined || actions !== undefined) {
    return (
      <div className={cardRow}>
        <dt className={cardRowText}>
          <Text variant="base">{title}</Text>
          {subtitle != null && (
            <Text variant="sm" saliency="low">
              {subtitle}
            </Text>
          )}
        </dt>
        <dd className={cardRowActions}>{actions}</dd>
      </div>
    );
  }

  return (
    <div className={cardRow}>
      <Text render={<dt className={cardRowTerm} />} variant="sm" saliency="low">
        {term}
      </Text>
      <Text render={<dd className={cardRowDesc} />} variant="sm">
        {description}
      </Text>
    </div>
  );
}

export type CardRowProps = CardRowTermProps | CardRowRichProps;

export type CardBleedProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

function CardBleed({ className, children, ref, ...rest }: CardBleedProps) {
  return (
    <div ref={ref} className={cx(cardBleed, className)} {...rest}>
      {children}
    </div>
  );
}

export type CardDividerProps = React.HTMLAttributes<HTMLHRElement> & {
  ref?: React.Ref<HTMLHRElement>;
};

function CardDivider({ className, ref, ...rest }: CardDividerProps) {
  return <hr ref={ref} className={cx(cardDivider, className)} {...rest} />;
}

/** Decorative disclosure chevron; the trigger carries the a11y semantics. */
function ChevronGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

CardRoot.displayName = "Card";
CardHeader.displayName = "Card.Header";
CardFooter.displayName = "Card.Footer";
CardActions.displayName = "Card.Actions";
CardRows.displayName = "Card.Rows";
CardRow.displayName = "Card.Row";
CardBleed.displayName = "Card.Bleed";
CardDivider.displayName = "Card.Divider";

/** Card with its compound parts attached. */
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Footer: CardFooter,
  Actions: CardActions,
  Rows: CardRows,
  Row: CardRow,
  Bleed: CardBleed,
  Divider: CardDivider,
});
