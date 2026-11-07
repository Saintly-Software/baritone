import type { Size } from "../../theme/constants";
import * as React from "react";
import { mergeProps } from "../../utils/render";
import { Icon } from "./index";

export interface IconRenderProps {
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLSpanElement>;
  size?: Size;
  "aria-hidden"?: React.AriaAttributes["aria-hidden"];
}

export type IconRenderFn<State> = (props: IconRenderProps, state: State) => React.ReactElement;

export type IconSlot<State = Record<string, never>> = React.ReactNode | IconRenderFn<State>;

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
