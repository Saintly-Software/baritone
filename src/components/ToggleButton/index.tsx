"use client";
import * as React from "react";
import {
  InternalButton,
  type InternalButtonHtmlAttrs,
} from "../../internal/components/InternalButton";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { toggleButtonSquare } from "./toggleButton.css";

export interface ToggleButtonProps {
  /** Whether the button is currently pressed / on (controlled). */
  value: boolean;
  /** Called with the next pressed state when the user toggles the button. */
  onChange: (value: boolean) => void;
  /**
   * Accessible name — **required**, because the button is icon-only and has no
   * visible text to name it. (The mirror image of `Button`, which *forbids*
   * `aria-label` precisely because its visible label is already the name.)
   */
  "aria-label": string;
  /** The glyph shown as the button's content. Typically an `<Icon>`. */
  icon: React.ReactNode;
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

/**
 * ToggleButton — an icon-only button with an on / off (`aria-pressed`) state,
 * for toolbar-style toggles (bold, mute, pin, …). It's a thin wrapper over the
 * very same `InternalButton` that powers `Button`: `value` / `onChange` drive
 * the `aria-pressed` flag and the click, and the `icon` is the button's only
 * content.
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
 * toggle `onClick` there too means the disabled guard gates it for free.
 *
 * @example
 * const [muted, setMuted] = React.useState(false);
 * <ToggleButton
 *   value={muted}
 *   onChange={setMuted}
 *   aria-label={muted ? "Unmute" : "Mute"}
 *   icon={<Icon><MuteGlyph /></Icon>}
 *   intent="primary"
 * />
 */
export function ToggleButton({
  value,
  onChange,
  "aria-label": ariaLabel,
  icon,
  intent,
  saliency = "high",
  size,
  disabled,
  disabledReason,
  className,
  ref,
}: ToggleButtonProps) {
  // Toggle semantics go through the `htmlAttrs` seam, the same one an overlay
  // `Trigger` uses. `aria-label` has to live here (InternalButton strips it from
  // `consumerProps`), and the toggle `onClick` rides alongside so InternalButton's
  // disabled guard gates it — a disabled toggle can't flip its state.
  const htmlAttrs: InternalButtonHtmlAttrs = {
    "aria-label": ariaLabel,
    "aria-pressed": value,
    onClick: () => onChange(!value),
  };

  return (
    <InternalButton
      consumerProps={{
        intent,
        // intent/saliency describe the *on* look; *off* drops to a ghost.
        saliency: value ? saliency : "low",
        size,
        disabled,
        disabledReason,
        className: cx(toggleButtonSquare, className),
        ref,
        children: icon,
      }}
      htmlAttrs={htmlAttrs}
    />
  );
}
