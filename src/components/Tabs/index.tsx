"use client";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import * as React from "react";
import { componentTypographyRecipe } from "../../styles/recipes/component.css";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import type { Intent, Saliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import { tabsList, tabsListDisabled, tabsPanel, tabsTab, tabsTabDisabled } from "./tabs.css";

export interface TabIconState {
  disabled: boolean;
}

export interface TabsItemProps<T> {
  value: T;

  label: React.ReactNode;

  disabled?: boolean;

  leadIcon?: IconSlot<TabIconState>;

  trailIcon?: IconSlot<TabIconState>;
}

interface TabsBaseProps<T> {
  tabs: ReadonlyArray<TabsItemProps<T>>;

  disabled?: boolean;

  intent?: Intent;

  saliency?: Saliency;

  "aria-label"?: string;

  className?: string;

  ref?: React.Ref<HTMLDivElement>;

  children?: React.ReactNode;
}

interface TabsControlledProps<T> {
  value: NoInfer<T>;
  onChange: (value: NoInfer<T>) => void;
  initialValue?: never;
}

interface TabsUncontrolledProps<T> {
  value?: never;
  onChange?: never;
  initialValue?: NoInfer<T>;
}

export type TabsProps<T> = TabsBaseProps<T> & (TabsControlledProps<T> | TabsUncontrolledProps<T>);

export function Tabs<const T>({
  tabs,
  disabled = false,
  intent,
  saliency,
  "aria-label": ariaLabel,
  className,
  ref,
  value,
  onChange,
  initialValue,
  children,
}: TabsProps<T>) {
  const controlled = onChange != null;
  const fallback = (tabs.find((tab) => !tab.disabled) ?? tabs[0])?.value;
  const rootValueProps = controlled ? { value } : { defaultValue: initialValue ?? fallback };

  return (
    <BaseTabs.Root
      ref={ref}
      {...rootValueProps}
      onValueChange={(next, details) => {
        const target = tabs.find((tab) => tab.value === next);
        if (disabled || target?.disabled) {
          details.cancel();
          return;
        }
        onChange?.(next as T);
      }}
    >
      <BaseTabs.List
        aria-label={ariaLabel}
        className={cx(tabsList, disabled && tabsListDisabled, className)}
      >
        {tabs.map((tab) => {
          const tabDisabled = disabled || tab.disabled;
          const iconState: TabIconState = { disabled: tabDisabled ?? false };
          return (
            <BaseTabs.Tab
              key={String(tab.value)}
              value={tab.value}
              aria-disabled={tabDisabled || undefined}
              className={cx(
                componentTypographyRecipe({ size: "md" }),
                tabsTab({ intent, saliency }),
                tab.disabled && !disabled && tabsTabDisabled,
                focusRingRecipe({ type: "visible" }),
              )}
            >
              {renderIcon(tab.leadIcon, { state: iconState })}
              <span>{tab.label}</span>
              {renderIcon(tab.trailIcon, { state: iconState })}
            </BaseTabs.Tab>
          );
        })}
      </BaseTabs.List>
      {children}
    </BaseTabs.Root>
  );
}

export interface TabsPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "color" | "children"
> {
  value: string | number;

  keepMounted?: boolean;

  className?: string;

  children?: React.ReactNode;

  ref?: React.Ref<HTMLDivElement>;
}

function TabsPanel({ value, keepMounted, className, children, ref, ...rest }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      ref={ref}
      value={value}
      keepMounted={keepMounted}
      className={cx(tabsPanel, focusRingRecipe({ type: "visible" }), className)}
      {...rest}
    >
      {children}
    </BaseTabs.Panel>
  );
}

Tabs.displayName = "Tabs";
TabsPanel.displayName = "Tabs.Panel";

Tabs.Panel = TabsPanel;
