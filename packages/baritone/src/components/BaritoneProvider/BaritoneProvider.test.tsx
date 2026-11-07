import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "../Button";
import { useToast } from "../Toast";
import { BaritoneProvider } from "./index";

function ToastButton() {
  const toast = useToast();
  return <Button onClick={() => toast.add({ title: "Hello", timeout: 0 })}>Show</Button>;
}

describe("BaritoneProvider", () => {
  it("renders its children", () => {
    render(
      <BaritoneProvider>
        <p>App content</p>
      </BaritoneProvider>,
    );
    expect(screen.getByText("App content")).toBeInTheDocument();
  });

  it("sets up the toast system so useToast works without any extra wiring", async () => {
    const user = userEvent.setup();
    render(
      <BaritoneProvider>
        <ToastButton />
      </BaritoneProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Show" }));
    expect(await screen.findByRole("dialog", { name: "Hello" })).toBeInTheDocument();
  });

  it("forwards toastLimit to the underlying provider", async () => {
    const user = userEvent.setup();

    function AddThree() {
      const toast = useToast();
      return (
        <Button
          onClick={() => {
            toast.add({ title: "One", timeout: 0 });
            toast.add({ title: "Two", timeout: 0 });
            toast.add({ title: "Three", timeout: 0 });
          }}
        >
          Add three
        </Button>
      );
    }

    render(
      <BaritoneProvider toastLimit={1}>
        <AddThree />
      </BaritoneProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Add three" }));

    await waitFor(() =>
      expect(document.querySelectorAll("[data-limited]").length).toBeGreaterThan(0),
    );
  });
});
