import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BaritoneProvider } from "../BaritoneProvider";
import { AppShell } from "./index";

describe("AppShell", () => {
  it("renders each slot as its landmark", () => {
    render(
      <AppShell header="Top" sidebar="Side" sidebarLabel="Sections" footer="Bottom">
        Content
      </AppShell>,
    );
    expect(screen.getByRole("banner")).toHaveTextContent("Top");
    expect(screen.getByRole("complementary", { name: "Sections" })).toHaveTextContent("Side");
    expect(screen.getByRole("main")).toHaveTextContent("Content");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Bottom");
  });

  it("omits slots that are not given", () => {
    render(<AppShell>Content</AppShell>);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });

  it("starts with a skip link that targets main", async () => {
    const user = userEvent.setup();
    render(<AppShell header={<button type="button">Menu</button>}>Content</AppShell>);
    await user.tab();
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveFocus();
    expect(link.getAttribute("href")).toBe(`#${screen.getByRole("main").id}`);
  });

  it("takes a custom skip link label", () => {
    render(<AppShell skipLinkLabel="Aller au contenu">Content</AppShell>);
    expect(screen.getByRole("link", { name: "Aller au contenu" })).toBeInTheDocument();
  });

  it("registers its regions with the provider", () => {
    render(
      <BaritoneProvider>
        <AppShell header="Top" fab={<button type="button">Help</button>}>
          Content
        </AppShell>
      </BaritoneProvider>,
    );
    expect(screen.getByRole("banner").style.getPropertyValue("--bt-layout-offset")).toBe("0px");
  });
});
