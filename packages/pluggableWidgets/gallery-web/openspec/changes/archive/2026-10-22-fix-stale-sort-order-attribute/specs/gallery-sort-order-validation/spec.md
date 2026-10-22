## ADDED Requirements

### Requirement: Applying a restored sort order never surfaces an uncaught reaction error

When the Gallery widget forwards a restored (persisted or props-provided) sort order to the datasource, a rejection by the Mendix runtime — such as a sort instruction whose attribute id is no longer valid for the current app build — SHALL NOT escape as an uncaught MobX reaction exception. The widget SHALL catch the rejection and recover to the datasource's default sort order so it remains usable.

This guard SHALL apply on the path every sort order takes into the datasource, regardless of whether a sort widget (DropdownSort) is configured — i.e. it SHALL NOT depend on a `SortOrderStore` being instantiated.

#### Scenario: Restored sort order contains a stale attribute id

- **WHEN** the widget is initialized with a `datasource.sortOrder` restored from a previous session/run that references an attribute id no longer present in the current app build
- **THEN** the runtime rejection is caught, the query is set to the default (unsorted) order, and no uncaught reaction exception is surfaced

#### Scenario: Restored sort order contains only currently valid attribute ids

- **WHEN** the widget is initialized with a `datasource.sortOrder` where every attribute id is valid for the current build
- **THEN** the full sort order is applied to the datasource unchanged, preserving order and direction

#### Scenario: No sort widget configured

- **WHEN** the widget has no DropdownSort configured (so no `SortOrderStore` exists) and the props-provided sort order references a stale attribute id
- **THEN** the guard still catches the runtime rejection and recovers to the default order, because the guard sits on the shared forwarding path rather than in the sort store

### Requirement: Sort-order fallback is diagnosable, not silent

When the widget recovers from a rejected sort order, it SHALL emit a `console.warn` explaining that the stored sort order was ignored because it references an attribute that is no longer available. This warning SHALL fire only on the rejection/fallback path, not during normal sort application.

#### Scenario: Fallback emits a warning

- **WHEN** a restored sort order is rejected by the runtime and the widget falls back to the default order
- **THEN** a `console.warn` is emitted describing the ignored sort order and including the underlying error, so the reset is diagnosable from the browser console
