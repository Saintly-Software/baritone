import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Grid, toGridTemplateAreas } from "./index";

describe("Grid", () => {
  it("renders a div by default and lays out its children", () => {
    render(
      <Grid data-testid="grid">
        <span>one</span>
        <span>two</span>
      </Grid>,
    );
    const el = screen.getByTestId("grid");
    expect(el.tagName).toBe("DIV");
    expect(el.className.length).toBeGreaterThan(0);
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
  });

  it("can render as a different element via the render prop", () => {
    render(
      <Grid render={<ul />} data-testid="grid">
        <li>item</li>
      </Grid>,
    );
    expect(screen.getByTestId("grid").tagName).toBe("UL");
  });

  it("merges a consumer className with the atoms classes", () => {
    render(
      <Grid className="extra" data-testid="grid">
        child
      </Grid>,
    );
    expect(screen.getByTestId("grid").className).toContain("extra");
  });

  it("expands a numeric `columns` into equal tracks", () => {
    render(
      <Grid columns={3} data-testid="grid">
        x
      </Grid>,
    );
    expect(screen.getByTestId("grid").style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
  });

  it("passes a string `columns`/`rows` through verbatim", () => {
    render(
      <Grid columns="200px 1fr" rows="auto 1fr" data-testid="grid">
        x
      </Grid>,
    );
    const el = screen.getByTestId("grid");
    expect(el.style.gridTemplateColumns).toBe("200px 1fr");
    expect(el.style.gridTemplateRows).toBe("auto 1fr");
  });

  it("quotes `areas` rows from an array", () => {
    render(
      <Grid areas={["header header", "nav main"]} data-testid="grid">
        x
      </Grid>,
    );
    expect(screen.getByTestId("grid").style.gridTemplateAreas).toBe('"header header" "nav main"');
  });

  it("joins and quotes `areas` rows from a 2D array of cells", () => {
    render(
      <Grid
        areas={[
          ["header", "header"],
          ["nav", "main"],
        ]}
        data-testid="grid"
      >
        x
      </Grid>,
    );
    expect(screen.getByTestId("grid").style.gridTemplateAreas).toBe('"header header" "nav main"');
  });

  it("quotes `areas` rows from a multi-line string, ignoring blank/indented lines", () => {
    render(
      <Grid
        areas={`
          header header
          nav    main
        `}
        data-testid="grid"
      >
        x
      </Grid>,
    );
    expect(screen.getByTestId("grid").style.gridTemplateAreas).toBe(
      '"header header" "nav    main"',
    );
  });

  it("lets a consumer `style` override the computed grid template", () => {
    render(
      <Grid columns={2} style={{ gridTemplateColumns: "1fr" }} data-testid="grid">
        x
      </Grid>,
    );
    expect(screen.getByTestId("grid").style.gridTemplateColumns).toBe("1fr");
  });

  it("applies a class for each layout knob", () => {
    const { rerender } = render(<Grid data-testid="grid">x</Grid>);
    const base = screen.getByTestId("grid").className;
    for (const props of [
      { inline: true },
      { gap: "4" as const },
      { align: "center" as const },
      { justify: "between" as const },
      { p: "2" as const },
      { mx: "auto" as const },
    ]) {
      rerender(
        <Grid data-testid="grid" {...props}>
          x
        </Grid>,
      );
      expect(screen.getByTestId("grid").className).not.toBe(base);
    }
  });
});

describe("toGridTemplateAreas", () => {
  it("wraps already-quoted rows without double-quoting", () => {
    expect(toGridTemplateAreas(['"a a"', '"b c"'])).toBe('"a a" "b c"');
  });

  it("wraps bare rows", () => {
    expect(toGridTemplateAreas(["a a", "b c"])).toBe('"a a" "b c"');
  });

  it("joins cell arrays with spaces", () => {
    expect(
      toGridTemplateAreas([
        ["a", "a"],
        ["b", "c"],
      ]),
    ).toBe('"a a" "b c"');
  });
});
