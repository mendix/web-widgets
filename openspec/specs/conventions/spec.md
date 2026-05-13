# Mendix Web Widgets — Development Conventions

## Purpose

Shared behavioral contracts and process standards for all widget packages in this
monorepo. These requirements describe expected developer-facing behavior that every
widget MUST comply with. They serve as the source of truth for code review and
agent-assisted development.

---

## Requirements

### Requirement: XML ↔ TypeScript Alignment

Widget XML property keys SHALL use lowerCamelCase and MUST match the corresponding
TypeScript prop names exactly.

#### Scenario: New XML property added

- GIVEN a developer adds a new property to `<WidgetName>.xml`
- WHEN the property has any supported Mendix type (string, integer, boolean, action, attribute, datasource, etc.)
- THEN the corresponding TypeScript prop interface MUST be updated to match
- AND the prop key MUST be identical to the XML key in lowerCamelCase

#### Scenario: XML property renamed

- GIVEN a developer renames an existing XML property
- WHEN the change is merged
- THEN the TypeScript prop name MUST be updated to match the new XML key
- AND all usages of the old prop name in `.tsx` and `editorConfig.ts` MUST be updated

---

### Requirement: ActionValue Guard

The widget SHALL check `ActionValue.canExecute` before calling `execute()` on any action prop.

#### Scenario: Action triggered by user interaction

- GIVEN a widget has an `ActionValue` prop
- WHEN a user triggers the action (click, keypress, programmatic trigger)
- THEN the widget MUST verify `canExecute === true` before calling `execute()`
- AND if `canExecute` is false, the interaction SHALL be silently ignored or the trigger element disabled

---

### Requirement: Loading State Rendering

The widget SHALL render a loading or placeholder state until all required Mendix API values are available.

#### Scenario: Data source loading on mount

- GIVEN a widget depends on a `ListValue` or `EditableValue`
- WHEN the widget mounts and the value's `status` is `"loading"`
- THEN the widget SHALL NOT render its full interactive content
- AND a loading indicator or empty placeholder SHALL be displayed

#### Scenario: Value becomes available

- GIVEN a widget was showing a loading state
- WHEN the value's `status` transitions to `"available"`
- THEN the widget SHALL render its full content using the now-available data

---

### Requirement: Semver Versioning

Each widget package MUST receive a semver bump whenever runtime code, public API,
XML schema, or observable behavior changes.

#### Scenario: Behavior change merged

- GIVEN a PR modifies runtime widget behavior, XML properties, or the public API
- WHEN the PR is reviewed and approved
- THEN `package.json` version MUST be incremented (patch / minor / major as appropriate)
- AND `CHANGELOG.md` MUST contain an entry in Keep-a-Changelog format describing the change

#### Scenario: Refactor or test-only change

- GIVEN a PR modifies only internal implementation, tests, or documentation (no observable behavior change)
- WHEN the PR is reviewed
- THEN a version bump is NOT required
- AND the author MUST confirm no behavior change in the PR description

---

### Requirement: Atlas UI Class Usage

Widgets SHALL use Atlas UI classes for common UI elements and MUST NOT override core Atlas classes.

#### Scenario: Button rendered inside a widget

- GIVEN a widget renders a clickable button element
- WHEN the button requires primary, secondary, or other standard styling
- THEN Atlas classes (e.g., `btn`, `btn-primary`, `btn-secondary`) SHALL be used
- AND custom CSS MUST NOT redefine or override core Atlas class definitions

#### Scenario: Custom styling needed beyond Atlas

- GIVEN a widget requires visual styling that Atlas classes do not cover
- WHEN the developer writes custom SCSS
- THEN the custom styles MUST wrap the element in a widget-specific selector
- AND MUST NOT modify global Atlas class definitions

---

### Requirement: SCSS Class Naming

Custom CSS classes MUST be prefixed with the widget name using BEM-like conventions.

#### Scenario: Widget renders a custom DOM element with a class

- GIVEN a widget adds a custom CSS class to a DOM element
- WHEN the class is not a standard Atlas UI class
- THEN the class name MUST start with the widget name prefix (e.g., `widget-datagrid-`, `widget-combobox-`)

---

### Requirement: Unit Test Coverage

New features and bug fixes MUST include corresponding unit tests using Jest and React Testing Library.

#### Scenario: Feature added to a widget

- GIVEN a developer implements a new feature in a widget
- WHEN the feature is submitted as a PR
- THEN unit tests MUST exist in `src/**/__tests__/*.spec.ts` covering the new behavior
- AND tests MUST use `@mendix/widget-plugin-test-utils` builders for Mendix API mocks
- AND tests MUST NOT use Enzyme — use RTL (`render`, `screen`) instead

#### Scenario: Bug fix submitted

- GIVEN a developer fixes a bug
- WHEN the fix is submitted as a PR
- THEN a regression test MUST be added that would have caught the original bug

---

### Requirement: Conventional Commits

All commits MUST follow the Conventional Commits specification.

#### Scenario: Developer commits code

- GIVEN a developer commits code to the monorepo
- WHEN the commit message is written
- THEN it MUST follow the pattern: `type(scope): description`
- AND `type` MUST be one of: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `ci`
- AND `scope` SHOULD be the widget package name (e.g., `datagrid`, `combobox`)

---

### Requirement: OpenSpec Change Proposal

Non-trivial changes to widget behavior, XML schema, or public API SHOULD be preceded
by an OpenSpec change proposal before implementation begins.

#### Scenario: Developer starts a new feature

- GIVEN a developer plans to implement a new feature or behavior change in a widget
- WHEN the change affects the widget's observable behavior, XML schema, or public API
- THEN `/opsx:propose <change-name>` SHOULD be run in the widget's directory first
- AND the generated `openspec/changes/<change-name>/proposal.md` SHOULD be reviewed before coding starts

#### Scenario: Bug fix or minor refactor

- GIVEN a developer is fixing a bug or doing a minor refactor
- WHEN the change does not add new user-visible behavior
- THEN an OpenSpec proposal is NOT required
