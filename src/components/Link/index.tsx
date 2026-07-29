"use client";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
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
 * Link props, discriminated on `appearance`: the default inline styled anchor
 * ({@link InlineLinkProps}) or a button-styled link ({@link ButtonLinkProps}).
 */
export type LinkProps = InlineLinkProps | ButtonLinkProps;

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
 * **Router integration.** Either pass `render` per link, or wrap the app in a
 * `LinkProvider` to route every internal `Link` (both appearances) through your
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
