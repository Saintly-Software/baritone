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

/**
 * `Menu.Item`'s colour intent — `neutral` plus the accent intents, derived from
 * the recipe's own list so type and styles can't drift. Narrower than
 * `Chip`/`Button`'s `Intent`: no `primary`, since a row in a list of peers isn't a CTA.
 */
export type MenuItemIntent = (typeof MENU_ITEM_INTENTS)[number];

/** The row state a `Menu.Item` icon render function can branch on. */
export interface MenuItemIconState {
  intent: MenuItemIntent;
  disabled: boolean;
}

export interface MenuItemProps {
  /** Colour intent for the row's icon/text and its highlight wash. Default `neutral`. */
  intent?: MenuItemIntent;
  /**
   * Leading glyph before the label — a bare glyph (auto-wrapped in `Icon`), an
   * explicit `<Icon>`, or a render function for full control.
   */
  icon?: IconSlot<MenuItemIconState>;
  /** The row's visible label — also its accessible name and keyboard type-ahead text. */
  children: string;
  /**
   * Activation handler; makes the row a real `<button>`. Can combine with
   * `href`/`render` (e.g. to fire analytics alongside navigation) — all three
   * chain rather than override each other.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Destination for an external link — makes the row a real `<a href>`. */
  href?: string;
  /**
   * Router-link element for internal navigation (the base-ui `render` seam, like
   * `Link`/`Card`). Its presence (with or without `href`) makes the row a link.
   */
  render?: RenderProp;
  /** Disables the row. Uses `aria-disabled`/`data-disabled` (never the native attribute). */
  disabled?: boolean;
  /**
   * Keep the menu open after this row activates, instead of the default
   * dismiss-on-click — for a repeatable, non-navigating action (a stepper, "mark
   * all"). No effect on link rows, which always navigate away and close.
   */
  keepOpen?: boolean;
}

/**
 * Wires a base-ui render callback's `htmlAttrs` onto `InternalGenericButtonAnchor`,
 * folding in the item's own `onClick`/`href`/`render`/`disabled`. The host's
 * `onClick` is chained after the consumer's own so both run. base-ui's own
 * `aria-disabled` is dropped rather than merged — since we never mark the item
 * disabled on base-ui's side, it always hands back `false`, which would otherwise
 * clobber the real value computed from our `disabled` prop.
 */
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

/**
 * Menu.Item — one action row. Renders as a real `<button>` (`onClick`) or a real
 * `<a>`/router link (`href`/`render`), wrapped in base-ui's `Menu.Item`/
 * `Menu.LinkItem` for roving keyboard focus, type-ahead, and highlight wiring.
 * Pass it as an entry in `<Menu items={[<Menu.Item …/>]} />`.
 */
function MenuItem(props: MenuItemProps) {
  const { children, keepOpen = false } = props;
  const isLink = props.href != null || props.render != null;

  if (isLink) {
    return (
      <BaseMenu.LinkItem
        label={children}
        // Closing on navigation matches other activations; base-ui defaults link
        // items to stay open (often used for nested surfaces), so override here.
        closeOnClick={!keepOpen}
        render={(htmlAttrs) => <MenuItemAnchor {...props} htmlAttrs={htmlAttrs} />}
      />
    );
  }

  return (
    <BaseMenu.Item
      label={children}
      // Dismiss on activation by default; `keepOpen` holds it open for a
      // repeatable, non-navigating action.
      closeOnClick={!keepOpen}
      // `disabled` isn't passed to base-ui: per this library's convention (see
      // Accordion), disabling is always modelled as `aria-disabled` + a swallowed
      // activation on our own element, so the row stays keyboard-reachable.
      // The row renders a real `<button>` below, so tell base-ui it's already
      // native (otherwise it assumes a `<div>` and adds its own keyboard shim).
      nativeButton
      render={(htmlAttrs) => <MenuItemAnchor {...props} htmlAttrs={htmlAttrs} />}
    />
  );
}

export interface MenuProps {
  /** The element that opens the menu — typically a `<Menu.Trigger>`. */
  trigger?: React.ReactNode;
  /**
   * The rows to render, each a `<Menu.Item>` element. Falsy entries are skipped,
   * so a row can be included conditionally (e.g. `canDelete && <Menu.Item ...>`).
   */
  items: Array<React.ReactElement<MenuItemProps> | null | false | undefined>;
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /**
   * Modal behaviour. Default `true` (unlike `Popover`): the rest of the page is
   * inert while the menu is open.
   */
  modal?: RootProps["modal"];
  /** Which side of the trigger to place the menu (base-ui default `bottom`). */
  side?: PositionerProps["side"];
  /** Alignment along the chosen side (base-ui default `center`). */
  align?: PositionerProps["align"];
  /** Gap in px between the trigger and the menu. Default `8`. */
  sideOffset?: PositionerProps["sideOffset"];
  /** Extra className merged onto the menu surface. */
  className?: string;
  /** Ref to the menu surface element. */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Menu — a floating list of actions anchored to a trigger, built on base-ui's
 * `Menu` (roving keyboard focus, type-ahead, and dismissal for free). Pass its
 * rows as `items`, each a `<Menu.Item>`.
 *
 * @example
 * <Menu
 *   trigger={<Menu.Trigger>Actions</Menu.Trigger>}
 *   items={[
 *     <Menu.Item onClick={() => edit()}>Edit</Menu.Item>,
 *     <Menu.Item onClick={() => duplicate()}>Duplicate</Menu.Item>,
 *     <Menu.Item href="/source">View source</Menu.Item>,
 *     <Menu.Item intent="negative" onClick={() => remove()}>Delete</Menu.Item>,
 *   ]}
 * />
 */
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

/** base-ui `Menu.Trigger`'s render seam — an element to render as, or `(htmlAttrs) => element`. */
type BaseMenuTriggerRender = React.ComponentProps<typeof BaseMenu.Trigger>["render"];

/** Hover/open-timing knobs shared by the default-Button and custom-render triggers. */
interface MenuTriggerOwnProps {
  /**
   * Also open the menu on hover, not just click/keyboard (base-ui's
   * `openOnHover`). Off by default.
   */
  openOnHover?: boolean;
  /** ms to wait before opening on hover. Requires `openOnHover`. Default `100`. */
  delay?: number;
  /** ms to wait before closing after the pointer leaves. Requires `openOnHover`. Default `0`. */
  closeDelay?: number;
}

/**
 * `Menu.Trigger` props. By default it renders a `Button`, so all of Button's
 * `intent`/`saliency`/`size`/`icons`/`loading`/`disabled` apply. Pass a base-ui
 * `render` for a fully custom trigger element instead — it receives the popup
 * wiring, and the Button props no longer apply.
 */
export type MenuTriggerProps =
  | (ButtonProps & MenuTriggerOwnProps & { render?: never })
  | (MenuTriggerOwnProps & { render: BaseMenuTriggerRender });

/**
 * The trigger that opens the menu. Renders a `Button` wired by base-ui with the
 * right `aria-haspopup`/`aria-expanded`. Must be passed to `<Menu trigger={...} />`
 * so it sits inside the menu's context.
 *
 * Pass `render` for a custom, non-Button trigger — base-ui hands your element the
 * same popup wiring via its `render` seam (never `asChild`).
 */
function MenuTrigger(props: MenuTriggerProps) {
  const { openOnHover, delay, closeDelay } = props;

  // Custom trigger: pass base-ui's render straight through with the popup
  // wiring merged onto it.
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

  // Default trigger: a real `Button` fed base-ui's computed props via
  // InternalButton's `htmlAttrs` seam. Strip the trigger-only knobs first.
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

/** Menu with its compound parts attached. */
export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Item: MenuItem,
});
