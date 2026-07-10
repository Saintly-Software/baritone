"use client";
import * as React from "react";
import type { Intent, Saliency, Size, SurfaceSaliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { Icon } from "../Icon";
import { Text } from "../Text";
import {
  noticeActions,
  noticeBody,
  noticeIconRecipe,
  noticeRecipe,
  noticeTitle,
} from "./notice.css";

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

export interface NoticeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
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
   * A leading icon. Pass any node (an `<svg>`/glyph) and it's wrapped in an
   * `<Icon>` that inherits the notice's colour, or pass a `<Notice.Icon>` to tint
   * the icon a different `intent`/`saliency`.
   */
  icon?: React.ReactNode;
  /** Supporting text rendered beneath the title. */
  description?: React.ReactNode;
  /**
   * Trailing action controls (typically `<Button>`s), rendered as a wrapping row
   * beneath the text — the same node array a `Card.Actions`/`Card.Footer` takes.
   */
  actions?: React.ReactNode[];
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
 * it), the `children` as the title, an optional `description` beneath, and an
 * optional `actions` row of buttons. Pick the `shape` (`square` / `pill`) like a
 * `Chip`.
 */
function NoticeRoot({
  intent,
  saliency,
  shape,
  icon,
  description,
  actions,
  render,
  className,
  children,
  ref,
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

  return useRender({
    render,
    defaultElement: "div",
    props: {
      ref,
      className: cx(noticeRecipe({ intent, saliency, shape }), className),
      children: (
        <>
          {iconNode}
          <div className={noticeBody}>
            <Text variant="base" className={noticeTitle}>
              {children}
            </Text>
            {description != null && <Text variant="sm">{description}</Text>}
            {actions != null &&
              actions.length > 0 && (
                // `Children.toArray` assigns stable keys to the positional list.
                <div className={noticeActions}>{React.Children.toArray(actions)}</div>
              )}
          </div>
        </>
      ),
      ...rest,
    },
  });
}

NoticeRoot.displayName = "Notice";
NoticeIcon.displayName = "Notice.Icon";

/** Notice with its `Icon` part attached. */
export const Notice = Object.assign(NoticeRoot, {
  Icon: NoticeIcon,
});
