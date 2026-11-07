import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Modal, useControlledModal } from "./index";

describe("useControlledModal", () => {
  it("starts closed and opens/closes/toggles", () => {
    const { result } = renderHook(() => useControlledModal());

    expect(result.current.isOpen).toBe(false);

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.setOpen(false));
    expect(result.current.isOpen).toBe(false);
  });

  it("honours a default open state", () => {
    const { result } = renderHook(() => useControlledModal(true));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.modalProps.open).toBe(true);
  });

  it("drives a real Modal through modalProps", async () => {
    const user = userEvent.setup();
    function Example() {
      const modal = useControlledModal();
      return (
        <div>
          <button type="button" onClick={modal.open}>
            External open
          </button>
          <Modal {...modal.modalProps}>
            Modal body
            <button type="button" onClick={modal.close}>
              External close
            </button>
          </Modal>
        </div>
      );
    }
    render(<Example />);

    expect(screen.queryByText("Modal body")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "External open" }));
    expect(await screen.findByText("Modal body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "External close" }));
    await waitFor(() => expect(screen.queryByText("Modal body")).not.toBeInTheDocument());
  });

  it("reflects the modal's own dismissals (Escape) back into isOpen", async () => {
    const user = userEvent.setup();
    function Example() {
      const modal = useControlledModal(true);
      return (
        <div>
          <span data-testid="state">{String(modal.isOpen)}</span>
          <Modal {...modal.modalProps}>Modal body</Modal>
        </div>
      );
    }
    render(<Example />);

    expect(await screen.findByText("Modal body")).toBeInTheDocument();
    expect(screen.getByTestId("state")).toHaveTextContent("true");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false"));
  });
});
