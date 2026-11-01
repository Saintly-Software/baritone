import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BaritoneProvider } from "../BaritoneProvider";
import { fabReservationCss, useLayoutInsets, useLayoutRegion } from "./index";
import { LayoutRegistry } from "./registry";

function box(rect: Partial<DOMRect>): HTMLElement {
  const element = document.createElement("div");
  const full = { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, ...rect };
  element.getBoundingClientRect = () => ({ ...full, toJSON: () => full }) as DOMRect;
  document.body.append(element);
  return element;
}

const rootVar = (name: string) => document.documentElement.style.getPropertyValue(name);
const offset = (element: HTMLElement) => element.style.getPropertyValue("--bt-layout-offset");

describe("LayoutRegistry", () => {
  let registry: LayoutRegistry;

  beforeEach(() => {
    registry = new LayoutRegistry();
    registry.connect();
  });

  afterEach(() => {
    registry.disconnect();
    document.body.innerHTML = "";
  });

  it("sums pinned regions on an edge into its inset variable", () => {
    registry.register(box({ height: 40 }), { edge: "top" });
    registry.register(box({ height: 64 }), { edge: "top" });
    registry.flush();
    expect(rootVar("--bt-layout-inset-top")).toBe("104px");
  });

  it("measures width for left and right edges", () => {
    registry.register(box({ width: 240, height: 900 }), { edge: "left" });
    registry.flush();
    expect(rootVar("--bt-layout-inset-left")).toBe("240px");
  });

  it("leaves unpinned regions out of the inset", () => {
    registry.register(box({ height: 40 }), { edge: "bottom", pinned: false });
    registry.flush();
    expect(rootVar("--bt-layout-inset-bottom")).toBe("");
  });

  it("offsets each top region by the pinned regions before it in DOM order", () => {
    const banner = box({ height: 37 });
    const navbar = box({ height: 64 });
    const tabs = box({ height: 48 });
    registry.register(tabs, { edge: "top" });
    registry.register(navbar, { edge: "top" });
    registry.register(banner, { edge: "top" });
    registry.flush();
    expect(offset(banner)).toBe("0px");
    expect(offset(navbar)).toBe("37px");
    expect(offset(tabs)).toBe("101px");
  });

  it("stacks bottom regions from the end of the document", () => {
    const footer = box({ height: 80 });
    const cookieBar = box({ height: 50 });
    registry.register(footer, { edge: "bottom" });
    registry.register(cookieBar, { edge: "bottom" });
    registry.flush();
    expect(offset(cookieBar)).toBe("0px");
    expect(offset(footer)).toBe("50px");
  });

  it("lets order override DOM order", () => {
    const first = box({ height: 10 });
    const second = box({ height: 20 });
    registry.register(first, { edge: "top", order: 1 });
    registry.register(second, { edge: "top" });
    registry.flush();
    expect(offset(second)).toBe("0px");
    expect(offset(first)).toBe("20px");
  });

  it("does not count an unpinned region towards later offsets", () => {
    const banner = box({ height: 37 });
    const navbar = box({ height: 64 });
    registry.register(banner, { edge: "top", pinned: false });
    registry.register(navbar, { edge: "top" });
    registry.flush();
    expect(offset(navbar)).toBe("0px");
    expect(rootVar("--bt-layout-inset-top")).toBe("64px");
  });

  it("restacks when a region unregisters", () => {
    const banner = box({ height: 37 });
    const navbar = box({ height: 64 });
    const unregisterBanner = registry.register(banner, { edge: "top" });
    registry.register(navbar, { edge: "top" });
    registry.flush();
    unregisterBanner();
    registry.flush();
    expect(offset(navbar)).toBe("0px");
    expect(offset(banner)).toBe("");
    expect(rootVar("--bt-layout-inset-top")).toBe("64px");
  });

  it("removes the inset variable, rather than zeroing it, when the last region leaves", () => {
    const unregister = registry.register(box({ height: 64 }), { edge: "top" });
    registry.flush();
    unregister();
    registry.flush();
    expect(document.documentElement.style.cssText).not.toContain("--bt-layout-inset-top");
  });

  it("reserves a FAB corner box measured from the viewport corner", () => {
    window.innerWidth = 1000;
    window.innerHeight = 800;
    registry.register(
      box({ left: 924, right: 984, top: 724, bottom: 784, width: 60, height: 60 }),
      {
        corner: "bottom-right",
      },
    );
    registry.flush();
    expect(rootVar("--bt-layout-fab-bottom-right-width")).toBe("76px");
    expect(rootVar("--bt-layout-fab-bottom-right-height")).toBe("76px");
  });

  it("ignores a FAB that is not rendered", () => {
    registry.register(box({}), { corner: "bottom-left" });
    registry.flush();
    expect(rootVar("--bt-layout-fab-bottom-left-width")).toBe("0px");
  });

  it("clears everything it wrote on disconnect", () => {
    const navbar = box({ height: 64 });
    registry.register(navbar, { edge: "top" });
    registry.flush();
    registry.disconnect();
    expect(rootVar("--bt-layout-inset-top")).toBe("");
    expect(offset(navbar)).toBe("");
  });
});

describe("fabReservationCss", () => {
  it("declares the corner variables, treating numbers as pixels", () => {
    expect(fabReservationCss({ corner: "bottom-right", width: 80, height: "5rem" })).toBe(
      ":root{--bt-layout-fab-bottom-right-width:80px;--bt-layout-fab-bottom-right-height:5rem}",
    );
  });
});

describe("hooks", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("style");
  });

  function Region() {
    const ref = useLayoutRegion({ edge: "top" });
    return <div ref={ref}>region</div>;
  }

  function Readout() {
    const insets = useLayoutInsets();
    return <span>top {insets.top}</span>;
  }

  it("useLayoutRegion is inert without a provider", () => {
    render(<Region />);
    expect(screen.getByText("region").style.getPropertyValue("--bt-layout-offset")).toBe("");
    expect(rootVar("--bt-layout-inset-top")).toBe("");
  });

  it("useLayoutInsets reports zeros without a provider", () => {
    render(<Readout />);
    expect(screen.getByText("top 0")).toBeInTheDocument();
  });

  it("BaritoneProvider renders the FAB reservation as CSS", () => {
    render(
      <BaritoneProvider fab={{ corner: "bottom-right", width: 80, height: 80 }}>
        <p>app</p>
      </BaritoneProvider>,
    );
    expect(document.querySelector("style[data-baritone-layout]")?.textContent).toContain(
      "--bt-layout-fab-bottom-right-width:80px",
    );
  });
});
