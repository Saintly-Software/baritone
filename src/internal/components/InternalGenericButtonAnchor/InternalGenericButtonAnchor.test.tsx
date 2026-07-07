import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { InternalGenericButtonAnchor } from "./index";

/**
 * The primitive's whole job is element-selection + disabled semantics, so the
 * tests are organised by the four things it can render (button, external link,
 * internal/router link, disabled-link div) plus the AGENTS.md focusable-disabled
 * convention.
 */
describe("InternalGenericButtonAnchor", () => {
  describe("button (no href / no render)", () => {
    it("renders a non-submitting <button> by default", () => {
      render(<InternalGenericButtonAnchor>Save</InternalGenericButtonAnchor>);
      const button = screen.getByRole("button", { name: "Save" });
      expect(button.tagName).toBe("BUTTON");
      expect(button).toHaveAttribute("type", "button");
    });

    it("honours an explicit type", () => {
      render(<InternalGenericButtonAnchor type="submit">Go</InternalGenericButtonAnchor>);
      expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("type", "submit");
    });

    it("fires onClick when enabled", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<InternalGenericButtonAnchor onClick={onClick}>Save</InternalGenericButtonAnchor>);
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("external link (href, no render)", () => {
    it("renders an <a href>", () => {
      render(
        <InternalGenericButtonAnchor href="https://example.com">Docs</InternalGenericButtonAnchor>,
      );
      const link = screen.getByRole("link", { name: "Docs" });
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "https://example.com");
    });

    it("defaults a safe rel when opening a new tab", () => {
      render(
        <InternalGenericButtonAnchor href="https://example.com" target="_blank">
          Docs
        </InternalGenericButtonAnchor>,
      );
      const link = screen.getByRole("link", { name: "Docs" });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("lets a caller override rel", () => {
      render(
        <InternalGenericButtonAnchor href="https://example.com" target="_blank" rel="external">
          Docs
        </InternalGenericButtonAnchor>,
      );
      expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("rel", "external");
    });

    it("adds no rel for a same-tab link", () => {
      render(
        <InternalGenericButtonAnchor href="https://example.com">Docs</InternalGenericButtonAnchor>,
      );
      expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("rel");
    });
  });

  describe("internal / router link (render)", () => {
    it("renders the router element and merges className, children and onClick", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      // A stand-in for a router link: a custom anchor that owns its own href.
      const RouterLink = (props: ComponentProps<"a">) => <a data-router {...props} />;
      render(
        <InternalGenericButtonAnchor
          render={<RouterLink href="/settings" />}
          className="consumer"
          onClick={onClick}
        >
          Settings
        </InternalGenericButtonAnchor>,
      );
      const link = screen.getByRole("link", { name: "Settings" });
      expect(link).toHaveAttribute("data-router");
      expect(link).toHaveAttribute("href", "/settings");
      expect(link.className).toContain("consumer");
      await user.click(link);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("disabled", () => {
    it("collapses a disabled external link to an inert <div> (no navigation)", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <InternalGenericButtonAnchor href="https://example.com" disabled onClick={onClick}>
          Docs
        </InternalGenericButtonAnchor>,
      );
      // No link is exposed at all — it's a plain div.
      expect(screen.queryByRole("link")).toBeNull();
      const div = screen.getByText("Docs");
      expect(div.tagName).toBe("DIV");
      expect(div).toHaveAttribute("aria-disabled", "true");
      expect(div).not.toHaveAttribute("href");
      await user.click(div);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("collapses a disabled internal (router) link to a <div>", () => {
      const RouterLink = (props: ComponentProps<"a">) => <a data-router {...props} />;
      render(
        <InternalGenericButtonAnchor render={<RouterLink href="/settings" />} disabled>
          Settings
        </InternalGenericButtonAnchor>,
      );
      expect(screen.queryByRole("link")).toBeNull();
      expect(screen.getByText("Settings").tagName).toBe("DIV");
    });

    it("keeps a disabled button as an aria-disabled <button> and swallows its click", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <InternalGenericButtonAnchor disabled onClick={onClick}>
          Save
        </InternalGenericButtonAnchor>,
      );
      const button = screen.getByRole("button", { name: "Save" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    // The AGENTS.md convention: a disabled control stays reachable so it can
    // explain itself. A disabled button must still be tabbable.
    it("keeps a disabled button in the tab order (aria-disabled, not native disabled)", async () => {
      const user = userEvent.setup();
      render(<InternalGenericButtonAnchor disabled>Save</InternalGenericButtonAnchor>);
      await user.tab();
      expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    });
  });

  it("passes arbitrary props (data-*, style, id) through to the rendered element", () => {
    render(
      <InternalGenericButtonAnchor id="cta" data-testid="cta" style={{ color: "red" }}>
        Save
      </InternalGenericButtonAnchor>,
    );
    const button = screen.getByTestId("cta");
    expect(button).toHaveAttribute("id", "cta");
    expect(button).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });
});
