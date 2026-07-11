import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ButtonGroup } from "./index";

describe("ButtonGroup", () => {
  it("renders each item as a <button> in source order, inside a group", () => {
    render(
      <ButtonGroup
        aria-label="Alignment"
        items={[
          <ButtonGroup.Item key="l">Left</ButtonGroup.Item>,
          <ButtonGroup.Item key="c">Center</ButtonGroup.Item>,
          <ButtonGroup.Item key="r">Right</ButtonGroup.Item>,
        ]}
      />,
    );
    const group = screen.getByRole("group", { name: "Alignment" });
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(buttons.every((b) => b.tagName === "BUTTON")).toBe(true);
    expect(buttons.map((b) => b.textContent)).toEqual(["Left", "Center", "Right"]);
    // DOM order (and thus tab order) matches the `items` order.
    expect(group).toContainElement(screen.getByRole("button", { name: "Left" }));
  });

  it("fires each member's own onClick independently", async () => {
    const onFirst = vi.fn();
    const onSecond = vi.fn();
    const user = userEvent.setup();
    render(
      <ButtonGroup
        items={[
          <ButtonGroup.Item key="a" onClick={onFirst}>
            First
          </ButtonGroup.Item>,
          <ButtonGroup.Item key="b" onClick={onSecond}>
            Second
          </ButtonGroup.Item>,
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Second" }));
    expect(onSecond).toHaveBeenCalledTimes(1);
    expect(onFirst).not.toHaveBeenCalled();
  });

  it("lets a member override the group's intent/saliency but keeps them focusable in tab order", async () => {
    const user = userEvent.setup();
    render(
      <ButtonGroup
        intent="neutral"
        saliency="low"
        items={[
          <ButtonGroup.Item key="a">Keep</ButtonGroup.Item>,
          <ButtonGroup.Item key="b" intent="negative" saliency="high">
            Delete
          </ButtonGroup.Item>,
        ]}
      />,
    );
    // Both members are ordinary tab stops in order (no roving tab stop).
    await user.tab();
    expect(screen.getByRole("button", { name: "Keep" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Delete" })).toHaveFocus();
  });

  it("renders start/end icons on members", () => {
    render(
      <ButtonGroup
        items={[
          <ButtonGroup.Item key="a" startIcon={<span data-testid="start" />}>
            Prev
          </ButtonGroup.Item>,
          <ButtonGroup.Item key="b" endIcon={<span data-testid="end" />}>
            Next
          </ButtonGroup.Item>,
        ]}
      />,
    );
    expect(screen.getByTestId("start")).toBeInTheDocument();
    expect(screen.getByTestId("end")).toBeInTheDocument();
  });

  describe("disabled member", () => {
    it("uses aria-disabled (not the native attribute), stays focusable, and suppresses onClick", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ButtonGroup
          items={[
            <ButtonGroup.Item key="a">Copy</ButtonGroup.Item>,
            <ButtonGroup.Item key="b" disabled onClick={onClick}>
              Paste
            </ButtonGroup.Item>,
          ]}
        />,
      );
      const paste = screen.getByRole("button", { name: "Paste" });
      expect(paste).toHaveAttribute("aria-disabled", "true");
      expect(paste).not.toHaveAttribute("disabled");

      paste.focus();
      expect(paste).toHaveFocus();

      await user.click(paste);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("surfaces a disabledReason tooltip when focused", async () => {
      const user = userEvent.setup();
      render(
        <ButtonGroup
          items={[
            <ButtonGroup.Item key="b" disabled disabledReason="Clipboard is empty.">
              Paste
            </ButtonGroup.Item>,
          ]}
        />,
      );
      await user.tab();
      expect(screen.getByRole("button", { name: "Paste" })).toHaveFocus();
      await waitFor(() => expect(screen.getByText("Clipboard is empty.")).toBeInTheDocument(), {
        timeout: 2000,
      });
    });
  });

  it("owns sizing — members cannot set their own size", () => {
    render(
      <ButtonGroup
        size="lg"
        items={[
          // @ts-expect-error `size` is owned by the group, not the member.
          <ButtonGroup.Item key="a" size="sm">
            A
          </ButtonGroup.Item>,
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
  });

  it("renders a single member without error (only-child, no joins to collapse)", () => {
    render(<ButtonGroup items={[<ButtonGroup.Item key="a">Solo</ButtonGroup.Item>]} />);
    expect(screen.getByRole("button", { name: "Solo" })).toBeInTheDocument();
  });
});
