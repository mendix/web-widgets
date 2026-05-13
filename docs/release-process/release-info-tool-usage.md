## Determining Releasability

### Data Structure for Release Candidates

See `docs/release-process/release-info-tool.md` for the complete reference.

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
