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
  "color"
> {
  /** The default inline-anchor look. */
  appearance?: "text";
  /**
   * Router-link element for client-side navigation (base-ui `render` pattern),
   * e.g. `render={<RouterLink to="/about" />}`; this is what makes Link
   * router-agnostic. Usually set once via a `LinkProvider`; per-link it overrides
   * the provider. Renders a plain `<a>` when neither is set.
   */
  render?: RenderProp;
  ref?: React.Ref<HTMLAnchorElement>;
  children?: React.ReactNode;
}

/** Props shared by every `<Link appearance="button">` arm — labelled and icon-only. */
interface ButtonLinkCommonProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "color" | "aria-label" | "children"
> {
  /** The button look. */
  appearance: "button";
  intent?: Intent;
  saliency?: Saliency;
  /** Control sizing (padding / font / height). Default `md`. */
  size?: Size;
  /**
   * Loading state: renders the spinner overlay and makes the link inert, keeping
   * the content in place to preserve width and the accessible name.
   */
  loading?: boolean;
  /**
   * Disables the link. A disabled link has no honest HTML form, so it collapses
   * to an inert element (no navigation, out of the a11y tree) while keeping the
   * button styling.
   */
  disabled?: boolean;
  /** Explanation shown in a tooltip when disabled. Not shown while `loading`. */
  disabledReason?: React.ReactNode;
  /**
   * Router-link element for client-side navigation. Omit and pass `href` for a
   * plain external `<a>`, or set it once via a `LinkProvider`.
   */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
}

/**
 * `<Link appearance="button">` — a link that looks like a labelled `Button`,
 * reusing Button's recipe (via `InternalButton`) but rendered on a real anchor.
 * The visible text is the accessible name, so `aria-label` is a type error here;
 * pass `icon` + `aria-label` for the icon-only arm ({@link IconButtonLinkProps}).
 */
export interface LabelledButtonLinkProps extends ButtonLinkCommonProps {
  /** Icon before the label — a bare glyph, an `<Icon>`, or a render function. */
  startIcon?: IconSlot<ButtonIconState>;
  /** Icon after the label — same forms as `startIcon`. */
  endIcon?: IconSlot<ButtonIconState>;
  /**
   * `width` shorthand: `fill` (100%), `fit` (fit-content), or `inherit`. `fill`
   * stretches the button-styled link to its container.
   */
  width?: WidthShorthand;
  /** Required visible text label (also the accessible name). */
  children: React.ReactNode;
  /** Unsupported on a labelled button-link — the visible label is the name. */
  "aria-label"?: never;
  /** Unsupported on a labelled button-link — the discriminant of the icon-only arm. */
  icon?: never;
}

/**
 * `<Link appearance="button" icon aria-label />` — the icon-only button-styled
 * link: a square control with a single centred glyph, the anchor mirror of
 * `Button`'s `IconButtonProps`. `aria-label` is **required**, since there's no
 * label to name it.
 */
export interface IconButtonLinkProps extends ButtonLinkCommonProps {
  /**
   * The single centred glyph — **required**, and the discriminant of this arm.
   * A bare glyph, an `<Icon>`, or a render function. `NonNullable` so a nullish
   * value can't slip through and render an unnamed anchor.
   */
  icon: NonNullable<IconSlot<ButtonIconState>>;
  /** Accessible name — **required**, since the link is icon-only. */
  "aria-label": string;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  children?: never;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  startIcon?: never;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  endIcon?: never;
  /** Unsupported on the icon-only arm — the square treatment pins a 1:1 aspect ratio. */
  width?: never;
}

/**
 * `<Link appearance="button">` props, discriminated on the presence of `icon`:
 * the labelled ({@link LabelledButtonLinkProps}) or icon-only
 * ({@link IconButtonLinkProps}) arm.
 */
export type ButtonLinkProps = LabelledButtonLinkProps | IconButtonLinkProps;

/**
 * `<Link appearance="chip">` — a link that looks like a `Chip`, reusing Chip's
 * recipe (via `InternalChip`) but rendered on a real anchor. Deliberately one
 * anchor: only decorative `icon` / `trailIcon`, nothing action-bearing — Chip's
 * interactive adornments stay on `Chip`, since an `href` on `Chip` would nest
 * interactive elements.
 */
export interface ChipLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "color" | "aria-label"
> {
  /** The chip look. */
  appearance: "chip";
  /** Colour intent — same knob and default (`neutral`) as `Chip`. */
  intent?: Intent;
  /** Colour saliency — same knob and default (`mid`) as `Chip`. */
  saliency?: Saliency;
  /** Chip sizing (height / font / padding). Same default (`md`) as `Chip`. */
  size?: Size;
  /** The chip's silhouette: `square` (default) or `pill`. Same as `Chip`. */
  shape?: "square" | "pill";
  /**
   * `fit` (default) hugs the label; `fill` stretches to the container's width
   * (the label still truncates). Same as `Chip`.
   */
  width?: "fit" | "fill";
  /** Decorative leading icon — a bare glyph, an `<Icon>`, or a render function. */
  icon?: IconSlot<ChipIconState>;
  /** Decorative trailing icon — mirrors `icon`. */
  trailIcon?: IconSlot<ChipIconState>;
  /** Disables the link — collapses to an inert element while keeping chip styling. */
  disabled?: boolean;
  /** Explanation shown in a tooltip when disabled. */
  disabledReason?: React.ReactNode;
  /**
   * Router-link element for client-side navigation. Omit and pass `href` for a
   * plain external `<a>`, or set it once via a `LinkProvider`.
   */
  render?: RenderProp;
  /** Required visible text label (also the accessible name). */
  children: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
  /** Unsupported — the visible label is always the accessible name. */
  "aria-label"?: never;
}

/**
 * Link props, discriminated on `appearance` (and, within `appearance="button"`,
 * on the presence of `icon`): the default inline styled anchor
 * ({@link InlineLinkProps}), a button-styled link ({@link ButtonLinkProps} — a
 * labelled or icon-only arm), or a chip-styled link ({@link ChipLinkProps}).
 */
export type LinkProps = InlineLinkProps | ButtonLinkProps | ChipLinkProps;

/**
 * A router-agnostic link. By default an inline styled `<a>` that blends into
 * copy (primary intent, always underlined, with the shared focus ring).
 * `appearance="button"` makes it look like a `Button` (add `icon` + `aria-label`
 * for the icon-only arm); `appearance="chip"` makes it look like a `Chip` — each
 * reusing that component's recipe on a real anchor.
 *
 * For router integration pass `render` per link, or wrap the app in a
 * `LinkProvider` to route every internal `Link` at once (external / new-tab /
 * `download` links stay plain `<a>`, and a per-link `render` overrides the provider).
 */
export function Link(props: LinkProps) {
  const render = useLinkRender(props.render, props);

  if (props.appearance === "button") {
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
    const { appearance: _appearance, render: _render, ...chipProps } = props;
    return <InternalChip {...(chipProps as InternalChipProps)} render={render} />;
  }

  const { appearance: _appearance, render: _render, className, children, ref, ...rest } = props;
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
