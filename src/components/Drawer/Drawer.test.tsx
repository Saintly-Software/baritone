import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useOverlayHandle } from "../../utils/overlayHandle";
import { ButtonGroup } from "../ButtonGroup";
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

describe("Drawer.Header actions", () => {
  it("renders header actions behind a 'more options' menu trigger", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(
      <Drawer
        open
        trigger={<Drawer.Trigger>Open</Drawer.Trigger>}
        header={
          <Drawer.Header
            title="Document"
            actions={[
              { children: "Rename", onClick: onRename },
              { children: "Delete", intent: "negative", onClick: () => {} },
            ]}
          />
        }
      >
        Body
      </Drawer>,
    );

    // The actions collapse into an icon-only trigger; the items are hidden until it opens.
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(screen.queryByRole("menuitem", { name: "Rename" })).not.toBeInTheDocument();

    await user.click(trigger);
    const rename = await screen.findByRole("menuitem", { name: "Rename" });
    await user.click(rename);
    expect(onRename).toHaveBeenCalledTimes(1);
  });

  it("names the actions trigger from actionsLabel", () => {
    render(
      <Drawer
        open
        trigger={<Drawer.Trigger>Open</Drawer.Trigger>}
        header={
          <Drawer.Header
            title="Document"
            actionsLabel="Document actions"
            actions={[{ children: "Rename", onClick: () => {} }]}
          />
        }
      >
        Body
      </Drawer>,
    );

    expect(screen.getByRole("button", { name: "Document actions" })).toBeInTheDocument();
  });

  it("renders no actions trigger when actions is empty", () => {
    render(
      <Drawer
        open
        trigger={<Drawer.Trigger>Open</Drawer.Trigger>}
        header={<Drawer.Header title="Document" actions={[]} />}
      >
        Body
      </Drawer>,
    );

    expect(screen.queryByRole("button", { name: "Actions" })).not.toBeInTheDocument();
  });
});

describe("Drawer.Footer actions", () => {
  it("renders footer actions as a grouped set of real buttons", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <Drawer
        open
        trigger={<Drawer.Trigger>Open</Drawer.Trigger>}
        footer={
          <Drawer.Footer
            actions={[
              <ButtonGroup.Item key="cancel" onClick={() => {}}>
                Cancel
              </ButtonGroup.Item>,
              <ButtonGroup.Item key="save" intent="primary" saliency="high" onClick={onSave}>
                Save
              </ButtonGroup.Item>,
            ]}
          />
        }
      >
        Body
      </Drawer>,
    );

    const group = screen.getByRole("group");
    const save = within(group).getByRole("button", { name: "Save" });
    expect(save.tagName).toBe("BUTTON");

    await user.click(save);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
