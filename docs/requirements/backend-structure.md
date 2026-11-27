---
description:
globs:
alwaysApply: true
---

# Widget Data Flow & Backend Integration

Although pluggable widgets are primarily client-side components, they operate within the Mendix ecosystem. This document explains how data flows between a widget and the Mendix runtime, and how events are handled.

## Widget XML Configuration and Mendix Runtime

- **Property Types and Mendix Data:**
    - **attribute:** Provided as an EditableValue object.
    - **textTemplate:** Passed as a DynamicValue<string>.
    - **objects/object:** Provided as a ListValue or ObjectValue.
    - **Simple types** (enumerations, strings, numbers, booleans): Passed as plain JS values. These are static props; see [Static props never change](#static-props-never-change).
    - **action:** Provided as an ActionValue with methods like `execute()`. **Exception:** when an action is linked to an attribute or association as its `onChange` handler (system-managed), the Mendix runtime invokes it automatically and it is **not** passed to the widget as a prop. Such actions are intentionally absent from the generated `*ContainerProps` typings — this is correct, not a sync issue.
- **Offline Capable:** XML can mark widgets as offline capable, meaning they are designed to work without a network connection.

## Data Flow: Reading and Updating Data

- **Initial Data Loading:** On page load, Mendix supplies data via props (e.g., EditableValue, DynamicValue). Widgets should render loading states if data is not yet available.
- **Two-Way Data Binding:** For interactive widgets, changes are pushed back using methods like `EditableValue.setValue()`.
- **Events and Actions:** User-triggered events call ActionValue's `execute()` method (after checking `canExecute`) to run Mendix microflows or nanoflows.

## Mendix Client and Widget Lifecycle

- **Instantiation:** Mendix creates the widget component on page load and passes the required props.
- **Re-rendering:** Changes in Mendix data trigger re-rendering via updated props. Each changed value arrives as a new object; see [Dynamic values are immutable snapshots](#dynamic-values-are-immutable-snapshots).
- **Destruction:** Widgets unmount when removed; cleanup (e.g., event listeners) should occur during unmount.
- **Communication with the Server:** Widgets trigger server-side logic indirectly via microflows or nanoflows, using data source properties when needed.

### Static props never change

Simple-type props (enumerations, strings, numbers, booleans) are **constants for the lifetime of a widget instance**. They never change between re-renders. They change only when the app developer reconfigures the app and redeploys, which means a completely new page load. Only dynamic values change between re-renders; see [Dynamic values are immutable snapshots](#dynamic-values-are-immutable-snapshots).

What this means:

- Read static props once, for example when a store or controller is constructed, and keep them as plain fields, never as observables.
- Never write a test that changes a static prop between renders, because that can't happen.

### Dynamic values are immutable snapshots

Every dynamic prop (EditableValue, DynamicValue, ListValue, ActionValue, SelectionValue, ReferenceValue, and the rest) is a read-only snapshot of its state at the moment of the render. The Mendix client never changes an object after passing it to the widget. When anything about a value changes, the widget re-renders and receives a **new** object for that prop. This covers changes to:

- the data, for example after `setValue`, `setSelection`, a microflow or another widget writing the same attribute
- the status, for example `loading` → `available` or `available` → `unavailable`
- its metadata: validation, read-only, formatter, `canExecute`, `isExecuting`, a list's limit, offset or filter

When a value has not changed, the widget receives the **same** object as in the previous render. Each prop is replaced on its own: a change to one prop doesn't give the other props new objects.

What this means for widget code:

- Read values from the current props. A reference to an older object keeps showing old data.
- `setValue` and `setSelection` don't change the object you call them on. The new value arrives as a new object in a later render.
- Object identity tells you whether a value changed. You can use it as a React dependency or as the input of a MobX computed (`observable.ref`).
- Objects inside a value follow the same rule. For example, a list's items can be new objects after a reload, so compare items by `id`, not by reference.

Unit test mocks must behave the same way: give the widget a new object on the next render instead of changing the one it already has.

## Example: DataGrid2 Interaction

- A DataGrid widget receives a ListValue for data.
- Sorting or row click events trigger ActionValues that may call microflows.
- Updates to the data source result in re-rendering of the widget.
