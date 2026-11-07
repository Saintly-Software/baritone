import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InternalTooltip } from "./index";

describe("InternalTooltip", () => {
  it("renders the trigger element directly (no extra wrapper) and keeps it focusable", () => {
    render(
      <InternalTooltip content="Hello">
        <button type="button">Trigger</button>
      </InternalTooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Trigger" });
    trigger.focus();
    expect(trigger).toHaveFocus();
  });

  it("shows its content when the trigger is focused", async () => {
    const user = userEvent.setup();
    render(
      <InternalTooltip content="Helpful hint">
        <button type="button">Trigger</button>
      </InternalTooltip>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Trigger" })).toHaveFocus();
    await waitFor(() => expect(screen.getByText("Helpful hint")).toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it("shows its content on hover", async () => {
    const user = userEvent.setup();
    render(
      <InternalTooltip content="Helpful hint" delay={0}>
        <button type="button">Trigger</button>
      </InternalTooltip>,
    );
    await user.hover(screen.getByRole("button", { name: "Trigger" }));
    await waitFor(() => expect(screen.getByText("Helpful hint")).toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(
      <InternalTooltip content="Helpful hint" disabled delay={0}>
        <button type="button">Trigger</button>
      </InternalTooltip>,
    );
    await user.hover(screen.getByRole("button", { name: "Trigger" }));
    expect(screen.queryByText("Helpful hint")).not.toBeInTheDocument();
  });

  it("respects the controlled open state", () => {
    render(
      <InternalTooltip content="Always visible" open>
        <button type="button">Trigger</button>
      </InternalTooltip>,
    );
    expect(screen.getByText("Always visible")).toBeInTheDocument();
  });
});
