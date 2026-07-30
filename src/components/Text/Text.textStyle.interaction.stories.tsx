import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { type TextStyleDef, buildDefaultTokens, vars } from "../../theme";
import { BaritoneTheme } from "../BaritoneTheme";
import { Text } from "./index";

/**
 * Interaction coverage for `textStyle`, validated against **real computed styles** —
 * the piece jsdom can't check. The whole mechanism leans on CSS var-chaining: a
 * `textStyle` points the size recipe's instance vars at `--textStyle-<name>-*`, and
 * a property the style *omits* must resolve to the guaranteed-invalid value so the
 * recipe's `fallbackVar` uses its base-token default. This story publishes a few
 * styles via a real theme and asserts each resolves correctly in a browser.
 */
const meta: Meta<typeof Text> = {
  title: "Interaction Tests/Text textStyle",
  component: Text,
};
export default meta;

type Story = StoryObj<typeof Text>;

const SERIF = 'Georgia, "Times New Roman", serif';

const TEXT_STYLES = {
  // Full size bundle via the `size` convenience.
  big: { size: "4xl" },
  // Sets *only* a weight — fontSize/lineHeight/family must fall back to the base.
  weightOnly: { weight: "bold" },
  // Sets *only* a line-height — fontSize must fall back to the base (md).
  loose: { lineHeight: 2.6 },
  // Family via a published `font` entry, plus a size.
  serifTitle: { size: "2xl", font: "serif" },
} satisfies Record<string, TextStyleDef>;

/**
 * Every published role resolves through the recipe against a set of reference sizes
 * rendered in the same theme, so the assertions compare like-for-like computed px.
 */
export const Resolves: Story = {
  render: () => (
    <BaritoneTheme
      tokens={buildDefaultTokens("light")}
      scheme="light"
      fonts={{ serif: SERIF }}
      textStyles={TEXT_STYLES}
      style={{ display: "grid", gap: 8, color: vars.text.color.neutral.mid }}
    >
      {/* References — plain sizes with no textStyle. */}
      <Text>baseline md</Text>
      <Text size="4xl">reference 4xl</Text>
      <Text size="sm">reference sm</Text>

      {/* Under test. */}
      <Text textStyle="big">big role</Text>
      <Text textStyle="weightOnly">weightOnly role</Text>
      <Text textStyle="loose">loose role</Text>
      <Text textStyle="serifTitle">serifTitle role</Text>
      <Text textStyle="big" size="sm">
        big role, nudged to sm
      </Text>
    </BaritoneTheme>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cs = (text: string) => getComputedStyle(canvas.getByText(text));

    const baseline = cs("baseline md");
    const fourXl = cs("reference 4xl");
    const sm = cs("reference sm");
    const big = cs("big role");
    const weightOnly = cs("weightOnly role");
    const loose = cs("loose role");
    const serifTitle = cs("serifTitle role");
    const bigNudged = cs("big role, nudged to sm");

    // Sanity: the references are actually distinct sizes.
    expect(parseFloat(fourXl.fontSize)).toBeGreaterThan(parseFloat(baseline.fontSize));
    expect(parseFloat(sm.fontSize)).toBeLessThan(parseFloat(baseline.fontSize));

    // 1. The `size` convenience resolves through the instance var: `big` === 4xl.
    expect(big.fontSize).toBe(fourXl.fontSize);

    // 2. VAR-CHAINING PIN — a style that omits fontSize falls back to the base (md),
    //    while the property it *does* set (weight) still applies.
    expect(weightOnly.fontSize).toBe(baseline.fontSize);
    expect(Number(weightOnly.fontWeight)).toBeGreaterThan(Number(baseline.fontWeight));

    // 3. `loose` sets only line-height: fontSize falls back to md, line-height grows.
    expect(loose.fontSize).toBe(baseline.fontSize);
    expect(parseFloat(loose.lineHeight)).toBeGreaterThan(parseFloat(baseline.lineHeight));

    // 4. Family resolves through the bundle → the published `serif` stack.
    expect(serifTitle.fontFamily).toContain("Georgia");
    expect(serifTitle.fontSize).not.toBe(baseline.fontSize);

    // 5. Precedence: an explicit `size` wins over the bundle's size.
    expect(bigNudged.fontSize).toBe(sm.fontSize);
  },
};
