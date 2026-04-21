# Popup Menu Widget - Agent Context

Dropdown/popup menu widget with keyboard navigation and accessibility. Uses Floating UI for positioning.

## Architecture

**Stack**: React + TypeScript + Floating UI + SCSS  
**Modes**: Basic (text items) or Advanced (custom content)

**Component hierarchy**:

```
PopupMenu → PopupContext.Provider
  ├── PopupTrigger (uses cloneElement)
  └── Menu (FloatingFocusManager + roving tabindex)
```

## Critical Implementation Details

### Why `cloneElement` in PopupTrigger

ARIA attributes (`aria-haspopup`, `aria-expanded`) must be on the **actual trigger element**, not a wrapper div.

```tsx
// ✅ cloneElement applies props directly to child
return cloneElement(childElement, {
    ref,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    ...getReferenceProps?.({ onClick: ... })
} as any);
```

**Why `as any`**: React 19 types don't recognize `ref` in cloneElement props object, even though it's supported. TypeScript also can't verify props for unknown child components.

### Roving Tabindex Pattern

Only **one** menu item has `tabindex="0"` (the active one), others have `tabindex="-1"`. This enables Arrow Up/Down navigation via `useListNavigation`.

## Breaking Change Alert (AT-174)

**Removed**: `.popupmenu-trigger` wrapper div  
**Impact**: Tests using `container.querySelector(".popupmenu-trigger")` will fail  
**Fix**: Use `getByText("Trigger")` or query the actual trigger element

## Key Files

- **PopupMenu.tsx**: State management (open, activeIndex), context provider
- **PopupTrigger.tsx**: cloneElement pattern, ref merging
- **Menu.tsx**: Roving tabindex, keyboard handlers (Enter/Space)
- **usePopup.ts**: Floating UI integration (click, hover, dismiss, listNavigation)

## Testing Gotchas

1. **Test context wrappers**: `MenuWithContext.tsx` provides PopupContext for isolated Menu tests
2. **Snapshots changed**: No wrapper div around trigger element
3. **ARIA assertions**: Test attributes on the trigger element directly

## Common Issues

**"Trigger is null" in tests**: No `.popupmenu-trigger` class anymore, query actual element  
**TypeScript ref errors**: Add `as any` to cloneElement props object  
**Keyboard nav broken**: Check `listRef` population and `activeIndex` state updates

## References

- [Floating UI Docs](https://floating-ui.com/)
- [ARIA Menu Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/)

---

**Last Updated**: 2026-04-21  
**Last Major Change**: Keyboard accessibility (AT-174) - removed trigger wrapper, added roving tabindex
