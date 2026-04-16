# Release Workflow Documentation

## Overview

This document describes the release process for Mendix web widgets and modules in the monorepo.

**Package types**:

- **Widgets** (`packageType: "widget"`) - UI components
- **Modules** (`packageType: "module"`) - Bundles of widgets and/or JavaScript actions

**Dependency structure**:

- **Standalone** (`hasDependencies: false`) - Released independently
- **Aggregators** (`hasDependencies: true`) - Bundle other widgets, all share the same version
- **Dependent widgets** - Widgets without Marketplace app numbers, bundled by aggregators

## Package Structure

### Standalone Widgets

**Location**: `packages/pluggableWidgets/*/`  
**Properties**: `packageType: "widget"`, `hasDependencies: false`

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

### Standalone Modules

**Location**: `packages/modules/*/`  
**Properties**: `packageType: "module"`, `hasDependencies: false`

**Characteristics**:

- Has `marketplace.appNumber`
- No widget dependencies (just JavaScript actions or other module content)
- Released independently
- Own version tracking

**Example**: `@mendix/web-actions`

```json
{
    "name": "@mendix/web-actions",
    "version": "2.0.0",
    "mxpackage": {
        "type": "module"
    },
    "marketplace": {
        "appNumber": 114337,
        "appName": "Web Actions"
    }
}
```

### Widget Aggregators

**Location**: `packages/pluggableWidgets/*/`  
**Properties**: `packageType: "widget"`, `hasDependencies: true`

**Characteristics**:

- Has `mxpackage.type: "widget"` in `package.json`
- Has `mxpackage.changelogType: "module"` (special flag for changelog aggregation)
- Has `marketplace.appNumber` (published to marketplace)
- Lists dependent widgets in `mxpackage.dependencies` array
- Has own CHANGELOG.md that aggregates widget changelogs

**Example**: `@mendix/charts-web` (the only widget-to-widget aggregator)

```json
{
    "name": "@mendix/charts-web",
    "version": "6.3.0",
    "mxpackage": {
        "type": "widget",
        "changelogType": "module",
        "dependencies": [
            "@mendix/area-chart-web",
            "@mendix/bar-chart-web",
            "@mendix/line-chart-web",
            "@mendix/pie-doughnut-chart-web"
            // ... more chart widgets
        ]
    },
    "marketplace": {
        "appNumber": 105695,
        "appName": "Charts"
    }
}
```

### Module Aggregators

**Location**: `packages/modules/*/`  
**Properties**: `packageType: "module"`, `hasDependencies: true`

**Characteristics**:

- Has `mxpackage.type: "module"` in `package.json`
- Has `marketplace.appNumber` (published to marketplace)
- Lists dependent widgets in `mxpackage.dependencies` array
- Has own CHANGELOG.md that aggregates widget changelogs
- May contain JS actions in addition to widgets

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
- Listed in an aggregator's `mxpackage.dependencies` array
- Released only as part of their parent aggregator
- Version always matches parent aggregator version
- Has own CHANGELOG.md (aggregated into aggregator changelog on release)

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

### Standalone Packages (hasDependencies: false)

- **Version tracking**: Each package has its own independent version
- **Semantic versioning rules**:
    - **Patch**: Bug fixes, small improvements
    - **Minor**: New features, backward-compatible changes
    - **Major**: Breaking changes, major rewrites

### Aggregator Packages (hasDependencies: true)

- **Version tracking**: Aggregator and all dependent widgets share the same version
- When aggregator releases version `3.8.0`, ALL dependent widgets become `3.8.0`
- When aggregator releases `3.8.1` for a single widget fix, ALL widgets still bump to `3.8.1`
- Even if a widget's code didn't change, it gets the version bump

**Example**: If `@mendix/data-widgets` (module aggregator) releases `3.9.0`, then:

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
- Generated automatically by GitHub workflow during release

## Release Preparation Process

### Prerequisites

- Changes merged to `main` branch
- Unreleased entries in CHANGELOG.md
- Jira story complete (or team decision to release)
- GitHub authentication configured (`gh` CLI)
- Jira authentication configured (optional)

### Steps

The release is prepared using the `rui-prepare-release` script:

#### 1. Determine what to release

**For standalone packages** (`hasDependencies: false`):

- Check if package has unreleased changelog entries
- Package can be released independently

**For aggregators** (`hasDependencies: true`):

- Check if aggregator has unreleased changelog entries OR
- Check if any dependent widget has unreleased changelog entries
- If either has changes → aggregator is releasable

#### 2. Determine version bump type

**Manual decision** (currently):

- **Patch** (X.Y.Z+1): Bug fixes, small changes
- **Minor** (X.Y+1.0): New features, backward-compatible
- **Major** (X+1.0.0): Breaking changes, major rewrites

**Future**: Agent should determine this based on changelog entry types

#### 3. Bump versions

**For standalone packages** (`hasDependencies: false`):

```
package.json: version → X.Y.Z
src/package.xml: version → X.Y.Z  (widgets only, modules don't have this)
```

**For aggregators** (`hasDependencies: true`):

```
# Aggregator package
packages/{modules|pluggableWidgets}/AGGREGATOR_NAME/package.json: version → X.Y.Z
packages/pluggableWidgets/AGGREGATOR_NAME/src/package.xml: version → X.Y.Z  (widget aggregators only)

# All dependent widgets
packages/pluggableWidgets/WIDGET_1/package.json: version → X.Y.Z
packages/pluggableWidgets/WIDGET_1/src/package.xml: version → X.Y.Z
packages/pluggableWidgets/WIDGET_2/package.json: version → X.Y.Z
packages/pluggableWidgets/WIDGET_2/src/package.xml: version → X.Y.Z
... (all dependent widgets)
```

**Note**:

- Module aggregators (`packageType: "module"`, `hasDependencies: true`): package.json in `packages/modules/`, no package.xml
- Widget aggregators (`packageType: "widget"`, `hasDependencies: true`): package.json in `packages/pluggableWidgets/`, has package.xml
- Standalone modules (`packageType: "module"`, `hasDependencies: false`): package.json in `packages/modules/`, no package.xml
- Standalone widgets (`packageType: "widget"`, `hasDependencies: false`): package.json in `packages/pluggableWidgets/`, has package.xml

**Important**: Changelog files are NOT modified at this stage

#### 4. Create release branch

Create temporary branch:

```
release/PACKAGE_NAME-vX.Y.Z
```

Example: `release/carousel-web-v2.3.2` or `release/data-widgets-v3.9.0`

#### 5. Commit and push

Commit message format:

```
chore(PACKAGE_NAME): bump version to X.Y.Z
```

Push branch to GitHub

#### 6. Trigger GitHub release workflow

The GitHub workflow (`Release` workflow) does:

1. Reads the version from package.json
2. Updates CHANGELOG.md:
    - Moves `## [Unreleased]` entries to `## [X.Y.Z] - YYYY-MM-DD`
    - Clears Unreleased section
3. For aggregators: aggregates widget changelogs into aggregator changelog
4. Creates a draft GitHub release
5. Builds artifacts (MPK files)

#### 7. OSS Clearance

**Manual step** (not automatable yet):

- Team member requests OSS clearance
- Uses scripts in `automation/utils/bin/rui-oss-clearance.ts`

#### 8. Approve and publish

**Manual step**:

- Team member reviews draft release on GitHub
- Approves and publishes the release
- Artifacts are uploaded to Mendix Marketplace

## Determining Releasability

### Data Structure for Release Candidates

See `docs/requirements/release-info-tool-summary.md` for the complete reference.

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

### Algorithm for determining release candidates

Use the `rui-release-info` tool:

```bash
# Get packages with unreleased changes
pnpm exec ts-node automation/utils/bin/rui-release-info.ts --candidates
```

**Logic**:

```
FOR EACH package in [packages/pluggableWidgets/*, packages/modules/*]:
  pkg = read package.json

  IF pkg.marketplace.appNumber does NOT exist:
    → Skip (dependent widget, handled by its aggregator)

  IF pkg.mxpackage.dependencies exists AND length > 0:
    # Aggregator (packageType: "widget" or "module", hasDependencies: true)
    hasChanges = (package changelog has unreleased entries) OR
                 (any dependent widget has unreleased entries)

    IF hasChanges:
      → Add to release candidates with dependentWidgets array
  ELSE:
    # Standalone (packageType: "widget" or "module", hasDependencies: false)
    IF changelog has unreleased entries:
      → Add to release candidates
```

See `automation/utils/src/release-candidates.ts` for the implementation.

## Dependencies and Constraints

### Dependency structure

- **Aggregators (`hasDependencies: true`) → Widgets**: Both module and widget aggregators can bundle widgets
    - Module aggregators (e.g., `data-widgets` → `datagrid-web`)
    - Widget aggregators (e.g., `charts-web` → `line-chart-web`) - only one example exists
- **No deeper nesting**: Maximum 2 levels, no aggregator-to-aggregator dependencies
- **No circular dependencies**: A widget cannot be both standalone and dependent

**Key identifier**: `hasDependencies: true` means package has `mxpackage.dependencies` array with items AND `marketplace.appNumber`.

### Version synchronization

- All widgets in an aggregator MUST have same version
- Version is determined by aggregator version
- Even unchanged widgets get version bumps

### Package.json vs package.xml

- `package.json`: Source of truth for version
- `src/package.xml`: Widget-specific, must stay in sync
- Modules don't have `package.xml`
- Scripts handle synchronization automatically

## Existing Automation Tools

Located in `automation/utils/`:

### Package Information

- `src/package-info.ts`: TypeScript types and parsers for package.json
- `src/monorepo.ts`: Utilities for working with pnpm workspace

### Changelog Operations

- `src/changelog-parser/`: Parser and writer for CHANGELOG.md files
- `src/changelog.ts`: High-level changelog operations
- `bin/rui-update-changelog-widget.ts`: Update widget changelog
- `bin/rui-update-changelog-module.ts`: Update module changelog

### Version Bumping

- `src/bump-version.ts`: Bump versions in package.json and package.xml
- `src/version.ts`: Version parsing and manipulation

### Release Preparation

- `bin/rui-prepare-release.ts`: Interactive wizard for release preparation
- `src/prepare-release-helpers.ts`: Helper functions for release prep

### Release Information

- `bin/rui-release-info.ts`: CLI tool to query release candidates (see `docs/requirements/release-info-tool-summary.md`)
- `src/release-candidates.ts`: Core logic for identifying releasable packages
- `src/io/filesystem.ts`: Filesystem abstraction for testing

### Other Tools

- `bin/rui-check-changelogs.ts`: Validate changelog format
- `bin/rui-oss-clearance.ts`: OSS clearance workflow
- `bin/rui-create-gh-release.ts`: Create GitHub releases
- `bin/rui-publish-marketplace.ts`: Publish to Mendix Marketplace

## Future Automation Goals

### Release Agent Capabilities

1. ✅ **Discover releasable packages**: Use `rui-release-info --candidates` to scan monorepo and identify packages with unreleased changes
2. **Suggest version bumps**: Analyze changelog entries, suggest patch/minor/major based on entry types
3. **Check for related work**: Query Jira for related stories, suggest bundling multiple changes
4. **Validate release readiness**: Check CI status, changelog format, required files
5. **Execute release preparation**: Bump versions, create branch, trigger workflow (reuse existing `rui-prepare-release` logic)
6. **Monitor release status**: Track workflow progress, OSS clearance, publication

### Integration Approaches

**CLI Tool** (✅ implemented):

- `rui-release-info` script outputs JSON
- Called via Bash tool in agent workflows
- Reusable functions in `@mendix/automation-utils`

**MCP Server** (future):

- Expose structured API for querying release state
- Can be called from Claude Code, CLI, or CI/CD
- Build on top of existing `loadReleaseCandidates()` function

## Questions and Decisions

### Open Questions

None at this time - all clarifications provided inline.

### Design Decisions

1. **Version synchronization**: All widgets in aggregator share version (simplifies dependency management)
2. **Changelog aggregation**: Widget changelogs copied into aggregator changelog (single source of release notes)
3. **Release from main**: All releases branch from main (simpler workflow, relies on main being stable)
4. **Manual OSS clearance**: Cannot be automated yet (external process)
5. **Draft releases**: Manual approval required (safety gate before publication)
6. **Widget aggregators**: Special case for `charts-web` - widget that bundles other widgets (identified by `changelogType: "module"`)

## Appendix: Example Scenarios

### Scenario 1: Release standalone widget with bug fix

**Initial state**:

```
@mendix/carousel-web
  version: 2.3.1
  CHANGELOG.md:
    ## [Unreleased]
    ### Fixed
    - We fixed an issue with carousel navigation on mobile devices.
```

**Steps**:

1. Run `rui-prepare-release`
2. Select `@mendix/carousel-web`
3. Choose "patch" bump → `2.3.2`
4. Bump `package.json` and `src/package.xml` to `2.3.2`
5. Create branch `release/carousel-web-v2.3.2`
6. Commit and push
7. GitHub workflow updates changelog, creates draft release
8. Team approves and publishes

**Final state**:

```
@mendix/carousel-web
  version: 2.3.2
  CHANGELOG.md:
    ## [Unreleased]

    ## [2.3.2] - 2026-04-15
    ### Fixed
    - We fixed an issue with carousel navigation on mobile devices.
```

### Scenario 2: Release module aggregator with multiple widget changes

**Initial state**:

```
@mendix/data-widgets (module)
  version: 3.9.0
  dependencies: [@mendix/datagrid-web, @mendix/gallery-web, @mendix/dropdown-sort-web]
  CHANGELOG.md:
    ## [Unreleased]

@mendix/datagrid-web
  version: 3.9.0
  CHANGELOG.md:
    ## [Unreleased]
    ### Fixed
    - We fixed an issue with column sorting.

@mendix/gallery-web
  version: 3.9.0
  CHANGELOG.md:
    ## [Unreleased]
    ### Added
    - We added support for lazy loading images.

@mendix/dropdown-sort-web
  version: 3.9.0
  CHANGELOG.md:
    ## [Unreleased]
    (empty - no changes)
```

**Steps**:

1. Run `rui-prepare-release`
2. Select `@mendix/data-widgets`
3. Choose "minor" bump → `3.10.0`
4. Bump all package.json and package.xml files to `3.10.0`:
    - `packages/modules/data-widgets/package.json`
    - `packages/pluggableWidgets/datagrid-web/package.json` + `src/package.xml`
    - `packages/pluggableWidgets/gallery-web/package.json` + `src/package.xml`
    - `packages/pluggableWidgets/dropdown-sort-web/package.json` + `src/package.xml`
5. Create branch `release/data-widgets-v3.10.0`
6. Commit and push
7. GitHub workflow:
    - Aggregates widget changelogs into module changelog
    - Updates all CHANGELOG.md files
    - Creates draft release

**Final state**:

```
@mendix/data-widgets (module)
  version: 3.10.0
  CHANGELOG.md:
    ## [Unreleased]

    ## [3.10.0] DataWidgets - 2026-04-15

    ### [3.10.0] Datagrid
    #### Fixed
    - We fixed an issue with column sorting.

    ### [3.10.0] Gallery
    #### Added
    - We added support for lazy loading images.

@mendix/datagrid-web
  version: 3.10.0
  CHANGELOG.md:
    ## [Unreleased]

    ## [3.10.0] - 2026-04-15
    ### Fixed
    - We fixed an issue with column sorting.

@mendix/gallery-web
  version: 3.10.0
  CHANGELOG.md:
    ## [Unreleased]

    ## [3.10.0] - 2026-04-15
    ### Added
    - We added support for lazy loading images.

@mendix/dropdown-sort-web
  version: 3.10.0
  CHANGELOG.md:
    ## [Unreleased]

    ## [3.10.0] - 2026-04-15
    (empty release - version bump only)
```

Note: `dropdown-sort-web` gets version bump even though it had no code changes.
