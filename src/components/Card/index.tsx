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
  cardCollapsibleHeader,
  cardCollapsibleResponsivePadding,
  cardCollapsiblePanel,
  cardCollapsiblePanelContent,
  cardCollapsibleRoot,
  cardCollapsibleTriggerButton,
  cardDivider,
  cardFooter,
  cardHeader,
  cardHeaderIcon,
  cardHeaderLeading,
  cardHeaderText,
  cardHeaderTrailing,
  cardInteractive,
  cardLayout,
  cardLayoutAction,
  cardLayoutText,
  cardOverlayLink,
  cardResponsivePadding,
  cardRoot,
  cardRowActions,
  cardRowDesc,
  cardRowRecipe,
  cardRows,
  cardRowTerm,
  cardRowText,
  cardSelectedRecipe,
} from "./card.css";

/** Semantic root element for a Card. */
export type CardElement = "div" | "section" | "main" | "article";

/**
 * How a `Card` tells its `Card.Header` to host a card-level control. The header is
 * the single place these live: an interactive (clickable/linkable) card turns the
 * header *title* into the one real link/button — stretched over the whole surface
 * with an `::after` overlay (https://inclusive-components.design/cards/) — and a
 * collapsible card puts the disclosure trigger in the header. Either way the rest
 * of the card can carry its own interactive content.
 */
type CardHeaderControl =
  | {
      kind: "link";
      href?: string;
      target?: string;
      rel?: string;
      onClick?: React.MouseEventHandler<HTMLElement>;
      render?: RenderProp;
      disabled?: boolean;
      /**
       * Selected state for the overlay control. A clickable card's title button
       * becomes a toggle (`aria-pressed`); a linkable card's title link marks
       * itself the current choice (`aria-current`). `undefined` leaves both off.
       */
      selected?: boolean;
    }
  | { kind: "collapsible"; disabled?: boolean };

/** What `Card.Header` renders as, plus the card-level control it should host. */
interface CardHeaderContextValue {
  /**
   * The card-level control the header hosts — the interactive title (link /
   * button) or the collapsible disclosure trigger — or `null` for a static card.
   */
  control: CardHeaderControl | null;
  /**
   * The element `Card.Header` renders. It's a real `<header>` only when the card
   * root is sectioning content (`article` / `section`) or `main`: there a child
   * `<header>` scopes to that section. Inside a plain `div` card a `<header>`
   * would instead be promoted to the page's `banner` landmark, so a `div` card
   * (and a collapsible card, whose root isn't sectioning) keeps a `<div>`.
   */
  element: "header" | "div";
}

const CardHeaderContext = React.createContext<CardHeaderContextValue | null>(null);

/**
 * Card roots whose box scopes a descendant `<header>` to the section, so
 * `Card.Header` can be a real `<header>` without being exposed as the page
 * `banner` landmark. Everything else (notably a plain `div` card) keeps a `div`.
 */
const SECTIONING_CARD_ELEMENTS = new Set<CardElement>(["article", "section", "main"]);

/** Props shared by every Card mode (static / clickable / linkable). */
interface CardBaseProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
  /** Semantic root element. Default `div`. (Ignored for a `collapsible` card.) */
  as?: CardElement;
  /** Default `neutral` (most surfaces are neutral). */
  intent?: Intent;
  /** `low` (neutral surface) or `high` (washed). Default `high`. */
  saliency?: SurfaceSaliency;
  /**
   * The card's header. Pass a `<Card.Header />` for full control, or — as a
   * shorthand — a plain **string**, which is rendered as a styled header title
   * (a `Heading`) and gains the `subheader` / `action` / `level` props below. An
   * interactive (`onClick` / `href`) or `collapsible` card still wires its
   * control into a string header.
   */
  header?: React.ReactNode;
  /**
   * Subtitle shown directly beneath a **string** `header`, inside the header
   * block (a tight, low-saliency line). Ignored when `header` is a `Card.Header`
   * element (put the subtitle on that instead).
   */
  subheader?: React.ReactNode;
  /**
   * A supporting paragraph rendered in the card body, beneath the header and
   * above any `children`. Unlike `subheader` (a caption in the header), this is
   * body copy. Works with any header.
   */
  description?: React.ReactNode;
  /**
   * A trailing control (e.g. a `<Button>`) placed at the end of a **string**
   * `header`'s row. Ignored when `header` is a `Card.Header` element (pass the
   * control as that header's children instead).
   */
  action?: React.ReactNode;
  /** Document-outline level for a **string** `header`'s title. Default `3`. */
  level?: HeadingLevel;
  /** Rendered below the content — typically a `<Card.Footer />`. */
  footer?: React.ReactNode;
  /**
   * Marks the card as chosen — an accented edge for a card that's been selected,
   * e.g. one holding a checked `Checkbox` or picked in a multi-select grid.
   *
   * The accent is *visual*: on a static card it reinforces the real selected
   * control inside (the checkbox), which is what conveys state to assistive tech —
   * a plain container can't carry `aria-selected`. When the card *is* the control,
   * the state is announced on it: a clickable card's overlay button becomes a
   * toggle (`aria-pressed`) and a linkable card's overlay link marks itself the
   * current choice (`aria-current`).
   */
  selected?: boolean;
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
  /**
   * Make the card a single collapsible disclosure: the content + `footer`
   * collapse away, leaving the `header` visible. The header's `Card.Header` grows
   * a disclosure **button** (beside any chip/actions) that toggles it — so,
   * unlike a whole-header trigger, the rest of the header can hold its own
   * interactive elements. Built on base-ui's `Collapsible`.
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
 * A clickable Card. The card stays a plain container; its `Card.Header` *title*
 * becomes the one real `<button>`, stretched across the whole surface (via an
 * `::after` overlay) so the entire card activates — the accessible pattern from
 * Inclusive Components (https://inclusive-components.design/cards/). Because the
 * card is no longer itself a button, you *can* nest other controls (footer
 * buttons, row actions); they stay independently clickable. Give the card a
 * `header={<Card.Header title=… />}` so the control has an accessible name.
 */
export interface CardClickableProps extends CardBaseProps {
  /** Activation handler. Turns the header title into the card's `<button>`. Swallowed while disabled. */
  onClick: React.MouseEventHandler<HTMLElement>;
  href?: never;
  collapsible?: never;
  open?: never;
  defaultOpen?: never;
  onOpenChange?: never;
}

/**
 * A linkable Card. Like the clickable card, the card stays a container and its
 * `Card.Header` *title* becomes the one real `<a>` (or your router's link via
 * `render`), stretched across the whole surface. Other links/buttons may live
 * inside it. Give the card a `header={<Card.Header title=… />}` for the link's
 * accessible name.
 */
export interface CardLinkableProps extends CardBaseProps {
  /** Destination. Turns the header title into the card's `<a>`. */
  href: string;
  /** Anchor target (e.g. `_blank`). */
  target?: string;
  /** Anchor rel (e.g. `noreferrer`). */
  rel?: string;
  onClick?: never;
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
 * For the common "title + supporting text + action" card, skip `Card.Header` /
 * `Card.Layout` entirely: pass a **string** `header` plus `subheader` (a caption
 * in the header), `description` (a body paragraph) and/or `action` (a trailing
 * control). `children` is optional, so those props alone make a complete card.
 *
 * It can also *be* a control: pass `onClick` or `href` to make it clickable /
 * linkable. The card stays a container and its `Card.Header` title becomes the
 * one real `<button>`/`<a>`, stretched over the whole surface so the entire card
 * activates while only the title names it and nested controls keep working — the
 * accessible pattern from https://inclusive-components.design/cards/. Or set
 * `collapsible` to give the header a disclosure button that collapses the content
 * + footer away.
 */
function CardRoot(props: CardProps) {
  const {
    intent,
    saliency = "high",
    header,
    subheader,
    description,
    action,
    level = 3,
    footer,
    selected,
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

  // A string `header` is the shorthand: render it as a styled `Card.Header` (title
  // + optional `subheader` subtitle, with `action` in the trailing slot). A card
  // that supplies only `subheader` / `action` (no `header`) still gets a header row
  // for them. A `Card.Header` element passed as `header` is used verbatim — the
  // shorthand-only props don't apply to it.
  const headerIsString = typeof header === "string";
  const headerNode =
    headerIsString || (header == null && (subheader != null || action != null)) ? (
      <CardHeader title={headerIsString ? header : undefined} subtitle={subheader} level={level}>
        {action}
      </CardHeader>
    ) : (
      header
    );

  // Body-level supporting copy, distinct from the header's `subheader`. Rendered
  // as its own paragraph beneath the header.
  const descriptionNode = description != null ? <Text variant="base">{description}</Text> : null;

  // A collapsible card is a self-contained disclosure (header + collapsing
  // panel), structurally unlike the flat surface, so it gets its own branch. The
  // disclosure trigger lives *inside* the header (added by Card.Header from
  // context), so only that button toggles — the rest of the header is free.
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
          cardSelectedRecipe({ selected }),
          className,
        )}
        {...rest}
      >
        <div className={cx(cardCollapsibleResponsivePadding, cardCollapsibleHeader)}>
          <CardHeaderContext.Provider
            value={{ control: { kind: "collapsible", disabled }, element: "div" }}
          >
            {headerNode}
          </CardHeaderContext.Provider>
        </div>
        <Collapsible.Panel className={cardCollapsiblePanel}>
          <div className={cx(cardCollapsibleResponsivePadding, cardCollapsiblePanelContent)}>
            {descriptionNode}
            {children}
            {footer}
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    );
  }

  const interactive = href != null || onClick != null;

  // The card is never itself the control: an interactive card is a container, and
  // its header title becomes the one real link/button (stretched over the whole
  // surface). Hand the activation down to that control via context. `render` (a
  // router link) belongs to the link too, so it's forwarded — never applied to
  // the container.
  const linkControl: CardHeaderControl | null = interactive
    ? { kind: "link", href, target, rel, onClick, render, disabled, selected }
    : null;

  // `Card.Header` becomes a real `<header>` when this root scopes it (a sectioning
  // `article` / `section`, or `main`); a plain `div` card keeps a `<div>` header so
  // it can't be mistaken for the page `banner`. See SECTIONING_CARD_ELEMENTS.
  const headerElement: "header" | "div" = SECTIONING_CARD_ELEMENTS.has(as) ? "header" : "div";

  const body = (
    <CardHeaderContext.Provider value={{ control: linkControl, element: headerElement }}>
      {headerNode}
      {descriptionNode}
      {children}
      {footer}
    </CardHeaderContext.Provider>
  );

  return useRender({
    render: interactive ? undefined : render,
    defaultElement: as,
    props: {
      ref,
      className: cx(
        surfaceRecipe({ intent, saliency, interactive }),
        cardResponsivePadding,
        cardRoot,
        // Interactive cards position their overlay link; static cards keep the
        // focus ring in case a consumer makes the surface itself focusable.
        interactive ? cardInteractive : focusRingRecipe({ type: "visible" }),
        cardSelectedRecipe({ selected }),
        className,
      ),
      "aria-disabled": disabled || undefined,
      children: body,
      ...rest,
    },
  });
}

/**
 * The card's single primary control — the header title rendered as the one real
 * link/button, stretched over the whole card via `cardOverlayLink`'s `::after`.
 * Disabled is modelled the focusable way (per AGENTS.md): `aria-disabled` plus
 * swallowing the activation — and an `<a>`'s navigation — never the native
 * attribute. An optional `render` carries a router link.
 */
function CardPrimaryLink({
  link,
  children,
}: {
  link: Extract<CardHeaderControl, { kind: "link" }>;
  children: React.ReactNode;
}) {
  const { href, target, rel, onClick, render, disabled, selected } = link;

  const handleActivate = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  const elementProps: Record<string, unknown> = {
    className: cardOverlayLink,
    "aria-disabled": disabled || undefined,
    onClick: handleActivate,
    children,
  };
  if (href != null) {
    elementProps.href = href;
    if (target != null) elementProps.target = target;
    if (rel != null) elementProps.rel = rel;
    // A selected link is the current choice among the cards. Only emit the
    // attribute when selected — `aria-current="false"` is still announced by some
    // screen readers, so an unselected link should carry nothing.
    if (selected != null) elementProps["aria-current"] = selected || undefined;
  } else {
    // Default `type` to `button` so a clickable card in a form doesn't submit it.
    elementProps.type = "button";
    // A selected clickable card is a toggle button; announce its pressed state.
    // Left `undefined` when the card isn't selectable so plain click cards stay
    // ordinary buttons (no toggle semantics).
    if (selected != null) elementProps["aria-pressed"] = selected;
  }

  return useRender({
    render,
    defaultElement: href != null ? "a" : "button",
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
  // A Card supplies one of these when it needs the header to host a card-level
  // control: a `link` (the title becomes the stretched overlay link/button) or a
  // `collapsible` disclosure trigger. Outside an interactive/collapsible card the
  // context is null and the header is plain text.
  const ctx = React.useContext(CardHeaderContext);
  const control = ctx?.control ?? null;
  const link = control?.kind === "link" ? control : null;
  const collapsibleControl = control?.kind === "collapsible" ? control : null;

  // The disclosure trigger is labelled by the title (so it announces e.g.
  // "Shipping details, button, collapsed"); fall back to a generic label.
  const titleId = React.useId();
  const labelledByTitle = collapsibleControl != null && title != null;

  const hasText = title != null || subtitle != null;
  // The collapsible trigger always needs a home in the trailing group, so render
  // it even without a chip / children.
  const hasTrailing = chip != null || children != null || collapsibleControl != null;
  const content = (
    <>
      {/* Leading group (icon + text) also acts as the flex spacer that pushes the
          trailing group to the end, so it's always rendered. */}
      <div className={cardHeaderLeading}>
        {icon != null && <span className={cardHeaderIcon}>{icon}</span>}
        {hasText && (
          <div className={cardHeaderText}>
            {title != null && (
              <Heading level={level} variant="lg" id={labelledByTitle ? titleId : undefined}>
                {/* An interactive card turns the title into its one real control,
                    stretched over the whole surface (see the article). */}
                {link != null ? <CardPrimaryLink link={link}>{title}</CardPrimaryLink> : title}
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
          {collapsibleControl != null && (
            <Collapsible.Trigger
              // `aria-disabled` (never the native attribute) keeps the trigger
              // tabbable; the root's veto stops it toggling. See AGENTS.md.
              aria-disabled={collapsibleControl.disabled || undefined}
              aria-label={labelledByTitle ? undefined : "Toggle"}
              aria-labelledby={labelledByTitle ? titleId : undefined}
              className={cx(cardCollapsibleTriggerButton, focusRingRecipe({ type: "visible" }))}
            >
              <ChevronGlyph className={cardChevron} />
            </Collapsible.Trigger>
          )}
        </div>
      )}
    </>
  );

  // A sectioning card (`article` / `section` / `main`) scopes this header, so it's
  // a real `<header>`; a plain `div` card keeps a `<div>` (see
  // CardHeaderContextValue.element). Default to `div` when used outside a Card.
  return useRender({
    render: undefined,
    defaultElement: ctx?.element ?? "div",
    props: { ref, className: cx(cardHeader, className), children: content, ...rest },
  });
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
    // A rich row carries its own action, so it doesn't get the row hover wash —
    // the action's own hover is the affordance that matters.
    return (
      <div className={cardRowRecipe({ hoverable: false })}>
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

  // A plain term/value row has no action of its own, so it highlights on hover.
  return (
    <div className={cardRowRecipe({ hoverable: true })}>
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

export interface CardLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Primary line, rendered as a `Heading` for the document outline. Omit it for a
   * description-only layout — then the `subtitle` is the row's text.
   */
  title?: React.ReactNode;
  /** Document-outline level for the `title` heading. Default `3`. */
  level?: HeadingLevel;
  /**
   * Supporting line — a subtitle beneath the `title`, or (with no `title`) the
   * layout's own description text.
   */
  subtitle?: React.ReactNode;
  /** Trailing control — typically a `<Button>` or a `<Card.Actions>`. */
  action?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Card.Layout — a split content row for the common "some text + a trailing
 * action" shapes: `title` + `subtitle` + `action`, `title` + `action`, or
 * `description` + `action` (drop the `title`). Passed as a child of `Card`.
 *
 * It's the standalone, body-content sibling of a rich `Card.Row` — the same
 * leading-text / trailing-action split, but a plain `<div>` rather than a
 * `<dt>`/`<dd>` inside a `<dl>`. So a whole `<Card as="article">` (e.g. a teaser
 * in a list of posts) can simply *be* one of these: the `title` is the article's
 * heading and the action is its content, with no `Card.Header` standing in for a
 * header the card doesn't have.
 *
 * @deprecated Prefer the string-`header` shorthand on `Card` itself — pass
 * `header` (string) + `subheader` / `description` / `action` — which covers the
 * same shapes without a wrapping element and also wires up an interactive card's
 * overlay link. `Card.Layout` remains for backward compatibility.
 */
function CardLayout({
  title,
  level = 3,
  subtitle,
  action,
  className,
  children,
  ref,
  ...rest
}: CardLayoutProps) {
  return (
    <div ref={ref} className={cx(cardLayout, className)} {...rest}>
      <div className={cardLayoutText}>
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
        {children}
      </div>
      {action != null && <div className={cardLayoutAction}>{action}</div>}
    </div>
  );
}

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
CardLayout.displayName = "Card.Layout";
CardBleed.displayName = "Card.Bleed";
CardDivider.displayName = "Card.Divider";

/** Card with its compound parts attached. */
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Footer: CardFooter,
  Actions: CardActions,
  Rows: CardRows,
  Row: CardRow,
  Layout: CardLayout,
  Bleed: CardBleed,
  Divider: CardDivider,
});
