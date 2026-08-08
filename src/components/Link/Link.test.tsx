import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Link } from "./index";

describe("Link", () => {
  it("renders an anchor by default and forwards href", () => {
    render(<Link href="/about">About</Link>);
    const link = screen.getByRole("link", { name: "About" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/about");
  });

  it("applies a generated style class", () => {
    render(<Link href="/x">Styled</Link>);
    expect(screen.getByRole("link", { name: "Styled" }).className.length).toBeGreaterThan(0);
  });

  it("is router-agnostic: renders a supplied link component and merges className", () => {
    // Stand-in for a framework's link (Next.js / React Router / …): any
    // component works as long as it ultimately renders an anchor.
    const RouterLink = ({ to, ...props }: { to: string; className?: string }) => (
      <a href={to} {...props} />
    );
    render(<Link render={<RouterLink to="/dashboard" className="mine" />}>Dashboard</Link>);
    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(link.className).toContain("mine");
  });

  it("passes through className", () => {
    render(
      <Link href="/x" className="extra">
        X
      </Link>,
    );
    expect(screen.getByRole("link", { name: "X" }).className).toContain("extra");
  });

  describe('appearance="button"', () => {
    it("renders an anchor (a link, not a button) with the label and forwards href", () => {
      render(
        <Link appearance="button" href="/dashboard">
          Dashboard
        </Link>,
      );
      const link = screen.getByRole("link", { name: "Dashboard" });
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "/dashboard");
    });

    it("reuses the Button recipe (styled, not the bare inline-link class)", () => {
      render(
        <Link appearance="button" href="/x">
          Styled
        </Link>,
      );
      // The button recipe emits many more classes than the single inline `linkBase`.
      const classes = screen.getByRole("link", { name: "Styled" }).className.split(/\s+/);
      expect(classes.length).toBeGreaterThan(1);
    });

    it("applies the width shorthand without leaking it to the anchor", () => {
      const { rerender } = render(
        <Link appearance="button" href="/x">
          Go
        </Link>,
      );
      const base = screen.getByRole("link", { name: "Go" }).className;

      rerender(
        <Link appearance="button" href="/x" width="fill">
          Go
        </Link>,
      );
      const link = screen.getByRole("link", { name: "Go" });
      expect(link.className).not.toBe(base);
      // `width` is a shorthand resolved to a class, not an anchor attribute.
      expect(link).not.toHaveAttribute("width");
    });

    it("renders start and end icons alongside the label", () => {
      render(
        <Link
          appearance="button"
          href="/x"
          startIcon={<span data-testid="start" />}
          endIcon={<span data-testid="end" />}
        >
          Label
        </Link>,
      );
      expect(screen.getByTestId("start")).toBeInTheDocument();
      expect(screen.getByTestId("end")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Label" })).toBeInTheDocument();
    });

    it("is router-agnostic: renders a supplied link component via `render`", () => {
      const RouterLink = ({ to, ...props }: { to: string; className?: string }) => (
        <a href={to} {...props} />
      );
      render(
        <Link appearance="button" render={<RouterLink to="/settings" />}>
          Settings
        </Link>,
      );
      const link = screen.getByRole("link", { name: "Settings" });
      expect(link).toHaveAttribute("href", "/settings");
    });

    it("collapses a disabled link to an inert element that is no longer a link", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Link appearance="button" href="/x" disabled onClick={onClick}>
          Off
        </Link>,
      );
      // A disabled link has no honest HTML form, so it leaves the link a11y tree.
      expect(screen.queryByRole("link", { name: "Off" })).not.toBeInTheDocument();
      const inert = screen.getByText("Off").closest("[aria-disabled]");
      expect(inert).toHaveAttribute("aria-disabled", "true");
      expect(inert?.tagName).not.toBe("A");
      await user.click(screen.getByText("Off"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("shows the disabledReason tooltip when the disabled link is hovered", async () => {
      const user = userEvent.setup();
      render(
        <Link appearance="button" href="/x" disabled disabledReason="Sign in first">
          Open
        </Link>,
      );
      await user.hover(screen.getByText("Open"));
      await waitFor(() => expect(screen.getByText("Sign in first")).toBeInTheDocument(), {
        timeout: 2000,
      });
    });

    it("sets aria-busy while loading", () => {
      render(
        <Link appearance="button" href="/x" loading>
          Redirecting
        </Link>,
      );
      expect(screen.getByText("Redirecting").closest("[aria-busy]")).toHaveAttribute(
        "aria-busy",
        "true",
      );
    });

    it("does not support aria-label (rejected by types, stripped at runtime)", () => {
      const props = { "aria-label": "nope" } as Record<string, unknown>;
      render(
        // @ts-expect-error aria-label is typed as `never` on the button appearance.
        <Link appearance="button" href="/x" aria-label="nope">
          Text
        </Link>,
      );
      render(
        <Link appearance="button" href="/x" {...props} data-testid="forced">
          Text
        </Link>,
      );
      expect(screen.getByTestId("forced")).not.toHaveAttribute("aria-label");
    });
  });

  describe('appearance="chip"', () => {
    it("renders an anchor (a link, not a button) with the label and forwards href", () => {
      render(
        <Link appearance="chip" href="/notes?tags=music">
          Music
        </Link>,
      );
      const link = screen.getByRole("link", { name: "Music" });
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "/notes?tags=music");
    });

    it("reuses the Chip recipe (styled, not the bare inline-link class)", () => {
      render(
        <Link appearance="chip" href="/x">
          Styled
        </Link>,
      );
      // The chip recipe emits many more classes than the single inline `linkBase`.
      const classes = screen.getByRole("link", { name: "Styled" }).className.split(/\s+/);
      expect(classes.length).toBeGreaterThan(1);
    });

    it("applies the visual variant props (shape / size / width) without leaking them to the anchor", () => {
      const { rerender } = render(
        <Link appearance="chip" href="/x">
          Tag
        </Link>,
      );
      const base = screen.getByRole("link", { name: "Tag" }).className;

      rerender(
        <Link appearance="chip" href="/x" shape="pill" size="sm" width="fill">
          Tag
        </Link>,
      );
      const link = screen.getByRole("link", { name: "Tag" });
      // The variant props change the class list…
      expect(link.className).not.toBe(base);
      // …but never leak onto the anchor as attributes.
      expect(link).not.toHaveAttribute("shape");
      expect(link).not.toHaveAttribute("width");
    });

    it("renders decorative lead and trail icons that stay out of the accessible name", () => {
      render(
        <Link
          appearance="chip"
          href="/x"
          icon={<span data-testid="lead">LEAD</span>}
          trailIcon={<span data-testid="trail">TRAIL</span>}
        >
          Label
        </Link>,
      );
      expect(screen.getByTestId("lead")).toBeInTheDocument();
      expect(screen.getByTestId("trail")).toBeInTheDocument();
      // Decorative glyphs are `aria-hidden`, so even textual icon content never
      // leaks into the accessible name — it stays the visible label.
      expect(screen.getByRole("link", { name: "Label" })).toBeInTheDocument();
    });

    it("is router-agnostic: renders a supplied link component via `render`", () => {
      const RouterLink = ({ to, ...props }: { to: string; className?: string }) => (
        <a href={to} {...props} />
      );
      render(
        <Link appearance="chip" render={<RouterLink to="/notes" />}>
          Music
        </Link>,
      );
      expect(screen.getByRole("link", { name: "Music" })).toHaveAttribute("href", "/notes");
    });

    it("is keyboard-focusable and activates on Enter", async () => {
      // Swallow the default so jsdom doesn't attempt a real navigation; the
      // handler firing is what proves Enter activates the anchor.
      const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
      const user = userEvent.setup();
      render(
        <Link appearance="chip" href="/x" onClick={onClick}>
          Music
        </Link>,
      );
      await user.tab();
      const link = screen.getByRole("link", { name: "Music" });
      expect(link).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("collapses a disabled link to an inert element that is no longer a link", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Link appearance="chip" href="/x" disabled onClick={onClick}>
          Off
        </Link>,
      );
      // A disabled link has no honest HTML form, so it leaves the link a11y tree.
      expect(screen.queryByRole("link", { name: "Off" })).not.toBeInTheDocument();
      const inert = screen.getByText("Off").closest("[aria-disabled]");
      expect(inert).toHaveAttribute("aria-disabled", "true");
      expect(inert?.tagName).not.toBe("A");
      await user.click(screen.getByText("Off"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("shows the disabledReason tooltip when the disabled link is hovered", async () => {
      const user = userEvent.setup();
      render(
        <Link appearance="chip" href="/x" disabled disabledReason="Sign in first">
          Open
        </Link>,
      );
      await user.hover(screen.getByText("Open"));
      await waitFor(() => expect(screen.getByText("Sign in first")).toBeInTheDocument(), {
        timeout: 2000,
      });
    });

    it("does not support aria-label (rejected by types, stripped at runtime)", () => {
      const props = { "aria-label": "nope" } as Record<string, unknown>;
      render(
        // @ts-expect-error aria-label is typed as `never` on the chip appearance.
        <Link appearance="chip" href="/x" aria-label="nope">
          Text
        </Link>,
      );
      render(
        <Link appearance="chip" href="/x" {...props} data-testid="forced">
          Text
        </Link>,
      );
      expect(screen.getByTestId("forced")).not.toHaveAttribute("aria-label");
    });
  });
});
