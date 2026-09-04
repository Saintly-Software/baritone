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

/**
 * The link seam: when any of these is set, `InternalGenericButtonAnchor` renders
 * the button chrome onto an `<a>`/router-link instead of a `<button>`. `Button`
 * itself never sets them (they stay `undefined`, so it's always a real button);
 * `Link`'s `appearance="button"` arm supplies them to get a button-styled link
 * that reuses this recipe wholesale rather than duplicating the styles.
 */
export interface InternalButtonAnchorSeam {
  render?: RenderProp;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
}

export interface InternalButtonProps {
  /**
   * The public `Button` API, exactly as a consumer set it — optionally widened
   * with the {@link InternalButtonAnchorSeam} so a button-styled link (`Link`'s
   * `appearance="button"`) can render the same chrome on an anchor.
   */
  consumerProps: ButtonProps & InternalButtonAnchorSeam;
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
    "aria-label": ariaLabel,
    ...rest
  } = consumerProps;

  const isIconOnly = icon != null;

  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  const isText = appearance === "text";

  const { onClick: hostOnClick, ...hostAttrs } = htmlAttrs ?? {};

  const isLoading = loading && !isText;

  const isDisabled = disabled || isLoading;
  const iconState: ButtonIconState = {
    intent,
    saliency,
    size,
    loading: isLoading,
    disabled: isDisabled,
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    hostOnClick?.(event);
  };

  const appearanceClassName = isText
    ? cx(textButtonRecipe({ intent, saliency }), textSizeRecipe({ size: variant }))
    : cx(
        buttonBase,
        componentTypographyRecipe({ size }),
        componentIntentRecipe({ intent, saliency }),
        isIconOnly && buttonSquare,
      );

  const ownProps = {
    ref,
    type,
    disabled: isDisabled,
    className: cx(
      appearanceClassName,
      focusRingRecipe({ type: "visible" }),
      width && atoms({ width: resolveWidth(width) }),
      className,
    ),
    "aria-busy": isLoading || undefined,
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

  const finalProps = (
    htmlAttrs ? mergeProps(hostAttrs as Record<string, unknown>, ownProps) : ownProps
  ) as InternalGenericButtonAnchorProps;

  const button = <InternalGenericButtonAnchor {...finalProps} />;

  if (disabledReason == null) {
    return button;
  }

  return (
    <InternalTooltip content={disabledReason} disabled={!(disabled && !isLoading)}>
      {button}
    </InternalTooltip>
  );
}
