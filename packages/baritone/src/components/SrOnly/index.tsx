"use client";
import * as React from "react";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { srOnly } from "./srOnly.css";

export interface SrOnlyProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  children?: React.ReactNode;

  render?: RenderProp;

  ref?: React.Ref<HTMLElement>;
}

export function SrOnly({ className, children, render, ref, ...rest }: SrOnlyProps) {
  return useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(srOnly, className),
      children,
      ...rest,
    },
  });
}

SrOnly.displayName = "SrOnly";
