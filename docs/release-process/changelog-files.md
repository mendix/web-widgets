---
description: This file describes how changelog files are organized, read ONLY if you need to understand the internal structure of them. If you need to work with changelogs, use high level tools for this, not the knowledge from this file.
alwaysApply: false
---

# Changelog Formats

All changelogs follow the [Keep a Changelog](https://keepachangelog.com/) format with Mendix-specific extensions.

There are two types of changelogs, **module** type and **widget** type. All share the same concepts, but differ in representation.

Changelogs always follows the same pattern:

**Header**: Has "Changelog" heading and some default wording almost identical for all changelogs.

**Standard sections**:

- `[Unreleased]` - Unreleased changes, only one at the top to keep unreleased entries before the next release
- `[X.Y.Z] - YYYY-MM-DD` - Released versions, multiple entries like this, represent released versions

Every section has **Change categories**:

- `Fixed` - Bug fixes
- `Added` - New features
- `Changed` - Changes to existing functionality
- `Removed` - Removed features
- `Deprecated` - Features that will be removed in upcoming releases
- `Security` - Security-related fixes or improvements
- `Breaking changes` - Breaking changes
- `Documentation` - Documentation-only changes

Every change category has a changelog entry as a bullet point:

- `- We added a new exciting column sorting feature`
  or
- `- We fixed an issue with column sorting`

While Widget changelog follows this exactly, module has extra differences, explained below.

### Widget Changelogs

Usually found in widgets: `packages/pluggableWidgets/*/CHANGELOG.md`

Example for widget `@mendix/datagrid-web`:

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

Usually found in modules: `packages/modules/*/CHANGELOG.md`

Example format for module `@mendix/data-widgets`:

```markdown
# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- We changed something at module level that does not belong to a specific widget.

## [3.10.0] DataWidgets - 2026-05-06

### Changed

- We changed some stylings hardcoded values to have a better support for css variables.

### [3.10.0] DatagridDropdownFilter

#### Fixed

- We fixed an issue with Dropdown filter captions not updating properly when their template parameters change.

### [3.10.0] Datagrid

#### Changed

- We improved accessibility on column selector, added aria-attributes and changed the role to 'menuitemcheckbox'.

#### Added

- We added a new `Loaded rows` attribute that reflects the number of rows currently loaded.

#### Fixed

- We fixed an issue with Data export crashing on some Android devices.

### [3.10.0] Gallery

#### Fixed

- We fixed the pagination properties `Page attribute`, `Page size attribute`, and `Total count` not being shown.
```

**Key differences**:

- Module name in version header: `[X.Y.Z] ModuleName - YYYY-MM-DD`
- Next to standard Change categories that describe changes to the module directly, they aggregate changes in dependent widgets: `### [3.10.0] Datagrid`, `### [3.10.0] Gallery`, etc
- Structure for each widget stays the same as for Widget changelog but every section is one h-level deeper as they fall under the module header
- Aggregates all widget changelogs into single module changelog, changes are duplicated into this changelog on release.

`[Unreleased]` section in modules works the same way as in widgets — holds all pending module changes, but not changes in the dependent widgets.
