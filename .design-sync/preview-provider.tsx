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
