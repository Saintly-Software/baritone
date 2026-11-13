---
"@saintly-software/baritone-datatable": minor
---

`DataTable` can expand or collapse a group together with every group beneath it, and exposes its group expansion state.

- Option/Alt+click (or Alt+Enter / Alt+Space) on a group toggle expands the group and all of its nested groups, or collapses them all if the group is already expanded. A plain click is unchanged and still toggles one level. The toggle keeps its `Expand X` / `Collapse X` name and gains a `title` hint when the group has nested groups.
- New `expanded` and `onExpandedChange` props make expansion controlled, following `selectedRowIds` / `onSelectionChange`. `expanded` is TanStack's `ExpandedState`: `true` for every group, or a record of expanded group row ids. `onExpandedChange` also fires in uncontrolled mode. `defaultExpanded` keeps working.
- In controlled mode the table no longer resets expansion when `data` or `grouping` change.
