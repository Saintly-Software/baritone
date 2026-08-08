"use client";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import { InternalChip, type InternalChipProps } from "../../internal/components/InternalChip";
import type { WidthShorthand } from "../../styles/layoutProps";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { RenderElement, type RenderProp } from "../../utils/render";
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
   * Render as a different element/component (base-ui `render` pattern). This is
   * what makes the Link router-agnostic: pass your router's link component so it
   * keeps the system's styling while owning navigation, e.g.
   * `render={<NextLink href="/about" />}` or `render={<RouterLink to="/about" />}`.
   *
   * Usually you don't set this per link — wrap the app in a `LinkProvider` to
   * point *every* internal `Link` at your router once. This prop then stays the
   * escape hatch: it overrides the provider for a single link (bespoke router
   * props, or forcing a plain element). Renders a plain `<a>` when neither is set.
   */
  render?: RenderProp;
  ref?: React.Ref<HTMLAnchorElement>;
  children?: React.ReactNode;
}

/**
 * `<Link appearance="button">` — a link that *looks like* a `Button`. It reuses
 * Button's colour/typography recipe wholesale (via the shared `InternalButton`),
 * so there's no style duplication: the same `intent`/`saliency`/`size`/`loading`/
 * icon knobs apply, but the rendered element is an anchor (or your router link),
 * making it a real navigation control rather than a scripted button.
 *
 * Supply the destination the same way as an inline `Link`: `href` for an external
 * link, or `render` with your framework's link for client-side navigation.
 */
export interface ButtonLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  // Colour comes from intent/saliency, not the `color` attribute…
  | "color"
  // …and the accessible name is always the visible label, so an `aria-label`
  // (which would silently override it) is intentionally unsupported (matches
  // `Button`).
  | "aria-label"
> {
  /** The button look. */
  appearance: "button";
  intent?: Intent;
  saliency?: Saliency;
  /** Control sizing (padding / font / height). Default `md`. */
  size?: Size;
  /**
   * Loading state: renders the spinner overlay and makes the link inert (an
   * in-flight navigation shouldn't be re-triggered), keeping the label in place
   * to preserve width and the accessible name.
   */
  loading?: boolean;
  /**
   * Disables the link. A disabled link has no honest HTML form, so it collapses
   * to an inert element (no navigation, out of the a11y tree as a link) while
   * keeping the button styling — see `InternalGenericButtonAnchor`.
   */
  disabled?: boolean;
  /**
   * Explanation shown in a tooltip when the link is disabled. Not shown while
   * `loading`.
   */
  disabledReason?: React.ReactNode;
  /** Icon placed before the label. Typically an `<Icon>`; inherits text colour. */
  startIcon?: React.ReactNode;
  /** Icon placed after the label. Typically an `<Icon>`; inherits text colour. */
  endIcon?: React.ReactNode;
  /**
   * `width` shorthand: `fill` (100%), `fit` (fit-content), or `inherit` — the
   * same knob `Box`/`Flex` and a `solid` `Button` take. `fill` stretches the
   * button-styled link to its container, for the full-width mobile CTA.
   */
  width?: WidthShorthand;
  /**
   * Router-link element for client-side navigation (base-ui `render` pattern),
   * e.g. `render={<NextLink href="/about" />}`. Omit and pass `href` for a plain
   * external `<a>` — or wrap the app in a `LinkProvider` to route every internal
   * button-link through your router without setting this per link (this then
   * overrides the provider for a single link).
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
 * `<Link appearance="chip">` — a link that *looks like* a `Chip`. It reuses
 * Chip's recipe wholesale (via the shared `InternalChip` / `chipBoxClassName`),
 * so there's no style duplication: the same `intent`/`saliency`/`size`/`shape`/
 * `width` knobs apply and it's visually identical to a `Chip`, but the rendered
 * element is a real anchor (or your router link), with the chip's pointer /
 * hover / active affordances and focus ring.
 *
 * A chip-link is deliberately *one anchor* — an optional decorative `icon` /
 * `trailIcon` on each side of the label, and nothing action-bearing. Chip's
 * interactive adornments, remove button, and `onClick`/`popover` label semantics
 * intentionally stay on `Chip`: a navigable chip is a `Link`, not an `href` on
 * `Chip` (which would create invalid nested interactive elements). Supply the
 * destination the same way as any other `Link`: `href` for an external link, or
 * `render` with your framework's link (which also carries *typed* router
 * descriptors a plain `href` can't express) for client-side navigation.
 */
export interface ChipLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  // Colour comes from intent/saliency, not the `color` attribute…
  | "color"
  // …and the accessible name is always the visible label, so an `aria-label`
  // (which would silently override it) is intentionally unsupported (matches
  // `Chip`/`Button`).
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
   * Decorative leading icon — a single non-interactive glyph before the label
   * (like `Chip`'s `icon`). Typically an `<Icon>`; inherits the chip's colour.
   */
  icon?: React.ReactNode;
  /** Decorative trailing icon — mirrors `icon` (like `Chip`'s `trailIcon`). */
  trailIcon?: React.ReactNode;
  /**
   * Disables the link. A disabled link has no honest HTML form, so it collapses
   * to an inert element (no navigation, out of the a11y tree as a link) while
   * keeping the chip styling — mirrors `appearance="button"`.
   */
  disabled?: boolean;
  /**
   * Explanation shown in a tooltip when the link is disabled and the user tabs to
   * or hovers it.
   */
  disabledReason?: React.ReactNode;
  /**
   * Router-link element for client-side navigation (base-ui `render` pattern),
   * e.g. `render={<NextLink href="/tags/music" />}` or a typed
   * `render={<RouterLink to="/notes" search={{ tags: ["music"] }} />}`. Omit and
   * pass `href` for a plain external `<a>` — or wrap the app in a `LinkProvider`
   * to route every internal chip-link through your router without setting this per
   * link (this then overrides the provider for a single link).
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
 * Link props, discriminated on `appearance`: the default inline styled anchor
 * ({@link InlineLinkProps}), a button-styled link ({@link ButtonLinkProps}), or a
 * chip-styled link ({@link ChipLinkProps}).
 */
export type LinkProps = InlineLinkProps | ButtonLinkProps | ChipLinkProps;

/**
 * Link — a router-agnostic link. By default it renders an inline styled `<a>`
 * that blends into surrounding copy: the colour is locked to the `primary` intent
 * text token and the text is always underlined (the underline, not colour alone,
 * signals a link), with oklch-derived hover/active states and the shared focus
 * ring. Supply your framework's link via `render` to integrate with any router.
 *
 * Pass `appearance="button"` for a link that looks like a `Button`: it reuses
 * Button's recipe (same `intent`/`saliency`/`size`/`loading`/icon knobs) but
 * renders an anchor, so you get button styling on a real navigation control
 * without duplicating any styles.
 *
 * Pass `appearance="chip"` for a link that looks like a `Chip`: it reuses Chip's
 * recipe (same `intent`/`saliency`/`size`/`shape`/`width` knobs, plus decorative
 * `icon`/`trailIcon`) so it's visually identical to a `Chip`, but the element is a
 * real navigable anchor — the way to make a whole chip navigate without putting an
 * `href` on `Chip`.
 *
 * **Router integration.** Either pass `render` per link, or wrap the app in a
 * `LinkProvider` to route every internal `Link` (all appearances) through your
 * router at once — external / new-tab / `download` links still render a plain
 * `<a>`, and a per-link `render` always overrides the provider.
 */
export function Link(props: LinkProps) {
  // Honour an enclosing `LinkProvider`: with no per-link `render`, an internal
  // link resolves to the provider's router link (external / new-tab / download
  // links resolve to `undefined` → a plain `<a>`). Read once, *before* the
  // appearance branch, so the hook order stays stable across renders. `props`
  // exposes `render`/`href`/`target`/`download` on both union arms (all anchor
  // props), so it's safe to read them here.
  const render = useLinkRender(props.render, props);

  if (props.appearance === "button") {
    // A button-styled link: hand the shared `InternalButton` the Button knobs plus
    // the anchor seam (`href`/`render`/…). `InternalGenericButtonAnchor` sees the
    // link seam and renders the button chrome onto an `<a>`/router link. The
    // `appearance` discriminant is Link's own and isn't part of Button's API, so
    // it's stripped here (InternalButton would treat it as the Button appearance).
    // The consumer's own `render` is stripped too and replaced with the resolved
    // one (so the provider is honoured); it's `undefined` for a plain/external
    // link, which `InternalGenericButtonAnchor` renders as an `<a href>`.
    // The cast bridges the ref/attribute variance across the internal boundary:
    // Button's props type `ref` as `Ref<HTMLButtonElement>`, but a button-link's
    // rendered element is an anchor (or an inert element when disabled), so this
    // arm's `ref` is the wider `Ref<HTMLElement>`, and it carries anchor-only
    // attributes (`download`, `hrefLang`, …) that flow straight through to the `<a>`.
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
    // A chip-styled link: hand the shared `InternalChip` the Chip knobs plus the
    // resolved anchor seam. It renders the chip chrome (via `chipBoxClassName` —
    // the same recipe `Chip` uses) onto an `<a>`/router link. The `appearance`
    // discriminant is Link's own, and the consumer's `render` is replaced with the
    // provider-resolved one (`undefined` for a plain/external link), so both are
    // stripped here.
    const { appearance: _appearance, render: _render, ...chipProps } = props;
    return <InternalChip {...(chipProps as InternalChipProps)} render={render} />;
  }

  const { appearance: _appearance, render: _render, className, children, ref, ...rest } = props;
  // `RenderElement` (not the `useRender` hook) because this render sits behind the
  // earlier `appearance === "button"` return.
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
