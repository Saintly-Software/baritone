import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Link } from "../Link";
import { isInternalHref, LinkProvider, type LinkRenderProps } from "./index";

/**
 * A stand-in for a framework's link (Next.js / React Router / TanStack). It marks
 * the anchors it renders (`data-router-link`) so tests can tell a routed link from
 * a plain one, records the destinations it's asked to navigate to, and prevents
 * the default full-page navigation so a click is observable without leaving jsdom.
 */
function makeRouter() {
  const navigations: string[] = [];
  const render = ({ href, children, ...props }: LinkRenderProps) => (
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
  );
  return { navigations, render };
}

describe("isInternalHref", () => {
  it.each([
    "/about",
    "/posts/42",
    "./relative",
    "../up",
    "relative",
    "?query=1",
    "#hash",
    "/weird:segment",
  ])("treats %s as internal", (href) => {
    expect(isInternalHref(href)).toBe(true);
  });

  it.each([
    "https://example.com",
    "http://example.com",
    "//cdn.example.com/app.js",
    "mailto:hi@example.com",
    "tel:+15551234567",
    "sms:+15551234567",
    "ftp://files.example.com",
  ])("treats %s as external", (href) => {
    expect(isInternalHref(href)).toBe(false);
  });
});

describe("LinkProvider", () => {
  it("routes an internal Link through the provider's router link", () => {
    const router = makeRouter();
    render(
      <LinkProvider render={router.render}>
        <Link href="/dashboard">Dashboard</Link>
      </LinkProvider>,
    );
    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(link).toHaveAttribute("data-router-link", "");
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("keeps the system's styling on the routed link and merges a passed className", () => {
    const router = makeRouter();
    render(
      <LinkProvider render={router.render}>
        <Link href="/dashboard" className="extra">
          Dashboard
        </Link>
      </LinkProvider>,
    );
    const link = screen.getByRole("link", { name: "Dashboard" });
    // The design system's generated class rides along...
    expect(link.className.split(/\s+/).length).toBeGreaterThan(1);
    // ...and the consumer's className is merged in.
    expect(link.className).toContain("extra");
  });

  it("navigates via the router (not a full page load) when a routed link is clicked", async () => {
    const user = userEvent.setup();
    const router = makeRouter();
    render(
      <LinkProvider render={router.render}>
        <Link href="/settings">Settings</Link>
      </LinkProvider>,
    );
    await user.click(screen.getByRole("link", { name: "Settings" }));
    expect(router.navigations).toEqual(["/settings"]);
  });

  it("leaves an external href as a plain anchor (never routed)", () => {
    const router = makeRouter();
    render(
      <LinkProvider render={router.render}>
        <Link href="https://example.com">Docs</Link>
      </LinkProvider>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).not.toHaveAttribute("data-router-link");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("leaves a mailto: href as a plain anchor", () => {
    const router = makeRouter();
    render(
      <LinkProvider render={router.render}>
        <Link href="mailto:hi@example.com">Email us</Link>
      </LinkProvider>,
    );
    expect(screen.getByRole("link", { name: "Email us" })).not.toHaveAttribute("data-router-link");
  });

  it("leaves a new-tab (target) link as a plain anchor", () => {
    const router = makeRouter();
    render(
      <LinkProvider render={router.render}>
        <Link href="/report.pdf" target="_blank">
          Open report
        </Link>
      </LinkProvider>,
    );
    expect(screen.getByRole("link", { name: "Open report" })).not.toHaveAttribute(
      "data-router-link",
    );
  });

  it("leaves a download link as a plain anchor", () => {
    const router = makeRouter();
    render(
      <LinkProvider render={router.render}>
        <Link href="/report.pdf" download>
          Download report
        </Link>
      </LinkProvider>,
    );
    expect(screen.getByRole("link", { name: "Download report" })).not.toHaveAttribute(
      "data-router-link",
    );
  });

  it("lets a per-link render override the provider", () => {
    const router = makeRouter();
    render(
      <LinkProvider render={router.render}>
        <Link href="/dashboard" render={<a data-explicit-link="" href="/override" />}>
          Dashboard
        </Link>
      </LinkProvider>,
    );
    const link = screen.getByRole("link", { name: "Dashboard" });
    // The explicit render wins: the element is the one passed to `render`, not the
    // provider's router link, and it keeps its own destination.
    expect(link).toHaveAttribute("data-explicit-link", "");
    expect(link).not.toHaveAttribute("data-router-link");
    expect(link).toHaveAttribute("href", "/override");
  });

  it("honours a custom isInternal predicate (e.g. keep a subtree on full-page loads)", () => {
    const router = makeRouter();
    // Route everything *except* the legacy /admin area.
    const isInternal = (href: string) => isInternalHref(href) && !href.startsWith("/admin");
    render(
      <LinkProvider render={router.render} isInternal={isInternal}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/admin/users">Admin</Link>
      </LinkProvider>,
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("data-router-link", "");
    expect(screen.getByRole("link", { name: "Admin" })).not.toHaveAttribute("data-router-link");
  });

  it("does not affect a Link rendered outside any provider", () => {
    render(<Link href="/about">About</Link>);
    const link = screen.getByRole("link", { name: "About" });
    expect(link.tagName).toBe("A");
    expect(link).not.toHaveAttribute("data-router-link");
    expect(link).toHaveAttribute("href", "/about");
  });

  it("lets an inner provider override an outer one for its subtree", () => {
    const outer = makeRouter();
    const innerRender = ({ href, children, ...props }: LinkRenderProps) => (
      <a {...props} href={href} data-inner-link="">
        {children}
      </a>
    );
    render(
      <LinkProvider render={outer.render}>
        <Link href="/a">Outer</Link>
        <LinkProvider render={innerRender}>
          <Link href="/b">Inner</Link>
        </LinkProvider>
      </LinkProvider>,
    );
    expect(screen.getByRole("link", { name: "Outer" })).toHaveAttribute("data-router-link", "");
    expect(screen.getByRole("link", { name: "Inner" })).toHaveAttribute("data-inner-link", "");
  });

  describe('appearance="button"', () => {
    it("routes an internal button-link through the provider (still an anchor)", () => {
      const router = makeRouter();
      render(
        <LinkProvider render={router.render}>
          <Link appearance="button" href="/dashboard">
            Dashboard
          </Link>
        </LinkProvider>,
      );
      const link = screen.getByRole("link", { name: "Dashboard" });
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("data-router-link", "");
      expect(link).toHaveAttribute("href", "/dashboard");
      // It still reuses the Button recipe (many classes, not the bare inline link).
      expect(link.className.split(/\s+/).length).toBeGreaterThan(1);
    });

    it("leaves an external button-link a plain anchor", () => {
      const router = makeRouter();
      render(
        <LinkProvider render={router.render}>
          <Link appearance="button" href="https://example.com">
            Docs
          </Link>
        </LinkProvider>,
      );
      expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("data-router-link");
    });

    it("still collapses a disabled routed button-link to an inert element", async () => {
      const router = makeRouter();
      const user = userEvent.setup();
      render(
        <LinkProvider render={router.render}>
          <Link appearance="button" href="/dashboard" disabled>
            Off
          </Link>
        </LinkProvider>,
      );
      // A disabled link has no honest HTML form, so it leaves the link a11y tree
      // even when a provider is present.
      expect(screen.queryByRole("link", { name: "Off" })).not.toBeInTheDocument();
      await user.click(screen.getByText("Off"));
      expect(router.navigations).toEqual([]);
    });
  });

  describe('appearance="chip"', () => {
    it("routes an internal chip-link through the provider (still an anchor)", () => {
      const router = makeRouter();
      render(
        <LinkProvider render={router.render}>
          <Link appearance="chip" href="/notes?tags=music">
            Music
          </Link>
        </LinkProvider>,
      );
      const link = screen.getByRole("link", { name: "Music" });
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("data-router-link", "");
      expect(link).toHaveAttribute("href", "/notes?tags=music");
      // It still reuses the Chip recipe (many classes, not the bare inline link).
      expect(link.className.split(/\s+/).length).toBeGreaterThan(1);
    });

    it("navigates via the router (not a full page load) when a routed chip-link is clicked", async () => {
      const user = userEvent.setup();
      const router = makeRouter();
      render(
        <LinkProvider render={router.render}>
          <Link appearance="chip" href="/notes?tags=music">
            Music
          </Link>
        </LinkProvider>,
      );
      await user.click(screen.getByRole("link", { name: "Music" }));
      expect(router.navigations).toEqual(["/notes?tags=music"]);
    });

    it("leaves an external chip-link a plain anchor", () => {
      const router = makeRouter();
      render(
        <LinkProvider render={router.render}>
          <Link appearance="chip" href="https://example.com">
            Docs
          </Link>
        </LinkProvider>,
      );
      expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("data-router-link");
    });

    it("leaves a new-tab chip-link a plain anchor", () => {
      const router = makeRouter();
      render(
        <LinkProvider render={router.render}>
          <Link appearance="chip" href="/notes?tags=music" target="_blank">
            Music
          </Link>
        </LinkProvider>,
      );
      expect(screen.getByRole("link", { name: "Music" })).not.toHaveAttribute("data-router-link");
    });

    it("lets a per-link render override the provider on a chip-link", () => {
      const router = makeRouter();
      render(
        <LinkProvider render={router.render}>
          <Link
            appearance="chip"
            href="/notes"
            render={<a data-explicit-link="" href="/override" />}
          >
            Music
          </Link>
        </LinkProvider>,
      );
      const link = screen.getByRole("link", { name: "Music" });
      expect(link).toHaveAttribute("data-explicit-link", "");
      expect(link).not.toHaveAttribute("data-router-link");
      expect(link).toHaveAttribute("href", "/override");
    });

    it("still collapses a disabled routed chip-link to an inert element", async () => {
      const router = makeRouter();
      const user = userEvent.setup();
      render(
        <LinkProvider render={router.render}>
          <Link appearance="chip" href="/notes?tags=music" disabled>
            Off
          </Link>
        </LinkProvider>,
      );
      expect(screen.queryByRole("link", { name: "Off" })).not.toBeInTheDocument();
      await user.click(screen.getByText("Off"));
      expect(router.navigations).toEqual([]);
    });
  });
});
