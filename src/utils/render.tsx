import * as React from "react";
import { useRender as baseUseRender, type UseRenderRenderProp } from "@base-ui/react/use-render";
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
  /**
   * The element rendered when `render` isn't supplied — an intrinsic tag name
   * only (`"div"`, `"a"`, …). To render *as* a component, use `render` instead.
   */
  defaultElement: keyof React.JSX.IntrinsicElements;
  props: AnyProps;
}

/**
 * Polymorphic render, delegating to base-ui's `useRender` so we inherit its
 * ref-merging, event-handler chaining, and `preventBaseUIHandler` support.
 * Refs are still passed inside `props` — base-ui reads `props.ref` and merges
 * it, so call sites keep their existing shape.
 *
 * This is a hook, so it must be called unconditionally. To render
 * polymorphically from a conditional branch (behind an early `return`), use
 * {@link RenderElement} instead.
 */
export function useRender({ render, defaultElement, props }: UseRenderParams): React.ReactElement {
  return baseUseRender({
    render: render as UseRenderRenderProp | undefined,
    defaultTagName: defaultElement,
    props,
  });
}

/**
 * Component form of {@link useRender} for call sites that render
 * polymorphically from a conditional branch — e.g. after an early `return`
 * for a disabled variant. Calling `useRender` directly there would break the
 * Rules of Hooks; rendering a component conditionally does not.
 */
export function RenderElement(params: UseRenderParams): React.ReactElement {
  return useRender(params);
}

export { composeRefs, mergeProps };
