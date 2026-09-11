## 1. XML: Add onChange binding to attribute properties

- [x] 1.1 Add `onChange="onChangeEvent"` to `attributeEnumeration` in `Combobox.xml`
- [x] 1.2 Add `onChange="onChangeEvent"` to `attributeBoolean` in `Combobox.xml`
- [x] 1.3 Add `onChange="onChangeEvent"` to `staticAttribute` in `Combobox.xml`
- [x] 1.4 Add `onChange="onChangeEvent"` to `attributeAssociation` in `Combobox.xml`
- [x] 1.5 Add `onChange="onChangeEvent"` to `databaseAttributeString` in `Combobox.xml`

## 2. Remove manual executeAction calls from selectors

- [x] 2.1 Remove `onChangeEvent` field and `executeAction(this.onChangeEvent)` call from `BaseAssociationSelector.setValue()`
- [x] 2.2 Remove `onChangeEvent` field and `executeAction(this.onChangeEvent)` call from `EnumBoolSingleSelector.setValue()`
- [x] 2.3 Remove `onChangeEvent` field and `executeAction(this.onChangeEvent)` call from `StaticSingleSelector.setValue()`
- [x] 2.4 Remove `onChangeEvent` field, `_valuesIsEqual` guard, and `executeAction(this.onChangeEvent)` call from `DatabaseSingleSelectionSelector.setAttributeValue()`

## 3. Clean up onChangeEvent extraction in utility helpers

- [x] 3.1 Remove `onChangeEvent` from `ExtractionReturnValue` type and `extractDatabaseProps` return in `Database/utils.ts`
- [x] 3.2 Remove `onChangeEvent` extraction from `Association/utils.ts` if present
- [x] 3.3 Remove `onChangeEvent` extraction from `Static/utils.ts` if present
- [x] 3.4 Remove `onChangeEvent` extraction from `EnumBool/utils.ts` if present
- [x] 3.5 Verify no remaining references to `this.onChangeEvent` in any selector file

## 4. Verify generated typings are correct

- [x] 4.1 Run `pnpm turbo build` and confirm `typings/ComboboxProps.ts` still includes `onChangeEvent?: ActionValue` from the XML action definition
- [x] 4.2 Confirm no TypeScript errors from removed fields

## 5. Run tests

- [x] 5.1 Run `pnpm run test` in `combobox-web` and confirm all existing tests pass
- [x] 5.2 Update any unit tests that assert `executeAction` is called directly in selectors to instead assert the attribute `setValue` was called
