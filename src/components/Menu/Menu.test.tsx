import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Menu } from "./index";

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
});
