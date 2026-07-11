import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Text } from "../Text";
import { ConfirmationModal } from "./index";

function openWith(props: Partial<React.ComponentProps<typeof ConfirmationModal>> = {}) {
  return render(
    <ConfirmationModal
      trigger={<ConfirmationModal.Trigger>Delete</ConfirmationModal.Trigger>}
      header="Delete project?"
      {...props}
    >
      <Text render={<p />}>This permanently removes the project.</Text>
    </ConfirmationModal>,
  );
}

describe("ConfirmationModal", () => {
  it("stays closed until the trigger is pressed, then shows header and body", async () => {
    const user = userEvent.setup();
    openWith();

    expect(screen.queryByText("This permanently removes the project.")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("heading", { name: "Delete project?" })).toBeInTheDocument();
    expect(screen.getByText("This permanently removes the project.")).toBeInTheDocument();
  });

  it("labels the dialog from the header", async () => {
    const user = userEvent.setup();
    openWith();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("dialog")).toHaveAccessibleName("Delete project?");
  });

  it("renders default Confirm/Cancel labels, overridable via props", async () => {
    const user = userEvent.setup();
    openWith({ confirm: { children: "Delete forever" }, cancel: { children: "Keep it" } });
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("button", { name: "Delete forever" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep it" })).toBeInTheDocument();
  });

  it("fires handleConfirm and closes on confirm", async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();
    openWith({ handleConfirm, confirm: { children: "Confirm" } });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByText("This permanently removes the project.")).not.toBeInTheDocument(),
    );
  });

  it("fires handleCancel and closes on cancel", async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();
    openWith({ handleCancel });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByText("This permanently removes the project.")).not.toBeInTheDocument(),
    );
  });

  it("keeps the dialog open when the confirm handler calls preventDefault (async escape hatch)", async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn((event: React.MouseEvent) => event.preventDefault());
    openWith({ handleConfirm });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    // Give any (unexpected) dismissal a chance to run before asserting it stayed.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByText("This permanently removes the project.")).toBeInTheDocument();
  });

  it("closes on Escape and via the backdrop it never does", async () => {
    const user = userEvent.setup();
    openWith();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("does not close on an outside click (backdrop dismissal is disabled)", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <span data-testid="outside">outside</span>
        <ConfirmationModal
          trigger={<ConfirmationModal.Trigger>Delete</ConfirmationModal.Trigger>}
          header="Delete project?"
        >
          <Text render={<p />}>Body</Text>
        </ConfirmationModal>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("locks while loading: confirm shows a spinner and the dialog can't be dismissed", async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    openWith({ loading: true, handleConfirm, handleCancel });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("dialog");

    const confirm = screen.getByRole("button", { name: "Confirm" });
    expect(confirm).toHaveAttribute("aria-busy", "true");

    // Neither button acts, and Escape can't dismiss the locked dialog.
    await user.click(confirm);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.keyboard("{Escape}");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(handleConfirm).not.toHaveBeenCalled();
    expect(handleCancel).not.toHaveBeenCalled();
    expect(dialog).toBeInTheDocument();
  });

  it("is controllable via open/onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ConfirmationModal
        open
        header="Sign out?"
        onOpenChange={onOpenChange}
        handleConfirm={vi.fn()}
      >
        <Text render={<p />}>You will be signed out.</Text>
      </ConfirmationModal>,
    );

    expect(screen.getByText("You will be signed out.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it("keeps the disabled confirm button focusable (aria-disabled, not native)", async () => {
    const user = userEvent.setup();
    openWith({ disabled: true });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const confirm = await screen.findByRole("button", { name: "Confirm" });

    expect(confirm).toHaveAttribute("aria-disabled", "true");
    expect(confirm).not.toBeDisabled();
    confirm.focus();
    expect(confirm).toHaveFocus();
  });
});
