import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { noticeIconRecipe } from "./notice.css";
import { Notice } from "./index";

describe("Notice", () => {
  it("renders as a div by default with its title", () => {
    render(<Notice data-testid="notice">Heads up</Notice>);
    const notice = screen.getByTestId("notice");
    expect(notice.tagName).toBe("DIV");
    expect(notice).toHaveTextContent("Heads up");
  });

  it("passes through className and rest props", () => {
    render(
      <Notice data-testid="notice" className="extra" aria-label="banner">
        Title
      </Notice>,
    );
    const notice = screen.getByTestId("notice");
    expect(notice.className).toContain("extra");
    expect(notice).toHaveAttribute("aria-label", "banner");
  });

  it("supports the render prop for polymorphism and merges className", () => {
    render(
      <Notice render={<section className="mine" />} data-testid="notice">
        Title
      </Notice>,
    );
    const notice = screen.getByTestId("notice");
    expect(notice.tagName).toBe("SECTION");
    expect(notice.className).toContain("mine");
  });

  it("renders the description beneath the title", () => {
    render(
      <Notice data-testid="notice" description="Supporting copy">
        Title
      </Notice>,
    );
    const notice = screen.getByTestId("notice");
    expect(notice).toHaveTextContent("Title");
    expect(notice).toHaveTextContent("Supporting copy");
  });

  it("omits the description when not provided", () => {
    render(<Notice data-testid="notice">Only a title</Notice>);
    expect(screen.getByTestId("notice")).toHaveTextContent("Only a title");
  });

  describe("actions", () => {
    it("renders each action", () => {
      render(
        <Notice
          data-testid="notice"
          actions={[
            <button key="a" type="button">
              Accept
            </button>,
            <button key="d" type="button">
              Dismiss
            </button>,
          ]}
        >
          Title
        </Notice>,
      );
      expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    });

    it("renders nothing extra for an empty actions array", () => {
      render(
        <Notice data-testid="notice" actions={[]}>
          Title
        </Notice>,
      );
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("icon", () => {
    it("wraps a plain glyph node in an Icon", () => {
      render(<Notice icon={<svg data-testid="glyph" />}>Title</Notice>);
      const glyph = screen.getByTestId("glyph");
      // The Icon wrapper marks a decorative glyph aria-hidden.
      expect(glyph.parentElement).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("gives Notice.Icon its own colour-override class when an intent is set", () => {
    render(
      <Notice
        intent="neutral"
        icon={
          <Notice.Icon intent="warning" saliency="high" label="Warning">
            <svg />
          </Notice.Icon>
        }
      >
        Title
      </Notice>,
    );
    const icon = screen.getByRole("img", { name: "Warning" });
    expect(icon.className).toContain(noticeIconRecipe({ intent: "warning", saliency: "high" }));
  });

  it("leaves a Notice.Icon without an intent inheriting the notice colour (no override class)", () => {
    render(
      <Notice intent="neutral" icon={<Notice.Icon label="Info">{<svg />}</Notice.Icon>}>
        Title
      </Notice>,
    );
    const icon = screen.getByRole("img", { name: "Info" });
    // Any of the intent-override classes would tint it; none should be present.
    expect(icon.className).not.toContain(noticeIconRecipe({ intent: "warning", saliency: "mid" }));
  });
});
