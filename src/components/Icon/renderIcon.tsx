import type { Size } from "../../theme/constants";
import * as React from "react";
import { mergeProps } from "../../utils/render";
import { Icon } from "./index";

/**
 * The presentational props a host applies to an icon slot — spread onto the
 * wrapping `Icon` (or handed to a render function to spread). Chrome only; the
 * consumer's own props on an explicit `<Icon>` always win over these.
 *
 * `size` is here rather than in `state` because a few hosts intrinsically size
 * their icon (`HelpText`, `Lockup`); they pass it so the default wrap keeps that
 * size. Hosts that don't size their icon simply omit it — nothing is newly
 * applied. The render function still sees the host's size via its `state` arg.
 */
export interface IconRenderProps {
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLSpanElement>;
  size?: Size;
  "aria-hidden"?: boolean;
}

/**
 * Full-control form of an icon slot: base-ui's `(props, state)` render
 * signature. Receives the host's chrome props to spread and its resolved icon
 * state to branch on; returns the element to render.
 */
export type IconRenderFn<State> = (props: IconRenderProps, state: State) => React.ReactElement;

/** An icon slot value: any node (auto-wrapped in `Icon`) or a render function. */
export type IconSlot<State = Record<string, never>> = React.ReactNode | IconRenderFn<State>;

/**
 * Resolve an icon slot to a render-ready node — the shared rule behind every
 * `icon`/`startIcon`/`endIcon` prop.
 *
 * - A **render function** is called with the host's chrome `props` and `state`.
 * - An existing **`Icon`** is passed through, its own props winning over the
 *   slot's chrome (classNames composed).
 * - Any **other node** (a bare glyph) is wrapped in a default `Icon`.
 * - A **nullish/boolean** value renders nothing.
 */
export function renderIcon<State>(
  icon: IconSlot<State>,
  ctx?: { props?: IconRenderProps; state?: State },
): React.ReactNode {
  if (icon == null || typeof icon === "boolean") return null;

  const chrome = ctx?.props ?? {};

  if (typeof icon === "function") {
    return icon(chrome, (ctx?.state ?? {}) as State);
  }

  if (React.isValidElement(icon) && icon.type === Icon) {
    const merged = mergeProps(
      chrome as Record<string, unknown>,
      (icon.props ?? {}) as Record<string, unknown>,
    );
    return React.cloneElement(icon as React.ReactElement, merged);
  }

  return <Icon {...chrome}>{icon}</Icon>;
}
