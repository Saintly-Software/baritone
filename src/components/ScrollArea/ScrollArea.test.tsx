import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { ScrollArea } from "./index";

// These run in jsdom, which has no layout — so base-ui never measures overflow
// and the scrollbars stay unmounted. The scrollbar / hover-reveal behaviour is
// covered by ScrollArea.interaction.stories.tsx (a real browser). Here we assert
// the parts jsdom can see: content, the labelled region, and root plumbing.

describe("ScrollArea", () => {
  it("renders its children", () => {
    render(
      <ScrollArea aria-label="Region">
        <p>Scrollable content</p>
      </ScrollArea>,
    );
    expect(screen.getByText("Scrollable content")).toBeInTheDocument();
  });

  it("names the scrollable region with aria-label", () => {
    const { container } = render(
      <ScrollArea aria-label="Release notes">
        <p>Body</p>
      </ScrollArea>,
    );
    expect(container.querySelector('[aria-label="Release notes"]')).not.toBeNull();
  });

  it("forwards a ref to the root element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ScrollArea ref={ref} aria-label="Region">
        <p>Body</p>
      </ScrollArea>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveTextContent("Body");
  });

  it("merges className and style onto the root", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ScrollArea ref={ref} className="custom" style={{ height: 240 }} aria-label="Region">
        <p>Body</p>
      </ScrollArea>,
    );
    expect(ref.current).toHaveClass("custom");
    expect(ref.current).toHaveStyle({ height: "240px" });
  });

  it.each(["vertical", "horizontal", "both"] as const)(
    "renders in %s orientation without error",
    (orientation) => {
      render(
        <ScrollArea orientation={orientation} aria-label="Region">
          <p>Body {orientation}</p>
        </ScrollArea>,
      );
      expect(screen.getByText(`Body ${orientation}`)).toBeInTheDocument();
    },
  );
});
