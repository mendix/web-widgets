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
    - **Simple types:** Passed as plain JS values.
    - **Static vs dynamic props:** Simple-type props (enumerations, strings, numbers, booleans) are **constants for the lifetime of a widget instance**. They change only when the app developer reconfigures the app and redeploys, which is a completely new page load. They never change between re-renders. Only the platform value objects (EditableValue, DynamicValue, ListValue, ListAttributeValue, ListExpressionValue, ListWidgetValue, ActionValue, SelectionValue) change between re-renders. Consequences: read static props once (for example at store or controller construction) as plain fields, never as observables; never write a test that changes a static prop between renders, because that behaviour cannot occur.
    - **action:** Provided as an ActionValue with methods like `execute()`. **Exception:** when an action is linked to an attribute or association as its `onChange` handler (system-managed), the Mendix runtime invokes it automatically and it is **not** passed to the widget as a prop. Such actions are intentionally absent from the generated `*ContainerProps` typings — this is correct, not a sync issue.
- **Offline Capable:** XML can mark widgets as offline capable, meaning they are designed to work without a network connection.

## Data Flow: Reading and Updating Data

- **Initial Data Loading:** On page load, Mendix supplies data via props (e.g., EditableValue, DynamicValue). Widgets should render loading states if data is not yet available.
- **Two-Way Data Binding:** For interactive widgets, changes are pushed back using methods like `EditableValue.setValue()`.
- **Events and Actions:** User-triggered events call ActionValue's `execute()` method (after checking `canExecute`) to run Mendix microflows or nanoflows.

## Mendix Client and Widget Lifecycle

- **Instantiation:** Mendix creates the widget component on page load and passes the required props.
- **Re-rendering:** Changes in Mendix data trigger re-rendering via updated props.
- **Destruction:** Widgets unmount when removed; cleanup (e.g., event listeners) should occur during unmount.
- **Communication with the Server:** Widgets trigger server-side logic indirectly via microflows or nanoflows, using data source properties when needed.

## Example: DataGrid2 Interaction

- A DataGrid widget receives a ListValue for data.
- Sorting or row click events trigger ActionValues that may call microflows.
- Updates to the data source result in re-rendering of the widget.
