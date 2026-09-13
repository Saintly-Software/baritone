"use client";
import type * as React from "react";
import { Flex, type FlexProps } from "../Flex";

export interface FormApiLike {
  handleSubmit: () => void | Promise<void>;

  AppForm?: React.ComponentType<React.PropsWithChildren>;
}

export interface FormProps extends Omit<FlexProps, "render" | "onSubmit"> {
  form: FormApiLike;

  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;

  noValidate?: boolean;
}

export function Form(props: FormProps) {
  const {
    form,
    onSubmit,
    noValidate = true,
    direction = "column",
    gap = "4",
    children,
    ...rest
  } = props;

  const element = (
    <Flex
      direction={direction}
      gap={gap}
      {...rest}
      render={
        <form
          noValidate={noValidate}
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
            onSubmit?.(event);
          }}
        />
      }
    >
      {children}
    </Flex>
  );

  const { AppForm } = form;
  return AppForm ? <AppForm>{element}</AppForm> : element;
}
