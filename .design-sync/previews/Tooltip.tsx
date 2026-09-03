import * as S from "@ds-stories/src/components/Tooltip/Tooltip.stories";

// Owned preview. The repo's Tooltip stories open the hint via a `play` (hover)
// function that the static design-sync preview can't execute, so it would show
// only the closed trigger — force `defaultOpen` to match the played-open
// reference. Interaction-test stories are dropped via cfg.overrides.Tooltip.skip.
export const Basic = () => {
  const meta: any = (S as any).default ?? {};
  const st: any = (S as any).Basic;
  const args: any = { ...meta.args, ...st?.args, defaultOpen: true };
  return st.render(args);
};
