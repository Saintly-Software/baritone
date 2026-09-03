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
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
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

/** Disabled state shared with a Notice's `actions`/`close` (inert via `aria-disabled`, still focusable). */
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
   * The glyph to render — typically an `<svg>` using `currentColor`. Wrapped in an
   * `<Icon>`, so pass the raw glyph, not another `<Icon>`.
   */
  children: React.ReactNode;
  /** Tint just the icon a different intent than the notice's foreground. Omit to inherit it. */
  intent?: Intent;
  /** Saliency for the `intent` override. Default `mid`. Ignored without `intent`. */
  saliency?: Saliency;
  /** Visual size (sets the `1em` icon box). Default `md`. */
  size?: Size;
  /** Accessible label — exposes the icon as `role="img"`. Omit for a decorative glyph. */
  label?: string;
}

/**
 * Notice.Icon — the notice's leading icon, with its own colour. Use it in the
 * `icon` prop when you want a different `intent`/`saliency` than the notice's
 * foreground; otherwise a plain node passed to `icon` is enough.
 */
function NoticeIcon({ children, intent, saliency = "mid", size, label }: NoticeIconProps) {
  return (
    <Icon
      size={size}
      label={label}
      // See `intent` doc above.
      className={intent != null ? noticeIconRecipe({ intent, saliency }) : undefined}
    >
      {children}
    </Icon>
  );
}

/** A `Notice.Chip` is just a `Chip` — see {@link ChipProps}. */
export type NoticeChipProps = ChipProps;

/**
 * Notice.Chip — a status chip for the notice's title line (the `chip` prop). A
 * `Chip` preset defaulting to the compact `sm` size; every other prop passes through.
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
  /** Inert the action (`aria-disabled`, stays focusable). Also inherited from a disabled Notice. */
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
   * Router-link element for internal navigation (base-ui `render` seam). Renders
   * an `<a>` when omitted and `href` is set.
   */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
}

/** The action state a `Notice.Action` icon render function can branch on. */
export interface NoticeActionIconState {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  disabled: boolean;
}

/** A `Notice.Action` with a visible text label (optionally a leading icon). */
export interface NoticeActionTextProps extends NoticeActionCommonProps {
  /** The visible text label (also the accessible name). */
  children: React.ReactNode;
  /**
   * Optional leading icon — a bare glyph, an explicit `<Icon>`, or a
   * `(props, state)` render function. Inherits the action's colour.
   */
  icon?: IconSlot<NoticeActionIconState>;
  label?: never;
}

/** An icon-only `Notice.Action` — a lone glyph with a required accessible name. */
export interface NoticeActionIconOnlyProps extends NoticeActionCommonProps {
  /**
   * The glyph — a bare glyph, an explicit `<Icon>`, or a `(props, state)` render
   * function. The action has no text.
   */
  icon: IconSlot<NoticeActionIconState>;
  /** Required accessible name for the icon-only action. */
  label: string;
  children?: never;
}

/**
 * Notice.Action props — a text action ({@link NoticeActionTextProps}) or
 * icon-only ({@link NoticeActionIconOnlyProps}); each is a `<button>` or a link.
 */
export type NoticeActionProps = NoticeActionTextProps | NoticeActionIconOnlyProps;

/**
 * Notice.Action — a control for the notice's `actions` row. Looks like a small
 * `Button` but can be a `<button>` (`onClick`) or a link (`href`/`render`), and
 * either text (`children` + optional `icon`) or icon-only (`icon` + required
 * `label`). Inherits a disabled Notice's inert state through context.
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

  const iconState = { intent, saliency, size, disabled: inert };

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
        renderIcon(icon, { state: iconState })
      ) : (
        <>
          {renderIcon(icon, { state: iconState })}
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
  /** Inert the button (`aria-disabled`, stays focusable). Also inherited from a disabled Notice. */
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Notice.Close — the "×" dismiss button, rendered top-right of a Notice. Pass a
 * handler via the notice's `close` prop (auto-wrapped into one), or supply a
 * `<Notice.Close>` directly to set its `label`/glyph. A disabled Notice makes it
 * inert (`aria-disabled`) while it stays focusable.
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

/** The notice state a leading-`icon` render function can branch on. */
export interface NoticeIconState {
  intent?: Intent;
  saliency?: Saliency;
  disabled: boolean;
}

export interface NoticeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">, MarginProps {
  /** Colour intent — the same palette as `Chip`/`Button`. Default `neutral`. */
  intent?: Intent;
  /**
   * How prominent the notice is. `high` (default) uses the washed `component`
   * `mid` palette; `low` uses the subtler `component` `low` palette.
   */
  saliency?: SurfaceSaliency;
  /**
   * The notice's silhouette. `square` (default) keeps the shared component
   * radius; `pill` fully rounds the ends (same as `Chip`).
   */
  shape?: "square" | "pill";
  /**
   * Compact layout: the notice becomes `inline-flex` and shrinks to its content
   * instead of filling its container like a full-width block banner.
   */
  inline?: boolean;
  /** Dims the notice and makes its `actions`/`close` inert via `aria-disabled` (stays focusable). */
  disabled?: boolean;
  /**
   * A leading icon — a bare glyph, an explicit `<Icon>`, a `(props, state)`
   * render function, or a `<Notice.Icon>` to tint it a different `intent`/`saliency`.
   */
  icon?: IconSlot<NoticeIconState>;
  /** Supporting text rendered beneath the title. */
  description?: React.ReactNode;
  /** A status chip shown on the title line, after the title. */
  chip?: React.ReactNode;
  /**
   * Trailing action controls in a wrapping row beneath the text — typically
   * `<Notice.Action>`s (or any node, e.g. a `<Button>`).
   */
  actions?: React.ReactNode[];
  /**
   * Dismiss affordance at the top-right. Pass a handler for a built-in
   * `<Notice.Close>`, or an element to configure its label/glyph.
   */
  close?: (() => void) | React.ReactElement;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLDivElement>;
  /** The notice's title. */
  children: React.ReactNode;
}

/**
 * Notice — a block-level callout / inline message. Uses the `component` colour
 * scheme (shared with `Chip`/`Button`), so `<Notice intent="warning">` matches a
 * Button/Chip of the same intent. Static — a container, not a control.
 *
 * Lay it out with a leading `icon`, `children` as the title, an optional `chip`,
 * a `description`, an `actions` row, and a `close` dismiss. Announces as a live
 * region (`role="alert"` for negative/warning, `role="status"` otherwise) unless
 * you override `role`.
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
  // A `<Notice.Icon>` already carries its own colour, so pass it through
  // untouched; anything else goes through the shared `renderIcon`.
  const iconNode =
    React.isValidElement(icon) && icon.type === NoticeIcon
      ? icon
      : renderIcon(icon, { state: { intent, saliency, disabled: disabled ?? false } });

  // See `close` doc above.
  const closeNode =
    close == null ? null : typeof close === "function" ? <NoticeClose onClick={close} /> : close;

  // Live-region role — see class doc above; also overridable via `aria-live`.
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
              <Text size="md" className={noticeTitle}>
                {children}
              </Text>
              {chip}
            </div>
            {description != null && <Text size="sm">{description}</Text>}
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
