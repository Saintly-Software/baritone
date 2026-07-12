import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./index";

describe("Tooltip", () => {
  it("renders the trigger as a real Button", () => {
    render(
      <Tooltip content="Copied to clipboard">
        <Tooltip.Trigger>Copy</Tooltip.Trigger>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Copy" });
    expect(trigger.tagName).toBe("BUTTON");
  });

  it("keeps the hint hidden until the trigger is hovered", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copied to clipboard">
        <Tooltip.Trigger delay={0}>Copy</Tooltip.Trigger>
      </Tooltip>,
    );

    expect(screen.queryByText("Copied to clipboard")).not.toBeInTheDocument();

    await user.hover(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(screen.getByText("Copied to clipboard")).toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it("opens on keyboard focus, not just hover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copied to clipboard">
        <Tooltip.Trigger delay={0}>Copy</Tooltip.Trigger>
      </Tooltip>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "Copy" })).toHaveFocus();
    await waitFor(() => expect(screen.getByText("Copied to clipboard")).toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it("describes the trigger via aria-describedby when open", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copied to clipboard">
        <Tooltip.Trigger delay={0}>Copy</Tooltip.Trigger>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Copy" });
    await user.hover(trigger);

    await waitFor(() => expect(trigger).toHaveAttribute("aria-describedby"), { timeout: 2000 });
    const describedById = trigger.getAttribute("aria-describedby");
    expect(describedById).toBeTruthy();
    // The referenced element is the tooltip surface carrying the content.
    const description = document.getElementById(describedById as string);
    expect(description).toHaveTextContent("Copied to clipboard");
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copied to clipboard" disabled>
        <Tooltip.Trigger delay={0}>Copy</Tooltip.Trigger>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "Copy" }));
    expect(screen.queryByText("Copied to clipboard")).not.toBeInTheDocument();
  });

  it("respects the controlled open state", () => {
    render(
      <Tooltip content="Always visible" open>
        <Tooltip.Trigger>Copy</Tooltip.Trigger>
      </Tooltip>,
    );
    expect(screen.getByText("Always visible")).toBeInTheDocument();
  });

  it("stays tabbable while disabled (aria-disabled, not native disabled)", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Why it's off">
        <Tooltip.Trigger disabled disabledReason="Not available yet">
          Copy
        </Tooltip.Trigger>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Copy" });
    expect(trigger).toHaveAttribute("aria-disabled", "true");
    expect(trigger).not.toBeDisabled();

    await user.tab();
    expect(trigger).toHaveFocus();
  });
});
