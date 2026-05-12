# Release Workflow Documentation

## Overview

This document describes the release process for Mendix web widgets and modules in the monorepo.

For an overview of package types (widgets, modules, dependent widgets) see [package-types.md](./package-types.md).

## Version Management

### Semantic versioning rules

- **Patch**: Bug fixes, small improvements
- **Minor**: New features, backward-compatible changes
- **Major**: Breaking changes, major rewrites, happens rarely

### Standalone package w/o dependencies

- **Version tracking**: Each package has its own independent version, follows Semantic versioning rules.

### Standalone packages with dependencies

- **Version tracking**: Parent package and all dependent widgets share the same version
- When parent releases version `3.8.0`, ALL dependent widgets become `3.8.0`
- When parent releases `3.8.1` for a single widget fix, ALL widgets still bump to `3.8.1`
- Even if a widget's code didn't change, it gets the version bump

**Example**: If `@mendix/data-widgets` (module) releases `3.9.0`, then:

- `@mendix/datagrid-web` → `3.9.0`
- `@mendix/gallery-web` → `3.9.0`
- `@mendix/dropdown-sort-web` → `3.9.0`
- ... all widgets in the module → `3.9.0`

Same Semantic versioning rules but based on all widgets.

## Changelog Management

### Workflow

1. **During development**: Developer adds entries under `[Unreleased]` changelog section
2. **On merge to main**: Changes merged with unreleased changelog entries (no version bump yet)
3. **Release decision**: Team decides to release based on:
    - Unreleased changes exist
    - Jira story is complete
    - Team decision (may wait to bundle multiple stories)
4. **On release**: GitHub workflow moves unreleased entries to new version section, `[Unreleased]` is cleared.

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
