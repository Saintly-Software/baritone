import { createGlobalThemeContract, fallbackVar, globalStyle } from "@vanilla-extract/css";

const kebab = (segment: string) => segment.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

export const layoutContract = createGlobalThemeContract(
  {
    inset: { top: "", right: "", bottom: "", left: "" },
    fab: {
      bottomRight: { width: "", height: "" },
      bottomLeft: { width: "", height: "" },
    },
    offset: "",
  },
  (_value, path) => `bt-layout-${path.map(kebab).join("-")}`,
);

export const layoutVars = {
  inset: {
    top: fallbackVar(layoutContract.inset.top, "0px"),
    right: fallbackVar(layoutContract.inset.right, "0px"),
    bottom: fallbackVar(layoutContract.inset.bottom, "0px"),
    left: fallbackVar(layoutContract.inset.left, "0px"),
  },
  fab: {
    bottomRight: {
      width: fallbackVar(layoutContract.fab.bottomRight.width, "0px"),
      height: fallbackVar(layoutContract.fab.bottomRight.height, "0px"),
    },
    bottomLeft: {
      width: fallbackVar(layoutContract.fab.bottomLeft.width, "0px"),
      height: fallbackVar(layoutContract.fab.bottomLeft.height, "0px"),
    },
  },
  offset: fallbackVar(layoutContract.offset, "0px"),
};

globalStyle("html", { scrollPaddingTop: layoutVars.inset.top });
