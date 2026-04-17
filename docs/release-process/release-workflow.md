# Release Workflow Documentation

## Overview

This document describes the release process for Mendix web widgets and modules in the monorepo.

**Package types**:

- **Widgets** - UI components
- **Modules** - Bundles of widgets, JavaScript actions, and Mendix documents like Nanoflows, Pages as well as Entities in domain model.
- **Dependent widgets** - Widgets without Marketplace app numbers, bundled by other modules or widgets

**Dependency structure**:

- Every module or widget can contain other widgets (dependent widgets). Most of the modules do, most of the widgets don't.
- There is maximum one nesting level (widget → widget or module → widget).

## Package Types

### Widgets

**Location**: `packages/pluggableWidgets/*/`

**Characteristics**:

- Has `marketplace.appNumber` field in `package.json`
- Released independently
- Own version tracking (semantic versioning)
- Own changelog lifecycle

**Example**: `@mendix/carousel-web`

```json
{
    "name": "@mendix/carousel-web",
    "version": "2.3.2",
    "mxpackage": {
        "type": "widget"
    },
    "marketplace": {
        "appNumber": 47784,
        "appName": "Carousel"
    }
}
```

**Special case**

- Widget `@mendix/charts-web` contains other widgets as if it is a module.
- Referencing dependencies, versioning and changelog structure works the same way as for module → widget dependency
- Should be still be referred as normal widget, no extra treatment (dependencies is only an extra step in build process)

### Modules

**Location**: `packages/modules/*/`

**Characteristics**:

- Has `mxpackage.type: "module"` in `package.json`
- Has `marketplace.appNumber` (published to marketplace)
- Lists dependent widgets in `mxpackage.dependencies` array, might be empty
- Has own CHANGELOG.md entries and additionally aggregates widget changelogs
- Contain other Mendix elements in addition to widgets: JS actions, nanoflows, pages, entities, etc. Those are not referenced in package.json

**Example**: `@mendix/data-widgets`

```json
{
    "name": "@mendix/data-widgets",
    "version": "3.9.0",
    "mxpackage": {
        "type": "module",
        "dependencies": [
            "@mendix/datagrid-web",
            "@mendix/datagrid-date-filter-web",
            "@mendix/gallery-web"
            // ... more widgets
        ]
    },
    "marketplace": {
        "appNumber": 116540,
        "appName": "Data Widgets"
    }
}
```

### Dependent Widgets

**Location**: `packages/pluggableWidgets/*/`  
**Not returned as top-level release candidates** - appear in `dependentWidgets` array

**Characteristics**:

- Does NOT have `marketplace.appNumber` in `package.json`
- Listed in parent's `mxpackage.dependencies` array
- Released only as part of their parent
- Version is set to match the parent version on each release cycle
- Has own CHANGELOG.md (aggregated into parent changelog on release)

**Example**: `@mendix/datagrid-web`

```json
{
    "name": "@mendix/datagrid-web",
    "version": "3.9.0",
    "mxpackage": {
        "type": "widget"
    },
    "marketplace": {
        "appName": "Data Grid 2"
        // Note: no appNumber
    }
}
```

## Version Management

### Packages without dependencies

- **Version tracking**: Each package has its own independent version
- **Semantic versioning rules**:
    - **Patch**: Bug fixes, small improvements
    - **Minor**: New features, backward-compatible changes
    - **Major**: Breaking changes, major rewrites

### Packages with dependencies

- **Version tracking**: Parent package and all dependent widgets share the same version
- When parent releases version `3.8.0`, ALL dependent widgets become `3.8.0`
- When parent releases `3.8.1` for a single widget fix, ALL widgets still bump to `3.8.1`
- Even if a widget's code didn't change, it gets the version bump

**Example**: If `@mendix/data-widgets` (module) releases `3.9.0`, then:

- `@mendix/datagrid-web` → `3.9.0`
- `@mendix/gallery-web` → `3.9.0`
- `@mendix/dropdown-sort-web` → `3.9.0`
- ... all widgets in the module → `3.9.0`

## Changelog Management

### Format

All changelogs follow the [Keep a Changelog](https://keepachangelog.com/) format with Mendix-specific extensions.

**Standard sections**:

- `## [Unreleased]` - Unreleased changes
- `## [X.Y.Z] - YYYY-MM-DD` - Released versions

**Change categories**:

- `### Fixed` - Bug fixes
- `### Added` - New features
- `### Changed` - Changes to existing functionality
- `### Removed` - Removed features

### Workflow

1. **During development**: Developer adds entries under `## [Unreleased]` section
2. **On merge to main**: Changes merged with unreleased changelog entries (no version bump yet)
3. **Release decision**: Team decides to release based on:
    - Unreleased changes exist
    - Jira story is complete
    - Team decision (may wait to bundle multiple stories)
4. **On release**: GitHub workflow moves unreleased entries to new version section

### Widget Changelogs

**Location**: `packages/pluggableWidgets/*/CHANGELOG.md`

**Format** (for widget `@mendix/datagrid-web`):

```markdown
# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.9.0] - 2026-03-23

### Changed

- We improved accessibility on column selector, added aria-attributes and changed the role to 'menuitemcheckbox'.

### Added

- We added a new `Loaded rows` attribute that reflects the number of rows currently loaded for virtual scrolling and load-more pagination modes.

### Fixed

- We fixed an issue with Data export crashing on some Android devices.
```

### Module Changelogs

**Location**: `packages/modules/*/CHANGELOG.md`

**Format** (for module `@mendix/data-widgets`):

```markdown
# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.9.0] DataWidgets - 2026-03-23

### [3.9.0] DatagridDropdownFilter

#### Fixed

- We fixed an issue with Dropdown filter captions not updating properly when their template parameters change.

### [3.9.0] Datagrid

#### Changed

- We improved accessibility on column selector, added aria-attributes and changed the role to 'menuitemcheckbox'.

#### Added

- We added a new `Loaded rows` attribute that reflects the number of rows currently loaded for virtual scrolling and load-more pagination modes.

#### Fixed

- We fixed an issue with Data export crashing on some Android devices.

### [3.9.0] Gallery

#### Fixed

- We fixed the pagination properties `Page attribute`, `Page size attribute`, and `Total count` not being shown in Studio Pro for Virtual Scrolling and Load More pagination modes.
```

**Key differences**:

- Module name in version header: `[3.9.0] DataWidgets - 2026-03-23`
- Subcomponent sections for each widget: `### [3.9.0] Datagrid`
- Aggregates all widget changelogs into single module changelog
- Generated automatically by GitHub workflow during release — the workflow reads each dependent widget's flat `## [Unreleased]` entries and transforms them into the nested `### [X.Y.Z] WidgetName` format shown above

## Release Preparation Process

### Prerequisites

- Changes merged to `main` branch
- Unreleased entries in CHANGELOG.md

### Steps

#### 1. Determine what to release

**Packages without dependencies**:

- Check if package has unreleased changelog entries
- If so → is releasable

**Packages with dependencies**:

- Check if package itself has unreleased changelog entries OR
- Check if any dependent widget has unreleased changelog entries
- If so → is releasable

#### 2. Determine version bump type

**Manual decision** (currently):

- **Patch** (X.Y.Z+1): Bug fixes, small changes
- **Minor** (X.Y+1.0): New features, backward-compatible
- **Major** (X+1.0.0): Breaking changes, major rewrites

**Future**: Agent should advise this based on changelog entries

#### 3. Bump versions

**For packages without dependencies**:

```
package.json: version → X.Y.Z
src/package.xml: version → X.Y.Z  (widgets only, modules don't have this)
```

**For packages with dependencies**:

```
# Package itself
packages/{modules|pluggableWidgets}/PACKAGE_NAME/package.json: version → X.Y.Z
packages/pluggableWidgets/PACKAGE_NAME/src/package.xml: version → X.Y.Z  (widgets only)

# All dependent widgets
packages/pluggableWidgets/DEPENDENT_WIDGET_1/package.json: version → X.Y.Z
packages/pluggableWidgets/DEPENDENT_WIDGET_1/src/package.xml: version → X.Y.Z
packages/pluggableWidgets/DEPENDENT_WIDGET_2/package.json: version → X.Y.Z
packages/pluggableWidgets/DEPENDENT_WIDGET_2/src/package.xml: version → X.Y.Z
... (all dependent widgets)
```

**Important**: Only version is bumped at this moment. Changelog files themselves are updated on step 6.

#### 4. Create release branch

Create temporary branch:

```
tmp/PACKAGE_NAME-vX.Y.Z
```

Example: `tmp/carousel-web-v2.3.2` or `tmp/data-widgets-v3.9.0`

#### 5. Commit and push

Commit message format:

```
chore(PACKAGE_NAME): bump version to X.Y.Z
```

Push branch to GitHub

#### 6. Trigger GitHub release workflow

The GitHub workflow (`Release` workflow) is triggered manually via UI or via a script.

What it does:

1. Reads the version from package.json
2. Updates CHANGELOG.md:
    - Moves all entries from `## [Unreleased]` section to a new section for the new release `## [X.Y.Z] - YYYY-MM-DD`
    - Unreleased section becomes empty
3. For packages with dependencies: aggregates widget changelogs into parent's changelog
4. Builds artifacts and creates a draft GitHub release based on them
5. Commits changelog updates to `tmp/PACKAGE_NAME-vX.Y.Z`
6. Opens PR to `main` containing changes from `tmp/PACKAGE_NAME-vX.Y.Z`

#### 7. Create Jira version entries

By team member via Jira UI or via helper scripts.

**Manual step**:

- In Jira a new Release is created with the name `PACKAGE_NAME-vX.Y.Z`.
- This release is then attached to the Jira story (or stories if new version contains multiple work items)

#### 8. OSS Clearance

**Manual step**:

- When the draft release created by workflow on step 6 is ready.
- Team member requests OSS clearance based on draft release artifacts
- Uses scripts in `automation/utils/bin/rui-oss-clearance.ts`
- When OSS clearance is complete team member uploads clearance artifact (HTML file) to the draft release.

This step has to be finished before the next steps.

#### 9. Approve and publish

**Manual step**:

- Team member reviews draft release on GitHub and makes sure release artifacts and oss clearance artifact (HTML file) are present
- If comfortable with release they "Publish" the release
- Artifacts are uploaded to Mendix Marketplace by a separate workflow

#### 10. Merging changelogs and completion

Team members approve and merge PR opened at step 6.
After merge `main` contains correct changelogs
Branch `tmp/PACKAGE_NAME-vX.Y.Z` is removed manually

#### 11. Completion in Jira

At this stage the release process is considered complete.
Relevant Jira stories are marked as Done and relevant Jira releases is marked as released.
