import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useOverlayHandle } from "../../utils/overlayHandle";
import { Modal } from "./index";

describe("Modal", () => {
  it("keeps the content hidden until the trigger is pressed", async () => {
    const user = userEvent.setup();
    render(<Modal trigger={<Modal.Trigger>Open</Modal.Trigger>}>Modal body</Modal>);

    expect(screen.queryByText("Modal body")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Modal body")).toBeInTheDocument();
  });

  it("renders the trigger as a Button with the right popup wiring", () => {
    render(<Modal trigger={<Modal.Trigger>Menu</Modal.Trigger>}>Body</Modal>);
    const trigger = screen.getByRole("button", { name: "Menu" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("aria-haspopup");
  });

  it("renders header and footer around the content", async () => {
    const user = userEvent.setup();
    render(
      <Modal
        trigger={<Modal.Trigger>Open</Modal.Trigger>}
        header={<Modal.Header title="Title" subtitle="Subtitle" />}
        footer={<Modal.Footer>Footer</Modal.Footer>}
      >
        Body
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(await screen.findByRole("heading", { level: 3, name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("labels the modal from Modal.Header title/subtitle", async () => {
    const user = userEvent.setup();
    render(
      <Modal
        trigger={<Modal.Trigger>Open</Modal.Trigger>}
        header={<Modal.Header title="Account" subtitle="Manage settings" />}
      >
        Body
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Account");
    expect(dialog).toHaveAccessibleDescription("Manage settings");
  });

  it("lets Modal.Header set the heading level", async () => {
    const user = userEvent.setup();
    render(
      <Modal
        trigger={<Modal.Trigger>Open</Modal.Trigger>}
        header={<Modal.Header title="Outline" level={2} />}
      >
        Body
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("heading", { level: 2, name: "Outline" })).toBeInTheDocument();
  });

  it("does NOT close when clicking outside (backdrop dismissal is disabled)", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <span data-testid="outside">outside</span>
        <Modal trigger={<Modal.Trigger>Open</Modal.Trigger>}>Modal body</Modal>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Modal body")).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));
    // Give any (unexpected) dismissal a chance to run before asserting it stayed.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("closes via Modal.Close in the footer", async () => {
    const user = userEvent.setup();
    render(
      <Modal
        trigger={<Modal.Trigger>Open</Modal.Trigger>}
        footer={
          <Modal.Footer>
            <Modal.Close>Done</Modal.Close>
          </Modal.Footer>
        }
      >
        Modal body
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Modal body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByText("Modal body")).not.toBeInTheDocument());
  });

  it("closes on Escape by default", async () => {
    const user = userEvent.setup();
    render(<Modal trigger={<Modal.Trigger>Open</Modal.Trigger>}>Modal body</Modal>);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Modal body")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("Modal body")).not.toBeInTheDocument());
  });

  it("when disabled, refuses to close via the close button or Escape", async () => {
    const user = userEvent.setup();
    render(
      <Modal
        disabled
        trigger={<Modal.Trigger>Open</Modal.Trigger>}
        footer={
          <Modal.Footer>
            <Modal.Close>Done</Modal.Close>
          </Modal.Footer>
        }
      >
        Modal body
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Modal body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Done" }));
    await user.keyboard("{Escape}");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("marks the panel aria-busy while loading", async () => {
    const user = userEvent.setup();
    render(
      <Modal loading trigger={<Modal.Trigger>Open</Modal.Trigger>}>
        Modal body
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-busy", "true");
  });

  it("respects the controlled open state", () => {
    render(
      <Modal trigger={<Modal.Trigger>Open</Modal.Trigger>} open>
        Always visible
      </Modal>,
    );
    expect(screen.getByText("Always visible")).toBeInTheDocument();
  });

  it("closes from an async callback via useOverlayHandle, without lifting open state", async () => {
    const user = userEvent.setup();
    function Example() {
      const modal = useOverlayHandle(Modal);
      return (
        <Modal handle={modal} trigger={<Modal.Trigger>Open</Modal.Trigger>}>
          Modal body
          <button
            type="button"
            onClick={async () => {
              await Promise.resolve();
              modal.close();
            }}
          >
            Save
          </button>
        </Modal>
      );
    }
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Modal body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByText("Modal body")).not.toBeInTheDocument());
  });

  it("vetoes imperative close while disabled", async () => {
    const user = userEvent.setup();
    function Example() {
      const modal = useOverlayHandle(Modal);
      return (
        <Modal disabled handle={modal} trigger={<Modal.Trigger>Open</Modal.Trigger>}>
          Modal body
          <button type="button" onClick={() => modal.close()}>
            Force close
          </button>
        </Modal>
      );
    }
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Modal body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Force close" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });
});
