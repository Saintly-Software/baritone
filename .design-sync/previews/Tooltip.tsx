import * as S from "@ds-stories/src/components/Tooltip/Tooltip.stories";

// Owned preview. The repo's Tooltip stories open the hint via a `play` (hover)
// function, which the static design-sync preview can't execute — so the
// generated preview showed only the closed trigger. Force `defaultOpen` so the
// card shows the OPEN tooltip, matching storybook's played-open reference.
// The interaction-test stories are dropped via cfg.overrides.Tooltip.skip; only
// Basic is kept here.
export const Basic = () => {
  const meta: any = (S as any).default ?? {};
  const st: any = (S as any).Basic;
  const args: any = { ...(meta.args ?? {}), ...(st?.args ?? {}), defaultOpen: true };
  return st.render(args);
};
