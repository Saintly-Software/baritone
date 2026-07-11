import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { textIntentRecipe } from "../../styles/recipes/text.css";
import { HelpText } from "./index";

describe("HelpText", () => {
  it("renders as a <p> by default with its message", () => {
    render(<HelpText data-testid="help">Helper copy</HelpText>);
    const el = screen.getByTestId("help");
    expect(el.tagName).toBe("P");
    expect(el).toHaveTextContent("Helper copy");
  });

  it("passes through className and rest props", () => {
    render(
      <HelpText data-testid="help" className="extra" id="pw-help">
        Copy
      </HelpText>,
    );
    const el = screen.getByTestId("help");
    expect(el.className).toContain("extra");
    expect(el).toHaveAttribute("id", "pw-help");
  });

  it("supports the render prop for polymorphism and merges className", () => {
    render(
      <HelpText render={<span className="mine" />} data-testid="help">
        Copy
      </HelpText>,
    );
    const el = screen.getByTestId("help");
    expect(el.tagName).toBe("SPAN");
    expect(el.className).toContain("mine");
  });

  describe("icon", () => {
    it("shows no icon by default (neutral intent)", () => {
      render(<HelpText data-testid="help">Copy</HelpText>);
      expect(screen.getByTestId("help").querySelector("svg")).toBeNull();
    });

    it("auto-shows a decorative warning glyph on an attention intent", () => {
      render(
        <HelpText data-testid="help" intent="negative">
          Copy
        </HelpText>,
      );
      const svg = screen.getByTestId("help").querySelector("svg");
      expect(svg).not.toBeNull();
      // Wrapped in a decorative (aria-hidden) Icon since the text carries meaning.
      expect(svg?.parentElement).toHaveAttribute("aria-hidden", "true");
    });

    it("wraps a custom glyph in an Icon", () => {
      render(
        <HelpText intent="primary" icon={<svg data-testid="glyph" />}>
          Copy
        </HelpText>,
      );
      expect(screen.getByTestId("glyph").parentElement).toHaveAttribute("aria-hidden", "true");
    });

    it("hideIcon drops the glyph even on an attention intent", () => {
      render(
        <HelpText data-testid="help" invalid hideIcon>
          Copy
        </HelpText>,
      );
      expect(screen.getByTestId("help").querySelector("svg")).toBeNull();
    });
  });

  describe("convenience flags", () => {
    it("invalid resolves to the negative intent colour", () => {
      render(
        <HelpText data-testid="help" invalid>
          Required
        </HelpText>,
      );
      expect(screen.getByTestId("help").className).toContain(
        textIntentRecipe({ intent: "negative", saliency: "mid" }),
      );
    });

    it("disabled resolves to a dimmed neutral and wins over invalid", () => {
      render(
        <HelpText data-testid="help" invalid disabled>
          Copy
        </HelpText>,
      );
      const el = screen.getByTestId("help");
      expect(el.className).toContain(textIntentRecipe({ intent: "neutral", saliency: "low" }));
      // No native `disabled` attribute — HelpText is non-interactive text.
      expect(el).not.toHaveAttribute("disabled");
    });
  });
});
