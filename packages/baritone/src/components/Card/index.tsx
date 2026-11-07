"use client";
import { Collapsible } from "@base-ui/react/collapsible";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import type { HeadingLevel, Intent, SurfaceSaliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { RenderElement, useRender, type RenderProp } from "../../utils/render";
import { Heading } from "../Heading";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
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

export type CardElement = "div" | "section" | "main" | "article";

type CardHeaderControl =
  | {
      kind: "link";
      href?: string;
      target?: string;
      rel?: string;

      download?: boolean | string;
      onClick?: React.MouseEventHandler<HTMLElement>;
      render?: RenderProp;
      disabled?: boolean;

      selected?: boolean;
    }
  | { kind: "collapsible"; disabled?: boolean };

interface CardHeaderContextValue {
  control: CardHeaderControl | null;

  element: "header" | "div";
}

const CardHeaderContext = React.createContext<CardHeaderContextValue | null>(null);

const SECTIONING_CARD_ELEMENTS = new Set<CardElement>(["article", "section", "main"]);

interface CardBaseProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
  as?: CardElement;

  intent?: Intent;

  saliency?: SurfaceSaliency;

  header?: React.ReactNode;

  subheader?: React.ReactNode;

  description?: React.ReactNode;

  action?: React.ReactNode;

  level?: HeadingLevel;

  footer?: React.ReactNode;

  selected?: boolean;

  disabled?: boolean;

  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

export interface CardStaticProps extends CardBaseProps {
  collapsible?: boolean;

  open?: boolean;

  defaultOpen?: boolean;

  onOpenChange?: (open: boolean) => void;
  href?: never;
  onClick?: never;
  download?: never;
}

export interface CardClickableProps extends CardBaseProps {
  onClick: React.MouseEventHandler<HTMLElement>;
  href?: never;
  download?: never;
  collapsible?: never;
  open?: never;
  defaultOpen?: never;
  onOpenChange?: never;
}

export interface CardLinkableProps extends CardBaseProps {
  href: string;

  target?: string;

  rel?: string;

  download?: boolean | string;
  onClick?: never;
  collapsible?: never;
  open?: never;
  defaultOpen?: never;
  onOpenChange?: never;
}

export type CardProps = CardStaticProps | CardClickableProps | CardLinkableProps;

type InternalCardProps = CardBaseProps & {
  as?: CardElement;
  href?: string;
  target?: string;
  rel?: string;
  download?: boolean | string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  collapsible?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

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
    download,
    collapsible,
    open,
    defaultOpen,
    onOpenChange,
    ...rest
  }: InternalCardProps = props;

  const headerIsString = typeof header === "string";
  const headerNode =
    headerIsString || (header == null && (subheader != null || action != null)) ? (
      <CardHeader title={headerIsString ? header : undefined} subtitle={subheader} level={level}>
        {action}
      </CardHeader>
    ) : (
      header
    );

  const descriptionNode = description != null ? <Text size="md">{description}</Text> : null;

  if (collapsible) {
    return (
      <Collapsible.Root
        ref={ref as React.Ref<HTMLDivElement>}
        open={open}
        defaultOpen={defaultOpen}
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

  const linkControl: CardHeaderControl | null = interactive
    ? { kind: "link", href, target, rel, download, onClick, render, disabled, selected }
    : null;

  const headerElement: "header" | "div" = SECTIONING_CARD_ELEMENTS.has(as) ? "header" : "div";

  const body = (
    <CardHeaderContext.Provider value={{ control: linkControl, element: headerElement }}>
      {headerNode}
      {descriptionNode}
      {children}
      {footer}
    </CardHeaderContext.Provider>
  );

  return (
    <RenderElement
      render={interactive ? undefined : render}
      defaultElement={as}
      props={{
        ref,
        className: cx(
          surfaceRecipe({ intent, saliency, interactive }),
          cardResponsivePadding,
          cardRoot,
          interactive ? cardInteractive : focusRingRecipe({ type: "visible" }),
          cardSelectedRecipe({ selected }),
          className,
        ),
        "aria-disabled": disabled || undefined,
        children: body,
        ...rest,
      }}
    />
  );
}

function CardPrimaryLink({
  link,
  children,
}: {
  link: Extract<CardHeaderControl, { kind: "link" }>;
  children: React.ReactNode;
}) {
  const { href, target, rel, download, onClick, render, disabled, selected } = link;

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
    if (download != null) elementProps.download = download;
    if (selected != null) elementProps["aria-current"] = selected || undefined;
  } else {
    elementProps.type = "button";
    if (selected != null) elementProps["aria-pressed"] = selected;
  }

  return useRender({
    render,
    defaultElement: href != null ? "a" : "button",
    props: elementProps,
  });
}

export type CardHeaderIconState = Record<string, never>;

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;

  level?: HeadingLevel;

  icon?: IconSlot<CardHeaderIconState>;

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
  const ctx = React.useContext(CardHeaderContext);
  const control = ctx?.control ?? null;
  const link = control?.kind === "link" ? control : null;
  const collapsibleControl = control?.kind === "collapsible" ? control : null;

  const titleId = React.useId();
  const labelledByTitle = collapsibleControl != null && title != null;

  const hasText = title != null || subtitle != null;
  const hasTrailing = chip != null || children != null || collapsibleControl != null;
  const iconNode = renderIcon(icon);
  const content = (
    <>
      <div className={cardHeaderLeading}>
        {iconNode != null && <span className={cardHeaderIcon}>{iconNode}</span>}
        {hasText && (
          <div className={cardHeaderText}>
            {title != null && (
              <Heading level={level} size="lg" id={labelledByTitle ? titleId : undefined}>
                {link != null ? <CardPrimaryLink link={link}>{title}</CardPrimaryLink> : title}
              </Heading>
            )}
            {subtitle != null && (
              <Text size="sm" saliency="low">
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

  return useRender({
    render: undefined,
    defaultElement: ctx?.element ?? "div",
    props: { ref, className: cx(cardHeader, className), children: content, ...rest },
  });
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
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
  side?: "start" | "end";

  actions: React.ReactNode[];

  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function CardActions({ side, actions, className, ref }: CardActionsProps) {
  return (
    <div ref={ref} className={cx(cardActionsRecipe({ side }), className)}>
      {React.Children.toArray(actions)}
    </div>
  );
}

export interface CardRowsProps {
  rows: React.ReactNode[];

  className?: string;
  ref?: React.Ref<HTMLDListElement>;
}

function CardRows({ rows, className, ref }: CardRowsProps) {
  return (
    <dl ref={ref} className={cx(cardRows, className)}>
      {React.Children.toArray(rows)}
    </dl>
  );
}

interface CardRowTermProps {
  term: React.ReactNode;

  description: React.ReactNode;
  title?: never;
  subtitle?: never;
  actions?: never;
}

interface CardRowRichProps {
  title: React.ReactNode;

  subtitle?: React.ReactNode;

  actions: React.ReactNode;
  term?: never;
  description?: never;
}

function CardRow(props: CardRowProps) {
  const { term, description, title, subtitle, actions } = props as {
    term?: React.ReactNode;
    description?: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
  };

  if (title !== undefined || actions !== undefined) {
    return (
      <div className={cardRowRecipe({ hoverable: false })}>
        <dt className={cardRowText}>
          <Text size="md">{title}</Text>
          {subtitle != null && (
            <Text size="sm" saliency="low">
              {subtitle}
            </Text>
          )}
        </dt>
        <dd className={cardRowActions}>{actions}</dd>
      </div>
    );
  }

  return (
    <div className={cardRowRecipe({ hoverable: true })}>
      <Text render={<dt className={cardRowTerm} />} size="sm" saliency="low">
        {term}
      </Text>
      <Text render={<dd className={cardRowDesc} />} size="sm">
        {description}
      </Text>
    </div>
  );
}

export type CardRowProps = CardRowTermProps | CardRowRichProps;

export interface CardLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;

  level?: HeadingLevel;

  subtitle?: React.ReactNode;

  action?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

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
          <Heading level={level} size="lg">
            {title}
          </Heading>
        )}
        {subtitle != null && (
          <Text size="sm" saliency="low">
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
