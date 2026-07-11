import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { srOnly } from "./srOnly.css";
import { SrOnly } from "./index";

describe("SrOnly", () => {
  it("renders a span by default and exposes its children", () => {
    render(<SrOnly>skip to content</SrOnly>);
    const el = screen.getByText("skip to content");
    expect(el.tagName).toBe("SPAN");
  });

  it("stays in the accessibility tree (queryable text, not display:none)", () => {
    render(
      <a href="/pricing">
        Read more <SrOnly>about pricing</SrOnly>
      </a>,
    );
    // Present for screen readers: still queryable by its text.
    expect(screen.getByText("about pricing")).toBeInTheDocument();
  });

  it("applies the visually-hidden clip/rect technique (not display:none)", () => {
    render(<SrOnly>hidden</SrOnly>);
    const el = screen.getByText("hidden");
    expect(el).toHaveClass(srOnly);

    const styles = getComputedStyle(el);
    // Collapsed and clipped out of view, but never removed from the a11y tree.
    expect(styles.position).toBe("absolute");
    expect(styles.width).toBe("1px");
    expect(styles.height).toBe("1px");
    expect(styles.overflow).toBe("hidden");
    expect(styles.clip).toBe("rect(0px, 0px, 0px, 0px)");
    // The technique deliberately avoids these a11y-tree-removing declarations.
    expect(styles.display).not.toBe("none");
    expect(styles.visibility).not.toBe("hidden");
  });

  it("forwards `id` and `ref`", () => {
    const ref = createRef<HTMLElement>();
    render(
      <SrOnly id="live-status" ref={ref}>
        Saved
      </SrOnly>,
    );
    expect(screen.getByText("Saved").id).toBe("live-status");
    expect(ref.current).toBe(screen.getByText("Saved"));
  });

  it("renders as a different element via the render prop", () => {
    render(<SrOnly render={<div />}>region label</SrOnly>);
    expect(screen.getByText("region label").tagName).toBe("DIV");
  });

  it("merges a consumer className with the srOnly class", () => {
    render(<SrOnly className="extra">x</SrOnly>);
    const el = screen.getByText("x");
    expect(el).toHaveClass(srOnly);
    expect(el).toHaveClass("extra");
  });

  it("forwards native attributes like aria-live", () => {
    render(
      <SrOnly aria-live="polite" role="status">
        Loading
      </SrOnly>,
    );
    const el = screen.getByRole("status");
    expect(el).toHaveAttribute("aria-live", "polite");
  });
});
