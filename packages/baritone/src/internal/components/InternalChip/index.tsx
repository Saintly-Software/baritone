"use client";
import * as React from "react";
import {
  chipLabelRecipe,
  chipShapeRecipe,
  chipSizeRecipe,
  chipWidthRecipe,
} from "../../../components/Chip/chip.css";
import { chipAdornmentRecipe } from "../../../components/Chip/chipAdornment.css";
import type { ChipIconState } from "../../../components/Chip";
import { type IconSlot, renderIcon } from "../../../components/Icon/renderIcon";
import {
  componentIntentRecipe,
  componentTypographyRecipe,
} from "../../../styles/recipes/component.css";
import { focusRingRecipe } from "../../../styles/recipes/focusRing.css";
import type { Intent, Saliency, Size } from "../../../theme/constants";
import { cx } from "../../../utils/cx";
import type { RenderProp } from "../../../utils/render";
import {
  InternalGenericButtonAnchor,
  type InternalGenericButtonAnchorProps,
} from "../InternalGenericButtonAnchor";
import { InternalTooltip } from "../InternalTooltip";

export interface ChipBoxVariants {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;

  shape?: "square" | "pill";

  width?: "fit" | "fill";
}

export function chipBoxClassName({
  intent,
  saliency,
  size,
  shape,
  width,
}: ChipBoxVariants): string {
  return cx(
    componentTypographyRecipe({ size, interactive: "auto" }),
    chipSizeRecipe({ size }),
    chipShapeRecipe({ shape }),
    chipWidthRecipe({ width }),
    componentIntentRecipe({ intent, saliency, interactive: "auto" }),
    focusRingRecipe({ type: "visible" }),
  );
}

export interface InternalChipProps
  extends
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "aria-label">,
    ChipBoxVariants {
  icon?: IconSlot<ChipIconState>;

  trailIcon?: IconSlot<ChipIconState>;

  disabled?: boolean;

  disabledReason?: React.ReactNode;

  render?: RenderProp;

  children: React.ReactNode;
  ref?: React.Ref<HTMLElement>;

  "aria-label"?: never;
}

export function InternalChip({
  intent,
  saliency,
  size = "md",
  shape,
  width,
  icon,
  trailIcon,
  disabled = false,
  disabledReason,
  render,
  href,
  target,
  rel,
  className,
  children,
  ref,
  "aria-label": _ariaLabel,
  ...rest
}: InternalChipProps) {
  const iconState = { intent, saliency, size, disabled };
  const iconNode = renderIcon(icon, { state: iconState });
  const trailIconNode = renderIcon(trailIcon, { state: iconState });
  const chip = (
    <InternalGenericButtonAnchor
      {...(rest as InternalGenericButtonAnchorProps)}
      ref={ref}
      render={render}
      href={href}
      target={target}
      rel={rel}
      disabled={disabled}
      className={cx(chipBoxClassName({ intent, saliency, size, shape, width }), className)}
    >
      {iconNode != null && (
        <span aria-hidden="true" className={chipAdornmentRecipe({ size })}>
          {iconNode}
        </span>
      )}
      <span className={chipLabelRecipe()}>{children}</span>
      {trailIconNode != null && (
        <span aria-hidden="true" className={chipAdornmentRecipe({ size })}>
          {trailIconNode}
        </span>
      )}
    </InternalGenericButtonAnchor>
  );

  if (disabledReason == null) {
    return chip;
  }

  return (
    <InternalTooltip content={disabledReason} disabled={!disabled}>
      {chip}
    </InternalTooltip>
  );
}
