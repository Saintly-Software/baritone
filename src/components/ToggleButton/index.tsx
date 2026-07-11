"use client";
import * as React from "react";
import {
  InternalButton,
  type InternalButtonHtmlAttrs,
} from "../../internal/components/InternalButton";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
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
   * The glyph shown as the button's content. Typically an `<Icon>`. May be a
   * function of the pressed state, so the glyph can change with the toggle.
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
 * ToggleButton — an icon-only button with an on / off (`aria-pressed`) state,
 * for toolbar-style toggles (bold, mute, pin, …). It's a thin wrapper over the
 * very same `InternalButton` that powers `Button`: the pressed state drives the
 * `aria-pressed` flag and the click, and the `icon` is the button's only content.
 *
 * The pressed state can be **controlled** (`value` + `onChange`) or
 * **uncontrolled** (`defaultValue`, or nothing, and the component tracks its own
 * state). Either way `onChange` — when given — receives the next boolean *and*
 * the DOM event. `icon` and `aria-label` may each be a function of the pressed
 * state, so the glyph / name can flip with the toggle.
 *
 * The pressed state is expressed through saliency — `intent` / `saliency`
 * describe the *on* look, and the *off* look drops to `low` (ghost) saliency —
 * so the two states are visibly distinct while reusing the shared `component`
 * colour recipe (no toggle-specific colours).
 *
 * The toggle wiring (the `aria-pressed` flag, the `aria-label`, and the toggle
 * `onClick`) rides in through `InternalButton`'s `htmlAttrs` seam, exactly like
 * an overlay `Trigger` — the consumer-facing visual props (intent, size, …) go
 * through `consumerProps`. `aria-label` *must* travel via `htmlAttrs` because
 * `InternalButton` deliberately strips it from `consumerProps`; routing the
 * toggle `onClick` there too means the disabled guard gates it for free (so a
 * disabled toggle can't flip its own uncontrolled state either).
 *
 * @example
 * // Controlled
 * const [muted, setMuted] = React.useState(false);
 * <ToggleButton
 *   value={muted}
 *   onChange={(next) => setMuted(next)}
 *   aria-label={(pressed) => (pressed ? "Unmute" : "Mute")}
 *   icon={(pressed) => <Icon>{pressed ? <MutedGlyph /> : <SoundGlyph />}</Icon>}
 *   intent="primary"
 * />
 *
 * @example
 * // Uncontrolled
 * <ToggleButton
 *   defaultValue
 *   aria-label="Pin"
 *   icon={<Icon><PinGlyph /></Icon>}
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

  // Controlled when a `value` is supplied; otherwise the component tracks its own
  // pressed state, seeded from `defaultValue`.
  const isControlled = props.value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(props.defaultValue ?? false);
  const pressed = isControlled ? (props.value as boolean) : uncontrolledValue;

  // Resolve the state-aware slots against the current pressed state.
  const resolvedLabel = typeof ariaLabel === "function" ? ariaLabel(pressed) : ariaLabel;
  const resolvedIcon = typeof icon === "function" ? icon(pressed) : icon;

  // Toggle semantics go through the `htmlAttrs` seam, the same one an overlay
  // `Trigger` uses. `aria-label` has to live here (InternalButton strips it from
  // `consumerProps`), and the toggle `onClick` rides alongside so InternalButton's
  // disabled guard gates it — a disabled toggle can't flip its state, and (only
  // when uncontrolled) commit the next state locally before notifying `onChange`.
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
        // intent/saliency describe the *on* look; *off* drops to a ghost.
        saliency: pressed ? saliency : "low",
        size,
        disabled,
        disabledReason,
        className: cx(toggleButtonSquare, className),
        ref,
        children: resolvedIcon,
      }}
      htmlAttrs={htmlAttrs}
    />
  );
}
