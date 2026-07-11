import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useOverlayHandle } from "../../utils/overlayHandle";
import { Popover } from "./index";

describe("Popover", () => {
  it("keeps the content hidden until the trigger is pressed", async () => {
    const user = userEvent.setup();
    render(<Popover trigger={<Popover.Trigger>Open</Popover.Trigger>}>Popover body</Popover>);

    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Popover body")).toBeInTheDocument();
  });

  it("renders the trigger as a Button with the right popup wiring", () => {
    render(<Popover trigger={<Popover.Trigger>Menu</Popover.Trigger>}>Body</Popover>);
    const trigger = screen.getByRole("button", { name: "Menu" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("aria-haspopup");
  });

  it("renders header and footer around the content", async () => {
    const user = userEvent.setup();
    render(
      <Popover
        trigger={<Popover.Trigger>Open</Popover.Trigger>}
        header={<Popover.Header title="Title" subtitle="Subtitle" />}
        footer={<Popover.Footer>Footer</Popover.Footer>}
      >
        Body
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(await screen.findByRole("heading", { level: 3, name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("labels the popover from Popover.Header title/subtitle", async () => {
    const user = userEvent.setup();
    render(
      <Popover
        trigger={<Popover.Trigger>Open</Popover.Trigger>}
        header={<Popover.Header title="Account" subtitle="Manage settings" />}
      >
        Body
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Account");
    expect(dialog).toHaveAccessibleDescription("Manage settings");
  });

  it("lets Popover.Header set the heading level", async () => {
    const user = userEvent.setup();
    render(
      <Popover
        trigger={<Popover.Trigger>Open</Popover.Trigger>}
        header={<Popover.Header title="Outline" level={2} />}
      >
        Body
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("heading", { level: 2, name: "Outline" })).toBeInTheDocument();
  });

  it("closes when clicking outside (non-modal default)", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <span data-testid="outside">outside</span>
        <Popover trigger={<Popover.Trigger>Open</Popover.Trigger>}>Popover body</Popover>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Popover body")).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));
    await waitFor(() => expect(screen.queryByText("Popover body")).not.toBeInTheDocument());
  });

  it("closes via Popover.Close in the footer", async () => {
    const user = userEvent.setup();
    render(
      <Popover
        trigger={<Popover.Trigger>Open</Popover.Trigger>}
        footer={
          <Popover.Footer>
            <Popover.Close>Done</Popover.Close>
          </Popover.Footer>
        }
      >
        Popover body
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Popover body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByText("Popover body")).not.toBeInTheDocument());
  });

  it("respects the controlled open state", () => {
    render(
      <Popover trigger={<Popover.Trigger>Open</Popover.Trigger>} open>
        Always visible
      </Popover>,
    );
    expect(screen.getByText("Always visible")).toBeInTheDocument();
  });

  it("closes from an async callback via useOverlayHandle, without lifting open state", async () => {
    const user = userEvent.setup();
    function Example() {
      const popover = useOverlayHandle(Popover);
      return (
        <Popover handle={popover} trigger={<Popover.Trigger>Open</Popover.Trigger>}>
          Popover body
          <button
            type="button"
            onClick={async () => {
              await Promise.resolve();
              popover.close();
            }}
          >
            Save
          </button>
        </Popover>
      );
    }
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Popover body")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByText("Popover body")).not.toBeInTheDocument());
  });
});
