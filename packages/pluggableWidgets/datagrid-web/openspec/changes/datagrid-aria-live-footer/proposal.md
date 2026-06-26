## Why

The DataGrid widget lacks screen reader announcements when row selection state changes, and the "select all" checkbox in the header lacks a descriptive label. Users relying on assistive technology have no feedback when rows are selected or deselected, and cannot identify the purpose of the header checkbox, making the selection feature inaccessible.

## What Changes

- Add `SelectionStatus` component that renders a status region (`role="status"`) announcing the current selection count per WCAG 4.1.3
- Place the status region in the `WidgetFooter` so it's always present when selection is enabled, independent of the visible selection counter
- Add `aria-label` to the "select all" checkbox in the table header (e.g., "Select all rows")
- Extract shared selection model logic from `select-all` module to a reusable `selection.model` in `widget-plugin-grid`

## Capabilities

### New Capabilities

- `selection-aria-live`: Status region announcement of selection state changes in the DataGrid footer (WCAG 4.1.3 compliant)
- `select-all-aria-label`: Accessible label for the select-all checkbox in the DataGrid header

### Modified Capabilities

None

## Impact

- `packages/pluggableWidgets/datagrid-web/src/features/selection-counter/` — new `SelectionStatus` component (role="status") and updated injection hooks
- `packages/pluggableWidgets/datagrid-web/src/components/WidgetFooter.tsx` — renders status region
- `packages/pluggableWidgets/datagrid-web/src/components/WidgetHeader.tsx` or checkbox component — add aria-label to select-all checkbox
- `packages/pluggableWidgets/datagrid-web/src/model/` — updated container and tokens for DI, add text properties for aria-label
- `packages/shared/widget-plugin-grid/src/core/models/` — extracted `selection.model` for reuse
