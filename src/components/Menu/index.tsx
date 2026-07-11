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
import type { Intent } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { mergeProps, type RenderProp } from "../../utils/render";
import type { ButtonProps } from "../Button";
import { menuItemIcon, menuItemRecipe, menuPopup, menuPositioner } from "./menu.css";

type RootProps = React.ComponentProps<typeof BaseMenu.Root>;
type PositionerProps = React.ComponentProps<typeof BaseMenu.Positioner>;

/** `Menu.Item`'s colour intent — the neutral default plus the accent intents (matches `Chip`/`Button`). */
export type MenuItemIntent = Extract<Intent, "neutral" | "secondary" | "warning" | "negative">;

export interface MenuItemProps {
  /** Colour intent for the row's icon/text and its highlight wash. Default `neutral`. */
  intent?: MenuItemIntent;
  /** Leading glyph before the label — typically an `<Icon>`. */
  icon?: React.ReactNode;
  /** The row's visible label — also its accessible name and keyboard type-ahead text. */
  children: string;
  /**
   * Activation handler, makes the row a real `<button>` (via
   * `InternalGenericButtonAnchor`). Can be combined with `href`/`render` (e.g. to
   * fire analytics alongside the navigation) — all three chain rather than
   * override each other.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Destination for an external link — makes the row a real `<a href>`. */
  href?: string;
  /**
   * Router-link element for internal, client-side navigation (the base-ui
   * `render` seam, like `Link`/`Card`) — e.g. `render={<RouterLink to="/settings" />}`.
   * Its presence (with or without `href`) makes the row a link.
   */
  render?: RenderProp;
  /** Disables the row. Uses `aria-disabled`/`data-disabled` (never the native attribute). */
  disabled?: boolean;
  /**
   * Keep the menu open after this row activates, instead of the default
   * dismiss-on-click. Meant for a button row whose action doesn't navigate away
   * and that a user may want to fire repeatedly (a stepper, a "mark all"
   * toggle). No effect on link rows — those navigate away, closing the menu.
   */
  keepOpen?: boolean;
}

/**
 * Wires a base-ui render callback's computed props (`htmlAttrs`) onto
 * `InternalGenericButtonAnchor`, folding in the item's own
 * `onClick`/`href`/`render`/`disabled` — mirrors `InternalButton`'s `htmlAttrs`
 * seam. The host's `onClick` (base-ui's highlight/keyboard/close wiring) is
 * pulled out and chained after the consumer's own, so both run exactly once.
 * base-ui's own `aria-disabled` is dropped rather than merged: since we never
 * tell base-ui this item is disabled (see `MenuItem`), it always hands back
 * `aria-disabled={false}` here, which would otherwise clobber the real value
 * `InternalGenericButtonAnchor` computes from our own `disabled` prop.
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
            {icon}
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
 * Menu.Item — one action row. Renders as a real `<button>` (`onClick`) or a
 * real `<a>`/router link (`href`/`render`) via `InternalGenericButtonAnchor`,
 * wrapped in base-ui's `Menu.Item`/`Menu.LinkItem` so it gets the roving
 * keyboard focus, type-ahead, and `data-highlighted` wiring for free. Use it
 * standalone inside `<Menu>`, or — more commonly — pass its props as an entry
 * in `<Menu items={[...]} />`.
 */
function MenuItem(props: MenuItemProps) {
  const { children, keepOpen = false } = props;
  const isLink = props.href != null || props.render != null;

  if (isLink) {
    return (
      <BaseMenu.LinkItem
        label={children}
        // A menu item navigating away should close the menu, same as any other
        // activation — base-ui defaults link items to `false` (kept open) since
        // they're often used to open a nested surface; override to match `Item`.
        // (`keepOpen` can force it back open, though it's rarely meaningful on a
        // link that's navigating away.)
        closeOnClick={!keepOpen}
        render={(htmlAttrs) => <MenuItemAnchor {...props} htmlAttrs={htmlAttrs} />}
      />
    );
  }

  return (
    <BaseMenu.Item
      label={children}
      // Dismiss on activation by default (base-ui's default too); `keepOpen`
      // holds the menu open for a repeatable, non-navigating action.
      closeOnClick={!keepOpen}
      // `disabled` is intentionally not passed to base-ui here: per this
      // library's convention (see Accordion), disabling always stays modelled
      // as `aria-disabled` + a swallowed activation on our own rendered
      // element (below, via `InternalGenericButtonAnchor`), never base-ui's own
      // `disabled` prop — so the row stays keyboard-reachable regardless of
      // that primitive's particular disabled implementation.
      // The row renders a real `<button>` below, so tell base-ui it's already a
      // native button (it otherwise assumes its `<div>` default and adds its own
      // keyboard-activation shim).
      nativeButton
      render={(htmlAttrs) => <MenuItemAnchor {...props} htmlAttrs={htmlAttrs} />}
    />
  );
}

export interface MenuProps {
  /** The element that opens the menu — typically a `<Menu.Trigger>`. */
  trigger?: React.ReactNode;
  /**
   * The rows to render, each the props for a `Menu.Item`. Falsy entries are
   * skipped, so a row can be included conditionally inline without a wrapper —
   * e.g. `canDelete && { children: "Delete", intent: "negative", onClick }`.
   */
  items: Array<MenuItemProps | null | false | undefined>;
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /**
   * Modal behaviour. Default `true` (base-ui's default for `Menu`, unlike
   * `Popover`): the rest of the page is inert while the menu is open.
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
 * `Menu` (roving keyboard focus, type-ahead, and dismissal handled for you).
 * Pass its rows as `items` (each a `Menu.Item`'s props); every row renders as a
 * real `<button>` or `<a>`/router link via `InternalGenericButtonAnchor`.
 *
 * @example
 * <Menu
 *   trigger={<Menu.Trigger>Actions</Menu.Trigger>}
 *   items={[
 *     { children: "Edit", onClick: () => edit() },
 *     { children: "Duplicate", onClick: () => duplicate() },
 *     { children: "View source", href: "/source" },
 *     { children: "Delete", intent: "negative", onClick: () => remove() },
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
            {items
              .filter((item): item is MenuItemProps => Boolean(item))
              .map((item, index) => (
                <MenuItem key={index} {...item} />
              ))}
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
   * Also open the menu when the trigger is hovered, not just on click/keyboard
   * (base-ui's `openOnHover`). Off by default.
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
 * `render` (an element, or `(htmlAttrs) => element`) to use a fully custom
 * trigger element instead — it receives the popup wiring
 * (`aria-haspopup`/`aria-expanded` + the toggle handler), and the Button props
 * no longer apply.
 */
export type MenuTriggerProps =
  | (ButtonProps & MenuTriggerOwnProps & { render?: never })
  | (MenuTriggerOwnProps & { render: BaseMenuTriggerRender });

/**
 * The trigger that opens the menu. Renders a `Button` (so all of Button's
 * intents/saliencies/sizes/icons are available), wired up by base-ui so it
 * carries the right `aria-haspopup`/`aria-expanded` and toggles the menu. Must
 * be passed to `<Menu trigger={...} />` so it sits inside the menu's context.
 *
 * Pass `render` for a custom, non-Button trigger (an avatar, an icon-only
 * control): base-ui hands your element the same popup wiring via its `render`
 * seam — the house polymorphism convention, never `asChild`.
 */
function MenuTrigger(props: MenuTriggerProps) {
  const { openOnHover, delay, closeDelay } = props;

  // Custom trigger: hand base-ui's render straight through — the consumer owns
  // the element and just needs the popup wiring merged onto it.
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

  // Default trigger: a real `Button` fed base-ui's computed props through
  // InternalButton's `htmlAttrs` seam. Strip the trigger-only knobs so they
  // don't leak onto the Button/DOM.
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
