import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./index";

describe("Card", () => {
  it("renders a div with its children by default", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card.tagName).toBe("DIV");
  });

  it("renders the semantic element from the `as` prop", () => {
    render(
      <Card as="section" aria-label="panel">
        Inner
      </Card>,
    );
    const section = screen.getByLabelText("panel");
    expect(section.tagName).toBe("SECTION");
  });

  it("sets aria-disabled when disabled", () => {
    render(<Card disabled>Locked</Card>);
    expect(screen.getByText("Locked")).toHaveAttribute("aria-disabled", "true");
  });

  it("renders header and footer around the content", () => {
    render(
      <Card
        header={<Card.Header title="Title" subtitle="Subtitle" />}
        footer={<Card.Footer>Footer</Card.Footer>}
      >
        Body
      </Card>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("lets Card.Header set the heading level", () => {
    render(<Card.Header title="Outline" level={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Outline" })).toBeInTheDocument();
  });

  it("renders Card.Divider as a separator", () => {
    render(<Card.Divider />);
    const divider = screen.getByRole("separator");
    expect(divider.tagName).toBe("HR");
  });

  it("renders Card.Bleed content", () => {
    render(<Card.Bleed>Bleeding</Card.Bleed>);
    expect(screen.getByText("Bleeding")).toBeInTheDocument();
  });

  it("can render as another element via the render prop", () => {
    render(
      <Card render={<section aria-label="panel2" />}>
        <span>Inner</span>
      </Card>,
    );
    const section = screen.getByLabelText("panel2");
    expect(section.tagName).toBe("SECTION");
    expect(section).toContainElement(screen.getByText("Inner"));
  });
});
