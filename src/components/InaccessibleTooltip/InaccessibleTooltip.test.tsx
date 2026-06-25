import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InaccessibleTooltip } from "./index";

describe("InaccessibleTooltip", () => {
  it("attaches to an arbitrary (non-focusable) element and shows it on hover", async () => {
    const user = userEvent.setup();
    render(
      <InaccessibleTooltip content="Supplemental hint" delay={0}>
        <span data-testid="trigger">Just a span</span>
      </InaccessibleTooltip>,
    );
    await user.hover(screen.getByTestId("trigger"));
    await waitFor(() => expect(screen.getByText("Supplemental hint")).toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it("renders the trigger element directly, with no extra wrapper", () => {
    render(
      <InaccessibleTooltip content="Hello">
        <button type="button">Trigger</button>
      </InaccessibleTooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Trigger" });
    trigger.focus();
    expect(trigger).toHaveFocus();
  });

  it("is keyboard-reachable when the trigger is focusable", async () => {
    const user = userEvent.setup();
    render(
      <InaccessibleTooltip content="Helpful hint">
        <button type="button">Trigger</button>
      </InaccessibleTooltip>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Trigger" })).toHaveFocus();
    await waitFor(() => expect(screen.getByText("Helpful hint")).toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(
      <InaccessibleTooltip content="Helpful hint" disabled delay={0}>
        <button type="button">Trigger</button>
      </InaccessibleTooltip>,
    );
    await user.hover(screen.getByRole("button", { name: "Trigger" }));
    expect(screen.queryByText("Helpful hint")).not.toBeInTheDocument();
  });
});
