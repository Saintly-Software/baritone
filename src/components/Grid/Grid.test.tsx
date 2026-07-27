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
      { placeItems: "center" as const },
      { placeContent: "center" as const },
      { minHeight: "screen" as const },
      { maxHeight: "full" as const },
      { position: "sticky" as const },
      { top: "0" as const },
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

  it("maps each placeItems value to a distinct class", () => {
    const classes = (["start", "center", "end", "stretch"] as const).map((placeItems) => {
      const { unmount } = render(
        <Grid placeItems={placeItems} data-testid="grid">
          x
        </Grid>,
      );
      const className = screen.getByTestId("grid").className;
      unmount();
      return className;
    });
    expect(new Set(classes).size).toBe(4);
  });

  // `placeItems` / `placeContent` are shorthands that also own the `align-items` /
  // `justify-content` longhands. Precedence is made explicit by omitting the
  // conflicting longhand — not left to vanilla-extract's class emission order.
  it("omits the align longhand when placeItems is set (explicit precedence)", () => {
    const { rerender } = render(
      <Grid placeItems="center" data-testid="grid">
        x
      </Grid>,
    );
    const placeOnly = screen.getByTestId("grid").className;
    // `align` adds nothing on top of `placeItems`, so the two render identically…
    rerender(
      <Grid align="start" placeItems="center" data-testid="grid">
        x
      </Grid>,
    );
    expect(screen.getByTestId("grid").className).toBe(placeOnly);
    // …but `align="start"` alone *does* emit a class (guards the assertion above).
    rerender(
      <Grid align="start" data-testid="grid">
        x
      </Grid>,
    );
    expect(screen.getByTestId("grid").className).not.toBe(placeOnly);
  });

  it("omits the justify longhand when placeContent is set (explicit precedence)", () => {
    const { rerender } = render(
      <Grid placeContent="center" data-testid="grid">
        x
      </Grid>,
    );
    const placeOnly = screen.getByTestId("grid").className;
    rerender(
      <Grid justify="between" placeContent="center" data-testid="grid">
        x
      </Grid>,
    );
    expect(screen.getByTestId("grid").className).toBe(placeOnly);
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
