import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
