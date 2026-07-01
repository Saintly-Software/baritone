import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { vars } from "../../theme/contract.css";
import { buildDefaultTokens } from "../../theme/defaultTokens";
import { BaritoneTheme } from "./index";

// The contract leaf is a `var(--name)` reference; strip the wrapper to get the
// underlying custom-property name so we can read its resolved inline value.
const operatorProp = vars.oklchOperator.slice(4, -1);

const lightTokens = buildDefaultTokens("light");

describe("BaritoneTheme", () => {
  it("renders a div wrapper by default", () => {
    render(
      <BaritoneTheme tokens={lightTokens} scheme="light">
        <span>hi</span>
      </BaritoneTheme>,
    );
    expect(screen.getByText("hi").parentElement?.tagName).toBe("DIV");
  });

  it("applies token values as inline CSS custom properties", () => {
    render(
      <BaritoneTheme data-testid="root" tokens={lightTokens} scheme="light">
        child
      </BaritoneTheme>,
    );
    const root = screen.getByTestId("root");
    // At least one contract variable should be set inline.
    const inline = root.getAttribute("style") ?? "";
    expect(inline).toMatch(/--[\w-]+:/);
  });

  it("sets the oklch interaction operator per scheme (-1 light / 1 dark)", () => {
    const { rerender } = render(
      <BaritoneTheme data-testid="root" tokens={lightTokens} scheme="light">
        x
      </BaritoneTheme>,
    );
    expect(screen.getByTestId("root").style.getPropertyValue(operatorProp).trim()).toBe("-1");

    rerender(
      <BaritoneTheme data-testid="root" tokens={buildDefaultTokens("dark")} scheme="dark">
        x
      </BaritoneTheme>,
    );
    expect(screen.getByTestId("root").style.getPropertyValue(operatorProp).trim()).toBe("1");
  });

  it("can render as a different element via the render prop", () => {
    render(
      <BaritoneTheme tokens={lightTokens} scheme="light" render={<section />}>
        content
      </BaritoneTheme>,
    );
    expect(screen.getByText("content").tagName).toBe("SECTION");
  });

  it("preserves brand vars while merging consumer style", () => {
    render(
      <BaritoneTheme
        data-testid="root"
        tokens={lightTokens}
        scheme="light"
        style={{ margin: "8px" }}
      >
        x
      </BaritoneTheme>,
    );
    const root = screen.getByTestId("root");
    expect(root.style.margin).toBe("8px");
    // Consumer layout style did not wipe out the inline theme variables.
    expect(root.getAttribute("style") ?? "").toMatch(/--[\w-]+:/);
  });
});
