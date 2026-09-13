"use client";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import type { SolidButtonProps } from "../Button";
import { buttonGroupItemRecipe, buttonGroupRoot } from "./buttonGroup.css";

export type ButtonGroupItemProps = Omit<SolidButtonProps, "size" | "appearance" | "variant">;

export function ButtonGroupItem(_props: ButtonGroupItemProps): React.ReactNode {
  return null;
}
ButtonGroupItem.displayName = "ButtonGroup.Item";

export interface ButtonGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "color" | "children"
> {
  items: React.ReactElement<ButtonGroupItemProps>[];

  intent?: Intent;

  saliency?: Saliency;

  size?: Size;

  ref?: React.Ref<HTMLDivElement>;
}

export function ButtonGroup({
  items,
  intent,
  saliency,
  size,
  className,
  ref,
  ...rest
}: ButtonGroupProps) {
  const count = items.length;

  return (
    <div ref={ref} role="group" className={cx(buttonGroupRoot, className)} {...rest}>
      {items.map((item, index) => {
        const position =
          count === 1 ? "only" : index === 0 ? "first" : index === count - 1 ? "last" : "middle";

        const consumerProps: SolidButtonProps = {
          ...item.props,
          size,
          intent: item.props.intent ?? intent,
          saliency: item.props.saliency ?? saliency,
          className: cx(buttonGroupItemRecipe({ position }), item.props.className),
        };

        return <InternalButton key={item.key ?? index} consumerProps={consumerProps} />;
      })}
    </div>
  );
}
ButtonGroup.Item = ButtonGroupItem;
