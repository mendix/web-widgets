## Context

Gallery items can contain nested interactive elements (inputs, textareas, buttons, etc.). The gallery widget implements keyboard activation for gallery items using SPACE and ENTER keys to trigger item selection/action. However, keyboard event handlers were unconditionally calling `preventDefault()` and `stopPropagation()` for all SPACE and ENTER events within a gallery item, regardless of whether the event originated from the gallery item itself or from a nested input element. This broke keyboard functionality for nested inputs — users cannot type SPACE, submit forms with ENTER, or interact with nested interactive elements.

The fix requires distinguishing between events that originated on the gallery item (`event.target === event.currentTarget`) and events from nested elements (bubbled events).

## Goals / Non-Goals

**Goals:**

- Enable keyboard functionality (SPACE, ENTER) for nested interactive elements within gallery items
- Preserve gallery item keyboard activation (SPACE/ENTER on the gallery item itself)
- Maintain backward compatibility with existing gallery item selection behavior
- No API or prop changes required

**Non-Goals:**

- Modifying the overall gallery keyboard interaction model
- Changing selection modes or multi-select behavior
- Updating documentation or public APIs

## Decisions

**Decision 1: Event ownership check using `event.target === event.currentTarget`**

Add an `isOwn` check to both keyboard event handlers to verify the event originated on the gallery item itself, not from a nested element.

- **Rationale**: The standard React/DOM pattern for distinguishing self events from bubbled child events is comparing `target` (original event source) with `currentTarget` (handler's element). This is performant and reliable.
- **Alternative considered**: Using event phases (capture vs. bubble) — more complex and less idiomatic in React event handlers.

**Decision 2: Apply `isOwn` check in two separate locations**

- **ListItemButton.tsx**: Check ownership before calling `preventAndStop()` in the `onKeyDown` handler
- **action-handlers.ts**: Check ownership in the `canExecOnSpaceOrEnter` filter

- **Rationale**: Both handlers independently decide whether to prevent/stop or trigger actions. Adding the check in both ensures consistent behavior regardless of which handler path is taken. The filter approach in action-handlers is cleaner; ListItemButton needs the check in the handler itself due to state management (`pressed` flag).
- **Alternative considered**: Centralizing the check in one location — would require restructuring event handler wiring and risks one path bypassing validation.

**Decision 3: No architectural changes to event routing**

Keep the existing event switch pattern and handler composition. Only add the ownership check, don't refactor the event handling system.

- **Rationale**: Minimal change reduces risk and review scope. The current architecture works; we're fixing behavior, not redesigning.

## Risks / Trade-offs

**[Risk]** Events that bubble from deeply nested elements may not have a clear owner.
→ **Mitigation**: The `event.target === event.currentTarget` check is strict and only matches events fired directly on the gallery item. Any bubbled event will fail the check, which is correct behavior — nested elements should handle their own events.

**[Risk]** Developers unfamiliar with this pattern might add similar handlers without the ownership check.
→ **Mitigation**: Add a code comment in both locations explaining the ownership check purpose.

**[Trade-off]** The ownership check requires `event.currentTarget` to be properly set. In React controlled event handlers it always is, but if event listeners are added directly to the DOM they must use `addEventListener(..., false)` (bubble phase, default).
→ **Justification**: We're using React event handlers exclusively; this is not a concern in practice.

## Implementation Notes

Files to modify:

1. `src/components/ListItemButton.tsx` (line 23-29): Move `preventAndStop()` inside the `isOwn()` check
2. `src/features/item-interaction/action-handlers.ts` (line 25-31): Add `isOwn` check to `canExecOnSpaceOrEnter`

Testing approach:

- Unit tests: Verify ownership checks block events from nested elements
- E2E tests: Confirm SPACE/ENTER work in nested inputs and still trigger gallery item actions when pressed on the item itself
