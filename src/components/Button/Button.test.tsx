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

  it("supports the render prop for polymorphism and merges className", () => {
    render(
      <Button render={<a href="/x" className="mine" />} intent="primary">
        Link button
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Link button" });
    expect(link).toHaveAttribute("href", "/x");
    expect(link.className).toContain("mine");
  });

  it("collapses a disabled render-as-link to an inert <div> (via InternalGenericButtonAnchor)", async () => {
    // A `render` link is treated as a link, and a disabled link has no honest HTML
    // form, so it degrades to a plain div rather than a still-navigable <a>.
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button render={<a href="/x" />} disabled onClick={onClick}>
        Link button
      </Button>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    const div = screen.getByText("Link button").closest("div");
    expect(div).not.toBeNull();
    expect(div).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByText("Link button"));
    expect(onClick).not.toHaveBeenCalled();
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
