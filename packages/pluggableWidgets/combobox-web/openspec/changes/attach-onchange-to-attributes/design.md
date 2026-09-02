## Context

The combobox widget supports multiple data sources (enum/boolean, static, association, database). Each has its own selector class. All of them currently fire `onChangeEvent` by calling `executeAction(this.onChangeEvent)` manually inside `setValue()`. This is boilerplate that every selector must remember to include and maintain.

The Mendix Pluggable Widgets API supports declaring `onChange="<actionKey>"` on `type="attribute"` and `type="association"` properties in XML. When declared, the platform fires the bound action automatically whenever the widget calls `.setValue()` on that attribute — no code needed.

## Goals / Non-Goals

**Goals:**

- Remove all manual `executeAction(this.onChangeEvent)` calls from selectors.
- Wire `onChange="onChangeEvent"` in XML for all five relevant attribute properties.
- Keep `onChangeDatabaseEvent` (Selection API path) exactly as-is.

**Non-Goals:**

- Changing when the action fires for any source type (this is a pure internal refactor — behaviour is identical).
- Modifying `DatabaseMultiSelectionSelector` or the `onChangeDatabaseEvent` mechanism.
- Adding new user-facing capabilities or changing the action's semantics.

## Decisions

### Decision: Wire onChange in XML rather than a shared base class

Adding `onChange="onChangeEvent"` in XML is the platform-idiomatic approach. It removes the coupling between selector code and the action, and ensures the action fires even if a selector forgets to call it. The alternative — creating a shared base class method — still requires every selector to call the base, which is the same maintenance burden as today.

### Decision: Remove the \_valuesIsEqual guard on database single select

`DatabaseSingleSelectionSelector.setAttributeValue()` currently guards `executeAction` with `_valuesIsEqual`. This guard is redundant with the platform's own behaviour: the platform only fires `onChange` when the attribute value actually changes. The guard can be removed without any change in observable behaviour.

### Decision: Keep onChangeEvent extraction in extractDatabaseProps only if needed elsewhere

After removing `onChangeEvent` from `DatabaseSingleSelectionSelector`, the field is no longer needed in `extractDatabaseProps`'s return type. Remove it from there and from all other `utils.ts` extraction helpers where it is no longer consumed.

## Risks / Trade-offs

- **[Risk] Generated typings change** → Removing `onChangeEvent` from `updateProps` arguments means the generated `ComboboxProps.ts` (via `typings/`) may change. Verify that the generated props still include `onChangeEvent?: ActionValue` from the XML action definition, independent of the attribute `onChange` binding.

## Migration Plan

No migration required. This is a pure internal refactor:

- XML `onChange` binding is additive.
- Removing `executeAction` calls from selectors is invisible to consumers.
- No public API, prop names, or user-facing behaviour changes.

Rollback: revert the XML change and restore `executeAction` calls in the affected selector files.
