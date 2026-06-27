"use client";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import * as React from "react";
import { componentTypographyRecipe } from "../../styles/recipes/component.css";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import type { Intent, Saliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { tabsList, tabsListDisabled, tabsTab, tabsTabDisabled } from "./tabs.css";

export interface TabsItemProps<T> {
  /**
   * The value this tab selects. Constrained to the set the `tabs` array forms,
   * so a typo or a value outside the union/enum is a compile error — and the
   * same `T` flows into `value` / `onChange` / `initialValue`.
   */
  value: T;
  /** The visible tab label (also its accessible name). */
  label: React.ReactNode;
  /**
   * Disable just this tab. Modelled with `aria-disabled` (never the native
   * attribute), so it stays in the roving tab order while selection is vetoed.
   */
  disabled?: boolean;
  /** Icon placed before the label. Typically an `<Icon>`; inherits text colour. */
  leadIcon?: React.ReactNode;
  /** Icon placed after the label. Typically an `<Icon>`; inherits text colour. */
  trailIcon?: React.ReactNode;
}

interface TabsBaseProps<T> {
  /**
   * The tabs to render, each a `TabsItemProps` (`value` + `label`, plus optional
   * `disabled` / `leadIcon` / `trailIcon`). The union of their `value`s is the
   * `T` that the selected-value props are type-checked against.
   */
  tabs: ReadonlyArray<TabsItemProps<T>>;
  /**
   * Disable every tab. The active tab stays keyboard-reachable (`aria-disabled`,
   * never the native attribute); selection changes are vetoed.
   */
  disabled?: boolean;
  /** Active-tab colour intent. Default `neutral`. */
  intent?: Intent;
  /**
   * Active-tab saliency: `high` (filled), `mid` (washed, default), `low`
   * (transparent + border) — the same scale as `Chip` / `Button`.
   */
  saliency?: Saliency;
  /** Accessible name for the tablist. */
  "aria-label"?: string;
  /** Extra className merged onto the tablist element. */
  className?: string;
  /** Ref to the root element. */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Controlled: drive the active tab yourself with `value` + `onChange`.
 * `NoInfer` keeps `T` coming from `tabs` alone, so `value` is *checked* against
 * the tab set rather than widening it.
 */
interface TabsControlledProps<T> {
  value: NoInfer<T>;
  onChange: (value: NoInfer<T>) => void;
  initialValue?: never;
}

/** Uncontrolled: seed the first active tab with `initialValue` (defaults to the first enabled tab). */
interface TabsUncontrolledProps<T> {
  value?: never;
  onChange?: never;
  initialValue?: NoInfer<T>;
}

export type TabsProps<T> = TabsBaseProps<T> & (TabsControlledProps<T> | TabsUncontrolledProps<T>);

/**
 * Tabs — a horizontal tablist for switching the active view. Built on base-ui's
 * `Tabs` (roving focus, arrow-key navigation, `tablist` / `tab` ARIA wiring); it
 * renders only the tab strip, so the content for each `value` is yours to show.
 *
 * Like `RadioGroup`, it's **type-safe over its values**: the component is generic
 * over `T` (inferred from the `tabs` array — `const` so string/number literals
 * survive without `as const`), and `value` / `onChange` / `initialValue` are all
 * bound to that same `T`. So a tab `value`, the controlled `value`, and the
 * uncontrolled `initialValue` can only ever be members of the same union/enum.
 * See https://tkdodo.eu/blog/building-type-safe-compound-components
 *
 * Controlled vs uncontrolled is a discriminated union: pass `value` + `onChange`
 * to drive it, or `initialValue` (or nothing) to let it manage its own state.
 *
 * @example
 * type View = "overview" | "activity" | "settings";
 * const [view, setView] = React.useState<View>("overview");
 * <Tabs
 *   aria-label="Project sections"
 *   value={view}
 *   onChange={setView}
 *   tabs={[
 *     { value: "overview", label: "Overview" },
 *     { value: "activity", label: "Activity", leadIcon: <Icon name="bell" /> },
 *     { value: "settings", label: "Settings", disabled: true },
 *   ]}
 * />
 */
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
}: TabsProps<T>) {
  const controlled = onChange != null;
  // base-ui's `defaultValue` falls back to `0`, which won't match string/enum
  // values — so an uncontrolled list seeds itself with the first enabled tab.
  const fallback = (tabs.find((tab) => !tab.disabled) ?? tabs[0])?.value;
  const rootValueProps = controlled ? { value } : { defaultValue: initialValue ?? fallback };

  return (
    <BaseTabs.Root
      ref={ref}
      {...rootValueProps}
      onValueChange={(next, details) => {
        const target = tabs.find((tab) => tab.value === next);
        // Veto selecting a disabled tab (or any tab while the group is disabled).
        // `cancel()` stops base-ui committing it in both controlled and
        // uncontrolled modes; the tab still takes focus, it just won't activate.
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
          return (
            <BaseTabs.Tab
              key={String(tab.value)}
              value={tab.value}
              // `aria-disabled` (not the native attribute) keeps the tab tabbable;
              // the per-tab dim only applies when the group itself isn't disabled,
              // so the group's `tabsListDisabled` never double-dims it.
              aria-disabled={tabDisabled || undefined}
              className={cx(
                componentTypographyRecipe({ size: "md" }),
                tabsTab({ intent, saliency }),
                tab.disabled && !disabled && tabsTabDisabled,
                focusRingRecipe({ type: "visible" }),
              )}
            >
              {tab.leadIcon}
              <span>{tab.label}</span>
              {tab.trailIcon}
            </BaseTabs.Tab>
          );
        })}
      </BaseTabs.List>
    </BaseTabs.Root>
  );
}
