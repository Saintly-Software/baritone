import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Grid } from "./index";

/**
 * Interaction coverage for `placeItems` on `Grid`. Running in a real browser lets
 * us read the *computed* box-alignment and prove the acceptance criterion —
 * `placeItems="center"` centers children on both axes — rather than just checking
 * a class landed.
 */
const meta: Meta<typeof Grid> = {
  title: "Interaction Tests/Grid",
  component: Grid,
};
export default meta;

type Story = StoryObj<typeof Grid>;

/** `placeItems="center"` resolves to `align-items: center` *and* `justify-items: center`. */
export const PlaceItemsCenter: Story = {
  render: () => (
    <Grid placeItems="center" minHeight="16" data-testid="grid">
      <div>centered</div>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector<HTMLElement>('[data-testid="grid"]')!;
    const cs = getComputedStyle(grid);
    // `place-items` is the shorthand; assert both longhands so we've proved both axes.
    expect(cs.alignItems).toBe("center");
    expect(cs.justifyItems).toBe("center");
  },
};
