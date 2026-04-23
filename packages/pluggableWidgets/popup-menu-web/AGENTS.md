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

### ARIA Attributes via DOM Manipulation

ARIA attributes (`aria-haspopup`, `aria-expanded`) must be on the **actual interactive element** (button/link) for screen reader compatibility, not the wrapper div.

**Problem**: Mendix widgets don't forward arbitrary props, so we can't pass ARIA attributes through React props.

**Solution**: Use `useEffect` + DOM query to find and enhance the interactive element:

```tsx
useEffect(() => {
    const interactiveElement = innerRef.current?.querySelector<HTMLElement>("button, a, [role='button'], input");

    if (interactiveElement) {
        interactiveElement.setAttribute("aria-haspopup", "menu");
        interactiveElement.setAttribute("aria-expanded", String(open));
    }
}, [open]);
```

**Why wrapper remains**: Backwards compatibility - `.popupmenu-trigger` class preserved for custom styling and Floating UI refs.  
**Why DOM manipulation**: More robust than `cloneElement` - works with any Mendix widget child structure.

### Roving Tabindex Pattern

Only **one** menu item has `tabindex="0"` (the active one), others have `tabindex="-1"`. This enables Arrow Up/Down navigation via `useListNavigation`.

## Implementation Notes (AT-174)

**Wrapper preserved**: `.popupmenu-trigger` wrapper div kept for backwards compatibility  
**ARIA placement**: Applied to first interactive child element (button/link) via DOM manipulation  
**No breaking changes**: Custom styles targeting `.popupmenu-trigger` continue to work  
**Floating UI integration**: `useListNavigation`, `useRole`, `useDismiss` for full keyboard support

## Key Files

- **PopupMenu.tsx**: State management (open, activeIndex), context provider
- **PopupTrigger.tsx**: DOM manipulation for ARIA attributes, ref merging
- **Menu.tsx**: Roving tabindex, keyboard handlers (Enter/Space), `getItemProps` integration
- **usePopup.ts**: Floating UI integration (click, hover, dismiss, listNavigation)

## Testing Gotchas

1. **Test context wrappers**: `MenuWithContext.tsx` provides PopupContext for isolated Menu tests
2. **ARIA assertions**: Attributes are on the button element inside `.popupmenu-trigger`, not the wrapper
3. **E2E keyboard tests**: Use `page.keyboard.press()` for arrow navigation, check tabindex changes

## Common Issues

**ARIA attributes not applied**: Check that child widget renders an interactive element (button/a/input)  
**Keyboard nav broken**: Verify `listRef` is populated and `activeIndex` updates on arrow keys  
**Focus not visible**: Ensure `FloatingFocusManager` wraps menu and items have proper tabindex

## References

- [Floating UI Docs](https://floating-ui.com/)
- [ARIA Menu Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/)

---

**Last Updated**: 2026-04-23  
**Last Major Change**: Keyboard accessibility (AT-174) - DOM-based ARIA attributes, roving tabindex, full arrow key navigation
