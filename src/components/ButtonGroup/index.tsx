"use client";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import type { SolidButtonProps } from "../Button";
import { buttonGroupItemRecipe, buttonGroupRoot } from "./buttonGroup.css";

/**
 * A member of a {@link ButtonGroup} — the full `Button` API (the default
 * "solid" appearance) **minus `size`**, because the group owns sizing so every
 * member matches. Item-level `intent` / `saliency` are still allowed and
 * override the group's defaults for that one button; everything else
 * (`children`, `startIcon` / `endIcon`, `loading`, `disabled` +
 * `disabledReason`, `onClick`, native button attributes, `ref`, …) works
 * exactly as on a standalone `Button`.
 *
 * The text appearance is intentionally out of scope: a `ButtonGroup` joins
 * chrome-bearing controls into one surface, and the underlined text look has no
 * chrome to join — so `appearance` / `variant` aren't part of this API.
 */
export type ButtonGroupItemProps = Omit<SolidButtonProps, "size" | "appearance" | "variant">;

/**
 * `ButtonGroup.Item` — a **configuration element**, not a rendered one. It only
 * carries props: `ButtonGroup` reads them off the elements you pass in `items`
 * and renders each as a positioned button itself (so it can square the inner
 * corners and collapse the shared borders). Rendering an `Item` on its own emits
 * nothing; it's meaningful only inside a `ButtonGroup`'s `items`.
 */
export function ButtonGroupItem(_props: ButtonGroupItemProps): React.ReactNode {
  return null;
}
ButtonGroupItem.displayName = "ButtonGroup.Item";

export interface ButtonGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  // Colour comes from each member's intent/saliency, not `color`; the members
  // are supplied via `items`, not `children`.
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
 * ButtonGroup — a visually-joined cluster of buttons sharing sizing and, by
 * default, intent/saliency: a row of real `<button>`s whose borders merge into
 * one hairline seam and whose outer corners round while the inner ones square
 * off, so the set reads as a single segmented control.
 *
 * Unlike `ToggleGroup` (a single-select segmented *value*), the members here are
 * independent actions — each keeps its own `onClick`, `disabled`, icons, and can
 * override the group's `intent` / `saliency`. There's no roving tab stop: the
 * buttons are ordinary tab stops in array order, so keyboard order is exactly the
 * source order.
 *
 * The members are passed as `ButtonGroup.Item` elements through `items` (a
 * config-only element the group reads props off of), which is what lets the group
 * own the per-position corner/border collapsing. `size` is owned by the group;
 * `intent` / `saliency` set group-wide defaults that any `Item` may override.
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
 *
 * @example
 * // Group defaults with a per-member override.
 * <ButtonGroup
 *   intent="neutral"
 *   saliency="low"
 *   items={[
 *     <ButtonGroup.Item key="edit" onClick={edit}>Edit</ButtonGroup.Item>,
 *     <ButtonGroup.Item key="del" intent="negative" saliency="high" onClick={remove}>
 *       Delete
 *     </ButtonGroup.Item>,
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
        // Position keys the corner/border collapse: the two ends stay rounded,
        // everything between them squares off and overlaps its neighbour.
        const position =
          count === 1 ? "only" : index === 0 ? "first" : index === count - 1 ? "last" : "middle";

        // Group defaults fill in, but the member's own intent/saliency win. `size`
        // is always the group's — the member type doesn't carry one.
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
