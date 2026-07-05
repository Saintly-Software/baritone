import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./index";

describe("Text", () => {
  it("renders body text in a div by default", () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText("Hello").tagName).toBe("DIV");
  });

  it("renders the tag named by the `as` shorthand", () => {
    render(<Text as="p">Para</Text>);
    expect(screen.getByText("Para").tagName).toBe("P");
  });

  it("can render as a label via `as`", () => {
    render(<Text as="label">Field</Text>);
    expect(screen.getByText("Field").tagName).toBe("LABEL");
  });

  it("can render as an arbitrary element via the render prop", () => {
    render(<Text render={<em />}>Emphasis</Text>);
    expect(screen.getByText("Emphasis").tagName).toBe("EM");
  });

  it("applies a generated recipe class", () => {
    render(<Text>Styled</Text>);
    expect(screen.getByText("Styled").className.length).toBeGreaterThan(0);
  });
});
