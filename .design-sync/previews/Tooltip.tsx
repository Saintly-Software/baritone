import * as S from "@ds-stories/src/components/Tooltip/Tooltip.stories";

export const Basic = () => {
  const meta: any = (S as any).default ?? {};
  const st: any = (S as any).Basic;
  const args: any = { ...meta.args, ...st?.args, defaultOpen: true };
  return st.render(args);
};
