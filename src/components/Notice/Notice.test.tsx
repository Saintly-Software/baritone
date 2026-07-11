import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

  describe("chip", () => {
    it("renders a status chip on the title line", () => {
      render(<Notice chip={<Notice.Chip>New</Notice.Chip>}>Title</Notice>);
      expect(screen.getByText("New")).toBeInTheDocument();
    });
  });

  describe("close", () => {
    it("renders no dismiss button without `close`", () => {
      render(<Notice>Title</Notice>);
      expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    });

    it("wraps a handler into the built-in Dismiss button and fires it on click", async () => {
      const onClose = vi.fn();
      render(<Notice close={onClose}>Title</Notice>);
      await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("renders a supplied <Notice.Close> with its own label", async () => {
      const onClose = vi.fn();
      render(<Notice close={<Notice.Close label="Close" onClick={onClose} />}>Title</Notice>);
      expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Notice.Action", () => {
    it("fires onClick for a button action", async () => {
      const onClick = vi.fn();
      render(
        <Notice
          actions={[
            <Notice.Action key="a" onClick={onClick}>
              Go
            </Notice.Action>,
          ]}
        >
          Title
        </Notice>,
      );
      const button = screen.getByRole("button", { name: "Go" });
      expect(button.tagName).toBe("BUTTON");
      await userEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("renders a link action as an anchor with its href", () => {
      render(
        <Notice
          actions={[
            <Notice.Action key="a" href="/docs">
              Docs
            </Notice.Action>,
          ]}
        >
          Title
        </Notice>,
      );
      const link = screen.getByRole("link", { name: "Docs" });
      expect(link).toHaveAttribute("href", "/docs");
    });

    it("names an icon-only action with its label", () => {
      render(
        <Notice
          actions={[
            <Notice.Action key="a" icon={<svg />} label="More options" onClick={() => {}} />,
          ]}
        >
          Title
        </Notice>,
      );
      expect(screen.getByRole("button", { name: "More options" })).toBeInTheDocument();
    });
  });

  describe("disabled", () => {
    it("marks the notice aria-disabled", () => {
      render(
        <Notice data-testid="notice" disabled>
          Title
        </Notice>,
      );
      expect(screen.getByTestId("notice")).toHaveAttribute("aria-disabled", "true");
    });

    it("makes the close button inert but focusable (aria-disabled, click swallowed)", async () => {
      const onClose = vi.fn();
      render(
        <Notice disabled close={onClose}>
          Title
        </Notice>,
      );
      const button = screen.getByRole("button", { name: "Dismiss" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      await userEvent.click(button);
      expect(onClose).not.toHaveBeenCalled();
    });

    it("makes actions inert via context", async () => {
      const onClick = vi.fn();
      render(
        <Notice
          disabled
          actions={[
            <Notice.Action key="a" onClick={onClick}>
              Go
            </Notice.Action>,
          ]}
        >
          Title
        </Notice>,
      );
      const button = screen.getByRole("button", { name: "Go" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      await userEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("role / aria-live", () => {
    it("defaults to role=status for informational intents", () => {
      render(
        <Notice data-testid="notice" intent="primary">
          Title
        </Notice>,
      );
      expect(screen.getByTestId("notice")).toHaveAttribute("role", "status");
    });

    it("uses role=alert for negative and warning intents", () => {
      render(
        <Notice data-testid="negative" intent="negative">
          Title
        </Notice>,
      );
      render(
        <Notice data-testid="warning" intent="warning">
          Title
        </Notice>,
      );
      expect(screen.getByTestId("negative")).toHaveAttribute("role", "alert");
      expect(screen.getByTestId("warning")).toHaveAttribute("role", "alert");
    });

    it("lets a consumer override the role", () => {
      render(
        <Notice data-testid="notice" intent="negative" role="region">
          Title
        </Notice>,
      );
      expect(screen.getByTestId("notice")).toHaveAttribute("role", "region");
    });
  });
});
