import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InternalButton, type InternalButtonHtmlAttrs } from "./index";

/**
 * The public-API surface (intents, loading, disabled tooltip, the `render` prop,
 * the rejected `aria-label`, …) is covered through `Button.test.tsx`, since
 * `Button` is a thin pass-through. These tests focus on what's unique to
 * `InternalButton`: the `htmlAttrs` seam used by the overlay triggers/closes.
 */
describe("InternalButton", () => {
  it("renders consumerProps into a <button> (the Button pass-through)", () => {
    render(<InternalButton consumerProps={{ children: "Save" }} />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  it("merges htmlAttrs (className, data-*, aria-*) onto the button", () => {
    // base-ui hands its `render` callback a pre-built bag of attributes; the
    // `data-*` it derives from state aren't statically known, hence the cast.
    const hostAttrs = {
      className: "host",
      "aria-haspopup": "dialog",
      "data-state": "closed",
    } as InternalButtonHtmlAttrs;
    render(
      <InternalButton
        consumerProps={{ children: "Trigger", className: "consumer" }}
        htmlAttrs={hostAttrs}
      />,
    );
    const button = screen.getByRole("button", { name: "Trigger" });
    // Both the host's and the consumer's classes survive the merge.
    expect(button.className).toContain("host");
    expect(button.className).toContain("consumer");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    expect(button).toHaveAttribute("data-state", "closed");
  });

  it("chains the consumer's and the host's onClick when enabled", async () => {
    const consumerClick = vi.fn();
    const hostClick = vi.fn();
    const user = userEvent.setup();
    render(
      <InternalButton
        consumerProps={{ children: "Open", onClick: consumerClick }}
        htmlAttrs={{ onClick: hostClick }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(consumerClick).toHaveBeenCalledTimes(1);
    expect(hostClick).toHaveBeenCalledTimes(1);
  });

  it("gates the host's onClick when disabled (a disabled trigger can't toggle)", async () => {
    const consumerClick = vi.fn();
    const hostClick = vi.fn();
    const user = userEvent.setup();
    render(
      <InternalButton
        consumerProps={{ children: "Open", disabled: true, onClick: consumerClick }}
        htmlAttrs={{ onClick: hostClick }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(consumerClick).not.toHaveBeenCalled();
    expect(hostClick).not.toHaveBeenCalled();
  });

  it("composes the consumer's ref and the host's ref onto the same node", () => {
    let consumerNode: HTMLButtonElement | null = null;
    let hostNode: HTMLButtonElement | null = null;
    render(
      <InternalButton
        consumerProps={{
          children: "Ref",
          ref: (el) => {
            consumerNode = el;
          },
        }}
        htmlAttrs={{
          ref: (el) => {
            hostNode = el;
          },
        }}
      />,
    );
    const button = screen.getByRole("button", { name: "Ref" });
    expect(consumerNode).toBe(button);
    expect(hostNode).toBe(button);
  });

  it("lets the consumer's props win over the host's on conflict", () => {
    render(
      <InternalButton
        consumerProps={{ children: "Submit", type: "submit", id: "consumer" }}
        htmlAttrs={{ type: "button", id: "host" }}
      />,
    );
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("id", "consumer");
  });
});
