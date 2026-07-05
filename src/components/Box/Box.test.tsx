import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Box } from "./index";

describe("Box", () => {
  it("renders a div by default and shows its children", () => {
    render(<Box data-testid="box">hello</Box>);
    const el = screen.getByTestId("box");
    expect(el.tagName).toBe("DIV");
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders as a different element via `as`", () => {
    render(
      <Box as="section" data-testid="box">
        x
      </Box>,
    );
    expect(screen.getByTestId("box").tagName).toBe("SECTION");
  });

  it("forwards `id` and `ref`", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Box id="my-box" ref={ref} data-testid="box">
        x
      </Box>,
    );
    expect(screen.getByTestId("box").id).toBe("my-box");
    expect(ref.current).toBe(screen.getByTestId("box"));
  });

  it("merges a consumer className with the atoms classes", () => {
    render(
      <Box className="extra" p="2" data-testid="box">
        x
      </Box>,
    );
    expect(screen.getByTestId("box").className).toContain("extra");
  });

  it("applies a class for each spacing knob", () => {
    const { rerender } = render(<Box data-testid="box">x</Box>);
    const base = screen.getByTestId("box").className;
    for (const props of [
      { p: "2" as const },
      { px: "4" as const },
      { py: "1" as const },
      { pt: "3" as const },
      { m: "2" as const },
      { mx: "auto" as const },
      { my: "1" as const },
      { mb: "3" as const },
    ]) {
      rerender(
        <Box data-testid="box" {...props}>
          x
        </Box>,
      );
      expect(screen.getByTestId("box").className).not.toBe(base);
    }
  });
});
