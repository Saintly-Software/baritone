import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button";
import { LinkProvider } from "../LinkProvider";
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

    it("does not support aria-label on the labelled arm (rejected by types, stripped at runtime)", () => {
      const props = { "aria-label": "nope" } as Record<string, unknown>;
      render(
        // @ts-expect-error aria-label is typed as `never` on the labelled button arm.
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

    describe("icon-only", () => {
      it("renders an anchor named by the required aria-label, with no visible label, and forwards href", () => {
        render(
          <Link
            appearance="button"
            href="/back"
            icon={<span data-testid="glyph" />}
            aria-label="Back to entry details"
          />,
        );
        const link = screen.getByRole("link", { name: "Back to entry details" });
        expect(link.tagName).toBe("A");
        expect(link).toHaveAttribute("href", "/back");
        expect(link).toHaveAttribute("aria-label", "Back to entry details");
        expect(screen.getByTestId("glyph")).toBeInTheDocument();
        // No visible text content — the glyph is the whole content.
        expect(link).toHaveTextContent("");
      });

      it("is pixel-identical to an icon-only Button: same recipe + square-treatment classes", () => {
        // Render both at the same knobs; the icon-only link must carry every class
        // an icon-only `Button` does (the shared recipe *and* the `buttonSquare`
        // treatment), proving it reuses the styling path rather than duplicating it.
        render(<Link appearance="button" href="/x" icon={<span />} aria-label="Add" />);
        render(<Button icon={<span />} aria-label="Add button" />);
        const linkClasses = new Set(
          screen.getByRole("link", { name: "Add" }).className.split(/\s+/),
        );
        const buttonClasses = screen
          .getByRole("button", { name: "Add button" })
          .className.split(/\s+/)
          .filter(Boolean);
        // The button emits more than one class (recipe + square + focus ring)…
        expect(buttonClasses.length).toBeGreaterThan(1);
        // …and every one of them is present on the icon-only link.
        for (const className of buttonClasses) expect(linkClasses).toContain(className);
      });

      it("is router-agnostic: renders a supplied link component via `render`", () => {
        const RouterLink = ({ to, ...props }: { to: string; className?: string }) => (
          <a href={to} {...props} />
        );
        render(
          <Link
            appearance="button"
            render={<RouterLink to="/settings" />}
            icon={<span />}
            aria-label="Open settings"
          />,
        );
        expect(screen.getByRole("link", { name: "Open settings" })).toHaveAttribute(
          "href",
          "/settings",
        );
      });

      it("routes through an ambient LinkProvider when only an internal href is set", async () => {
        const user = userEvent.setup();
        const navigations: string[] = [];
        render(
          <LinkProvider
            render={({ href, children, ...props }) => (
              <a
                {...props}
                href={href}
                data-router-link=""
                onClick={(event) => {
                  event.preventDefault();
                  navigations.push(href);
                }}
              >
                {children}
              </a>
            )}
          >
            <Link appearance="button" href="/dashboard" icon={<span />} aria-label="Dashboard" />
          </LinkProvider>,
        );
        const link = screen.getByRole("link", { name: "Dashboard" });
        // The provider owns internal navigation, keeping the icon-only styling.
        expect(link).toHaveAttribute("data-router-link", "");
        await user.click(link);
        expect(navigations).toEqual(["/dashboard"]);
      });

      it("collapses a disabled icon-only link to an inert element whose name survives as content", async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(
          <Link
            appearance="button"
            href="/x"
            icon={<span />}
            aria-label="Back"
            disabled
            onClick={onClick}
          />,
        );
        // A disabled link has no honest HTML form, so it leaves the link a11y tree
        // and becomes a role-less inert element — like the labelled arm.
        expect(screen.queryByRole("link", { name: "Back" })).not.toBeInTheDocument();
        // The icon-only arm has no visible label, so the name is re-exposed as
        // visually-hidden *content* (perceivable on a generic element) rather than
        // an `aria-label` — which is prohibited on a role-less element (axe
        // `aria-prohibited-attr`) and ignored by some AT.
        const inert = screen.getByText("Back").closest("[aria-disabled]") as HTMLElement;
        expect(inert).toHaveAttribute("aria-disabled", "true");
        expect(inert.tagName).not.toBe("A");
        expect(inert).not.toHaveAttribute("aria-label");
        await user.click(inert);
        expect(onClick).not.toHaveBeenCalled();
      });

      it("shows the disabledReason tooltip when the disabled icon-only link is hovered", async () => {
        const user = userEvent.setup();
        render(
          <Link
            appearance="button"
            href="/x"
            icon={<span />}
            aria-label="Back"
            disabled
            disabledReason="Sign in first"
          />,
        );
        await user.hover(screen.getByText("Back"));
        await waitFor(() => expect(screen.getByText("Sign in first")).toBeInTheDocument(), {
          timeout: 2000,
        });
      });

      it("sets aria-busy while loading and keeps its name perceivable as content", () => {
        render(
          <Link appearance="button" href="/x" icon={<span />} aria-label="Redirecting" loading />,
        );
        // Loading makes the link inert (an in-flight nav shouldn't re-trigger), so
        // like the labelled arm it collapses out of the link a11y tree — the name
        // rides along as visually-hidden content and aria-busy marks it in-flight.
        const busy = screen.getByText("Redirecting").closest("[aria-busy]") as HTMLElement;
        expect(busy).toHaveAttribute("aria-busy", "true");
        expect(busy).not.toHaveAttribute("aria-label");
      });

      it("requires an aria-label on the icon-only arm", () => {
        // @ts-expect-error `aria-label` is required when `icon` is present (no visible name).
        render(<Link appearance="button" href="/x" icon={<span data-testid="no-label" />} />);
        expect(screen.getByTestId("no-label")).toBeInTheDocument();
      });

      it("rejects a nullish icon (it can't select the icon-only arm and render unnamed)", () => {
        // `icon` is `NonNullable<React.ReactNode>`, so a `cond ? <Icon/> : null`
        // can't slip through as the icon-only arm — which would forward no glyph
        // and drop the required `aria-label`, producing an unnamed anchor.
        // @ts-expect-error `icon` must not be null.
        render(<Link appearance="button" href="/x" icon={null} aria-label="Back" />);
        // @ts-expect-error `icon` must not be undefined.
        render(<Link appearance="button" href="/x" icon={undefined} aria-label="Back" />);
        expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
      });

      it("rejects children, startIcon/endIcon, and width on the icon-only arm", () => {
        render(
          // @ts-expect-error `children` is unsupported alongside `icon`.
          <Link appearance="button" href="/x" icon={<span />} aria-label="Add">
            Label
          </Link>,
        );
        // @ts-expect-error `startIcon` is unsupported on the icon-only arm.
        render(<Link appearance="button" icon={<span />} aria-label="Add" startIcon={<span />} />);
        // @ts-expect-error `endIcon` is unsupported on the icon-only arm.
        render(<Link appearance="button" icon={<span />} aria-label="Add" endIcon={<span />} />);
        // @ts-expect-error aspect-ratio 1 would inflate it into a container-sized square.
        render(<Link appearance="button" icon={<span />} aria-label="Add" width="fill" />);
        expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
      });
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
