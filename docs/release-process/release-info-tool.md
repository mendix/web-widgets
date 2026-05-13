# Release Info Tool

## Purpose

The `rui-release-info` tool scans the Mendix web widgets monorepo and outputs structured JSON about packages ready for release. This document explains how to use it.

## Quick Start

```bash
# Get packages with unreleased changes (release candidates)
pnpm exec ts-node automation/utils/bin/rui-release-info.ts --candidates

# Get summary with counts
pnpm exec ts-node automation/utils/bin/rui-release-info.ts --summary

# Get all packages (including those without changes)
pnpm exec ts-node automation/utils/bin/rui-release-info.ts --all
```

## Output Structure

### ReleaseCandidate Type

```typescript
interface ReleaseCandidate {
    packageType: "widget" | "module"; // From package.json mxpackage.type
    hasDependencies: boolean; // Does it bundle other widgets?
    name: string; // NPM package name
    path: string; // Filesystem path
    currentVersion: string; // Current version (e.g., "3.9.0")
    appNumber: number; // Mendix Marketplace app number
    appName: string; // Display name in Marketplace
    hasUnreleasedChanges: boolean; // Does the package itself have changes?
    unreleasedEntries: ChangelogEntry[]; // Changelog entries for this package
    dependentWidgets?: DependentWidgetInfo[]; // Only present if hasDependencies is true
}

interface ChangelogEntry {
    type: "Fixed" | "Added" | "Changed" | "Removed" | "Breaking changes";
    description: string;
}

interface DependentWidgetInfo {
    name: string;
    path: string;
    currentVersion: string;
    appName: string;
    hasUnreleasedChanges: boolean;
    unreleasedEntries: ChangelogEntry[];
}
```

## Available Commands

| Command             | Output                                              | Use Case                                |
| ------------------- | --------------------------------------------------- | --------------------------------------- |
| `--candidates` `-c` | Full JSON array of packages with unreleased changes | Planning releases, reviewing changelogs |
| `--all` `-a`        | Full JSON array of ALL packages                     | Understanding repo structure            |
| `--summary` `-s`    | Statistics + basic package list                     | Quick overview                          |
| `--help` `-h`       | Help text                                           | Command reference                       |

## Package Types

Packages are described by two properties:

- **`packageType`**: Either `"widget"` or `"module"`
- **`hasDependencies`**: Either `true` (bundles other widgets) or `false` (standalone)

This creates four combinations:

| packageType | hasDependencies | Description                                | Examples                                              |
| ----------- | --------------- | ------------------------------------------ | ----------------------------------------------------- |
| `"widget"`  | `false`         | Standalone widget                          | `@mendix/carousel-web`, `@mendix/document-viewer-web` |
| `"widget"`  | `true`          | Widget that bundles other widgets          | `@mendix/charts-web` (only example)                   |
| `"module"`  | `false`         | Standalone module (no widget dependencies) | `@mendix/web-actions` (JavaScript actions only)       |
| `"module"`  | `true`          | Module that bundles widgets                | `@mendix/data-widgets` (Data Grid 2 + filters)        |

### Dependent Widgets

Widgets that are bundled by packages with `hasDependencies: true` don't have their own Marketplace app number. They appear in the `dependentWidgets` array of their parent package, not as top-level candidates.

**Example**: `@mendix/datagrid-web` is part of `@mendix/data-widgets` module

### Version Synchronization

When a package with `hasDependencies: true` is released, **all its dependent widgets get the same version**, even if they have no code changes.

## Release Rules

### When to Release

A package is a **release candidate** if:

1. **Independent package** (widget or module): `hasUnreleasedChanges: true`
2. **Aggregator** (widget or module): The package itself OR any dependent widget has `hasUnreleasedChanges: true`

### Version Synchronization

When an aggregator is released, **all dependent widgets get the same version** even if they have no changes.

Example: If `@mendix/data-widgets` releases v3.10.0:

- All 9 widgets in the bundle → v3.10.0
- Even widgets without code changes get the version bump

## Example Output

```json
[
    {
        "packageType": "widget",
        "hasDependencies": false,
        "name": "@mendix/document-viewer-web",
        "currentVersion": "1.2.0",
        "appNumber": 240853,
        "appName": "Document Viewer",
        "hasUnreleasedChanges": true,
        "unreleasedEntries": [
            {
                "type": "Changed",
                "description": "We changed the internal structure of the widget"
            }
        ]
    },
    {
        "packageType": "module",
        "hasDependencies": true,
        "name": "@mendix/data-widgets",
        "currentVersion": "3.9.0",
        "appNumber": 116540,
        "appName": "Data Widgets",
        "hasUnreleasedChanges": false,
        "unreleasedEntries": [],
        "dependentWidgets": [
            {
                "name": "@mendix/datagrid-date-filter-web",
                "currentVersion": "3.9.0",
                "appName": "Date Filter",
                "hasUnreleasedChanges": true,
                "unreleasedEntries": [
                    {
                        "type": "Fixed",
                        "description": "We fixed an issue with filter selector dropdown not choosing the best placement on small viewports."
                    }
                ]
            }
        ]
    }
]
```

## Testing

```bash
# Verify tool works
cd /path/to/web-widgets
pnpm exec ts-node automation/utils/bin/rui-release-info.ts --summary

# Pipe to jq for filtering
pnpm exec ts-node automation/utils/bin/rui-release-info.ts --candidates | \
  jq '.[] | select(.packageType == "module")'

# Count packages by type
pnpm exec ts-node automation/utils/bin/rui-release-info.ts --summary | \
  jq '{widgets: .independentWidgets, modules: .independentModules, aggregators: (.widgetAggregators + .moduleAggregators)}'
```
