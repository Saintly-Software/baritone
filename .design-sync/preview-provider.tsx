// design-sync preview wrapper.
//
// Why this exists (do not delete): the repo's `.storybook/preview.tsx` decorator
// themes stories by importing `lightTheme`/`darkTheme` from `../src/theme` — the
// vanilla-extract *source* `.css.ts` files. The design-sync converter bundles
// previews with esbuild, which does NOT run the VE compiler, so those
// `createTheme()` calls execute at runtime and throw "Styles were unable to be
// assigned to a file" on every preview. This wrapper reproduces the decorator
// faithfully but sources the theme from the COMPILED `../dist` (plain class
// strings + a pure token builder), so nothing hits the VE runtime.
//
// It also mirrors the theme's CSS custom properties onto `document.body`: base-ui
// overlays (Modal, Drawer, Popover, Menu, Combobox, Select, Tooltip) portal out
// to the body, outside this wrapper — without the vars there, portaled surfaces
// render unthemed, exactly as the repo's decorator comment documents.
//
// Wired via cfg.provider ({component:"PreviewRoot"}) + cfg.extraEntries. The real
// consumer-facing wrap guidance (BaritoneTheme / lightTheme class + styles.css)
// lives in .design-sync/conventions.md, not here.
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
