import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "../Chip";
import { ChipList } from "./index";

const LABELS = ["Alpha", "Beta", "Gamma", "Delta"];
const TAGS = LABELS.map((label) => <ChipList.Item key={label}>{label}</ChipList.Item>);

describe("ChipList", () => {
  it("renders a list with one listitem per chip", () => {
    render(<ChipList items={TAGS} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(TAGS.length);
    for (const label of LABELS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("keeps an explicit list role even with the list marker removed", () => {
    render(<ChipList items={TAGS} />);
    // Explicit role: Safari drops the implicit one under `list-style: none`.
    expect(screen.getByRole("list")).toHaveAttribute("role", "list");
    for (const item of screen.getAllByRole("listitem")) {
      expect(item).toHaveAttribute("role", "listitem");
    }
  });

  it("passes through className and extra props to the root", () => {
    render(<ChipList items={TAGS} className="extra" data-testid="list" />);
    const list = screen.getByTestId("list");
    expect(list.className).toContain("extra");
  });

  describe("shared vs. per-item props", () => {
    it("applies the list-level intent/saliency to every chip's recipe class", () => {
      const { container } = render(<ChipList items={TAGS.slice(0, 2)} intent="primary" />);
      const chips = container.querySelectorAll("li > *");
      expect(chips).toHaveLength(2);
      // Both chips share the same generated class set (same intent/saliency/size).
      expect(chips[0]?.className).toBe(chips[1]?.className);
    });

    it("lets an item override intent/saliency while others inherit", () => {
      const { container } = render(
        <ChipList
          intent="neutral"
          items={[
            <ChipList.Item key="x">Inherits</ChipList.Item>,
            <ChipList.Item key="y" intent="negative" saliency="high">
              Overrides
            </ChipList.Item>,
          ]}
        />,
      );
      const chips = container.querySelectorAll("li > *");
      // The overriding chip carries a different intent class than the inheriting one.
      expect(chips[0]?.className).not.toBe(chips[1]?.className);
    });

    it("ignores a per-item size (size is owned by the list)", () => {
      const { container } = render(
        <ChipList
          size="sm"
          items={[
            <ChipList.Item key="x">A</ChipList.Item>,
            // @ts-expect-error – size is intentionally omitted from ChipListItemProps.
            <ChipList.Item key="y" size="lg">
              B
            </ChipList.Item>,
          ]}
        />,
      );
      const chips = container.querySelectorAll("li > *");
      // Same size class on both: the list's `sm` wins over the item's `lg`.
      expect(chips[0]?.className).toBe(chips[1]?.className);
    });
  });

  describe("keys", () => {
    it("renders all items even without a key (falls back to index)", () => {
      render(
        <ChipList
          items={[
            <ChipList.Item>One</ChipList.Item>,
            <ChipList.Item>Two</ChipList.Item>,
            <ChipList.Item>Three</ChipList.Item>,
          ]}
        />,
      );
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });
  });

  it("skips falsy entries so a chip can be included conditionally inline", () => {
    const showBeta = false;
    render(
      <ChipList
        items={[
          <ChipList.Item key="a">Alpha</ChipList.Item>,
          showBeta && <ChipList.Item key="b">Beta</ChipList.Item>,
          null,
        ]}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  describe("max / see more", () => {
    it("shows every chip and no see-more chip when under max", () => {
      render(<ChipList items={TAGS} max={4} />);
      expect(screen.getAllByRole("listitem")).toHaveLength(4);
      expect(screen.queryByRole("button", { name: "See more" })).not.toBeInTheDocument();
    });

    it("shows only the first `max` chips plus a see-more chip when over max", () => {
      render(<ChipList items={TAGS} max={2} />);
      expect(screen.getByText("Alpha")).toBeInTheDocument();
      expect(screen.getByText("Beta")).toBeInTheDocument();
      // The overflow chips are not inline.
      expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
      expect(screen.queryByText("Delta")).not.toBeInTheDocument();
      // 2 visible chips + 1 see-more, each in its own listitem.
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
      expect(screen.getByRole("button", { name: "See more" })).toBeInTheDocument();
    });

    it("opens a popover listing the remaining chips when the see-more chip is clicked", async () => {
      const user = userEvent.setup();
      render(<ChipList items={TAGS} max={2} />);

      const trigger = screen.getByRole("button", { name: "See more" });
      expect(screen.queryByText("Gamma")).not.toBeInTheDocument();

      await user.click(trigger);

      const popup = await screen.findByRole("dialog");
      expect(within(popup).getByText("Gamma")).toBeInTheDocument();
      expect(within(popup).getByText("Delta")).toBeInTheDocument();
      // The hidden chips render as their own list inside the popover.
      expect(within(popup).getByRole("list")).toBeInTheDocument();
    });

    it("supports a function seeMoreLabel reporting the hidden count", async () => {
      render(<ChipList items={TAGS} max={1} seeMoreLabel={(n) => `+${n}`} />);
      // 4 items, 1 shown -> 3 hidden.
      expect(screen.getByRole("button", { name: "+3" })).toBeInTheDocument();
    });

    it("does not render a see-more chip without max", () => {
      render(<ChipList items={TAGS} />);
      expect(screen.queryByRole("button", { name: "See more" })).not.toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(4);
    });
  });

  describe("interactive chips", () => {
    it("fires an item's onClick from its clickable label", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ChipList
          items={[
            <ChipList.Item key="x" onClick={onClick}>
              Filter
            </ChipList.Item>,
          ]}
        />,
      );
      await user.click(screen.getByRole("button", { name: "Filter" }));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("fires an item's handleRemove from its built-in remove button", async () => {
      const handleRemove = vi.fn();
      const user = userEvent.setup();
      render(
        <ChipList
          items={[
            <ChipList.Item key="x" handleRemove={handleRemove}>
              Tag
            </ChipList.Item>,
          ]}
        />,
      );
      await user.click(screen.getByRole("button", { name: "Remove" }));
      expect(handleRemove).toHaveBeenCalledOnce();
    });

    it("keeps a chip's remove-button click from bubbling to a clickable ancestor", async () => {
      const onAncestor = vi.fn();
      const handleRemove = vi.fn();
      const user = userEvent.setup();
      // A common layout: the list sits inside a clickable region. Removing a chip
      // should act alone, never trip the surrounding handler.
      render(
        <div onClick={onAncestor}>
          <ChipList
            items={[
              <ChipList.Item key="x" handleRemove={handleRemove}>
                Tag
              </ChipList.Item>,
            ]}
          />
        </div>,
      );
      await user.click(screen.getByRole("button", { name: "Remove" }));
      expect(handleRemove).toHaveBeenCalledOnce();
      expect(onAncestor).not.toHaveBeenCalled();
    });

    it("lets a chip's button adornment reach the ancestor when the item opts into forcePropagation", async () => {
      const onAncestor = vi.fn();
      const onAdornment = vi.fn();
      const user = userEvent.setup();
      render(
        <div onClick={onAncestor}>
          <ChipList
            items={[
              <ChipList.Item
                key="x"
                trailAdornments={[
                  <Chip.Adornment
                    key="remove"
                    icon={<span>×</span>}
                    label="Remove"
                    onClick={onAdornment}
                    forcePropagation
                  />,
                ]}
              >
                Tag
              </ChipList.Item>,
            ]}
          />
        </div>,
      );
      await user.click(screen.getByRole("button", { name: "Remove" }));
      expect(onAdornment).toHaveBeenCalledOnce();
      expect(onAncestor).toHaveBeenCalledOnce();
    });
  });

  describe("orientation", () => {
    it("applies a distinct root class for vertical vs. the default horizontal", () => {
      const { rerender } = render(<ChipList items={TAGS} data-testid="list" />);
      const horizontal = screen.getByTestId("list").className;
      rerender(<ChipList items={TAGS} data-testid="list" orientation="vertical" />);
      const vertical = screen.getByTestId("list").className;
      expect(vertical).not.toBe(horizontal);
    });
  });

  it("closes the see-more popover on outside interaction", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">outside</button>
        <ChipList items={TAGS} max={2} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "See more" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
