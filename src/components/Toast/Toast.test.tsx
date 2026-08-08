import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { BaritoneProvider } from "../BaritoneProvider";
import { Button } from "../Button";
import { Notice } from "../Notice";
import { useToast, type AddToastOptions } from "./index";

/** A button that fires one toast; auto-dismiss is off so assertions can't race the timer. */
function Trigger({ options, label = "Show" }: { options: AddToastOptions; label?: string }) {
  const toast = useToast();
  return <Button onClick={() => toast.add({ timeout: 0, ...options })}>{label}</Button>;
}

function renderWithProvider(ui: React.ReactNode) {
  return render(<BaritoneProvider>{ui}</BaritoneProvider>);
}

describe("Toast", () => {
  it("shows nothing until a toast is fired", () => {
    renderWithProvider(<Trigger options={{ title: "Saved" }} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a fired toast as a dialog labelled by its title", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Trigger options={{ title: "Saved" }} />);

    await user.click(screen.getByRole("button", { name: "Show" }));

    const toast = await screen.findByRole("dialog", { name: "Saved" });
    expect(toast).toHaveAccessibleName("Saved");
  });

  it("wires the description as the dialog's accessible description", async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <Trigger options={{ title: "Export ready", description: "report.csv is ready." }} />,
    );

    await user.click(screen.getByRole("button", { name: "Show" }));

    const toast = await screen.findByRole("dialog", { name: "Export ready" });
    expect(toast).toHaveAccessibleDescription("report.csv is ready.");
  });

  it("renders the Notice as presentational so it isn't a second live region", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Trigger options={{ title: "Heads up", intent: "primary" }} />);

    await user.click(screen.getByRole("button", { name: "Show" }));

    const toast = await screen.findByRole("dialog", { name: "Heads up" });
    // The base-ui viewport owns announcements; the Notice must not add its own
    // status/alert live region inside the dialog (that would double-announce).
    expect(toast.querySelector('[role="presentation"]')).not.toBeNull();
    expect(toast.querySelector('[role="status"]')).toBeNull();
    expect(toast.querySelector('[role="alert"]')).toBeNull();
  });

  it("puts the fired toasts inside the viewport's labelled live region", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Trigger options={{ title: "Connected" }} />);

    await user.click(screen.getByRole("button", { name: "Show" }));
    await screen.findByRole("dialog", { name: "Connected" });

    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("dismisses a toast when its close button is pressed", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Trigger options={{ title: "Dismiss me" }} />);

    await user.click(screen.getByRole("button", { name: "Show" }));
    const toast = await screen.findByRole("dialog", { name: "Dismiss me" });

    await user.click(within(toast).getByRole("button", { name: "Dismiss" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Dismiss me" })).not.toBeInTheDocument(),
    );
  });

  it("fires an action inside the toast and can close from its handler", async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();

    function Demo() {
      const toast = useToast();
      const archive = () => {
        const id = toast.add({
          title: "Archived",
          timeout: 0,
          actions: [
            <Notice.Action
              key="undo"
              onClick={() => {
                onUndo();
                toast.close(id);
              }}
            >
              Undo
            </Notice.Action>,
          ],
        });
      };
      return <Button onClick={archive}>Archive</Button>;
    }

    renderWithProvider(<Demo />);
    await user.click(screen.getByRole("button", { name: "Archive" }));
    const toast = await screen.findByRole("dialog", { name: "Archived" });

    await user.click(within(toast).getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Archived" })).not.toBeInTheDocument(),
    );
  });

  it("stacks multiple toasts, each its own labelled dialog", async () => {
    const user = userEvent.setup();

    function Demo() {
      const toast = useToast();
      const n = React.useRef(0);
      return (
        <Button
          onClick={() => {
            n.current += 1;
            toast.add({ title: `Toast ${n.current}`, timeout: 0 });
          }}
        >
          Add
        </Button>
      );
    }

    renderWithProvider(<Demo />);
    const add = screen.getByRole("button", { name: "Add" });
    await user.click(add);
    await user.click(add);

    expect(await screen.findByRole("dialog", { name: "Toast 1" })).toBeInTheDocument();
    expect(await screen.findByRole("dialog", { name: "Toast 2" })).toBeInTheDocument();
  });

  it("updates a toast in place without clearing the fields left unspecified", async () => {
    const user = userEvent.setup();

    function Demo() {
      const toast = useToast();
      const idRef = React.useRef<string>("");
      return (
        <>
          <Button
            onClick={() => {
              idRef.current = toast.add({
                title: "Uploading",
                description: "Starting up",
                intent: "primary",
                actions: [
                  <Notice.Action key="cancel" onClick={() => {}}>
                    Cancel
                  </Notice.Action>,
                ],
                timeout: 0,
              });
            }}
          >
            Start
          </Button>
          <Button onClick={() => toast.update(idRef.current, { description: "Almost there" })}>
            Progress
          </Button>
          <Button onClick={() => toast.update(idRef.current, { intent: "negative" })}>Fail</Button>
        </>
      );
    }

    renderWithProvider(<Demo />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    const toast = await screen.findByRole("dialog", { name: "Uploading" });
    expect(toast).toHaveTextContent("Starting up");

    // A description-only update keeps the title and the (data-bag) action.
    await user.click(screen.getByRole("button", { name: "Progress" }));
    await waitFor(() => expect(toast).toHaveTextContent("Almost there"));
    expect(toast).toHaveAccessibleName("Uploading");
    expect(toast).not.toHaveTextContent("Starting up");
    expect(within(toast).getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    // An intent-only update must not drop the other data fields (the action).
    await user.click(screen.getByRole("button", { name: "Fail" }));
    await waitFor(() =>
      expect(within(toast).getByRole("button", { name: "Cancel" })).toBeInTheDocument(),
    );
    expect(toast).toHaveTextContent("Almost there");
  });

  it("throws a helpful error when useToast is used outside a provider", () => {
    function Orphan() {
      useToast();
      return null;
    }
    // Silence React's expected error boundary logging for this render.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(/Toast\.Provider/);
    spy.mockRestore();
  });
});
