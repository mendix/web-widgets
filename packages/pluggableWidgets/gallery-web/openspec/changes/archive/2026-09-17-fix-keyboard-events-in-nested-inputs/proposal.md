## Why

Gallery items can contain nested interactive elements like input fields. Currently, SPACE and ENTER keyboard events are being unconditionally prevented and blocked from propagating whenever pressed on any element within a gallery item. This breaks keyboard functionality for nested inputs — users cannot use SPACE in text inputs or ENTER to submit forms nested within gallery items.

## What Changes

- **ListItemButton.tsx**: Move the `isOwn` ownership check into the same conditional as `isTriggerKey`, so `preventDefault()` and `stopPropagation()` only execute for keyboard events that originate directly on the gallery item, not on nested elements.
- **action-handlers.ts**: Add an `isOwn` ownership check to the `canExecOnSpaceOrEnter` filter, ensuring gallery item activation actions only trigger when SPACE/ENTER is pressed directly on the gallery item, not on nested interactive elements.

## Capabilities

### New Capabilities

- `keyboard-event-ownership`: Ensure keyboard event handlers respect event ownership, blocking propagation and preventing defaults only for events that originate on the gallery item itself, not on nested interactive elements.

### Modified Capabilities

<!-- No existing capability requirements are changing; this is a bug fix within existing gallery keyboard handling. -->

## Impact

- **Affected files**: `src/components/ListItemButton.tsx`, `src/features/item-interaction/action-handlers.ts`
- **Behavior**: Nested input elements within gallery items now respond normally to SPACE and ENTER keyboard events
- **Scope**: Gallery-web widget only; no breaking changes to public API or data contracts
