"use client";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import * as React from "react";
import { componentTypographyRecipe } from "../../styles/recipes/component.css";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import type { Intent, Saliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import { tabsList, tabsListDisabled, tabsPanel, tabsTab, tabsTabDisabled } from "./tabs.css";

/** The presentational state a `Tabs` icon render function can branch on. */
export interface TabIconState {
  /** Whether this tab is disabled — either on its own or via the whole group. */
  disabled: boolean;
}

export interface TabsItemProps<T> {
  /**
   * The value this tab selects. Constrained to the set the `tabs` array forms,
   * so a typo or an out-of-union value is a compile error.
   */
  value: T;
  /** The visible tab label (also its accessible name). */
  label: React.ReactNode;
  /**
   * Disable just this tab. Modelled with `aria-disabled` (never the native
   * attribute), so it stays in the roving tab order while selection is vetoed.
   */
  disabled?: boolean;
  /**
   * Icon before the label; inherits text colour. Pass a bare glyph
   * (auto-wrapped in `Icon`), an explicit `<Icon>` for custom size/label, or a
   * render function for full control.
   */
  leadIcon?: IconSlot<TabIconState>;
  /**
   * Icon after the label; inherits text colour. Pass a bare glyph
   * (auto-wrapped in `Icon`), an explicit `<Icon>` for custom size/label, or a
   * render function for full control.
   */
  trailIcon?: IconSlot<TabIconState>;
}

interface TabsBaseProps<T> {
  /**
   * The tabs to render, each a `TabsItemProps`. The union of their `value`s is
   * the `T` that the selected-value props are type-checked against.
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
  /**
   * Panel content, rendered below the tab strip in the same tabs context —
   * typically one `<Tabs.Panel>` per tab `value`. base-ui cross-wires each
   * pair's `aria-labelledby`/`aria-controls` by matching `value`s. Omit to
   * render just the strip and place the active view yourself.
   */
  children?: React.ReactNode;
}

/**
 * Controlled: drive the active tab with `value` + `onChange`. `NoInfer` keeps
 * `T` coming from `tabs` alone, so `value` is checked against it, not widened.
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
 * `Tabs` (roving focus, arrow-key navigation, ARIA wiring). Pass one
 * `<Tabs.Panel>` per tab `value` as `children` for wired-up panel content, or
 * omit `children` to place the active view yourself.
 *
 * Type-safe over its values, like `RadioGroup`: generic over `T` (inferred from
 * `tabs`), with `value`/`onChange`/`initialValue` all bound to that same `T`.
 * See https://tkdodo.eu/blog/building-type-safe-compound-components
 *
 * Controlled vs uncontrolled is a discriminated union: `value` + `onChange` to
 * drive it, or `initialValue` (or nothing) to manage its own state.
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
 * >
 *   <Tabs.Panel value="overview">…overview content…</Tabs.Panel>
 *   <Tabs.Panel value="activity">…activity content…</Tabs.Panel>
 *   <Tabs.Panel value="settings">…settings content…</Tabs.Panel>
 * </Tabs>
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
  children,
}: TabsProps<T>) {
  const controlled = onChange != null;
  // base-ui's `defaultValue` falls back to `0`, which won't match string/enum
  // values, so we seed the first enabled tab ourselves.
  const fallback = (tabs.find((tab) => !tab.disabled) ?? tabs[0])?.value;
  const rootValueProps = controlled ? { value } : { defaultValue: initialValue ?? fallback };

  return (
    <BaseTabs.Root
      ref={ref}
      {...rootValueProps}
      onValueChange={(next, details) => {
        const target = tabs.find((tab) => tab.value === next);
        // Veto a disabled tab (or any tab while the group is disabled).
        // `cancel()` blocks the commit either mode; the tab still takes focus.
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
              // `aria-disabled` keeps the tab tabbable; the per-tab dim only
              // applies when the group isn't disabled, so it never double-dims.
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
  /**
   * The tab `value` this panel belongs to — shown while the matching tab is
   * active. Not bound to the `Tabs` generic, so keep it in sync with a tab's `value`.
   */
  value: string | number;
  /**
   * Keep the panel mounted while hidden instead of unmounting it. Off by
   * default (lazy mount on first activation); turn on to preserve state across switches.
   */
  keepMounted?: boolean;
  /** Extra className merged onto the panel element. */
  className?: string;
  /** Panel content. */
  children?: React.ReactNode;
  /** Ref to the panel element. */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Tabs.Panel — the content region for one tab, shown only while the tab whose
 * `value` matches is active (base-ui wires `aria-controls`/`aria-labelledby`
 * both ways). Carries the shared focus ring since base-ui makes the active
 * panel focusable, for keyboard paging when it has no other focusable child.
 */
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
