"use client";
import * as React from "react";
import { InternalGenericButtonAnchor } from "../../internal/components/InternalGenericButtonAnchor";
import {
  componentIntentRecipe,
  componentTypographyRecipe,
} from "../../styles/recipes/component.css";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { atoms } from "../../styles/sprinkles.css";
import type { MarginProps } from "../../styles/spacingProps";
import type { Intent, Saliency, Size, SurfaceSaliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { Chip, type ChipProps } from "../Chip";
import { Icon } from "../Icon";
import { Text } from "../Text";
import {
  noticeActionRecipe,
  noticeActions,
  noticeBody,
  noticeClose,
  noticeHeader,
  noticeIconRecipe,
  noticeRecipe,
  noticeTitle,
} from "./notice.css";

/**
 * What a Notice publishes to its interactive parts. A disabled Notice drags its
 * `actions` and `close` along — they go inert (`aria-disabled`, never the native
 * attribute) but stay focusable — so they read this off context.
 */
interface NoticeContextValue {
  disabled?: boolean;
}

const NoticeContext = React.createContext<NoticeContextValue>({});

/** A small "×" glyph; decorative — the close button carries the accessible name. */
function CloseGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export interface NoticeIconProps {
  /**
   * The glyph to render — typically an `<svg>` using `currentColor`. It's wrapped
   * in an `<Icon>`, so pass the raw glyph (not another `<Icon>`).
   */
  children: React.ReactNode;
  /**
   * Tint just the icon a different intent, overriding the notice's foreground.
   * Republishes `--iconColor` for this icon (and the glyph inside) so it reads the
   * override token. Omit to inherit the notice's colour.
   */
  intent?: Intent;
  /** Saliency for the `intent` override. Default `mid`. Ignored without `intent`. */
  saliency?: Saliency;
  /** Visual size (sets the `1em` icon box). Default `md`. */
  size?: Size;
  /** Accessible label — exposes the icon as `role="img"`. Omit for a decorative glyph. */
  label?: string;
}

/**
 * Notice.Icon — the leading icon of a `Notice`, with control over its colour.
 * Drop it in the notice's `icon` prop instead of a bare glyph when you want the
 * icon tinted a different `intent`/`saliency` than the notice's own foreground;
 * otherwise passing a plain node to `icon` (wrapped in a colour-inheriting
 * `<Icon>`) is enough.
 */
function NoticeIcon({ children, intent, saliency = "mid", size, label }: NoticeIconProps) {
  return (
    <Icon
      size={size}
      label={label}
      // With no `intent` the icon inherits the notice's `--iconColor`; with one,
      // this class republishes `--iconColor` at the override token.
      className={intent != null ? noticeIconRecipe({ intent, saliency }) : undefined}
    >
      {children}
    </Icon>
  );
}

/** A `Notice.Chip` is just a `Chip` — see {@link ChipProps}. */
export type NoticeChipProps = ChipProps;

/**
 * Notice.Chip — a status chip for the notice's title line, passed via the
 * `chip` prop. A thin `Chip` preset that defaults to the compact `sm` size (a
 * notice title is body-sized); every other `Chip` prop passes straight through.
 */
function NoticeChip({ size = "sm", ...rest }: NoticeChipProps) {
  return <Chip size={size} {...rest} />;
}

/** Props shared by every `Notice.Action`, regardless of button/link or content. */
interface NoticeActionCommonProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "color" | "onClick" | "children" | "aria-label"
> {
  /** Colour intent — the same palette as `Button`/`Chip`. Default `neutral`. */
  intent?: Intent;
  saliency?: Saliency;
  /** Control size. Default `sm` — notice actions are compact. */
  size?: Size;
  /**
   * Inert the action (`aria-disabled`, never the native attribute — it stays
   * focusable). Also inherited from a disabled Notice.
   */
  disabled?: boolean;
  /** Activation handler. With no `href`/`render` the action is a `<button>`. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Destination — renders the action as a link (`<a>`). */
  href?: string;
  /** Anchor `target` for the link form (e.g. `"_blank"`). */
  target?: React.HTMLAttributeAnchorTarget;
  /** Anchor `rel`; defaults to a safe value for `target="_blank"`. */
  rel?: string;
  /**
   * Router-link element for internal navigation (base-ui `render` seam) — keeps
   * the button look while your router owns navigation. Renders an `<a>` when
   * omitted and `href` is set.
   */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
}

/** A `Notice.Action` with a visible text label (optionally a leading icon). */
export interface NoticeActionTextProps extends NoticeActionCommonProps {
  /** The visible text label (also the accessible name). */
  children: React.ReactNode;
  /** Optional leading icon — typically an `<Icon>`; inherits the action's colour. */
  icon?: React.ReactNode;
  label?: never;
}

/** An icon-only `Notice.Action` — a lone glyph with a required accessible name. */
export interface NoticeActionIconOnlyProps extends NoticeActionCommonProps {
  /** The glyph — typically an `<Icon>`. The action has no text. */
  icon: React.ReactNode;
  /** Required accessible name for the icon-only action. */
  label: string;
  children?: never;
}

/**
 * Notice.Action props — a text action ({@link NoticeActionTextProps}) or an
 * icon-only one ({@link NoticeActionIconOnlyProps}), each of which is a
 * `<button>` (`onClick`) or a link (`href`/`render`).
 */
export type NoticeActionProps = NoticeActionTextProps | NoticeActionIconOnlyProps;

/**
 * Notice.Action — a control for the notice's `actions` row. Looks like a small
 * `Button` (it shares the component colour/size recipes and the focus ring) but
 * can be either a `<button>` (`onClick`) or a link (`href`, or a router link via
 * `render`), and either text (`children`, with an optional leading `icon`) or
 * icon-only (`icon` + a required `label`). Inherits a disabled Notice's inert
 * state through context.
 */
function NoticeAction(props: NoticeActionProps) {
  const {
    intent,
    saliency,
    size = "sm",
    disabled,
    onClick,
    href,
    target,
    rel,
    render,
    icon,
    label,
    children,
    ref,
    ...rest
  } = props;
  const { disabled: noticeDisabled } = React.useContext(NoticeContext);
  const inert = disabled === true || noticeDisabled === true;
  // No children → the icon is the whole control, so it needs the `label` name.
  const iconOnly = children == null;

  return (
    <InternalGenericButtonAnchor
      ref={ref}
      render={render}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      disabled={inert}
      aria-label={iconOnly ? label : undefined}
      className={cx(
        componentTypographyRecipe({ size }),
        componentIntentRecipe({ intent, saliency }),
        noticeActionRecipe({ iconOnly }),
        focusRingRecipe({ type: "visible" }),
      )}
      {...rest}
    >
      {iconOnly ? (
        icon
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </InternalGenericButtonAnchor>
  );
}

export interface NoticeCloseProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "color" | "onClick" | "children" | "aria-label"
> {
  /** Dismiss handler. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Accessible name for the icon-only button. Default `"Dismiss"`. */
  label?: string;
  /** Override the built-in "×" glyph. */
  children?: React.ReactNode;
  /**
   * Inert the button (`aria-disabled`, never the native attribute — it stays
   * focusable). Also inherited from a disabled Notice.
   */
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Notice.Close — the "×" dismiss button, rendered top-right of a Notice. Pass it
 * a handler via the notice's `close` prop (a function auto-wraps into one), or
 * supply a `<Notice.Close>` directly to set its `label`/glyph. It's a real
 * focusable `<button>` with an accessible name (default "Dismiss"); a disabled
 * Notice makes it inert (`aria-disabled`) while it stays focusable.
 */
function NoticeClose({
  onClick,
  label = "Dismiss",
  children,
  disabled,
  ref,
  ...rest
}: NoticeCloseProps) {
  const { disabled: noticeDisabled } = React.useContext(NoticeContext);
  const inert = disabled === true || noticeDisabled === true;

  return (
    <InternalGenericButtonAnchor
      ref={ref as React.Ref<HTMLElement>}
      type="button"
      onClick={onClick as React.MouseEventHandler<HTMLElement>}
      disabled={inert}
      aria-label={label}
      className={cx(noticeClose, focusRingRecipe({ type: "visible", offset: "sm" }))}
      {...rest}
    >
      {children ?? <CloseGlyph />}
    </InternalGenericButtonAnchor>
  );
}

export interface NoticeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">, MarginProps {
  /** Colour intent — the same palette as `Chip`/`Button`. Default `neutral`. */
  intent?: Intent;
  /**
   * How prominent the notice is. `high` (default) borrows the `component` `mid`
   * palette — a washed fill; `low` borrows the `component` `low` palette — a
   * subtler shade. (A Notice never uses the loud `high` component fill.)
   */
  saliency?: SurfaceSaliency;
  /**
   * The notice's silhouette. `square` (default) keeps the shared component radius;
   * `pill` fully rounds the ends (same as `Chip`).
   */
  shape?: "square" | "pill";
  /**
   * Compact layout: the notice becomes `inline-flex` and shrinks to its content
   * instead of filling its container like a full-width block banner.
   */
  inline?: boolean;
  /**
   * Dims the notice and makes its `actions` / `close` inert. Modelled with
   * `aria-disabled` (never the native attribute), so the controls stay focusable.
   */
  disabled?: boolean;
  /**
   * A leading icon. Pass any node (an `<svg>`/glyph) and it's wrapped in an
   * `<Icon>` that inherits the notice's colour, or pass a `<Notice.Icon>` to tint
   * the icon a different `intent`/`saliency`.
   */
  icon?: React.ReactNode;
  /** Supporting text rendered beneath the title. */
  description?: React.ReactNode;
  /**
   * A status chip shown on the title line, after the title — a `<Notice.Chip>`
   * (or any `<Chip>`).
   */
  chip?: React.ReactNode;
  /**
   * Trailing action controls, rendered as a wrapping row beneath the text —
   * typically `<Notice.Action>`s (or any node, e.g. a `<Button>`).
   */
  actions?: React.ReactNode[];
  /**
   * Dismiss affordance, rendered at the top-right. Pass a handler for a built-in
   * `<Notice.Close>`, or a `<Notice.Close>` element to configure its label/glyph.
   */
  close?: (() => void) | React.ReactElement;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLDivElement>;
  /** The notice's title. */
  children: React.ReactNode;
}

/**
 * Notice — a block-level callout / inline message. It borrows the `component`
 * colour scheme (shared with `Chip`/`Button`) rather than the washed `surface`
 * palette, so `<Notice intent="warning">` matches a Button/Chip of the same
 * intent; its `saliency` (`high`/`low`) maps onto the component `mid`/`low`
 * shades (see `notice.css`). Static — a container, not a control.
 *
 * Lay it out with a leading `icon` (a plain glyph, or a `<Notice.Icon>` to recolour
 * it), the `children` as the title, an optional status `chip` on the title line,
 * a `description` beneath, an `actions` row of `<Notice.Action>`s, and a top-right
 * `close` dismiss. It announces itself as a live region (`role="alert"` for
 * negative/warning intents, `role="status"` otherwise) unless you override `role`.
 */
function NoticeRoot({
  intent,
  saliency,
  shape,
  inline,
  disabled,
  icon,
  description,
  chip,
  actions,
  close,
  render,
  className,
  children,
  role,
  ref,
  m,
  mx,
  my,
  mt,
  mr,
  mb,
  ml,
  ...rest
}: NoticeProps) {
  // A plain node is a glyph — wrap it in a colour-inheriting `<Icon>`; a
  // `<Notice.Icon>` already is one (with its own intent/saliency), so pass it
  // through untouched.
  const iconNode =
    icon == null ? null : React.isValidElement(icon) && icon.type === NoticeIcon ? (
      icon
    ) : (
      <Icon>{icon}</Icon>
    );

  // A bare handler wraps into the default `<Notice.Close>`; a `<Notice.Close>`
  // element passes through so the caller can set its label/glyph.
  const closeNode =
    close == null ? null : typeof close === "function" ? <NoticeClose onClick={close} /> : close;

  // A notice is a live region so assistive tech announces it when it appears or
  // changes. Errors/warnings are assertive (`alert`); everything else is polite
  // (`status`). Callers can override with their own `role` (and `aria-live`).
  const resolvedRole = role ?? (intent === "negative" || intent === "warning" ? "alert" : "status");

  const contextValue = React.useMemo<NoticeContextValue>(() => ({ disabled }), [disabled]);

  return useRender({
    render,
    defaultElement: "div",
    props: {
      ref,
      role: resolvedRole,
      "aria-disabled": disabled || undefined,
      className: cx(
        noticeRecipe({ intent, saliency, shape, inline, disabled }),
        atoms({ m, mx, my, mt, mr, mb, ml }),
        className,
      ),
      children: (
        <NoticeContext.Provider value={contextValue}>
          {iconNode}
          <div className={noticeBody}>
            <div className={noticeHeader}>
              <Text variant="base" className={noticeTitle}>
                {children}
              </Text>
              {chip}
            </div>
            {description != null && <Text variant="sm">{description}</Text>}
            {actions != null &&
              actions.length > 0 && (
                // `Children.toArray` assigns stable keys to the positional list.
                <div className={noticeActions}>{React.Children.toArray(actions)}</div>
              )}
          </div>
          {closeNode}
        </NoticeContext.Provider>
      ),
      ...rest,
    },
  });
}

NoticeRoot.displayName = "Notice";
NoticeIcon.displayName = "Notice.Icon";
NoticeChip.displayName = "Notice.Chip";
NoticeAction.displayName = "Notice.Action";
NoticeClose.displayName = "Notice.Close";

/** Notice with its `Icon`, `Chip`, `Action`, and `Close` parts attached. */
export const Notice = Object.assign(NoticeRoot, {
  Icon: NoticeIcon,
  Chip: NoticeChip,
  Action: NoticeAction,
  Close: NoticeClose,
});
