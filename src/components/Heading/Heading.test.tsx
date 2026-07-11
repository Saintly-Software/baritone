import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading } from "./index";

describe("Heading", () => {
  it("renders the numeric semantic level as the matching h-tag", () => {
    render(<Heading level={2}>Title</Heading>);
    const heading = screen.getByRole("heading", { level: 2, name: "Title" });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H2");
  });

  it("renders the requested semantic level", () => {
    render(<Heading level={1}>Big</Heading>);
    expect(screen.getByRole("heading", { level: 1, name: "Big" })).toBeInTheDocument();
  });

  it("allows a visual variant independent of the semantic level", () => {
    render(
      <Heading level={3} variant="4xl">
        Small tag, big look
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  it("keeps the default weight when `weight` is omitted", () => {
    const { rerender } = render(
      <Heading level={2} data-testid="h">
        Default
      </Heading>,
    );
    const defaultClasses = screen.getByTestId("h").className;
    rerender(
      <Heading level={2} data-testid="h" weight="regular">
        Overridden
      </Heading>,
    );
    const weightedClasses = screen.getByTestId("h").className;
    // Passing `weight` adds a class; omitting it must not, so the default render
    // stays exactly as it was before the prop existed.
    expect(weightedClasses).not.toBe(defaultClasses);
    expect(weightedClasses.split(" ").length).toBeGreaterThan(defaultClasses.split(" ").length);
  });

  it("adds a class for each of align, weight, and wrap when passed", () => {
    const { rerender } = render(
      <Heading level={2} data-testid="h">
        Plain
      </Heading>,
    );
    const base = screen.getByTestId("h").className.split(" ").length;
    rerender(
      <Heading level={2} data-testid="h" align="center" weight="bold" wrap="balance">
        Styled
      </Heading>,
    );
    const styled = screen.getByTestId("h").className.split(" ").length;
    expect(styled).toBe(base + 3);
  });
});
