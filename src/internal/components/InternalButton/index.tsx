"use client";
import * as React from "react";
import type { ButtonProps } from "../../../components/Button";
import {
  componentIntentRecipe,
  componentTypographyRecipe,
} from "../../../styles/recipes/component.css";
import { focusRingRecipe } from "../../../styles/recipes/focusRing.css";
import { cx } from "../../../utils/cx";
import { mergeProps, useRender } from "../../../utils/render";
import { InternalTooltip } from "../InternalTooltip";
import {
  buttonBase,
  buttonContent,
  buttonContentLoading,
  buttonSpinner,
  buttonSpinnerIcon,
} from "./internalButton.css";

/**
 * Raw HTML attributes merged onto the rendered `<button>`. This is the seam for
 * base-ui's `render` callback: an overlay `Trigger`/`Close` hands the props it
 * computed (`onClick`, `aria-haspopup`, `aria-expanded`, `data-*`, `ref`, …)
 * straight through here, so the button stays the real interactive element with
 * no extra wrapper. (`ref` rides along in this object — that's base-ui's render
 * convention, see `HTMLProps`.)
 */
export type InternalButtonHtmlAttrs = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: React.Ref<HTMLButtonElement>;
};

export interface InternalButtonProps {
  /** The public `Button` API, exactly as a consumer set it. */
  consumerProps: ButtonProps;
  /**
   * Host-supplied attributes merged onto the button — typically the props a
   * base-ui `Trigger`/`Close` passes via its `render` callback. Merged the way
   * base-ui itself merges: `className`/`style` are joined, refs composed, event
   * handlers chained, and the consumer's own props win on conflict.
   */
  htmlAttrs?: InternalButtonHtmlAttrs;
}

/**
 * InternalButton — the implementation behind the public `Button`. It owns the
 * rendering: the shared colour/typography recipe, the focus ring, the
 * loading-spinner overlay, and the disabled-explanation tooltip. `Button` is a
 * thin wrapper that just forwards its props as `consumerProps`.
 *
 * The extra `htmlAttrs` seam is what lets the overlay components (`Drawer`,
 * `Modal`, `Popover`) use a real button as their trigger/close: each base-ui
 * `Trigger`/`Close` passes its computed props straight in via `render`, rather
 * than cloning a `<Button>` element and stacking a second layer of prop merging
 * on top of Button's own.
 *
 * **Internal by design — not exported from the package.** Like `InternalTooltip`
 * and `InternalCheckbox`, it's a building block the system composes from.
 */
export function InternalButton({ consumerProps, htmlAttrs }: InternalButtonProps) {
  const {
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
  } = consumerProps;

  // The host's click (e.g. a Trigger's open/close toggle) rides in on `htmlAttrs`.
  // Pull it out so the disabled guard below gates it alongside the consumer's
  // onClick — everything else from the host is merged structurally further down.
  const { onClick: hostOnClick, ...hostAttrs } = htmlAttrs ?? {};

  const isDisabled = disabled || loading;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      // No `disabled` attribute means the click (incl. Enter/Space and form
      // submit) still fires — swallow it ourselves before the host's handler, so
      // a disabled trigger can't still toggle its drawer/modal/popover.
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
    hostOnClick?.(event);
  };

  // The button's own props; `hostAttrs` is merged underneath these below so the
  // consumer's intent always wins on conflict.
  const ownProps = {
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
  };

  const button = useRender({
    render,
    defaultElement: "button",
    // When the button is a host's trigger/close, merge the host attributes the
    // way base-ui would (className/style joined, refs composed, handlers chained)
    // with the consumer's props winning. `onClick` was pulled out above and is
    // already folded into `handleClick`, so it isn't double-applied here.
    props: htmlAttrs ? mergeProps(hostAttrs as Record<string, unknown>, ownProps) : ownProps,
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
