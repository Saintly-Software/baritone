import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

describe("Drawer.Action", () => {
  it("renders an onClick action as a real button and fires its handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Drawer trigger={<Drawer.Trigger>Open</Drawer.Trigger>} open>
        <Drawer.Action onClick={onClick}>Rename</Drawer.Action>
      </Drawer>,
    );

    const action = screen.getByRole("button", { name: "Rename" });
    expect(action.tagName).toBe("BUTTON");

    await user.click(action);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders an href action as a real anchor", () => {
    render(
      <Drawer trigger={<Drawer.Trigger>Open</Drawer.Trigger>} open>
        <Drawer.Action href="https://example.com">Docs</Drawer.Action>
      </Drawer>,
    );

    const action = screen.getByRole("link", { name: "Docs" });
    expect(action.tagName).toBe("A");
    expect(action).toHaveAttribute("href", "https://example.com");
  });

  it("is keyboard reachable — a real tab stop, not a roving menu item", () => {
    render(
      <Drawer trigger={<Drawer.Trigger>Open</Drawer.Trigger>} open>
        <Drawer.Action>Edit</Drawer.Action>
        <Drawer.Action>Duplicate</Drawer.Action>
      </Drawer>,
    );

    const edit = screen.getByRole("button", { name: "Edit" });
    const duplicate = screen.getByRole("button", { name: "Duplicate" });
    // Native buttons that stay in the tab order — unlike menu items, which base-ui
    // pulls out with tabindex="-1" and drives with roving focus instead.
    expect(edit.tagName).toBe("BUTTON");
    expect(edit).not.toHaveAttribute("tabindex", "-1");
    expect(duplicate).not.toHaveAttribute("tabindex", "-1");

    // Each accepts programmatic focus (natively focusable, nothing traps it out).
    edit.focus();
    expect(edit).toHaveFocus();
    duplicate.focus();
    expect(duplicate).toHaveFocus();
  });

  it("swallows activation on a disabled action and stays focusable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Drawer trigger={<Drawer.Trigger>Open</Drawer.Trigger>} open>
        <Drawer.Action onClick={onClick} disabled>
          Delete
        </Drawer.Action>
      </Drawer>,
    );

    const action = screen.getByRole("button", { name: "Delete" });
    expect(action).toHaveAttribute("aria-disabled", "true");

    await user.click(action);
    expect(onClick).not.toHaveBeenCalled();
  });
});
