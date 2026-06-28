"use client";
import * as React from "react";
import {
  componentIntentRecipe,
  componentTypographyRecipe,
} from "../../styles/recipes/component.css";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { chipLabelRecipe, chipShapeRecipe, chipSizeRecipe, chipSpinner } from "./chip.css";
import { chipAdornmentRecipe } from "./chipAdornment.css";

/**
 * What a Chip publishes to its adornments. The adornment never needs the chip's
 * *intent* (it inherits the chip's colour via `--iconColor`, or overrides it
 * with its own `intent`), but it does need the chip's `saliency` to tint an
 * override at the right shade, and the chip's `disabled` so a clickable
 * adornment goes inert with the chip.
 */
interface ChipAdornmentContextValue {
  saliency?: Saliency;
  disabled?: boolean;
}

const ChipAdornmentContext = React.createContext<ChipAdornmentContextValue>({});

interface ChipAdornmentBaseProps {
  /**
   * The icon to render. Typically an `<Icon>` (or an `<svg>` drawn with
   * `currentColor`); it inherits the chip's foreground unless `intent` overrides
   * it.
   */
  icon: React.ReactNode;
  /**
   * Colour intent for this adornment. Defaults to the parent Chip's intent (the
   * adornment simply inherits its colour); set this to tint just this adornment
   * a different intent. It keeps the chip's saliency.
   */
  intent?: Intent;
}

/**
 * A plain, non-interactive adornment — just a decorative or labelled icon.
 * Provide `label` to give it an accessible name (`role="img"`); omit it for a
 * purely decorative glyph.
 */
export interface ChipRegularAdornmentProps extends ChipAdornmentBaseProps {
  /** Accessible name. Omit for a decorative icon. */
  label?: string;
  onClick?: never;
  href?: never;
  disabled?: never;
  render?: never;
}

/**
 * A clickable adornment — renders a real `<button>`. Use for an action attached
 * to the chip, e.g. a remove "×".
 */
export interface ChipButtonAdornmentProps extends ChipAdornmentBaseProps {
  /** Activation handler. Makes the adornment a `<button>`. Suppressed while inert. */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Required accessible name for the icon-only button. */
  label: string;
  /**
   * Disables the button. Applied as `aria-disabled` (never the native attribute)
   * so it stays keyboard-focusable; the click is swallowed. A disabled Chip also
   * makes its clickable adornments inert.
   */
  disabled?: boolean;
  href?: never;
  render?: never;
}

/**
 * A link adornment — renders a real `<a>` (or your router's link via `render`).
 */
export interface ChipLinkAdornmentProps extends ChipAdornmentBaseProps {
  /** Destination. Makes the adornment an `<a>`. */
  href: string;
  /** Required accessible name for the icon-only link. */
  label: string;
  /**
   * Render as a different element/component (base-ui `render` pattern) — e.g.
   * your router's link — while keeping the styling. Renders a plain `<a>` when
   * omitted.
   */
  render?: RenderProp;
  onClick?: never;
  disabled?: never;
}

/**
 * A Chip adornment, as one of three shapes:
 *   - **regular** — a decorative/labelled icon (default),
 *   - **button** — pass `onClick` (+ required `label`) for a clickable control,
 *   - **link** — pass `href` (+ required `label`) for a navigable link.
 */
export type ChipAdornmentProps =
  | ChipRegularAdornmentProps
  | ChipButtonAdornmentProps
  | ChipLinkAdornmentProps;

/** A small "×" glyph; decorative — the remove adornment carries the accessible name. */
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

/**
 * Chip.Adornment — a small icon slotted before/after a Chip's label via the
 * `leadAdornments` / `trailAdornments` props (or dropped directly in the Chip's
 * children). It inherits the Chip's colour and (for clickable kinds) its
 * disabled state through context, and is one of three kinds discriminated by its
 * props: a regular icon, a `<button>` (`onClick`), or an `<a>` (`href`).
 */
function ChipAdornment(props: ChipAdornmentProps) {
  const { icon, intent, label, onClick, href, disabled, render } = props;
  const { saliency = "mid", disabled: chipDisabled = false } =
    React.useContext(ChipAdornmentContext);

  const interactive = href != null || onClick != null;
  const overriding = intent != null;
  // Only the clickable kinds can be inert; a disabled chip drags them along.
  const inert = interactive && (disabled === true || chipDisabled);

  const className = cx(
    chipAdornmentRecipe({
      interactive,
      // Pass intent+saliency only to override; omitting both inherits the chip's.
      intent: overriding ? intent : undefined,
      saliency: overriding ? saliency : undefined,
    }),
    interactive && focusRingRecipe({ type: "visible", offset: "sm" }),
  );

  const handleActivate = (event: React.MouseEvent<HTMLElement>) => {
    if (inert) {
      // No native `disabled` (and `<a>` has none), so the activation still fires
      // — swallow it ourselves so the control stays focusable but inert.
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event as React.MouseEvent<HTMLButtonElement>);
  };

  const elementProps: Record<string, unknown> = { className, children: icon };

  if (href != null) {
    elementProps.href = href;
    elementProps["aria-label"] = label;
    elementProps["aria-disabled"] = inert || undefined;
    elementProps.onClick = handleActivate;
  } else if (onClick != null) {
    elementProps.type = "button";
    elementProps["aria-label"] = label;
    elementProps["aria-disabled"] = inert || undefined;
    elementProps.onClick = handleActivate;
  } else if (label != null) {
    // Regular, named: expose the icon as an image with the given name.
    elementProps.role = "img";
    elementProps["aria-label"] = label;
  }

  return useRender({
    render: href != null ? render : undefined,
    defaultElement: href != null ? "a" : onClick != null ? "button" : "span",
    props: elementProps,
  });
}

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  /**
   * The chip's silhouette. `square` (default) keeps the shared component radius —
   * softly rounded corners, the chip as it is by design. `pill` fully rounds the
   * ends into a Bootstrap-style pill/badge.
   */
  shape?: "square" | "pill";
  /** Uses `aria-disabled` (keyboard-focusable) rather than `disabled`. */
  disabled?: boolean;
  /**
   * Makes the chip's text label clickable: the label renders as a real
   * `<button>` (keyboard-focusable, Enter/Space-activated) and this fires on
   * activation. Only the label is the hit target — adornments keep their own
   * actions. A disabled chip makes the label inert but still focusable
   * (`aria-disabled`, never the native attribute), swallowing the click. Has no
   * effect without text `children`.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /**
   * Loading state: replaces the chip's entire content — both adornment lists and
   * the label — with a centred spinner, and marks the chip `aria-busy` and inert
   * (`aria-disabled`, like `disabled`). The chip keeps its height; its width
   * collapses to fit the spinner.
   */
  loading?: boolean;
  /** Adornments rendered before the label — each a `<Chip.Adornment>`. */
  leadAdornments?: Array<React.ReactElement<ChipAdornmentProps>>;
  /** Adornments rendered after the label — each a `<Chip.Adornment>`. */
  trailAdornments?: Array<React.ReactElement<ChipAdornmentProps>>;
  /**
   * When provided, appends a built-in clickable remove "×" adornment that calls
   * this on activation. It always sits last among the trailing adornments, after
   * any `trailAdornments` you supply. Like any clickable adornment it inherits
   * the chip's disabled state — inert but still keyboard-focusable
   * (`aria-disabled`) when the chip is `disabled`.
   */
  handleRemove?: () => void;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  /**
   * The chip's text label, and only text — a single string (or an array of
   * strings, e.g. interpolated `{a}/{b}`). Icons and actions go through
   * `leadAdornments` / `trailAdornments` (each a `Chip.Adornment`), never the
   * children, so the chip can wrap the label in its own truncating element.
   */
  children?: string | string[];
}

/**
 * Chip — a "component" element type. Shares the colour scheme/recipe with Button
 * et al., so `<Chip intent="negative" saliency="high">` matches a Button with
 * the same props. Hover/active states are derived from tokens at use-site.
 *
 * Decorate it with `Chip.Adornment`s via `leadAdornments` / `trailAdornments`
 * (icons that can also be a `<button>` or an `<a>`); they inherit the chip's
 * colour and disabled state, and the chip's flex layout spaces them around the
 * label.
 */
function ChipRoot({
  intent,
  saliency,
  size,
  shape,
  disabled,
  loading = false,
  leadAdornments,
  trailAdornments,
  handleRemove,
  render,
  className,
  children,
  onClick,
  ref,
  ...rest
}: ChipProps) {
  const adornmentContext = React.useMemo<ChipAdornmentContextValue>(
    () => ({ saliency, disabled }),
    [saliency, disabled],
  );

  // A clickable label is a real `<button>`; a disabled chip keeps it focusable
  // but inert, so swallow the activation ourselves (no native `disabled`) —
  // mirrors Chip.Adornment. `loading` already swaps the label out for the
  // spinner, so `disabled` is the only inert case the button itself can hit.
  const handleLabelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  return useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(
        componentTypographyRecipe({ size }),
        chipSizeRecipe({ size }),
        chipShapeRecipe({ shape }),
        componentIntentRecipe({ intent, saliency }),
        focusRingRecipe({ type: "visible" }),
        className,
      ),
      "aria-disabled": disabled || loading || undefined,
      "aria-busy": loading || undefined,
      // Loading swaps the whole content out for a decorative spinner; the
      // recipe's flex-centring places it and `aria-busy` announces the state.
      children: loading ? (
        <span className={chipSpinner} aria-hidden />
      ) : (
        <ChipAdornmentContext.Provider value={adornmentContext}>
          {/* `Children.toArray` assigns stable keys to the positional lists. */}
          {React.Children.toArray(leadAdornments)}
          {/* Children are text-only, so the chip owns the label element — one
              flex item it can truncate, sat between the adornment lists. With an
              `onClick` it becomes a real `<button>` so the label is the
              keyboard-focusable hit target; otherwise it's a plain span. */}
          {children != null &&
            (onClick != null ? (
              <button
                type="button"
                className={cx(
                  chipLabelRecipe({ interactive: true }),
                  focusRingRecipe({ type: "visible", offset: "sm" }),
                )}
                aria-disabled={disabled || undefined}
                onClick={handleLabelClick}
              >
                {children}
              </button>
            ) : (
              <span className={chipLabelRecipe()}>{children}</span>
            ))}
          {React.Children.toArray(trailAdornments)}
          {/* The built-in remove "×" always sits last, after any supplied
              trailing adornments. It's a clickable adornment, so it inherits the
              chip's disabled state through context (inert but focusable). */}
          {handleRemove != null && (
            <ChipAdornment icon={<CloseGlyph />} label="Remove" onClick={handleRemove} />
          )}
        </ChipAdornmentContext.Provider>
      ),
      ...rest,
    },
  });
}

ChipRoot.displayName = "Chip";
ChipAdornment.displayName = "Chip.Adornment";

/** Chip with its `Adornment` part attached. */
export const Chip = Object.assign(ChipRoot, {
  Adornment: ChipAdornment,
});
