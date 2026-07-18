import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { Overflow } from "./index";

// These run in jsdom, which has no layout — so base-ui never measures overflow,
// the scrollbars stay unmounted, and the nav buttons stay in their hidden
// resting state. The scroll/reveal behaviour (which needs a real viewport) is
// covered by Overflow.interaction.stories.tsx. Here we assert the parts jsdom
// can see: content, the labelled region, root plumbing, and the nav buttons'
// wiring (labels, out-of-tab-order, non-submitting).

const NAV = (container: HTMLElement, side: "start" | "end") =>
  container.querySelector<HTMLButtonElement>(`button[data-side="${side}"]`)!;

describe("Overflow", () => {
  it("renders its children", () => {
    render(
      <Overflow aria-label="Toolbar">
        <button>One</button>
        <button>Two</button>
      </Overflow>,
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("names the scrollable region with aria-label", () => {
    const { container } = render(
      <Overflow aria-label="Formatting">
        <button>One</button>
      </Overflow>,
    );
    expect(container.querySelector('[aria-label="Formatting"]')).not.toBeNull();
  });

  it("forwards a ref to the root element and reflects the orientation", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Overflow ref={ref} aria-label="Toolbar">
        <button>One</button>
      </Overflow>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-orientation", "horizontal");
  });

  it("merges className and style onto the root", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Overflow ref={ref} className="custom" style={{ maxWidth: 320 }} aria-label="Toolbar">
        <button>One</button>
      </Overflow>,
    );
    expect(ref.current).toHaveClass("custom");
    expect(ref.current).toHaveStyle({ maxWidth: "320px" });
  });

  it("renders both nav buttons, out of the tab order and non-submitting", () => {
    const { container } = render(
      <Overflow aria-label="Toolbar">
        <button>One</button>
      </Overflow>,
    );
    for (const side of ["start", "end"] as const) {
      const btn = NAV(container, side);
      expect(btn).not.toBeNull();
      // Pointer conveniences: never a Tab stop, never a form submit.
      expect(btn).toHaveAttribute("tabindex", "-1");
      expect(btn).toHaveAttribute("type", "button");
    }
  });

  it("labels the nav buttons per orientation by default", () => {
    const { container, rerender } = render(
      <Overflow aria-label="Toolbar">
        <button>One</button>
      </Overflow>,
    );
    expect(NAV(container, "start")).toHaveAttribute("aria-label", "Scroll left");
    expect(NAV(container, "end")).toHaveAttribute("aria-label", "Scroll right");

    rerender(
      <Overflow orientation="vertical" aria-label="Toolbar">
        <button>One</button>
      </Overflow>,
    );
    expect(NAV(container, "start")).toHaveAttribute("aria-label", "Scroll up");
    expect(NAV(container, "end")).toHaveAttribute("aria-label", "Scroll down");
  });

  it("lets the nav-button labels be overridden", () => {
    const { container } = render(
      <Overflow aria-label="Toolbar" previousLabel="Earlier" nextLabel="Later">
        <button>One</button>
      </Overflow>,
    );
    expect(NAV(container, "start")).toHaveAttribute("aria-label", "Earlier");
    expect(NAV(container, "end")).toHaveAttribute("aria-label", "Later");
  });

  it.each(["horizontal", "vertical"] as const)(
    "renders in %s orientation without error",
    (orientation) => {
      const { container } = render(
        <Overflow orientation={orientation} aria-label="Region">
          <button>Body {orientation}</button>
        </Overflow>,
      );
      expect(screen.getByText(`Body ${orientation}`)).toBeInTheDocument();
      expect(container.querySelector(`[data-orientation="${orientation}"]`)).not.toBeNull();
    },
  );
});
