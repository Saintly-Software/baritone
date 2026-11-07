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

export type InternalButtonHtmlAttrs = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: React.Ref<HTMLButtonElement>;
};

export interface InternalButtonAnchorSeam {
  render?: RenderProp;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
}

export interface InternalButtonProps {
  consumerProps: ButtonProps & InternalButtonAnchorSeam;

  htmlAttrs?: InternalButtonHtmlAttrs;
}

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
