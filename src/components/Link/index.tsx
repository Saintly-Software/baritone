"use client";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import { InternalChip, type InternalChipProps } from "../../internal/components/InternalChip";
import type { WidthShorthand } from "../../styles/layoutProps";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { RenderElement, type RenderProp } from "../../utils/render";
import type { ButtonIconState } from "../Button";
import type { ChipIconState } from "../Chip";
import type { IconSlot } from "../Icon/renderIcon";
import { useLinkRender } from "../LinkProvider";
import { linkBase } from "./link.css";

/**
 * The default, inline `Link` — a router-agnostic styled `<a>` that blends into
 * surrounding copy. This is the shape when `appearance` is omitted (or `"text"`).
 */
export interface InlineLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  // Colour is locked to the primary text token, not the `color` attribute.
  "color"
> {
  /** The default inline-anchor look. */
  appearance?: "text";
  /**
   * Render as a different element/component (base-ui `render` pattern) — pass
   * your router's link component to make this link router-agnostic, e.g.
   * `render={<NextLink href="/about" />}` or `render={<RouterLink to="/about" />}`.
   *
   * Usually set once via a `LinkProvider` wrapping the app instead of per link;
   * this prop overrides the provider for a single link. Renders a plain `<a>`
   * when neither is set.
   */
  render?: RenderProp;
  ref?: React.Ref<HTMLAnchorElement>;
  children?: React.ReactNode;
}

/**
 * Props shared by every `<Link appearance="button">` arm, labelled and
 * icon-only alike. Like `Button`'s `ButtonCommonProps`, it omits
 * `children`/`aria-label`/`icon` since those differ per arm (visible label vs.
 * required `aria-label`) — each arm redefines them.
 */
interface ButtonLinkCommonProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  // Colour comes from intent/saliency, not the `color` attribute…
  | "color"
  // …and the accessible name is arm-specific, so each arm redefines `aria-label`/`children`.
  | "aria-label"
  | "children"
> {
  /** The button look. */
  appearance: "button";
  intent?: Intent;
  saliency?: Saliency;
  /** Control sizing (padding / font / height). Default `md`. */
  size?: Size;
  /**
   * Loading state: shows the spinner overlay and makes the link inert (no
   * re-triggering an in-flight navigation), keeping content in place to
   * preserve width and the accessible name.
   */
  loading?: boolean;
  /**
   * Disables the link. With no honest disabled HTML form, it collapses to an
   * inert element (no navigation, out of the a11y tree) while keeping the button
   * styling — see `InternalGenericButtonAnchor`.
   */
  disabled?: boolean;
  /** Explanation shown in a tooltip when the link is disabled (not shown while `loading`). */
  disabledReason?: React.ReactNode;
  /**
   * Router-link element for client-side navigation (base-ui `render` pattern),
   * e.g. `render={<NextLink href="/about" />}`. Omit and pass `href` for a plain
   * external `<a>`, or set once via `LinkProvider` for every internal
   * button-link — this prop overrides the provider for a single link.
   */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
}

/**
 * `<Link appearance="button">` — a link that looks like a labelled `Button`.
 * Reuses Button's colour/typography recipe wholesale (via `InternalButton`), so
 * the same `intent`/`saliency`/`size`/`loading`/icon knobs apply, but it renders
 * an anchor (or your router link) — a real navigation control, not a scripted
 * button.
 *
 * The visible text is the accessible name, so `aria-label` is a type error
 * here; pass `icon` + `aria-label` instead for the icon-only arm
 * ({@link IconButtonLinkProps}). Supply the destination as with an inline
 * `Link`: `href` for external, `render` for client-side navigation.
 */
export interface LabelledButtonLinkProps extends ButtonLinkCommonProps {
  /**
   * Icon before the label — a bare glyph (auto-wrapped in `Icon`), an explicit
   * `<Icon>`, or a render function. Inherits text colour.
   */
  startIcon?: IconSlot<ButtonIconState>;
  /** Icon after the label — same forms as `startIcon`. Inherits text colour. */
  endIcon?: IconSlot<ButtonIconState>;
  /**
   * `width` shorthand: `fill` (100%), `fit` (fit-content), or `inherit` — same
   * knob as `Box`/`Flex`/`Button`. `fill` stretches the link to its container
   * (e.g. a full-width mobile CTA).
   */
  width?: WidthShorthand;
  /** Required visible text label (also the accessible name). */
  children: React.ReactNode;
  /**
   * Unsupported here: the accessible name is always the visible label, so an
   * `aria-label` (which would silently override it) is a type error. It's
   * required on the icon-only arm ({@link IconButtonLinkProps}) instead, which
   * has no visible text to name it.
   */
  "aria-label"?: never;
  /**
   * Unsupported here — pass `startIcon`/`endIcon` alongside the label instead.
   * `icon` is the discriminant of the icon-only arm ({@link IconButtonLinkProps}).
   */
  icon?: never;
}

/**
 * `<Link appearance="button" icon={…} aria-label="…" />` — the icon-only
 * button-styled link: a square control with a single centred glyph and no
 * visible text, the mirror of `Button`'s `IconButtonProps` rendered on a real
 * anchor (or router link). `aria-label` is **required** (the labelled arm
 * forbids it) since there's no label to name the control.
 *
 * Shares `intent`/`saliency`/`size`/`loading`/`disabled`/`disabledReason` with
 * the labelled button-link and reuses the same square recipe, so it's
 * pixel-identical to an icon-only `Button`. Supply the destination as usual:
 * `href`, or `render` (or an ambient `LinkProvider`) for client-side navigation.
 */
export interface IconButtonLinkProps extends ButtonLinkCommonProps {
  /**
   * The single centred glyph — **required**, and the discriminant of this arm.
   * A bare glyph (auto-wrapped in `Icon`), an explicit `<Icon>`, or a render
   * function; inherits the link's text colour. Typed `NonNullable` so a nullish
   * value (e.g. `cond ? <Icon/> : null`) can't slip through and render an
   * *unnamed* anchor.
   */
  icon: NonNullable<IconSlot<ButtonIconState>>;
  /**
   * Accessible name — **required**, since the link is icon-only with no visible
   * text to name it (e.g. "Back to entry details"). The labelled arm forbids
   * `aria-label` instead, since its visible label is already the name.
   */
  "aria-label": string;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  children?: never;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  startIcon?: never;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  endIcon?: never;
  /**
   * Unsupported here: the square treatment pins a 1:1 `aspect-ratio`, so
   * `width="fill"` would inflate it into a container-sized square rather than
   * widen it. Use a labelled button-link for a full-width control.
   */
  width?: never;
}

/**
 * `<Link appearance="button">` props, discriminated on the presence of `icon`:
 * labelled ({@link LabelledButtonLinkProps}) or icon-only
 * ({@link IconButtonLinkProps}, via `icon` + `aria-label` and no `children`).
 * Mirrors `Button`'s labelled/`IconButtonProps` split.
 */
export type ButtonLinkProps = LabelledButtonLinkProps | IconButtonLinkProps;

/**
 * `<Link appearance="chip">` — a link that looks like a `Chip`. Reuses Chip's
 * recipe wholesale (via `InternalChip`/`chipBoxClassName`), so the same
 * `intent`/`saliency`/`size`/`shape`/`width` knobs apply and it's visually
 * identical to a `Chip`, but renders a real anchor (or router link) with the
 * chip's pointer/hover/active affordances and focus ring.
 *
 * A chip-link is deliberately *one anchor* — an optional decorative `icon`/
 * `trailIcon` and nothing action-bearing. Chip's interactive adornments, remove
 * button, and `onClick`/`popover` semantics intentionally stay on `Chip`: a
 * navigable chip is a `Link`, not an `href` on `Chip` (which would nest
 * interactive elements invalidly). Supply the destination as with any `Link`:
 * `href` for external, or `render` for client-side navigation.
 */
export interface ChipLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  // Colour comes from intent/saliency, not the `color` attribute…
  | "color"
  // …and the accessible name is always the visible label, so `aria-label` is
  // intentionally unsupported (matches `Chip`/`Button`).
  | "aria-label"
> {
  /** The chip look. */
  appearance: "chip";
  /** Colour intent — same knob and default (`neutral`) as `Chip`. */
  intent?: Intent;
  /** Colour saliency — same knob and default (`mid`) as `Chip`. */
  saliency?: Saliency;
  /** Chip sizing (height / font / padding). Same default (`md`) as `Chip`. */
  size?: Size;
  /**
   * The chip's silhouette: `square` (default, the component radius) or `pill`
   * (fully rounded ends). Same as `Chip`.
   */
  shape?: "square" | "pill";
  /**
   * `fit` (default) hugs the label; `fill` stretches the chip-link to its
   * container's full width (the label still truncates). Same as `Chip`.
   */
  width?: "fit" | "fill";
  /**
   * Decorative leading icon, like `Chip`'s `icon` — a bare glyph (auto-wrapped
   * in `Icon`), explicit `<Icon>`, or render function; inherits chip colour.
   */
  icon?: IconSlot<ChipIconState>;
  /** Decorative trailing icon — mirrors `icon` (like `Chip`'s `trailIcon`). */
  trailIcon?: IconSlot<ChipIconState>;
  /**
   * Disables the link. With no honest disabled HTML form, it collapses to an
   * inert element (no navigation, out of the a11y tree) while keeping the chip
   * styling — mirrors `appearance="button"`.
   */
  disabled?: boolean;
  /** Explanation shown in a tooltip when the link is disabled, on tab or hover. */
  disabledReason?: React.ReactNode;
  /**
   * Router-link element for client-side navigation (base-ui `render` pattern),
   * e.g. `render={<NextLink href="/tags/music" />}` or a typed
   * `render={<RouterLink to="/notes" search={{ tags: ["music"] }} />}`. Omit and
   * pass `href` for a plain external `<a>`, or set once via `LinkProvider` for
   * every internal chip-link — this prop overrides the provider for a single link.
   */
  render?: RenderProp;
  /** Required visible text label (also the accessible name). */
  children: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
  /**
   * Unsupported: the accessible name is always the visible label, so passing an
   * `aria-label` (which would silently override it) is a type error.
   */
  "aria-label"?: never;
}

/**
 * Link props, discriminated on `appearance` (and, within `"button"`, on the
 * presence of `icon`): inline ({@link InlineLinkProps}), button-styled
 * ({@link ButtonLinkProps} — labelled or icon-only), or chip-styled
 * ({@link ChipLinkProps}).
 */
export type LinkProps = InlineLinkProps | ButtonLinkProps | ChipLinkProps;

/**
 * Link — a router-agnostic link. By default it renders an inline styled `<a>`
 * that blends into copy: colour locked to the `primary` text token, always
 * underlined, with oklch hover/active states and the shared focus ring.
 *
 * `appearance="button"` looks like a `Button` (same `intent`/`saliency`/`size`/
 * `loading`/icon knobs) but renders an anchor; add `icon` + `aria-label` (no
 * `children`) for the icon-only square look ({@link IconButtonLinkProps}).
 *
 * `appearance="chip"` looks like a `Chip` (same knobs, plus decorative
 * `icon`/`trailIcon`) but renders a real navigable anchor.
 *
 * **Router integration.** Pass `render` per link, or wrap the app in a
 * `LinkProvider` to route every internal `Link` at once — a per-link `render`
 * always overrides the provider; external/new-tab/`download` links stay plain.
 */
export function Link(props: LinkProps) {
  // Honours an enclosing `LinkProvider` (external/new-tab/download links get
  // `undefined` → a plain `<a>`). Read before the appearance branch so hook
  // order stays stable across renders.
  const render = useLinkRender(props.render, props);

  if (props.appearance === "button") {
    // Hands the shared `InternalButton` the Button knobs plus the anchor seam
    // (`href`/`render`/…); `InternalGenericButtonAnchor` renders the button
    // chrome onto an `<a>`/router link. Both arms flow through unchanged — the
    // icon-only arm hits the same `InternalButton` path as `Button`'s
    // `IconButtonProps`, so they're pixel-identical.
    // `appearance` is Link's own discriminant (not part of Button's API) and is
    // stripped, and the consumer's `render` is replaced with the resolved one.
    // The cast bridges the ref/attribute variance: Button types `ref` as
    // `Ref<HTMLButtonElement>`, but a button-link renders an anchor, so this arm
    // widens it to `Ref<HTMLElement>` and carries anchor-only attributes through.
    const { appearance: _appearance, render: _render, ...buttonProps } = props;
    return (
      <InternalButton
        consumerProps={
          { ...buttonProps, render } as React.ComponentProps<typeof InternalButton>["consumerProps"]
        }
      />
    );
  }

  if (props.appearance === "chip") {
    // Hands the shared `InternalChip` the Chip knobs plus the resolved anchor
    // seam, rendering the chip chrome (via `chipBoxClassName`, `Chip`'s own
    // recipe) onto an `<a>`/router link. `appearance` (Link's own discriminant)
    // and the consumer's `render` (replaced with the resolved one) are stripped.
    const { appearance: _appearance, render: _render, ...chipProps } = props;
    return <InternalChip {...(chipProps as InternalChipProps)} render={render} />;
  }

  const { appearance: _appearance, render: _render, className, children, ref, ...rest } = props;
  // `RenderElement` (not `useRender`) since this sits behind an earlier return.
  return (
    <RenderElement
      render={render}
      defaultElement="a"
      props={{
        ref,
        className: cx(linkBase, focusRingRecipe({ type: "visible" }), className),
        children,
        ...rest,
      }}
    />
  );
}
