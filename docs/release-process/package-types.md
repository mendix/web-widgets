# Package Types

## Widgets

**Location**: `packages/pluggableWidgets/*/`, `mxpackage.type: "widget"`

Widgets with `marketplace.appNumber` are published independently (**standalone widgets**). Widgets without it are **dependent widgets** — not published of their own and are listed in a parent's `mxpackage.dependencies`.

```json
// Standalone - has appNumber
{
    "mxpackage": { "type": "widget" },
    "marketplace": { "appNumber": 47784, "appName": "Carousel" }
}

// Dependent — no appNumber
{
    "mxpackage": { "type": "widget" },
    "marketplace": { "appName": "Data Grid 2" }
}
```

**Special case**: `@mendix/charts-web` has `mxpackage.dependencies`, acts as a module but is still a regular widget.

## Modules

**Location**: `packages/modules/*/`, `mxpackage.type: "module"`

- Has `marketplace.appNumber`.
- Lists dependent widgets in `mxpackage.dependencies`.
- May also contain JS actions, nanoflows, pages, and domain model entities (not referenced in `package.json`).

```json
{
    "mxpackage": {
        "type": "module",
        "dependencies": ["@mendix/datagrid-web", "@mendix/gallery-web"]
    },
    "marketplace": { "appNumber": 116540, "appName": "Data Widgets" }
}
```

## Dependency Structure

- Max one level of nesting: `module → widget` or `widget → widget`.
- Most modules have dependent widgets; standalone widgets (except charts) don't.
