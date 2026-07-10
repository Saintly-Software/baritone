import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InfoButton } from "./index";

describe("InfoButton", () => {
  it("renders an icon-only button named by its aria-label", () => {
    render(<InfoButton aria-label="More info">Body</InfoButton>);
    const button = screen.getByRole("button", { name: "More info" });
    expect(button.tagName).toBe("BUTTON");
    // No visible text label — the accessible name comes from aria-label.
    expect(button).toHaveTextContent("");
  });

  it("wires the trigger up to the popover", () => {
    render(<InfoButton aria-label="More info">Body</InfoButton>);
    expect(screen.getByRole("button", { name: "More info" })).toHaveAttribute("aria-haspopup");
  });

  it("keeps the body hidden until the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<InfoButton aria-label="More info">Popover body</InfoButton>);

    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "More info" }));
    expect(await screen.findByText("Popover body")).toBeInTheDocument();
  });

  it("renders a header that names the popover", async () => {
    const user = userEvent.setup();
    render(
      <InfoButton aria-label="Open" header="Billing cycles">
        Body
      </InfoButton>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Billing cycles");
    expect(await screen.findByRole("heading", { name: "Billing cycles" })).toBeInTheDocument();
  });

  it("uses the provided icon over the default glyph", () => {
    render(
      <InfoButton aria-label="More info" icon={<svg data-testid="custom" />}>
        Body
      </InfoButton>,
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<InfoButton aria-label="More info">Popover body</InfoButton>);

    await user.click(screen.getByRole("button", { name: "More info" }));
    expect(await screen.findByText("Popover body")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("Popover body")).not.toBeInTheDocument());
  });

  it("closes when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <span data-testid="outside">outside</span>
        <InfoButton aria-label="More info">Popover body</InfoButton>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "More info" }));
    expect(await screen.findByText("Popover body")).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));
    await waitFor(() => expect(screen.queryByText("Popover body")).not.toBeInTheDocument());
  });

  describe("disabled", () => {
    it("uses aria-disabled (not the disabled attribute) and stays focusable", () => {
      render(
        <InfoButton aria-label="More info" disabled>
          Body
        </InfoButton>,
      );
      const button = screen.getByRole("button", { name: "More info" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");

      button.focus();
      expect(button).toHaveFocus();
    });

    it("does not open when disabled", async () => {
      const user = userEvent.setup();
      render(
        <InfoButton aria-label="More info" disabled>
          Popover body
        </InfoButton>,
      );

      await user.click(screen.getByRole("button", { name: "More info" }));

      // Give the popover a chance to (not) open.
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(screen.queryByText("Popover body")).not.toBeInTheDocument();
    });
  });
});
