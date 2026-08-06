import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "../../../components/Chip";
import { chipBoxClassName, InternalChip } from "./index";

/**
 * `InternalChip` is not part of the public API — it's the engine behind `Link`'s
 * `appearance="chip"`, and it shares `chipBoxClassName` (the chip look) with the
 * public `Chip`. These tests cover the chip-specific chrome it adds on top of
 * `InternalGenericButtonAnchor`; the router/disabled semantics of the element
 * itself are covered under `Link` / `InternalGenericButtonAnchor`.
 */
describe("InternalChip", () => {
  it("renders an <a> whose accessible name is the label", () => {
    render(<InternalChip href="/tags/music">Music</InternalChip>);
    const link = screen.getByRole("link", { name: "Music" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/tags/music");
  });

  it("wraps the label in the chip label element and reuses the chip box recipe", () => {
    render(<InternalChip href="/x">Label</InternalChip>);
    const link = screen.getByRole("link", { name: "Label" });
    // The chip look is many classes, not the bare inline-link class.
    expect(link.className.split(/\s+/).length).toBeGreaterThan(1);
    // The label sits in its own truncating element, not directly on the anchor.
    expect(link.querySelector("span")?.textContent).toBe("Label");
  });

  it("renders decorative lead and trail icons around the label", () => {
    render(
      <InternalChip
        href="/x"
        icon={<span data-testid="lead" />}
        trailIcon={<span data-testid="trail" />}
      >
        Label
      </InternalChip>,
    );
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(screen.getByTestId("trail")).toBeInTheDocument();
    // The decorative glyphs don't change the accessible name.
    expect(screen.getByRole("link", { name: "Label" })).toBeInTheDocument();
  });

  it("is visually identical to a Chip with the same props (same box classes)", () => {
    render(
      <>
        <Chip data-testid="chip" intent="primary" saliency="low" size="sm" shape="pill">
          Music
        </Chip>
        <InternalChip data-testid="link" intent="primary" saliency="low" size="sm" shape="pill">
          Music
        </InternalChip>
      </>,
    );
    const chipClasses = new Set(screen.getByTestId("chip").className.split(/\s+/));
    const linkClasses = screen.getByTestId("link").className.split(/\s+/);
    // Every class the shared `chipBoxClassName` emits is present on both.
    for (const cls of chipBoxClassName({
      intent: "primary",
      saliency: "low",
      size: "sm",
      shape: "pill",
    }).split(/\s+/)) {
      expect(chipClasses.has(cls)).toBe(true);
      expect(linkClasses).toContain(cls);
    }
  });

  it("routes through a supplied render element (typed router link)", () => {
    const RouterLink = (props: ComponentProps<"a">) => <a data-router {...props} />;
    render(<InternalChip render={<RouterLink href="/notes" />}>Notes</InternalChip>);
    const link = screen.getByRole("link", { name: "Notes" });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveAttribute("href", "/notes");
  });

  it("collapses a disabled chip-link to an inert element and swallows the click", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <InternalChip href="/x" disabled onClick={onClick}>
        Off
      </InternalChip>,
    );
    // A disabled link has no honest HTML form, so it leaves the link a11y tree.
    expect(screen.queryByRole("link", { name: "Off" })).not.toBeInTheDocument();
    const inert = screen.getByText("Off").closest("[aria-disabled]");
    expect(inert).toHaveAttribute("aria-disabled", "true");
    expect(inert?.tagName).not.toBe("A");
    await user.click(screen.getByText("Off"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
