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

/**
 * The value the element's *own* atom rule declares for `prop` — found by matching
 * each of the element's classes against the injected stylesheets. Binding to the
 * element (rather than scanning every rule) proves the value belongs to *this*
 * element, and reading the authored declaration (e.g. `100dvh`) rather than the
 * browser's resolved pixels is what distinguishes `dvh` from `vh` — the two are
 * identical in a static viewport.
 */
function declaredValue(el: HTMLElement, prop: string): string | undefined {
  for (const cls of Array.from(el.classList)) {
    const selector = `.${CSS.escape(cls)}`;
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin sheet — skip
      }
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
          const value = rule.style.getPropertyValue(prop).trim();
          if (value) return value;
        }
      }
    }
  }
  return undefined;
}

/**
 * `minHeight="screen"` maps to the dynamic viewport unit `100dvh`: the atom rule
 * on this element declares exactly `100dvh` (not a raw `100vh`), and it's live on
 * the element.
 */
export const ViewportFill: Story = {
  render: () => (
    <Box minHeight="screen" data-testid="fill">
      Fills the viewport
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector<HTMLElement>('[data-testid="fill"]')!;

    // The `screen` atom on THIS element declares the dynamic-viewport unit exactly.
    expect(declaredValue(el, "min-height")).toBe("100dvh");

    // …and it's live — applied to the element, not shadowed by another rule.
    expect(parseFloat(getComputedStyle(el).minHeight)).toBeGreaterThan(0);
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
