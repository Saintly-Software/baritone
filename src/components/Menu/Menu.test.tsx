import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Menu } from "./index";
import { MENU_ITEM_INTENTS } from "./menu.css";

describe("Menu", () => {
  it("keeps the items hidden until the trigger is pressed", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={[{ children: "Edit" }, { children: "Delete" }]}
      />,
    );

    expect(screen.queryByRole("menuitem", { name: "Edit" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
  });

  it("renders the trigger as a Button with the right popup wiring", () => {
    render(<Menu trigger={<Menu.Trigger>Actions</Menu.Trigger>} items={[{ children: "Edit" }]} />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("aria-haspopup");
  });

  it("renders an onClick item as a real button and fires its handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Menu trigger={<Menu.Trigger>Open</Menu.Trigger>} items={[{ children: "Edit", onClick }]} />,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    const item = await screen.findByRole("menuitem", { name: "Edit" });
    expect(item.tagName).toBe("BUTTON");

    await user.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders an href item as a real anchor", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={[{ children: "Docs", href: "https://example.com" }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    const item = await screen.findByRole("menuitem", { name: "Docs" });
    expect(item.tagName).toBe("A");
    expect(item).toHaveAttribute("href", "https://example.com");
  });

  it("closes after an item is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={[{ children: "Edit", onClick: () => {} }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(await screen.findByRole("menuitem", { name: "Edit" }));
    await waitFor(() =>
      expect(screen.queryByRole("menuitem", { name: "Edit" })).not.toBeInTheDocument(),
    );
  });

  it("swallows activation on a disabled item", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={[{ children: "Billing", onClick, disabled: true }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    const item = await screen.findByRole("menuitem", { name: "Billing" });
    expect(item).toHaveAttribute("aria-disabled", "true");

    await user.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("respects the controlled open state", () => {
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={[{ children: "Edit" }]}
        open
        modal={false}
      />,
    );
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
  });

  it("keeps the menu open after a keepOpen item fires", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={[{ children: "Increment", keepOpen: true, onClick }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    const item = await screen.findByRole("menuitem", { name: "Increment" });

    await user.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
    // Still open — the row didn't dismiss the menu.
    expect(screen.getByRole("menuitem", { name: "Increment" })).toBeInTheDocument();
  });

  it("highlights an item on hover", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={[{ children: "Edit" }, { children: "Duplicate" }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    const duplicate = await screen.findByRole("menuitem", { name: "Duplicate" });

    await user.hover(duplicate);
    await waitFor(() => expect(duplicate).toHaveAttribute("data-highlighted"));
  });

  it("skips falsy entries in items", async () => {
    const user = userEvent.setup();
    const canDelete = false;
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={[
          { children: "Edit", onClick: () => {} },
          canDelete && { children: "Delete", intent: "negative", onClick: () => {} },
          null,
          undefined,
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(1);
  });

  it("gives every supported intent its own class", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={MENU_ITEM_INTENTS.map((intent) => ({ children: intent, intent }))}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("menuitem", { name: MENU_ITEM_INTENTS[0] });

    // A missing recipe variant silently falls back to the base class, so the
    // intents would collide rather than throw — distinctness is what catches it.
    const classNames = MENU_ITEM_INTENTS.map(
      (intent) => screen.getByRole("menuitem", { name: intent }).className,
    );
    expect(new Set(classNames).size).toBe(MENU_ITEM_INTENTS.length);
  });

  it("opens a custom (non-Button) trigger and wires the popup attributes", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<Menu.Trigger render={<button type="button">Custom</button>} />}
        items={[{ children: "Edit", onClick: () => {} }]}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Custom" });
    expect(trigger).toHaveAttribute("aria-haspopup");

    await user.click(trigger);
    expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
  });

  it("opens on hover when openOnHover is set", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<Menu.Trigger openOnHover>Hover</Menu.Trigger>}
        items={[{ children: "Edit" }]}
      />,
    );

    await user.hover(screen.getByRole("button", { name: "Hover" }));
    expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
  });

  it("returns focus to the trigger when closed with Escape", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={[{ children: "Edit" }, { children: "Delete" }]}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await screen.findByRole("menuitem", { name: "Edit" });

    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("moves keyboard focus through items with the arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={[{ children: "Edit" }, { children: "Delete" }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("menuitem", { name: "Edit" });

    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus());

    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus());
  });

  it("jumps to a matching item via type-ahead", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<Menu.Trigger>Open</Menu.Trigger>}
        items={[{ children: "Edit" }, { children: "Duplicate" }, { children: "Delete" }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("menuitem", { name: "Edit" });

    // Typing "Du" should land on "Duplicate".
    await user.keyboard("Du");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus());
  });
});
