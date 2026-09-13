"use client";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import type { SolidButtonProps } from "../Button";
import { buttonGroupItemRecipe, buttonGroupRoot } from "./buttonGroup.css";

/**
 * A member of a {@link ButtonGroup} — the full solid `Button` API minus `size`
 * (the group owns sizing). Item-level `intent` / `saliency` override the group's
 * defaults; everything else works as on a standalone `Button`. The text
 * appearance is out of scope (no chrome to join).
 */
export type ButtonGroupItemProps = Omit<SolidButtonProps, "size" | "appearance" | "variant">;

/**
 * `ButtonGroup.Item` — a **configuration element**, not a rendered one:
 * `ButtonGroup` reads its props off `items` and renders the positioned button
 * itself. Rendering an `Item` on its own emits nothing.
 */
export function ButtonGroupItem(_props: ButtonGroupItemProps): React.ReactNode {
  return null;
}
ButtonGroupItem.displayName = "ButtonGroup.Item";

export interface ButtonGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "color" | "children"
> {
  /**
   * The buttons, as `ButtonGroup.Item` elements. Rendered in array order (which
   * is also the DOM / keyboard tab order), joined into a single surface with the
   * two ends rounded and the inner corners squared.
   */
  items: React.ReactElement<ButtonGroupItemProps>[];
  /** Default colour scheme for every member. Overridable per `Item`. Default `neutral`. */
  intent?: Intent;
  /** Default prominence for every member. Overridable per `Item`. Default `mid`. */
  saliency?: Saliency;
  /** Control size for the whole group — members can't set their own. Default `md`. */
  size?: Size;
  /** Ref to the group container element. */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * A visually-joined cluster of buttons sharing sizing and, by default,
 * intent/saliency — a row of real `<button>`s whose borders merge into one seam
 * and whose outer corners round, so the set reads as one segmented control. Unlike
 * `ToggleGroup`, the members are independent actions (each its own `onClick`,
 * `disabled`, icons), and they're ordinary tab stops in source order. Passed as
 * `ButtonGroup.Item` config elements through `items`; `size` is group-owned,
 * `intent` / `saliency` are overridable defaults.
 *
 * @example
 * <ButtonGroup
 *   size="md"
 *   items={[
 *     <ButtonGroup.Item key="prev" startIcon={<ChevronLeft />} onClick={goPrev}>
 *       Previous
 *     </ButtonGroup.Item>,
 *     <ButtonGroup.Item key="next" onClick={goNext}>Next</ButtonGroup.Item>,
 *   ]}
 * />
 */
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
