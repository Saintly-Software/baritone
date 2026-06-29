import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Popover } from "../Popover";
import { Chip } from "./index";

describe("Chip", () => {
  it("renders as a span by default and wraps the text label in its own element", () => {
    render(<Chip data-testid="chip">Beta</Chip>);
    const chip = screen.getByTestId("chip");
    expect(chip.tagName).toBe("SPAN");
    // The (string) label gets its own element so the chip can truncate it; it is
    // not a raw text child of the root.
    const label = screen.getByText("Beta");
    expect(label).not.toBe(chip);
    expect(chip).toContainElement(label);
  });

  it("accepts an array of strings as children", () => {
    render(
      <Chip data-testid="chip">
        {"neutral"}/{"mid"}
      </Chip>,
    );
    expect(screen.getByTestId("chip")).toHaveTextContent("neutral/mid");
  });

  it("sets aria-disabled (not the disabled attribute) when disabled", () => {
    render(
      <Chip data-testid="chip" disabled>
        Off
      </Chip>,
    );
    const chip = screen.getByTestId("chip");
    expect(chip).toHaveAttribute("aria-disabled", "true");
    expect(chip).not.toHaveAttribute("disabled");
  });

  it("supports the render prop for polymorphism and merges className", () => {
    render(
      <Chip render={<a href="/x" className="mine" />} intent="primary">
        Link chip
      </Chip>,
    );
    const link = screen.getByRole("link", { name: "Link chip" });
    expect(link).toHaveAttribute("href", "/x");
    expect(link.className).toContain("mine");
  });

  it("passes through className", () => {
    render(
      <Chip data-testid="chip" className="extra">
        X
      </Chip>,
    );
    expect(screen.getByTestId("chip").className).toContain("extra");
  });

  describe("shape", () => {
    it("applies a distinct class for the pill shape vs. the default square", () => {
      render(
        <>
          <Chip data-testid="square">Square</Chip>
          <Chip data-testid="pill" shape="pill">
            Pill
          </Chip>
        </>,
      );
      const square = screen.getByTestId("square");
      const pill = screen.getByTestId("pill");
      // The pill variant adds a class the default square chip does not carry.
      const extra = pill.className
        .split(/\s+/)
        .filter((cls) => !square.className.split(/\s+/).includes(cls));
      expect(extra.length).toBeGreaterThan(0);
    });

    it("treats an explicit square shape the same as the default", () => {
      render(
        <>
          <Chip data-testid="default">Default</Chip>
          <Chip data-testid="explicit" shape="square">
            Explicit
          </Chip>
        </>,
      );
      expect(screen.getByTestId("explicit").className).toBe(
        screen.getByTestId("default").className,
      );
    });
  });

  describe("clickable label", () => {
    it("renders the text label as a button and fires onClick", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<Chip onClick={onClick}>Filter</Chip>);
      const button = screen.getByRole("button", { name: "Filter" });
      expect(button.tagName).toBe("BUTTON");
      await user.click(button);
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("keeps the label a plain span (no button) when onClick is omitted", () => {
      render(<Chip>Filter</Chip>);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.getByText("Filter").tagName).toBe("SPAN");
    });

    it("uses aria-disabled (not the native attribute) on the label button when the chip is disabled, keeps it focusable, and swallows the click", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Chip disabled onClick={onClick}>
          Filter
        </Chip>,
      );
      const button = screen.getByRole("button", { name: "Filter" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");

      button.focus();
      expect(button).toHaveFocus();

      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("popover", () => {
    it("renders the label as a button trigger carrying the popup a11y wiring", async () => {
      const user = userEvent.setup();
      render(<Chip popover={<Popover>Popover body</Popover>}>Status</Chip>);

      const trigger = screen.getByRole("button", { name: "Status" });
      expect(trigger.tagName).toBe("BUTTON");
      // base-ui marks the trigger as controlling a dialog popup, collapsed to start.
      expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      // The popover is closed until the label is clicked.
      expect(screen.queryByText("Popover body")).not.toBeInTheDocument();

      await user.click(trigger);

      const popup = await screen.findByRole("dialog");
      expect(popup).toHaveTextContent("Popover body");
      // Once open, the trigger is expanded and `aria-controls` points at the popup.
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(trigger).toHaveAttribute("aria-controls", popup.id);
      expect(popup.id).toBeTruthy();
    });

    it("keeps the label a plain span (no trigger) when popover is omitted", () => {
      render(<Chip>Status</Chip>);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.getByText("Status").tagName).toBe("SPAN");
    });

    it("closes the popover via a Popover.Close in the content", async () => {
      const user = userEvent.setup();
      render(
        <Chip
          popover={
            <Popover
              footer={<Popover.Footer>{<Popover.Close>Done</Popover.Close>}</Popover.Footer>}
            >
              Popover body
            </Popover>
          }
        >
          Status
        </Chip>,
      );

      await user.click(screen.getByRole("button", { name: "Status" }));
      expect(await screen.findByText("Popover body")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Done" }));
      await waitFor(() => expect(screen.queryByText("Popover body")).not.toBeInTheDocument());
    });

    it("still fires the chip's own onClick when the label trigger is pressed", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Chip popover={<Popover>Popover body</Popover>} onClick={onClick}>
          Status
        </Chip>,
      );

      await user.click(screen.getByRole("button", { name: "Status" }));
      expect(onClick).toHaveBeenCalledOnce();
      expect(await screen.findByText("Popover body")).toBeInTheDocument();
    });

    it("uses aria-disabled (not the native attribute) on a disabled trigger, keeps it focusable, and won't open the popover", async () => {
      const user = userEvent.setup();
      render(
        <Chip disabled popover={<Popover>Popover body</Popover>}>
          Status
        </Chip>,
      );

      const trigger = screen.getByRole("button", { name: "Status" });
      expect(trigger).toHaveAttribute("aria-disabled", "true");
      expect(trigger).not.toHaveAttribute("disabled");

      trigger.focus();
      expect(trigger).toHaveFocus();

      await user.click(trigger);
      expect(screen.queryByText("Popover body")).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("does not mount the popover when there is no text label to trigger it", () => {
      render(<Chip popover={<Popover>Popover body</Popover>} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByText("Popover body")).not.toBeInTheDocument();
    });
  });

  describe("loading", () => {
    it("replaces the chip's entire content with a spinner and marks it busy + inert", () => {
      render(
        <Chip
          data-testid="chip"
          loading
          leadAdornments={[<Chip.Adornment icon={<span>L</span>} />]}
          trailAdornments={[
            <Chip.Adornment icon={<span>R</span>} label="Remove" onClick={() => {}} />,
          ]}
        >
          Saving
        </Chip>,
      );
      const chip = screen.getByTestId("chip");
      // Label and both adornment lists are gone — replaced by the spinner.
      expect(chip).not.toHaveTextContent("Saving");
      expect(screen.queryByText("L")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
      // The lone child is the decorative (aria-hidden) spinner.
      expect(chip.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
      // Busy + inert, mirroring Button's loading state.
      expect(chip).toHaveAttribute("aria-busy", "true");
      expect(chip).toHaveAttribute("aria-disabled", "true");
    });

    it("renders content normally and is not busy when not loading", () => {
      render(<Chip data-testid="chip">Idle</Chip>);
      const chip = screen.getByTestId("chip");
      expect(chip).toHaveTextContent("Idle");
      expect(chip).not.toHaveAttribute("aria-busy");
      expect(chip).not.toHaveAttribute("aria-disabled");
    });
  });

  describe("adornments", () => {
    it("renders lead adornments before, and trail adornments after, the label", () => {
      render(
        <Chip
          data-testid="chip"
          leadAdornments={[<Chip.Adornment icon={<span>L</span>} />]}
          trailAdornments={[
            <Chip.Adornment icon={<span>R</span>} label="Remove" onClick={() => {}} />,
          ]}
        >
          Tag
        </Chip>,
      );
      expect(screen.getByTestId("chip").textContent).toBe("LTagR");
    });

    it("names a regular adornment via `label` (role img) and leaves a label-less one unnamed", () => {
      render(
        <Chip
          leadAdornments={[<Chip.Adornment icon={<svg />} label="Verified" />]}
          trailAdornments={[<Chip.Adornment icon={<span data-testid="bare">·</span>} />]}
        >
          Tag
        </Chip>,
      );
      expect(screen.getByRole("img", { name: "Verified" })).toBeInTheDocument();
      const bareWrapper = screen.getByTestId("bare").parentElement;
      expect(bareWrapper).not.toHaveAttribute("role");
      expect(bareWrapper).not.toHaveAttribute("aria-label");
    });

    it("renders a clickable adornment as a button and fires onClick", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Chip
          trailAdornments={[
            <Chip.Adornment icon={<span>×</span>} label="Remove" onClick={onClick} />,
          ]}
        >
          Tag
        </Chip>,
      );
      const button = screen.getByRole("button", { name: "Remove" });
      expect(button.tagName).toBe("BUTTON");
      await user.click(button);
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("uses aria-disabled (not the native attribute) on a disabled clickable adornment and keeps it focusable", () => {
      render(
        <Chip
          trailAdornments={[
            <Chip.Adornment icon={<span>×</span>} label="Remove" disabled onClick={() => {}} />,
          ]}
        >
          Tag
        </Chip>,
      );
      const button = screen.getByRole("button", { name: "Remove" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");

      button.focus();
      expect(button).toHaveFocus();
    });

    it("does not fire a disabled clickable adornment's onClick", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Chip
          trailAdornments={[
            <Chip.Adornment icon={<span>×</span>} label="Remove" disabled onClick={onClick} />,
          ]}
        >
          Tag
        </Chip>,
      );
      await user.click(screen.getByRole("button", { name: "Remove" }));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("makes clickable adornments inert (but focusable) when the chip is disabled", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Chip
          disabled
          trailAdornments={[
            <Chip.Adornment icon={<span>×</span>} label="Remove" onClick={onClick} />,
          ]}
        >
          Tag
        </Chip>,
      );
      const button = screen.getByRole("button", { name: "Remove" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");

      button.focus();
      expect(button).toHaveFocus();

      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("renders a link adornment as an anchor with href and accessible name", () => {
      render(
        <Chip
          trailAdornments={[
            <Chip.Adornment icon={<span>↗</span>} label="Open docs" href="/docs" />,
          ]}
        >
          Tag
        </Chip>,
      );
      const link = screen.getByRole("link", { name: "Open docs" });
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "/docs");
    });

    it("appends a clickable remove button when handleRemove is supplied and fires it", async () => {
      const handleRemove = vi.fn();
      const user = userEvent.setup();
      render(<Chip handleRemove={handleRemove}>Tag</Chip>);
      const button = screen.getByRole("button", { name: "Remove" });
      expect(button.tagName).toBe("BUTTON");
      await user.click(button);
      expect(handleRemove).toHaveBeenCalledOnce();
    });

    it("renders no remove button when handleRemove is omitted", () => {
      render(<Chip>Tag</Chip>);
      expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
    });

    it("places the handleRemove button last, after any supplied trail adornments", () => {
      render(
        <Chip
          handleRemove={() => {}}
          trailAdornments={[
            <Chip.Adornment icon={<span>↗</span>} label="Open docs" href="/docs" />,
          ]}
        >
          Tag
        </Chip>,
      );
      const link = screen.getByRole("link", { name: "Open docs" });
      const remove = screen.getByRole("button", { name: "Remove" });
      // The built-in remove "×" follows the supplied trailing link in the DOM.
      expect(link.compareDocumentPosition(remove) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("makes the handleRemove button inert (but focusable) when the chip is disabled", async () => {
      const handleRemove = vi.fn();
      const user = userEvent.setup();
      render(
        <Chip disabled handleRemove={handleRemove}>
          Tag
        </Chip>,
      );
      const button = screen.getByRole("button", { name: "Remove" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");

      button.focus();
      expect(button).toHaveFocus();

      await user.click(button);
      expect(handleRemove).not.toHaveBeenCalled();
    });

    it("supports the render prop on a link adornment (merges className)", () => {
      render(
        <Chip
          trailAdornments={[
            <Chip.Adornment
              icon={<span>↗</span>}
              label="Open docs"
              href="/docs"
              render={<a className="mine" />}
            />,
          ]}
        >
          Tag
        </Chip>,
      );
      const link = screen.getByRole("link", { name: "Open docs" });
      expect(link).toHaveAttribute("href", "/docs");
      expect(link.className).toContain("mine");
    });
  });
});
