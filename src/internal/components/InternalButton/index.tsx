"use client";
import * as React from "react";
import type { ButtonIconState, ButtonProps } from "../../../components/Button";
import { useIsFieldDisabled } from "../../../components/Fieldset";
import { renderIcon } from "../../../components/Icon/renderIcon";
import {
  componentIntentRecipe,
  componentTypographyRecipe,
} from "../../../styles/recipes/component.css";
import { resolveWidth } from "../../../styles/layoutProps";
import { focusRingRecipe } from "../../../styles/recipes/focusRing.css";
import { textSizeRecipe } from "../../../styles/recipes/text.css";
import { atoms } from "../../../styles/sprinkles.css";
import { cx } from "../../../utils/cx";
import { mergeProps, type RenderProp } from "../../../utils/render";
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
 * Raw HTML attributes merged onto the rendered `<button>` — the seam for
 * base-ui's `render` callback: an overlay `Trigger`/`Close` hands its computed
 * props (`onClick`, `aria-haspopup`, `data-*`, `ref`, …) straight through, so
 * the button stays the real interactive element with no extra wrapper.
 */
export type InternalButtonHtmlAttrs = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * The link seam: when any of these is set, `InternalGenericButtonAnchor` renders
 * the button chrome onto an `<a>`/router-link instead of a `<button>`. `Button`
 * never sets them; `Link`'s `appearance="button"` arm supplies them to reuse
 * this recipe rather than duplicate it.
 */
export interface InternalButtonAnchorSeam {
  render?: RenderProp;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
}

export interface InternalButtonProps {
  /**
   * The public `Button` API as the consumer set it, optionally widened with
   * {@link InternalButtonAnchorSeam} so a button-styled `Link` can reuse this
   * chrome on an anchor.
   */
  consumerProps: ButtonProps & InternalButtonAnchorSeam;
  /**
   * Host-supplied attributes merged onto the button — typically what a base-ui
   * `Trigger`/`Close` passes via `render`. Merged base-ui-style: `className`/
   * `style` joined, refs composed, handlers chained, consumer props win.
   */
  htmlAttrs?: InternalButtonHtmlAttrs;
}

/**
 * InternalButton — the implementation behind the public `Button`. It owns the
 * button-specific chrome: the colour/typography recipe, focus ring, loading
 * spinner, and disabled-explanation tooltip. `InternalGenericButtonAnchor`
 * renders the actual element and owns the `type` default and disabled model
 * (`aria-disabled` + swallowed activation); `Button` just forwards its props
 * as `consumerProps`.
 *
 * The `htmlAttrs` seam lets overlay components (`Drawer`, `Modal`, `Popover`)
 * use a real button as their trigger/close: base-ui passes computed props
 * straight in via `render`, instead of cloning a `<Button>` and stacking a
 * second layer of prop merging.
 *
 * **Internal by design — not exported from the package**, like
 * `InternalTooltip` and `InternalCheckbox`.
 */
export function InternalButton({ consumerProps, htmlAttrs }: InternalButtonProps) {
  const {
    appearance,
    intent,
    saliency,
    size,
    variant,
    // Pulled out so it never reaches the DOM — resolved to an atoms class
    // below, and invalid as an HTML attribute anyway.
    width,
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
    // On a labelled button the accessible name must be the visible label, so
    // `aria-label` (type-`never` here) is dropped rather than forwarded. On the
    // icon-only arm it *is* the name, forwarded explicitly below.
    "aria-label": ariaLabel,
    ...rest
  } = consumerProps;

  // Icon-only look: `icon` is the union discriminant that puts the button in
  // this mode, rendering a centred glyph in a square box named by `aria-label`.
  const isIconOnly = icon != null;

  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  // The hyperlink look: underlined text, no chrome. `size`/`loading` are typed
  // away on this appearance, so there's no spinner overlay.
  const isText = appearance === "text";

  // The host's click (e.g. a Trigger's toggle) rides in on `htmlAttrs`. Pull it
  // out so it chains into `handleClick`, gated by the disabled guard.
  const { onClick: hostOnClick, ...hostAttrs } = htmlAttrs ?? {};

  // `loading` is solid-only — no chrome to overlay a spinner on the text look —
  // so it's ignored there even if a JS caller forces it.
  const isLoading = loading && !isText;

  // A loading button is non-interactive, so it reads as disabled everywhere.
  const isDisabled = disabled || isLoading;
  // The button's resolved state, handed to an icon render function to branch on.
  const iconState: ButtonIconState = {
    intent,
    saliency,
    size,
    loading: isLoading,
    disabled: isDisabled,
  };

  // Chain the consumer's and host's onClick. The disabled guard lives in
  // `InternalGenericButtonAnchor`, which swallows activation before this runs.
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    hostOnClick?.(event);
  };

  // The text appearance drops the component chrome for a link-like recipe and
  // takes typography from `variant` instead of `size`.
  const appearanceClassName = isText
    ? cx(textButtonRecipe({ intent, saliency }), textSizeRecipe({ size: variant }))
    : cx(
        buttonBase,
        componentTypographyRecipe({ size }),
        componentIntentRecipe({ intent, saliency }),
        // Square the box (drop inline padding, pin 1:1) for the icon-only look.
        isIconOnly && buttonSquare,
      );

  // The button's own props; `hostAttrs` merges underneath so the consumer wins
  // on conflict. `InternalGenericButtonAnchor` owns the element and disabled
  // model; this layer adds the recipe/focus-ring classes and loading state.
  const ownProps = {
    ref,
    type,
    disabled: isDisabled,
    className: cx(
      appearanceClassName,
      focusRingRecipe({ type: "visible" }),
      // Layered after the recipe so it wins; unset `width` leaves the button
      // hugging its label.
      width && atoms({ width: resolveWidth(width) }),
      className,
    ),
    "aria-busy": isLoading || undefined,
    // The icon-only arm has no visible text, so its required `aria-label` is
    // forwarded here as the accessible name. Labelled buttons never reach this.
    ...(isIconOnly && ariaLabel != null ? { "aria-label": ariaLabel } : {}),
    onClick: handleClick,
    children: (
      <>
        <span className={cx(buttonContent, isLoading && buttonContentLoading)}>
          {isIconOnly ? (
            renderIcon(icon, { state: iconState })
          ) : (
            <>
              {renderIcon(startIcon, { state: iconState })}
              {children}
              {renderIcon(endIcon, { state: iconState })}
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

  // Merge host attributes the way base-ui would, with the consumer's props
  // winning. `onClick` was already pulled out above into `handleClick`.
  const finalProps = (
    htmlAttrs ? mergeProps(hostAttrs as Record<string, unknown>, ownProps) : ownProps
  ) as InternalGenericButtonAnchorProps;

  const button = <InternalGenericButtonAnchor {...finalProps} />;

  // Skip the tooltip machinery entirely when there's nothing to explain.
  if (disabledReason == null) {
    return button;
  }

  return (
    <InternalTooltip
      content={disabledReason}
      // Only openable while disabled-but-not-loading, keeping the tree stable
      // as the button toggles states.
      disabled={!(disabled && !isLoading)}
    >
      {button}
    </InternalTooltip>
  );
}
