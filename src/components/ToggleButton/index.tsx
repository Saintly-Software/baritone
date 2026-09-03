"use client";
import * as React from "react";
import {
  InternalButton,
  type InternalButtonHtmlAttrs,
} from "../../internal/components/InternalButton";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { renderIcon } from "../Icon/renderIcon";
import { toggleButtonSquare } from "./toggleButton.css";

/**
 * A value given directly, or derived from the pressed state — `aria-label`
 * and `icon` accept this so the name/glyph can flip with the toggle.
 */
type PressedSlot<T> = T | ((pressed: boolean) => T);

/** Fired on toggle. Exposes both the next pressed state and the DOM event. */
export type ToggleButtonChange = (
  value: boolean,
  event: React.MouseEvent<HTMLButtonElement>,
) => void;

export interface ToggleButtonBaseProps {
  /**
   * Accessible name — **required**, since the button is icon-only with no
   * visible text to name it. May be a function of the pressed state, so the
   * name can flip with the toggle (mirrors `Button`, which forbids `aria-label`).
   */
  "aria-label": PressedSlot<string>;
  /**
   * The glyph shown as the button's content — a bare glyph (auto-wrapped in
   * `Icon`) or an explicit `<Icon>`. May be a function of the pressed state.
   */
  icon: PressedSlot<React.ReactNode>;
  /** Colour scheme of the pressed (on) state. Shared with `Button` / `Chip`. */
  intent?: Intent;
  /**
   * Prominence of the pressed (on) state. Default `high`. The unpressed (off)
   * state always renders at `low` (ghost) saliency, so the two read as distinct.
   */
  saliency?: Saliency;
  /** Control size; the button is square at every size. Default `md`. */
  size?: Size;
  /**
   * Disable the toggle. Modelled with `aria-disabled` (keyboard-focusable, so it
   * can surface `disabledReason`); clicks / keyboard activation are vetoed.
   */
  disabled?: boolean;
  /**
   * Explanation shown in a tooltip when disabled and the user tabs to or hovers
   * the button.
   */
  disabledReason?: React.ReactNode;
  /** Extra className merged onto the button. */
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

/** Controlled: drive the pressed state with `value` (+ typically `onChange`). */
export interface ToggleButtonControlledProps {
  /** Whether the button is currently pressed / on (controlled). */
  value: boolean;
  defaultValue?: never;
  /** Called with the next pressed state and the DOM event when toggled. */
  onChange?: ToggleButtonChange;
}

/** Uncontrolled: seed the initial pressed state with `defaultValue`. */
export interface ToggleButtonUncontrolledProps {
  value?: never;
  /** Initial pressed state; the component then manages its own. Default `false`. */
  defaultValue?: boolean;
  /** Called with the next pressed state and the DOM event when toggled. */
  onChange?: ToggleButtonChange;
}

export type ToggleButtonProps = ToggleButtonBaseProps &
  (ToggleButtonControlledProps | ToggleButtonUncontrolledProps);

/**
 * ToggleButton — an icon-only button with an on / off (`aria-pressed`)
 * state, for toolbar-style toggles (bold, mute, pin, …). A thin wrapper over
 * the same `InternalButton` that powers `Button`: the pressed state drives
 * the `aria-pressed` flag and the click, and `icon` is the button's only
 * content.
 *
 * The pressed state can be **controlled** (`value` + `onChange`) or
 * **uncontrolled** (`defaultValue`, or nothing). `onChange` — when given —
 * receives the next boolean and the DOM event. `icon` and `aria-label` may
 * each be a function of the pressed state, so the glyph/name can flip with
 * the toggle.
 *
 * The pressed state is expressed through saliency: `intent`/`saliency`
 * describe the *on* look, and *off* drops to `low` (ghost) saliency — so the
 * two states read as distinct while reusing the shared `component` colour
 * recipe.
 *
 * The toggle wiring (`aria-pressed`, `aria-label`, the toggle `onClick`)
 * rides in through `InternalButton`'s `htmlAttrs` seam, like an overlay
 * `Trigger` — visual props (intent, size, …) go through `consumerProps`.
 * `aria-label` must travel via `htmlAttrs` because `InternalButton` strips
 * it from `consumerProps`; routing `onClick` there too means the disabled
 * guard gates it for free.
 *
 * @example
 * // Controlled
 * const [muted, setMuted] = React.useState(false);
 * <ToggleButton
 *   value={muted}
 *   onChange={(next) => setMuted(next)}
 *   aria-label={(pressed) => (pressed ? "Unmute" : "Mute")}
 *   icon={(pressed) => (pressed ? <MutedGlyph /> : <SoundGlyph />)}
 *   intent="primary"
 * />
 *
 * @example
 * // Uncontrolled
 * <ToggleButton
 *   defaultValue
 *   aria-label="Pin"
 *   icon={<PinGlyph />}
 * />
 */
export function ToggleButton(props: ToggleButtonProps) {
  const {
    "aria-label": ariaLabel,
    icon,
    intent,
    saliency = "high",
    size,
    disabled,
    disabledReason,
    className,
    ref,
  } = props;

  const isControlled = props.value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(props.defaultValue ?? false);
  const pressed = isControlled ? (props.value as boolean) : uncontrolledValue;

  const resolvedLabel = typeof ariaLabel === "function" ? ariaLabel(pressed) : ariaLabel;
  const resolvedIcon = typeof icon === "function" ? icon(pressed) : icon;

  const htmlAttrs: InternalButtonHtmlAttrs = {
    "aria-label": resolvedLabel,
    "aria-pressed": pressed,
    onClick: (event) => {
      const next = !pressed;
      if (!isControlled) setUncontrolledValue(next);
      props.onChange?.(next, event);
    },
  };

  return (
    <InternalButton
      consumerProps={{
        intent,
        saliency: pressed ? saliency : "low",
        size,
        disabled,
        disabledReason,
        className: cx(toggleButtonSquare, className),
        ref,
        children: renderIcon(resolvedIcon),
      }}
      htmlAttrs={htmlAttrs}
    />
  );
}
