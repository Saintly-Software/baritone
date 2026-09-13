import type { LetterSpacingName } from "../theme/letterSpacings";
import type { LineHeightName } from "../theme/lineHeights";
import type { Atoms } from "./sprinkles.css";

export interface MarginProps {
  m?: Atoms["m"];

  mx?: Atoms["mx"];

  my?: Atoms["my"];
  mt?: Atoms["mt"];
  mr?: Atoms["mr"];
  mb?: Atoms["mb"];
  ml?: Atoms["ml"];
}

export interface PaddingProps {
  p?: Atoms["p"];

  px?: Atoms["px"];

  py?: Atoms["py"];
  pt?: Atoms["pt"];
  pr?: Atoms["pr"];
  pb?: Atoms["pb"];
  pl?: Atoms["pl"];
}

export interface TypographyAtomProps {
  textAlign?: Atoms["textAlign"];

  whiteSpace?: Atoms["whiteSpace"];

  overflowWrap?: Atoms["overflowWrap"];

  textTransform?: Atoms["textTransform"];

  letterSpacing?: LetterSpacingName;

  lineHeight?: LineHeightName;
}
