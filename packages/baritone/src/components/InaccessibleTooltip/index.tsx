"use client";
import * as React from "react";
import {
  InternalTooltip,
  type InternalTooltipProps,
} from "../../internal/components/InternalTooltip";

export interface InaccessibleTooltipProps extends InternalTooltipProps {
  children: React.ReactElement;
}

export function InaccessibleTooltip(props: InaccessibleTooltipProps) {
  return <InternalTooltip {...props} />;
}
