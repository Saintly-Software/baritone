"use client";
import * as React from "react";
import type { ButtonProps } from "../../../components/Button";
import { useIsFieldDisabled } from "../../../components/Fieldset";
import {
  componentIntentRecipe,
  componentTypographyRecipe,
} from "../../../styles/recipes/component.css";
import { focusRingRecipe } from "../../../styles/recipes/focusRing.css";
import { textVariantRecipe } from "../../../styles/recipes/text.css";
import { cx } from "../../../utils/cx";
import { mergeProps } from "../../../utils/render";
import {
  InternalGenericButtonAnchor,
  type InternalGenericButtonAnchorProps,
} from "../InternalGenericButtonAnchor";
import { InternalSpinner } from "../InternalSpinner";
import { InternalTooltip } from "../InternalTooltip";
import {
  buttonBase,
  buttonContent,
  buttonContentLoading,
  buttonSpinner,
  buttonSquare,
  textButtonRecipe,
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
 * button-specific chrome: the shared colour/typography recipe, the focus ring,
 * the loading-spinner overlay, and the disabled-explanation tooltip. The element
 * itself is rendered by `InternalGenericButtonAnchor`, which owns the element
 * rendering (a `<button>`), the `type` default, and the shared disabled model
 * (`aria-disabled` + swallowed activation). `Button` is a thin wrapper that just
 * forwards its props as `consumerProps`.
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
    appearance,
    intent,
    saliency,
    size,
    variant,
    children,
    disabled: disabledProp = false,
    loading = false,
    startIcon,
    endIcon,
    icon,
    disabledReason,
    type,
    onClick,
    className,
    ref,
    // Destructured out of `rest` so it's never blindly forwarded to the DOM. On a
    // labelled button the accessible name must be the visible label, so a
    // (type-`never`) `aria-label` is dropped here — a cast/JS caller can't sneak
    // it on. On the icon-only arm it *is* the name, so it's forwarded explicitly
    // below when `icon` is present.
    "aria-label": ariaLabel,
    ...rest
  } = consumerProps;

  // Icon-only look: `<Button icon aria-label>` renders a single centred glyph in
  // a square box, named by the required `aria-label`. `icon` is the union
  // discriminant, so its presence is what puts the button in this mode.
  const isIconOnly = icon != null;

  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  // The hyperlink look: underlined text coloured by intent/saliency, no chrome.
  // `size`/`loading` are typed away on this appearance, so there's no spinner
  // overlay — just the icons around the label.
  const isText = appearance === "text";

  // The host's click (e.g. a Trigger's open/close toggle) rides in on `htmlAttrs`.
  // Pull it out so it's chained into `handleClick` (and thus gated by the
  // primitive's disabled guard) — everything else from the host is merged
  // structurally further down.
  const { onClick: hostOnClick, ...hostAttrs } = htmlAttrs ?? {};

  // `loading` is a solid-only feature (no chrome to overlay a spinner on the
  // text look). Ignore it on the text appearance even if a JS caller forces it.
  const isLoading = loading && !isText;
  const isDisabled = disabled || isLoading;

  // Chain the consumer's and the host's onClick. The disabled *guard* now lives in
  // `InternalGenericButtonAnchor` (it swallows the activation before this runs), so
  // a disabled trigger still can't toggle its drawer/modal/popover.
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    hostOnClick?.(event);
  };

  // The text appearance drops the component chrome for a link-like recipe and
  // takes its typography from `variant` (a body size) instead of `size`; the
  // default appearance keeps the shared component recipe + `size`.
  const appearanceClassName = isText
    ? cx(
        textButtonRecipe({ intent, saliency }),
        textVariantRecipe({ family: "body", size: variant }),
      )
    : cx(
        buttonBase,
        componentTypographyRecipe({ size }),
        componentIntentRecipe({ intent, saliency }),
        // Square the box (drop inline padding, pin 1:1) for the icon-only look.
        isIconOnly && buttonSquare,
      );

  // The button's own props; `hostAttrs` is merged underneath these below so the
  // consumer's intent always wins on conflict. `InternalGenericButtonAnchor` owns
  // the element rendering (a `<button>`), the `type` default, and the disabled
  // model (`aria-disabled` + swallowed activation); this layer adds the
  // recipe/focus-ring classes, the loading `aria-busy`, and the icon/spinner label.
  const ownProps = {
    ref,
    type,
    disabled: isDisabled,
    className: cx(appearanceClassName, focusRingRecipe({ type: "visible" }), className),
    "aria-busy": isLoading || undefined,
    // The icon-only arm has no visible text, so its required `aria-label` is the
    // accessible name and is forwarded here. Labelled buttons never reach this
    // (their `aria-label` is type-`never` and was dropped above).
    ...(isIconOnly && ariaLabel != null ? { "aria-label": ariaLabel } : {}),
    onClick: handleClick,
    children: (
      <>
        <span className={cx(buttonContent, isLoading && buttonContentLoading)}>
          {isIconOnly ? (
            icon
          ) : (
            <>
              {startIcon}
              {children}
              {endIcon}
            </>
          )}
        </span>
        {isLoading && (
          <span className={buttonSpinner} aria-hidden>
            <InternalSpinner />
          </span>
        )}
      </>
    ),
    ...rest,
  };

  // When the button is a host's trigger/close, merge the host attributes the way
  // base-ui would (className/style joined, refs composed, handlers chained) with
  // the consumer's props winning. `onClick` was pulled out above and is already
  // folded into `handleClick`, so it isn't double-applied here.
  const finalProps = (
    htmlAttrs ? mergeProps(hostAttrs as Record<string, unknown>, ownProps) : ownProps
  ) as InternalGenericButtonAnchorProps;

  const button = <InternalGenericButtonAnchor {...finalProps} />;

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
      disabled={!(disabled && !isLoading)}
    >
      {button}
    </InternalTooltip>
  );
}
