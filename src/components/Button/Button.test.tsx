import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./index";

describe("Button", () => {
  it('renders its text in a <button> and defaults to type="button"', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  it("renders start and end icons alongside the label", () => {
    render(
      <Button startIcon={<span data-testid="start" />} endIcon={<span data-testid="end" />}>
        Label
      </Button>,
    );
    expect(screen.getByTestId("start")).toBeInTheDocument();
    expect(screen.getByTestId("end")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Label" })).toBeInTheDocument();
  });

  describe("disabled", () => {
    it("uses aria-disabled (not the disabled attribute) and stays focusable", () => {
      render(<Button disabled>Off</Button>);
      const button = screen.getByRole("button", { name: "Off" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");

      button.focus();
      expect(button).toHaveFocus();
    });

    it("does not fire onClick when disabled", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Button disabled onClick={onClick}>
          Off
        </Button>,
      );
      await user.click(screen.getByRole("button", { name: "Off" }));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("loading", () => {
    it("disables interaction, sets aria-busy, and keeps the accessible name", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Button loading onClick={onClick}>
          Saving
        </Button>,
      );
      // Label still names the control (spinner is decorative), so getByRole works.
      const button = screen.getByRole("button", { name: "Saving" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toHaveAttribute("aria-busy", "true");

      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  it("fires onClick when enabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not support aria-label (rejected by types, stripped at runtime)", () => {
    const props = { "aria-label": "nope" } as Record<string, unknown>;
    // @ts-expect-error aria-label is typed as `never` on ButtonProps.
    render(<Button aria-label="nope">Text</Button>);
    // Even when forced through a cast, it never reaches the DOM.
    render(
      <Button {...props} data-testid="forced">
        Text
      </Button>,
    );
    expect(screen.getByTestId("forced")).not.toHaveAttribute("aria-label");
  });

  describe("icon-only", () => {
    it("renders a square button named by the required aria-label, with no visible label", () => {
      render(<Button icon={<span data-testid="glyph" />} aria-label="Add item" />);
      const button = screen.getByRole("button", { name: "Add item" });
      expect(button.tagName).toBe("BUTTON");
      expect(button).toHaveAttribute("aria-label", "Add item");
      expect(screen.getByTestId("glyph")).toBeInTheDocument();
      // No visible text content — the glyph is the whole content.
      expect(button).toHaveTextContent("");
    });

    it("fires onClick when enabled", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<Button icon={<span />} aria-label="Add" onClick={onClick} />);
      await user.click(screen.getByRole("button", { name: "Add" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("supports disabled (aria-disabled) and suppresses onClick", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<Button icon={<span />} aria-label="Add" disabled onClick={onClick} />);
      const button = screen.getByRole("button", { name: "Add" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("keeps its accessible name and sets aria-busy while loading", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<Button icon={<span />} aria-label="Add" loading onClick={onClick} />);
      const button = screen.getByRole("button", { name: "Add" });
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toHaveAttribute("aria-disabled", "true");
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("rejects children, startIcon/endIcon, and appearance=text on the icon-only arm", () => {
      render(
        // @ts-expect-error `children` is unsupported alongside `icon`.
        <Button icon={<span />} aria-label="Add">
          Label
        </Button>,
      );
      // @ts-expect-error `startIcon` is unsupported on the icon-only arm.
      render(<Button icon={<span />} aria-label="Add" startIcon={<span />} />);
      // @ts-expect-error the text appearance is label-only (no icon-only mode).
      render(<Button icon={<span />} aria-label="Add" appearance="text" />);
      expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });

    it("requires an aria-label when icon-only", () => {
      // @ts-expect-error `aria-label` is required on the icon-only arm.
      render(<Button icon={<span data-testid="no-label" />} />);
      expect(screen.getByTestId("no-label")).toBeInTheDocument();
    });
  });

  describe('appearance="text"', () => {
    it("renders a real <button> with the label as its accessible name", () => {
      render(<Button appearance="text">Learn more</Button>);
      const button = screen.getByRole("button", { name: "Learn more" });
      expect(button.tagName).toBe("BUTTON");
      expect(button).toHaveAttribute("type", "button");
    });

    it("supports start/end icons, intent, saliency, and variant", () => {
      render(
        <Button
          appearance="text"
          intent="negative"
          saliency="high"
          variant="sm"
          startIcon={<span data-testid="start" />}
          endIcon={<span data-testid="end" />}
        >
          Remove
        </Button>,
      );
      expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
      expect(screen.getByTestId("start")).toBeInTheDocument();
      expect(screen.getByTestId("end")).toBeInTheDocument();
    });

    it("still disables via aria-disabled and suppresses onClick", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Button appearance="text" disabled onClick={onClick}>
          Off
        </Button>,
      );
      const button = screen.getByRole("button", { name: "Off" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("fires onClick when enabled", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Button appearance="text" onClick={onClick}>
          Go
        </Button>,
      );
      await user.click(screen.getByRole("button", { name: "Go" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not render a spinner even if `loading` is forced through", () => {
      // `loading` is typed away on the text appearance; a forced JS caller must
      // not get a spinner or an aria-busy control.
      const forced = { loading: true } as Record<string, unknown>;
      render(
        <Button appearance="text" {...forced}>
          Saving
        </Button>,
      );
      const button = screen.getByRole("button", { name: "Saving" });
      expect(button).not.toHaveAttribute("aria-busy");
      expect(button).not.toHaveAttribute("aria-disabled");
    });

    it("rejects size, loading, and variant that don't belong to the appearance", () => {
      render(
        // @ts-expect-error `size` is unsupported on the text appearance.
        <Button appearance="text" size="lg">
          A
        </Button>,
      );
      render(
        // @ts-expect-error `loading` is unsupported on the text appearance.
        <Button appearance="text" loading>
          B
        </Button>,
      );
      // @ts-expect-error `variant` is unsupported on the default appearance.
      render(<Button variant="sm">C</Button>);
      expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
    });
  });

  describe("disabled tooltip", () => {
    it("shows the disabledReason when a disabled button is focused", async () => {
      const user = userEvent.setup();
      render(
        <Button disabled disabledReason="Add a title first">
          Publish
        </Button>,
      );
      await user.tab();
      expect(screen.getByRole("button", { name: "Publish" })).toHaveFocus();
      await waitFor(() => expect(screen.getByText("Add a title first")).toBeInTheDocument(), {
        timeout: 2000,
      });
    });

    it("does not show the tooltip when the button is enabled", async () => {
      const user = userEvent.setup();
      render(<Button disabledReason="Add a title first">Publish</Button>);
      await user.hover(screen.getByRole("button", { name: "Publish" }));
      expect(screen.queryByText("Add a title first")).not.toBeInTheDocument();
    });

    it("does not show the tooltip while loading", async () => {
      const user = userEvent.setup();
      render(
        <Button loading disabledReason="Add a title first">
          Publish
        </Button>,
      );
      await user.hover(screen.getByRole("button", { name: "Publish" }));
      expect(screen.queryByText("Add a title first")).not.toBeInTheDocument();
    });
  });
});
