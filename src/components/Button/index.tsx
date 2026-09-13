"use client";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { WidthShorthand } from "../../styles/layoutProps";
import type { Intent, Saliency, Size, TextSize } from "../../theme/constants";
import type { IconSlot } from "../Icon/renderIcon";

export interface ButtonIconState {
  intent?: Intent;
  saliency?: Saliency;

  size?: Size;
  loading: boolean;
  disabled: boolean;
}

interface ButtonCommonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color" | "aria-label" | "children" | "disabled"
> {
  intent?: Intent;
  saliency?: Saliency;

  disabled?: boolean;

  disabledReason?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

export interface ButtonBaseProps extends ButtonCommonProps {
  children: React.ReactNode;

  "aria-label"?: never;

  startIcon?: IconSlot<ButtonIconState>;

  endIcon?: IconSlot<ButtonIconState>;

  icon?: never;
}

export interface SolidButtonProps extends ButtonBaseProps {
  appearance?: "solid";
  size?: Size;

  loading?: boolean;

  width?: WidthShorthand;

  variant?: never;
}

export interface TextButtonProps extends ButtonBaseProps {
  appearance: "text";

  variant?: TextSize;

  size?: never;

  loading?: never;

  width?: never;
}

export interface IconButtonProps extends ButtonCommonProps {
  appearance?: "solid";

  icon: NonNullable<IconSlot<ButtonIconState>>;

  "aria-label": string;
  size?: Size;

  loading?: boolean;

  children?: never;

  startIcon?: never;

  endIcon?: never;

  variant?: never;

  width?: never;
}

export type ButtonProps = SolidButtonProps | TextButtonProps | IconButtonProps;

export function Button(props: ButtonProps) {
  return <InternalButton consumerProps={props} />;
}
