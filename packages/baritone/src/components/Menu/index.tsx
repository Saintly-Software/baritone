"use client";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import {
  InternalGenericButtonAnchor,
  type InternalGenericButtonAnchorProps,
} from "../../internal/components/InternalGenericButtonAnchor";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import { cx } from "../../utils/cx";
import { keyedElements } from "../../utils/keyedElements";
import { mergeProps, type RenderProp } from "../../utils/render";
import type { ButtonProps } from "../Button";
import {
  MENU_ITEM_INTENTS,
  menuItemIcon,
  menuItemRecipe,
  menuPopup,
  menuPositioner,
} from "./menu.css";

type RootProps = React.ComponentProps<typeof BaseMenu.Root>;
type PositionerProps = React.ComponentProps<typeof BaseMenu.Positioner>;

export type MenuItemIntent = (typeof MENU_ITEM_INTENTS)[number];

export interface MenuItemIconState {
  intent: MenuItemIntent;
  disabled: boolean;
}

export interface MenuItemProps {
  intent?: MenuItemIntent;

  icon?: IconSlot<MenuItemIconState>;

  children: string;

  onClick?: React.MouseEventHandler<HTMLElement>;

  href?: string;

  render?: RenderProp;

  disabled?: boolean;

  keepOpen?: boolean;
}

function MenuItemAnchor({
  intent = "neutral",
  icon,
  children,
  onClick,
  href,
  render,
  disabled = false,
  htmlAttrs,
}: MenuItemProps & { htmlAttrs: InternalGenericButtonAnchorProps }) {
  const { onClick: hostOnClick, "aria-disabled": _hostAriaDisabled, ...hostAttrs } = htmlAttrs;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event);
    hostOnClick?.(event);
  };

  const ownProps: InternalGenericButtonAnchorProps = {
    href,
    render,
    disabled,
    onClick: handleClick,
    className: menuItemRecipe({ intent }),
    children: (
      <>
        {icon != null && (
          <span className={menuItemIcon} aria-hidden>
            {renderIcon(icon, { state: { intent, disabled } })}
          </span>
        )}
        {children}
      </>
    ),
  };

  return (
    <InternalGenericButtonAnchor
      {...(mergeProps(
        hostAttrs as Record<string, unknown>,
        ownProps as Record<string, unknown>,
      ) as InternalGenericButtonAnchorProps)}
    />
  );
}

function MenuItem(props: MenuItemProps) {
  const { children, keepOpen = false } = props;
  const isLink = props.href != null || props.render != null;

  if (isLink) {
    return (
      <BaseMenu.LinkItem
        label={children}
        closeOnClick={!keepOpen}
        render={(htmlAttrs) => <MenuItemAnchor {...props} htmlAttrs={htmlAttrs} />}
      />
    );
  }

  return (
    <BaseMenu.Item
      label={children}
      closeOnClick={!keepOpen}
      nativeButton
      render={(htmlAttrs) => <MenuItemAnchor {...props} htmlAttrs={htmlAttrs} />}
    />
  );
}

export interface MenuProps {
  trigger?: React.ReactNode;

  items: Array<React.ReactElement<MenuItemProps> | null | false | undefined>;

  open?: RootProps["open"];

  defaultOpen?: RootProps["defaultOpen"];

  onOpenChange?: RootProps["onOpenChange"];

  modal?: RootProps["modal"];

  side?: PositionerProps["side"];

  align?: PositionerProps["align"];

  sideOffset?: PositionerProps["sideOffset"];

  className?: string;

  ref?: React.Ref<HTMLDivElement>;
}

function MenuRoot({
  trigger,
  items,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  side,
  align,
  sideOffset = 8,
  className,
  ref,
}: MenuProps) {
  return (
    <BaseMenu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      {trigger}
      <BaseMenu.Portal>
        <BaseMenu.Positioner
          className={menuPositioner}
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BaseMenu.Popup
            ref={ref}
            className={cx(
              surfaceRecipe({ padding: "none" }),
              focusRingRecipe({ type: "visible" }),
              menuPopup,
              className,
            )}
          >
            {keyedElements(items)}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

type BaseMenuTriggerRender = React.ComponentProps<typeof BaseMenu.Trigger>["render"];

interface MenuTriggerOwnProps {
  openOnHover?: boolean;

  delay?: number;

  closeDelay?: number;
}

export type MenuTriggerProps =
  | (ButtonProps & MenuTriggerOwnProps & { render?: never })
  | (MenuTriggerOwnProps & { render: BaseMenuTriggerRender });

function MenuTrigger(props: MenuTriggerProps) {
  const { openOnHover, delay, closeDelay } = props;

  if (props.render != null) {
    return (
      <BaseMenu.Trigger
        openOnHover={openOnHover}
        delay={delay}
        closeDelay={closeDelay}
        render={props.render}
      />
    );
  }

  const { openOnHover: _oh, delay: _d, closeDelay: _cd, render: _r, ...buttonProps } = props;
  return (
    <BaseMenu.Trigger
      openOnHover={openOnHover}
      delay={delay}
      closeDelay={closeDelay}
      render={(htmlAttrs) => (
        <InternalButton consumerProps={buttonProps as ButtonProps} htmlAttrs={htmlAttrs} />
      )}
    />
  );
}

MenuRoot.displayName = "Menu";
MenuTrigger.displayName = "Menu.Trigger";
MenuItem.displayName = "Menu.Item";

export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Item: MenuItem,
});
