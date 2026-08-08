import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Grid } from "./index";

/**
 * Interaction coverage for `placeItems` on `Grid`. Running in a real browser lets
 * us read the *computed* box-alignment and prove the acceptance criterion —
 * `placeItems="center"` centers children on both axes — and that it wins the
 * align-items axis over a competing `align`, rather than just checking a class
 * landed.
 */
const meta: Meta<typeof Grid> = {
  title: "Interaction Tests/Grid",
  component: Grid,
};
export default meta;

type Story = StoryObj<typeof Grid>;

/**
 * `placeItems="center"` resolves to `align-items: center` *and* `justify-items:
 * center`. A competing `align="start"` is set too, to prove `placeItems` wins the
 * align-items axis by explicit omission of the longhand — not by stylesheet order.
 */
export const PlaceItemsCenter: Story = {
  render: () => (
    <Grid align="start" placeItems="center" minHeight="16" data-testid="grid">
      <div>centered</div>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector<HTMLElement>('[data-testid="grid"]')!;
    const cs = getComputedStyle(grid);
    // justify-items proves the second axis; align-items proves `placeItems`
    // overrode the competing `align="start"`.
    expect(cs.alignItems).toBe("center");
    expect(cs.justifyItems).toBe("center");
  },
};
