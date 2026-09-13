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

interface NoticeContextValue {
  disabled?: boolean;
}

const NoticeContext = React.createContext<NoticeContextValue>({});

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
  children: React.ReactNode;

  intent?: Intent;

  saliency?: Saliency;

  size?: Size;

  label?: string;
}

function NoticeIcon({ children, intent, saliency = "mid", size, label }: NoticeIconProps) {
  return (
    <Icon
      size={size}
      label={label}
      className={intent != null ? noticeIconRecipe({ intent, saliency }) : undefined}
    >
      {children}
    </Icon>
  );
}

export type NoticeChipProps = ChipProps;

function NoticeChip({ size = "sm", ...rest }: NoticeChipProps) {
  return <Chip size={size} {...rest} />;
}

interface NoticeActionCommonProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "color" | "onClick" | "children" | "aria-label"
> {
  intent?: Intent;
  saliency?: Saliency;

  size?: Size;

  disabled?: boolean;

  onClick?: React.MouseEventHandler<HTMLElement>;

  href?: string;

  target?: React.HTMLAttributeAnchorTarget;

  rel?: string;

  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
}

export interface NoticeActionIconState {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  disabled: boolean;
}

export interface NoticeActionTextProps extends NoticeActionCommonProps {
  children: React.ReactNode;

  icon?: IconSlot<NoticeActionIconState>;
  label?: never;
}

export interface NoticeActionIconOnlyProps extends NoticeActionCommonProps {
  icon: IconSlot<NoticeActionIconState>;

  label: string;
  children?: never;
}

export type NoticeActionProps = NoticeActionTextProps | NoticeActionIconOnlyProps;

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
  onClick?: React.MouseEventHandler<HTMLButtonElement>;

  label?: string;

  children?: React.ReactNode;

  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

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

export interface NoticeIconState {
  intent?: Intent;
  saliency?: Saliency;
  disabled: boolean;
}

export interface NoticeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">, MarginProps {
  intent?: Intent;

  saliency?: SurfaceSaliency;

  shape?: "square" | "pill";

  inline?: boolean;

  disabled?: boolean;

  icon?: IconSlot<NoticeIconState>;

  description?: React.ReactNode;

  chip?: React.ReactNode;

  actions?: React.ReactNode[];

  close?: (() => void) | React.ReactElement;

  render?: RenderProp;
  ref?: React.Ref<HTMLDivElement>;

  children: React.ReactNode;
}

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
  const iconNode =
    React.isValidElement(icon) && icon.type === NoticeIcon
      ? icon
      : renderIcon(icon, { state: { intent, saliency, disabled: disabled ?? false } });

  const closeNode =
    close == null ? null : typeof close === "function" ? <NoticeClose onClick={close} /> : close;

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
            {actions != null && actions.length > 0 && (
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

export const Notice = Object.assign(NoticeRoot, {
  Icon: NoticeIcon,
  Chip: NoticeChip,
  Action: NoticeAction,
  Close: NoticeClose,
});
