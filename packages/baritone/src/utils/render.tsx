import * as React from "react";
import { useRender as baseUseRender, type UseRenderRenderProp } from "@base-ui/react/use-render";
import { cx } from "./cx";

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

  defaultElement: keyof React.JSX.IntrinsicElements;
  props: AnyProps;
}

export function useRender({ render, defaultElement, props }: UseRenderParams): React.ReactElement {
  return baseUseRender({
    render: render as UseRenderRenderProp | undefined,
    defaultTagName: defaultElement,
    props,
  });
}

export function RenderElement(params: UseRenderParams): React.ReactElement {
  return useRender(params);
}

export { composeRefs, mergeProps };
