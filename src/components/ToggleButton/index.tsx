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
 * A value that may either be given directly or derived from the pressed state.
 * `aria-label` and `icon` accept this so the name / glyph can change with the
 * toggle (e.g. a play ⇄ pause glyph, or an "Mute" ⇄ "Unmute" name).
 */
type PressedSlot<T> = T | ((pressed: boolean) => T);

/** Fired on toggle. Exposes both the next pressed state and the DOM event. */
export type ToggleButtonChange = (
  value: boolean,
  event: React.MouseEvent<HTMLButtonElement>,
) => void;

export interface ToggleButtonBaseProps {
  /**
   * Accessible name — **required**, because the button is icon-only and has no
   * visible text to name it. (The mirror image of `Button`, which *forbids*
   * `aria-label` precisely because its visible label is already the name.) May
   * be a function of the pressed state, so the name can flip with the toggle.
   */
  "aria-label": PressedSlot<string>;
  /**
   * The glyph shown as the button's content — a bare glyph (auto-wrapped in
   * `Icon`) or an explicit `<Icon>`. May be a function of the pressed state, so
   * the glyph can change with the toggle.
   */
  icon: PressedSlot<React.ReactNode>;
  /** Colour scheme of the pressed (on) state. Shared with `Button` / `Chip`. */
  intent?: Intent;
  /**
   * Prominence of the pressed (on) state. Default `high`. The unpressed (off)
   * state always renders at `low` (ghost) saliency, so on / off read as visibly
   * distinct while reusing the shared `component` colour recipe.
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
 * An icon-only button with an on / off (`aria-pressed`) state, for toolbar-style
 * toggles. A thin wrapper over the same `InternalButton` that powers `Button`.
 * The pressed state is **controlled** (`value` + `onChange`) or **uncontrolled**
 * (`defaultValue`); `onChange` receives the next boolean and the DOM event. `icon`
 * and `aria-label` may each be a function of the pressed state. The *on* look is
 * `intent` / `saliency`, the *off* look drops to `low` (ghost).
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
