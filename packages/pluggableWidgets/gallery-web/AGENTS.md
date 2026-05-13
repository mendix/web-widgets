# Gallery — Agent Context

## OpenSpec

This widget has OpenSpec initialized. Before implementing any new feature,
behavior change, or XML property change, run:

```
cd packages/pluggableWidgets/gallery-web
/opsx:propose "<what-you-want-to-build>"
```

- **Current behavior spec:** `openspec/specs/spec.md`
- **Active changes:** `openspec/changes/` (check here first before starting work)
- **Schema:** `mendix-widget` (see `openspec/config.yaml` for widget-specific context)

---

## Overview

Grid-based data display widget. Renders items from a `ListValue` datasource as
a configurable multi-column grid with pagination, sorting, filtering integration,
and item click/selection actions.

- **Version:** 3.10.0 | **Min Mendix:** 10.0.0
- **Key deps:** @mendix/widget-plugin-filtering, @mendix/widget-plugin-sorting

---

## Key Patterns

- Entry point: `src/Gallery.tsx` — functional component with `ContainerProps`
- Shares filtering and pagination patterns with datagrid via shared plugin packages
- Item rendering uses Mendix widget content slots (not inline React)
