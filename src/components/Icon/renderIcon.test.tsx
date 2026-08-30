import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Icon } from "./index";
import { renderIcon } from "./renderIcon";

describe("renderIcon", () => {
  it("renders nothing for a nullish or boolean slot value", () => {
    expect(renderIcon(null)).toBeNull();
    expect(renderIcon(undefined)).toBeNull();
    expect(renderIcon(false)).toBeNull();
    expect(renderIcon(true)).toBeNull();
  });

  it("wraps a bare glyph element in a default Icon", () => {
    const glyph = <svg data-testid="glyph" />;
    const result = renderIcon(glyph) as React.ReactElement<{ children: React.ReactNode }>;

    expect(React.isValidElement(result)).toBe(true);
    expect(result.type).toBe(Icon);
    expect(result.props.children).toBe(glyph);
  });

  it("applies the slot's chrome props onto the wrapped Icon", () => {
    const result = renderIcon(<svg />, {
      props: { className: "slot", "aria-hidden": true },
    }) as React.ReactElement<{ className?: string; "aria-hidden"?: boolean }>;

    expect(result.props.className).toBe("slot");
    expect(result.props["aria-hidden"]).toBe(true);
  });

  it("spreads a host-supplied size onto the wrapped Icon", () => {
    const result = renderIcon(<svg />, { props: { size: "lg" } }) as React.ReactElement<{
      size?: string;
    }>;

    expect(result.props.size).toBe("lg");
  });

  it("passes an existing Icon through, composing the slot className and letting the Icon's own props win", () => {
    const result = renderIcon(
      <Icon className="mine" size="lg">
        <svg />
      </Icon>,
      { props: { className: "slot" } },
    ) as React.ReactElement<{ className?: string; size?: string }>;

    expect(result.type).toBe(Icon);
    // Icon's explicit size wins; the slot className is composed ahead of the Icon's own.
    expect(result.props.size).toBe("lg");
    expect(result.props.className).toBe("slot mine");
  });

  it("calls a render function with the chrome props and host state, returning its element", () => {
    const returned = <span data-testid="custom" />;
    const fn = vi.fn(() => returned);
    const props = { className: "slot" };
    const state = { size: "lg" as const };

    const result = renderIcon(fn, { props, state });

    expect(fn).toHaveBeenCalledWith(props, state);
    expect(result).toBe(returned);
  });
});
