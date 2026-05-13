# Data Grid 2 — Agent Context

## OpenSpec

This widget has OpenSpec initialized. Before implementing any new feature,
behavior change, or XML property change, run:

```
cd packages/pluggableWidgets/datagrid-web
/opsx:propose "<what-you-want-to-build>"
```

- **Current behavior spec:** `openspec/specs/spec.md`
- **Active changes:** `openspec/changes/` (check here first before starting work)
- **Schema:** `mendix-widget` (see `openspec/config.yaml` for widget-specific context)

---

## Overview

Complex data grid widget. Renders rows from a `ListValue` datasource with
configurable columns, pagination, sorting, row selection, column resizing/reordering,
filtering integration, and data export.

- **Version:** 3.10.0 | **Min Mendix:** 10.0.0
- **Architecture:** MobX stores + brandi-react DI container
- **Key deps:** MobX, mobx-react-lite, brandi-react, @mendix/widget-plugin-filtering

---

## Key Patterns

- Entry point: `src/Datagrid.tsx` — wraps everything in a brandi DI `ContainerProvider`
- All state lives in MobX stores, not React state
- Feature modules under `src/features/` are self-contained slices (pagination, selection, export, etc.)
- Pure presentational components in `src/components/`
- Use `runInAction` for async state mutations in stores

---

## Constraints

- Never use React state for data-layer concerns — use the existing MobX stores
- Column configuration is immutable after mount — do not mutate column descriptors
- Filtering is owned by child filter widgets; the grid only consumes the filter result
