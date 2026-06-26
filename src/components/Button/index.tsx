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
import { InternalTooltip } from "../../internal/components/InternalTooltip";
import {
  buttonBase,
  buttonContent,
  buttonContentLoading,
  buttonSpinner,
  buttonSpinnerIcon,
} from "./button.css";

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  // Colour comes from intent/saliency, not `color`.
  | "color"
  // The label is the accessible name; an `aria-label` would silently override
  // it, so the API intentionally doesn't expose one.
  | "aria-label"
  // Disabled is modelled with `aria-disabled` (see below), and the label is
  // required, so both are redefined.
  | "disabled"
  | "children"
> {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  /** Required visible text label (also the accessible name). */
  children: React.ReactNode;
  /**
   * Unsupported: the accessible name is always the visible label, so passing an
   * `aria-label` (which would silently override it) is a type error.
   */
  "aria-label"?: never;
  /**
   * Disables the button. Applied as `aria-disabled` (not the `disabled`
   * attribute) so the button stays keyboard-focusable and can surface its
   * `disabledReason` tooltip. Clicks/keyboard activation are suppressed.
   */
  disabled?: boolean;
  /**
   * Loading state: disables interaction and overlays a spinner on the label
   * (the label stays in place to preserve width and the accessible name). The
   * disabled tooltip is suppressed while loading.
   */
  loading?: boolean;
  /** Icon placed before the label. Typically an `<Icon>`; inherits text colour. */
  startIcon?: React.ReactNode;
  /** Icon placed after the label. Typically an `<Icon>`; inherits text colour. */
  endIcon?: React.ReactNode;
  /**
   * Explanation shown in a tooltip when the button is disabled and the user
   * tabs to or hovers it. Not shown in the `loading` state.
   */
  disabledReason?: React.ReactNode;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Button — a "component" element type. Shares the colour scheme/recipe with
 * `Chip` et al., so `<Button intent="negative" saliency="high">` matches a
 * `<Chip>` with the same props. Hover/active states are derived from tokens at
 * use-site.
 *
 * Disabled uses `aria-disabled` (keyboard-reachable) so a disabled button can
 * explain itself via `disabledReason`; loading overlays a spinner on the label.
 */
export function Button({
  intent,
  saliency,
  size,
  children,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  disabledReason,
  type,
  onClick,
  render,
  className,
  ref,
  // Dropped, never forwarded: the accessible name must be the visible label, so
  // an `aria-label` (which would override it) is intentionally unsupported. The
  // interface types it as `never`, but strip it here so a cast/JS caller can't
  // sneak it onto the DOM.
  "aria-label": _unsupportedAriaLabel,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      // No `disabled` attribute means the click (incl. Enter/Space and form
      // submit) still fires — swallow it ourselves.
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  const button = useRender({
    render,
    defaultElement: "button",
    props: {
      ref,
      // Default to a non-submitting button; let consumers opt into submit/reset.
      type: type ?? "button",
      className: cx(
        buttonBase,
        componentTypographyRecipe({ size }),
        componentIntentRecipe({ intent, saliency }),
        focusRingRecipe({ type: "visible" }),
        className,
      ),
      "aria-disabled": isDisabled || undefined,
      "aria-busy": loading || undefined,
      onClick: handleClick,
      children: (
        <>
          <span className={cx(buttonContent, loading && buttonContentLoading)}>
            {startIcon}
            {children}
            {endIcon}
          </span>
          {loading && (
            <span className={buttonSpinner} aria-hidden>
              <span className={buttonSpinnerIcon} />
            </span>
          )}
        </>
      ),
      ...rest,
    },
  });

  // The tooltip only exists to explain a disabled button; skip the machinery
  // entirely when there's nothing to explain.
  if (disabledReason == null) {
    return button;
  }

  return (
    <InternalTooltip
      content={disabledReason}
      // Only openable while disabled-but-not-loading; keeps the tree stable as
      // the button toggles between states.
      disabled={!(disabled && !loading)}
    >
      {button as React.ReactElement}
    </InternalTooltip>
  );
}
