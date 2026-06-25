import * as React from "react";
import { cx } from "./cx";

/**
 * Polymorphism following base-ui's `render` prop pattern (rather than an
 * `asChild` slot). `render` is either:
 *   - a React element to render *as* (its props are merged with ours), or
 *   - a function `(props) => element` for full control.
 * Otherwise the `defaultElement` is used. Refs are composed; className/style are
 * merged; event handlers are chained.
 */
export type RenderProp<Props = Record<string, unknown>> =
  | React.ReactElement<Record<string, unknown>>
  | ((props: Props) => React.ReactNode);

type AnyProps = Record<string, unknown>;

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        (ref as React.RefObject<T | null>).current = node;
      }
    }
  };
}

function mergeProps(ours: AnyProps, theirs: AnyProps): AnyProps {
  const merged: AnyProps = { ...ours, ...theirs };

  for (const key of Object.keys(theirs)) {
    const ourValue = ours[key];
    const theirValue = theirs[key];
    // Chain event handlers so both ours and the consumer's run.
    if (
      /^on[A-Z]/.test(key) &&
      typeof ourValue === "function" &&
      typeof theirValue === "function"
    ) {
      merged[key] = (...args: unknown[]) => {
        (theirValue as (...a: unknown[]) => unknown)(...args);
        (ourValue as (...a: unknown[]) => unknown)(...args);
      };
    }
  }

  if (ours.className || theirs.className) {
    merged.className = cx(ours.className as string, theirs.className as string);
  }
  if (ours.style || theirs.style) {
    merged.style = {
      ...(ours.style as React.CSSProperties),
      ...(theirs.style as React.CSSProperties),
    };
  }
  if (ours.ref || theirs.ref) {
    merged.ref = composeRefs(ours.ref as React.Ref<unknown>, theirs.ref as React.Ref<unknown>);
  }
  return merged;
}

export interface UseRenderParams {
  render: RenderProp | undefined;
  defaultElement: React.ElementType;
  props: AnyProps;
}

export function useRender({ render, defaultElement, props }: UseRenderParams): React.ReactNode {
  if (typeof render === "function") {
    return render(props);
  }
  if (React.isValidElement(render)) {
    return React.cloneElement(render, mergeProps(props, render.props as AnyProps));
  }
  return React.createElement(defaultElement, props);
}

export { composeRefs };
