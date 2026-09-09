## Why

The `onChangeEvent` action is currently fired manually via `executeAction()` in every selector's `setValue()` method. This is error-prone and inconsistent — each selector duplicates the call, and the database single selector has an extra guard that makes its behavior subtly different from the rest. The Mendix platform already supports automatic action firing via `onChange` on attribute properties in XML, which is the idiomatic way to hook into value changes.

## What Changes

- Add `onChange="onChangeEvent"` to each attribute property in `Combobox.xml`: `attributeEnumeration`, `attributeBoolean`, `staticAttribute`, `attributeAssociation`, and `databaseAttributeString`.
- Remove manual `executeAction(this.onChangeEvent)` calls from:
    - `BaseAssociationSelector.setValue()`
    - `EnumBoolSingleSelector.setValue()`
    - `StaticSingleSelector.setValue()`
    - `DatabaseSingleSelectionSelector.setAttributeValue()`
- Remove the `onChangeEvent` field and its extraction from selector classes and `extractDatabaseProps` / `extractAssociationProps` / other `utils.ts` helpers.
- No behavioral difference: the platform also only fires `onChange` when the attribute value actually changes, so the existing `_valuesIsEqual` guard in `DatabaseSingleSelectionSelector` becomes redundant and is removed.

## Capabilities

### New Capabilities

- `attribute-driven-onchange`: The `onChangeEvent` action is wired to attribute properties in XML so the platform fires it automatically on every attribute value change, eliminating manual `executeAction` calls in selectors.

### Modified Capabilities

<!-- No existing specs to modify — no openspec/specs/ directory exists yet. -->

## Impact

- `src/Combobox.xml`: 5 attribute properties gain `onChange="onChangeEvent"`.
- `src/helpers/Association/BaseAssociationSelector.ts`: remove `onChangeEvent` field and `executeAction` call.
- `src/helpers/EnumBool/EnumBoolSingleSelector.tsx`: remove `onChangeEvent` field and `executeAction` call.
- `src/helpers/Static/StaticSingleSelector.ts`: remove `onChangeEvent` field and `executeAction` call.
- `src/helpers/Database/DatabaseSingleSelectionSelector.ts`: remove `onChangeEvent` field and `executeAction` call (and the `_valuesIsEqual` guard around it).
- `src/helpers/Database/utils.ts`: remove `onChangeEvent` from `ExtractionReturnValue` and `extractDatabaseProps`.
- `src/helpers/Association/utils.ts`, `src/helpers/Static/utils.ts`, `src/helpers/EnumBool/utils.ts`: remove `onChangeEvent` extraction where present.
- No public API changes. No new dependencies. `DatabaseMultiSelectionSelector` is unaffected.
