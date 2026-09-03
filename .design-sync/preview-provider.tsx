// design-sync preview wrapper.
//
// Why this exists (do not delete): `.storybook/preview.tsx` themes stories via
// `lightTheme`/`darkTheme` from the vanilla-extract *source* `.css.ts` files.
// The design-sync converter bundles previews with esbuild, which doesn't run
// the VE compiler, so those `createTheme()` calls throw at runtime ("Styles
// were unable to be assigned to a file"). This wrapper reproduces the
// decorator but sources the theme from the COMPILED `../dist` instead, so
// nothing hits the VE runtime.
//
// It also mirrors the theme's CSS vars onto `document.body`, since base-ui
// overlays portal out to the body and would otherwise render unthemed.
//
// Wired via cfg.provider ({component:"PreviewRoot"}) + cfg.extraEntries; wrap
// guidance for consumers lives in .design-sync/conventions.md, not here.
import * as React from "react";
import { BaritoneTheme, buildDefaultTokens, createInlineTheme, vars } from "../dist/index.js";

const previewTokens = buildDefaultTokens("light");
const bodyVars = createInlineTheme(previewTokens, { scheme: "light" });

export function PreviewRoot({ children }: { children?: React.ReactNode }) {
  React.useEffect(() => {
    const prev: Record<string, string> = {};
    for (const [k, v] of Object.entries(bodyVars)) {
      prev[k] = document.body.style.getPropertyValue(k);
      document.body.style.setProperty(k, v as string);
    }
    return () => {
      for (const k of Object.keys(bodyVars)) {
        if (prev[k]) document.body.style.setProperty(k, prev[k]);
        else document.body.style.removeProperty(k);
      }
    };
  }, []);

  return React.createElement(
    BaritoneTheme,
    {
      tokens: previewTokens,
      scheme: "light",
      style: {
        padding: "2rem",
        minHeight: "100vh",
        background: vars.surface.color.neutral.low.default.bgc,
        color: vars.text.color.neutral.mid,
      },
    },
    children,
  );
}
