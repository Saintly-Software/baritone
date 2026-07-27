import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Box } from "./index";

/**
 * Interaction coverage for the new layout atoms on `Box`. These run in a real
 * browser (unlike the jsdom unit tests, which can only compare class strings), so
 * they can read *computed* CSS and prove the actual values the acceptance
 * criteria call for: `minHeight="screen"` emits `100dvh` and fills the viewport,
 * and `position="sticky"` + `top` reach the element as real positioning.
 */
const meta: Meta<typeof Box> = {
  title: "Interaction Tests/Box",
  component: Box,
};
export default meta;

type Story = StoryObj<typeof Box>;

/** Every rule's text across all injected stylesheets (incl. inside media queries). */
function allCssText(): string {
  let out = "";
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet — skip
    }
    for (const rule of Array.from(rules)) out += `${rule.cssText}\n`;
  }
  return out;
}

/**
 * `minHeight="screen"` maps to the dynamic viewport unit `100dvh`: the atom emits
 * `100dvh` into the stylesheet, and the element's used `min-height` fills the
 * viewport.
 */
export const ViewportFill: Story = {
  render: () => (
    <Box minHeight="screen" data-testid="fill">
      Fills the viewport
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector<HTMLElement>('[data-testid="fill"]')!;

    // The atom emits the dynamic-viewport unit, not a raw `100vh`.
    expect(allCssText()).toContain("100dvh");

    // …and it lands on the element as a viewport-height min-height.
    const used = parseFloat(getComputedStyle(el).minHeight);
    expect(used).toBeGreaterThan(0);
    expect(Math.abs(used - window.innerHeight)).toBeLessThanOrEqual(2);
  },
};

/**
 * `position="sticky"` and `top="0"` both reach the element as real positioning —
 * no raw CSS, no inline style.
 */
export const Sticky: Story = {
  render: () => (
    <Box style={{ height: 160, overflow: "auto" }}>
      <Box position="sticky" top="0" data-testid="bar">
        Sticky bar
      </Box>
      <Box style={{ height: 600 }}>tall content</Box>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector<HTMLElement>('[data-testid="bar"]')!;
    const cs = getComputedStyle(bar);
    expect(cs.position).toBe("sticky");
    expect(cs.top).toBe("0px");
  },
};
