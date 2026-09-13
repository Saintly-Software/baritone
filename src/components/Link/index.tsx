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

export interface InlineLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "color"
> {
  appearance?: "text";

  render?: RenderProp;
  ref?: React.Ref<HTMLAnchorElement>;
  children?: React.ReactNode;
}

interface ButtonLinkCommonProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "color" | "aria-label" | "children"
> {
  appearance: "button";
  intent?: Intent;
  saliency?: Saliency;

  size?: Size;

  loading?: boolean;

  disabled?: boolean;

  disabledReason?: React.ReactNode;

  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
}

export interface LabelledButtonLinkProps extends ButtonLinkCommonProps {
  startIcon?: IconSlot<ButtonIconState>;

  endIcon?: IconSlot<ButtonIconState>;

  width?: WidthShorthand;

  children: React.ReactNode;

  "aria-label"?: never;

  icon?: never;
}

export interface IconButtonLinkProps extends ButtonLinkCommonProps {
  icon: NonNullable<IconSlot<ButtonIconState>>;

  "aria-label": string;

  children?: never;

  startIcon?: never;

  endIcon?: never;

  width?: never;
}

export type ButtonLinkProps = LabelledButtonLinkProps | IconButtonLinkProps;

export interface ChipLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "color" | "aria-label"
> {
  appearance: "chip";

  intent?: Intent;

  saliency?: Saliency;

  size?: Size;

  shape?: "square" | "pill";

  width?: "fit" | "fill";

  icon?: IconSlot<ChipIconState>;

  trailIcon?: IconSlot<ChipIconState>;

  disabled?: boolean;

  disabledReason?: React.ReactNode;

  render?: RenderProp;

  children: React.ReactNode;
  ref?: React.Ref<HTMLElement>;

  "aria-label"?: never;
}

export type LinkProps = InlineLinkProps | ButtonLinkProps | ChipLinkProps;

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
