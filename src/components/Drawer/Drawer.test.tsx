import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useOverlayHandle } from "../../utils/overlayHandle";
import { Drawer } from "./index";

describe("Drawer", () => {
  it("keeps the content hidden until the trigger is pressed", async () => {
    const user = userEvent.setup();
    render(<Drawer trigger={<Drawer.Trigger>Open</Drawer.Trigger>}>Drawer body</Drawer>);

    expect(screen.queryByText("Drawer body")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Drawer body")).toBeInTheDocument();
  });

  it("renders the trigger as a Button with the right popup wiring", () => {
    render(<Drawer trigger={<Drawer.Trigger>Menu</Drawer.Trigger>}>Body</Drawer>);
    const trigger = screen.getByRole("button", { name: "Menu" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("aria-haspopup");
  });

  it("renders header and footer around the content", async () => {
    const user = userEvent.setup();
    render(
      <Drawer
        trigger={<Drawer.Trigger>Open</Drawer.Trigger>}
        header={<Drawer.Header title="Title" subtitle="Subtitle" />}
        footer={<Drawer.Footer>Footer</Drawer.Footer>}
      >
        Body
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(await screen.findByRole("heading", { level: 3, name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("labels the drawer from Drawer.Header title/subtitle", async () => {
    const user = userEvent.setup();
    render(
      <Drawer
        trigger={<Drawer.Trigger>Open</Drawer.Trigger>}
        header={<Drawer.Header title="Account" subtitle="Manage settings" />}
      >
        Body
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Account");
    expect(dialog).toHaveAccessibleDescription("Manage settings");
  });

  it("lets Drawer.Header set the heading level", async () => {
    const user = userEvent.setup();
    render(
      <Drawer
        trigger={<Drawer.Trigger>Open</Drawer.Trigger>}
        header={<Drawer.Header title="Outline" level={2} />}
      >
        Body
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("heading", { level: 2, name: "Outline" })).toBeInTheDocument();
  });

  it("does NOT close when clicking outside (backdrop dismissal is disabled)", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <span data-testid="outside">outside</span>
        <Drawer trigger={<Drawer.Trigger>Open</Drawer.Trigger>}>Drawer body</Drawer>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Drawer body")).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));
    // Give any (unexpected) dismissal a chance to run before asserting it stayed.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByText("Drawer body")).toBeInTheDocument();
  });

  it("closes via Drawer.Close in the footer", async () => {
    const user = userEvent.setup();
    render(
      <Drawer
        trigger={<Drawer.Trigger>Open</Drawer.Trigger>}
        footer={
          <Drawer.Footer>
            <Drawer.Close>Done</Drawer.Close>
          </Drawer.Footer>
        }
      >
        Drawer body
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Drawer body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByText("Drawer body")).not.toBeInTheDocument());
  });

  it("closes on Escape by default", async () => {
    const user = userEvent.setup();
    render(<Drawer trigger={<Drawer.Trigger>Open</Drawer.Trigger>}>Drawer body</Drawer>);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Drawer body")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("Drawer body")).not.toBeInTheDocument());
  });

  it("when disabled, refuses to close via the close button or Escape", async () => {
    const user = userEvent.setup();
    render(
      <Drawer
        disabled
        trigger={<Drawer.Trigger>Open</Drawer.Trigger>}
        footer={
          <Drawer.Footer>
            <Drawer.Close>Done</Drawer.Close>
          </Drawer.Footer>
        }
      >
        Drawer body
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Drawer body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Done" }));
    await user.keyboard("{Escape}");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByText("Drawer body")).toBeInTheDocument();
  });

  it("marks the panel aria-busy while loading", async () => {
    const user = userEvent.setup();
    render(
      <Drawer loading trigger={<Drawer.Trigger>Open</Drawer.Trigger>}>
        Drawer body
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-busy", "true");
  });

  it("respects the controlled open state", () => {
    render(
      <Drawer trigger={<Drawer.Trigger>Open</Drawer.Trigger>} open>
        Always visible
      </Drawer>,
    );
    expect(screen.getByText("Always visible")).toBeInTheDocument();
  });

  it("closes from an async callback via useOverlayHandle, without lifting open state", async () => {
    const user = userEvent.setup();
    function Example() {
      const drawer = useOverlayHandle(Drawer);
      return (
        <Drawer handle={drawer} trigger={<Drawer.Trigger>Open</Drawer.Trigger>}>
          Drawer body
          <button
            type="button"
            onClick={async () => {
              await Promise.resolve();
              drawer.close();
            }}
          >
            Save
          </button>
        </Drawer>
      );
    }
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Drawer body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByText("Drawer body")).not.toBeInTheDocument());
  });

  it("vetoes imperative close while disabled", async () => {
    const user = userEvent.setup();
    function Example() {
      const drawer = useOverlayHandle(Drawer);
      return (
        <Drawer disabled handle={drawer} trigger={<Drawer.Trigger>Open</Drawer.Trigger>}>
          Drawer body
          <button type="button" onClick={() => drawer.close()}>
            Force close
          </button>
        </Drawer>
      );
    }
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Drawer body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Force close" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByText("Drawer body")).toBeInTheDocument();
  });
});
