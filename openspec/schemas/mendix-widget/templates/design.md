## Technical Approach

<!-- Describe the implementation strategy at a high level. What is the core mechanism?
     What's the key insight or trade-off that drives the approach? -->

## Mendix API Usage

<!-- List which Mendix API values this change involves.

Props used:
- `propName` (EditableValue<T> / ActionValue / ListValue / DynamicValue<T>) — role in this change

canExecute checks:
- New guards needed? Which actions?

Loading/status handling:
- New status checks needed? Which values? -->

## Component Changes

<!-- Describe structural changes to React components.

New components:
- `ComponentName` — purpose, parent component

Modified components:
- `ComponentName` — what changes

Deleted components:
- `ComponentName` — replacement -->

## XML Changes

<!-- Detail .xml property additions/modifications.

New properties:
- `propName` (type) — caption, defaultValue, impact on editorConfig/editorPreview

Modified properties:
- `propName` — what changes

Removed properties:
- `propName` — any migration impact -->

## SCSS Changes

<!-- New classes, modified styles, Atlas UI classes used -->

## MobX / State Changes

<!-- If applicable: new observables, actions, computed values, store restructuring -->

## File Changes

```
src/components/NewComponent.tsx     (new)
src/components/ExistingComponent.tsx (modify)
src/ui/widget-name.scss              (modify)
src/WidgetName.xml                   (modify)
src/WidgetName.editorConfig.ts       (modify if needed)
```
