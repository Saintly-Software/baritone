import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Drawer, useControlledDrawer } from "./index";

describe("useControlledDrawer", () => {
  it("starts closed and opens/closes/toggles", () => {
    const { result } = renderHook(() => useControlledDrawer());

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
    const { result } = renderHook(() => useControlledDrawer(true));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.drawerProps.open).toBe(true);
  });

  it("drives a real Drawer through drawerProps", async () => {
    const user = userEvent.setup();
    function Example() {
      const drawer = useControlledDrawer();
      return (
        <div>
          <button type="button" onClick={drawer.open}>
            External open
          </button>
          <Drawer {...drawer.drawerProps}>
            Drawer body
            <button type="button" onClick={drawer.close}>
              External close
            </button>
          </Drawer>
        </div>
      );
    }
    render(<Example />);

    expect(screen.queryByText("Drawer body")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "External open" }));
    expect(await screen.findByText("Drawer body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "External close" }));
    await waitFor(() => expect(screen.queryByText("Drawer body")).not.toBeInTheDocument());
  });

  it("reflects the drawer's own dismissals (Escape) back into isOpen", async () => {
    const user = userEvent.setup();
    function Example() {
      const drawer = useControlledDrawer(true);
      return (
        <div>
          <span data-testid="state">{String(drawer.isOpen)}</span>
          <Drawer {...drawer.drawerProps}>Drawer body</Drawer>
        </div>
      );
    }
    render(<Example />);

    expect(await screen.findByText("Drawer body")).toBeInTheDocument();
    expect(screen.getByTestId("state")).toHaveTextContent("true");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false"));
  });
});
