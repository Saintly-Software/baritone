import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { atoms } from "../../styles/sprinkles.css";
import { dividerRoot } from "./divider.css";
import { Divider } from "./index";

describe("Divider", () => {
  it("renders a horizontal separator by default", () => {
    render(<Divider />);
    const divider = screen.getByRole("separator");
    expect(divider).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("exposes a vertical orientation to assistive tech", () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("renders no children when unlabelled", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toBeEmptyDOMElement();
  });

  it("renders a string label and names the separator with it", () => {
    render(<Divider>or</Divider>);
    // A separator's children are presentational, so the visible text alone would
    // never be announced — the string label doubles as the accessible name.
    const divider = screen.getByRole("separator", { name: "or" });
    expect(divider).toHaveTextContent("or");
  });

  it("lets an explicit aria-label win over a string label", () => {
    render(<Divider aria-label="Section break">or</Divider>);
    const divider = screen.getByRole("separator", { name: "Section break" });
    expect(divider).toHaveTextContent("or");
  });

  it("leaves a non-string label unnamed unless aria-label is given", () => {
    const { rerender } = render(
      <Divider>
        <span>Today</span>
      </Divider>,
    );
    expect(screen.getByRole("separator")).not.toHaveAttribute("aria-label");

    rerender(
      <Divider aria-label="Today">
        <span>Today</span>
      </Divider>,
    );
    expect(screen.getByRole("separator", { name: "Today" })).toBeInTheDocument();
  });

  it("sets no aria-label when unlabelled", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).not.toHaveAttribute("aria-label");
  });

  it("applies the labelled variant only when there's a label", () => {
    const { rerender } = render(<Divider />);
    expect(screen.getByRole("separator")).toHaveClass(dividerRoot({ labelled: false }));
    rerender(<Divider>or</Divider>);
    expect(screen.getByRole("separator")).toHaveClass(dividerRoot({ labelled: true }));
  });

  it("applies the intent / saliency / thickness variants", () => {
    render(<Divider intent="primary" saliency="high" thickness="thick" />);
    expect(screen.getByRole("separator")).toHaveClass(
      dividerRoot({ intent: "primary", saliency: "high", thickness: "thick" }),
    );
  });

  it("forwards slotProps onto the label", () => {
    render(<Divider slotProps={{ label: { className: "slot-label" } }}>or</Divider>);
    expect(screen.getByText("or")).toHaveClass("slot-label");
  });

  it("wires the margin props to the spacing scale", () => {
    render(<Divider my="4" />);
    // The recipe must not carry a `margin` reset of its own: it would out-order
    // this equal-specificity atoms class and swallow the margin props.
    expect(screen.getByRole("separator")).toHaveClass(atoms({ my: "4" }));
  });

  it("merges a consumer className", () => {
    render(<Divider className="extra" />);
    const divider = screen.getByRole("separator");
    expect(divider).toHaveClass("extra");
    expect(divider).toHaveClass(dividerRoot({}));
  });

  it("forwards id, ref, and native attributes", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Divider id="split" ref={ref} data-testid="divider" />);
    const divider = screen.getByRole("separator");
    expect(divider.id).toBe("split");
    expect(ref.current).toBe(divider);
    expect(divider).toHaveAttribute("data-testid", "divider");
  });
});
