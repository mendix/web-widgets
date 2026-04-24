# Tooltip Widget - Agent Context Guide

**Purpose:** This document provides AI agents with essential context for working on the Mendix Tooltip widget.

## Widget Overview

The Tooltip widget displays contextual information when users interact with trigger elements. It supports:

- Multiple trigger modes: hover, click, hover+focus
- Text or custom HTML content
- Multiple positioning options with floating-ui
- Full accessibility via screen reader support

**Key Files:**

- `src/components/Tooltip.tsx` - Main component with accessibility logic
- `src/utils/useFloatingUI.ts` - Floating-ui integration for positioning
- `src/ui/Tooltip.scss` - Styles including sr-only class
- `tooltip-accessibility-implementation.md` - Complete implementation guide
- `aria-live-vs-aria-describedby-analysis.md` - ARIA pattern decision rationale

## Critical Architecture Decisions

### 1. Dual-Content Pattern (DO NOT REMOVE)

The widget renders tooltip content TWICE for accessibility:

```tsx
{
    /* Sr-only: Always in DOM for screen readers */
}
<div id={contentId} className="sr-only" aria-hidden="true">
    {content}
</div>;

{
    /* Visual: Conditionally rendered for sighted users */
}
{
    showTooltip && <div className="widget-tooltip-content">{content}</div>;
}
```

**Why:** Screen readers need content to be in DOM before interaction, but visual tooltip appears on-demand.

**DO NOT:**

- ❌ Remove sr-only content (breaks screen reader support)
- ❌ Use only `aria-live` (wrong pattern, see aria-live-vs-aria-describedby-analysis.md)
- ❌ Try to conditionally render sr-only content (defeats its purpose)

### 2. DOM Manipulation for aria-describedby (REQUIRED)

We use `useEffect` + `querySelectorAll` to apply `aria-describedby`:

```tsx
useEffect(() => {
    const focusableElements = triggerWrapperRef.current.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusableElements.forEach(element => {
        element.setAttribute("aria-describedby", contentId);
    });
}, [hasTooltipContent, contentId]);
```

**Why:** Trigger can be ANY Mendix widget (ActionButton, custom components). We can't use `cloneElement` because we don't control the widget's internals.

**DO NOT:**

- ❌ Try to use `cloneElement` to pass props to trigger (doesn't work with complex components)
- ❌ Apply `aria-describedby` to wrapper div (doesn't inherit to focusable children)
- ❌ Target only first focusable element (must handle multiple buttons/links)

### 3. Floating-UI Integration

Uses `@floating-ui/react` for positioning with these hooks:

- `useFloating` - position calculation
- `useHover`, `useFocus`, `useClick` - interaction modes
- `useRole` - sets `role="tooltip"` on visible tooltip
- `useDismiss` - handles outside clicks and escape key

**DO NOT:**

- ❌ Remove floating-ui integration (positioning will break)
- ❌ Modify `useRole` to set custom IDs (we override aria-describedby manually)

## Common Tasks

### Adding a New Trigger Mode

1. Add enum value to `OpenOnEnum` in typings
2. Update `useFloatingUI.ts` to add new interaction hook
3. Add tests in `Tooltip.spec.tsx`
4. Update XML with new enum value

### Modifying Tooltip Content Rendering

**CRITICAL:** Always maintain dual rendering (sr-only + visual).

```tsx
// ✅ Correct: Both elements get the same content
const content = renderMethod === "text" ? textMessage : htmlMessage;

<div className="sr-only">{content}</div>;
{
    showTooltip && <div className="widget-tooltip-content">{content}</div>;
}

// ❌ Wrong: Different content or conditional sr-only
{
    showTooltip && <div className="sr-only">{content}</div>;
} // NO!
```

### Styling Changes

- Visual tooltip styles: `.widget-tooltip-content` in `Tooltip.scss`
- Sr-only styles: `.sr-only` class (DO NOT MODIFY - standard pattern)
- Trigger wrapper: `.widget-tooltip-trigger`

**DO NOT:**

- ❌ Remove or modify `.sr-only` class (breaks accessibility)
- ❌ Add `display: none` or `visibility: hidden` to sr-only (screen readers won't read it)

## Accessibility Requirements (NON-NEGOTIABLE)

### Must Maintain

1. **Sr-only content always in DOM** with `aria-hidden="true"`
2. **All focusable elements** get `aria-describedby` (not just first)
3. **useId() for stable IDs** across renders
4. **Clean up aria-describedby** in useEffect return

### Testing Checklist

Before any commit affecting accessibility:

```bash
cd packages/pluggableWidgets/tooltip-web
pnpm run test  # Must pass all 7 accessibility tests
```

**Required tests:**

- ✅ aria-describedby on trigger element
- ✅ Sr-only content always in DOM
- ✅ Content matches (text and HTML)
- ✅ No aria-describedby when no content
- ✅ Multiple focusable elements all get aria-describedby

### Screen Reader Testing

If changing accessibility logic, manually test with:

- **NVDA** (Windows + Firefox/Chrome)
- **VoiceOver** (macOS + Safari)

**Expected behavior:**

1. Tab to trigger → Announces: "Button, [tooltip text]"
2. Browse mode → Sr-only div NOT reachable
3. Multiple triggers → Each announces tooltip text

## Common Pitfalls

### ❌ Anti-Pattern: Removing Duplication

```tsx
// WRONG: Trying to DRY by removing sr-only
{
    showTooltip ? <div role="tooltip">{content}</div> : <div className="sr-only">{content}</div>;
}
```

**Problem:** Sr-only must ALWAYS be in DOM, not conditionally rendered.

### ❌ Anti-Pattern: Using aria-live

```tsx
// WRONG: Trying to use aria-live instead of aria-describedby
<div role="tooltip" aria-live="polite">
    {content}
</div>
```

**Problem:** See `aria-live-vs-aria-describedby-analysis.md` for detailed explanation. Short version: wrong pattern, causes interruptions, doesn't work with all trigger modes.

### ❌ Anti-Pattern: Simplifying Query Selector

```tsx
// WRONG: Only finding first element
const focusableElement = wrapper.querySelector("button");
focusableElement.setAttribute("aria-describedby", id);
```

**Problem:** Trigger can contain multiple buttons. Must use `querySelectorAll` and loop.

## Debugging Tips

### Issue: Screen reader not announcing tooltip

**Check:**

1. Does trigger element have `aria-describedby` attribute? (inspect DOM)
2. Does `aria-describedby` value match sr-only div's `id`?
3. Is sr-only div in DOM? (should always be present)
4. Does sr-only div have `aria-hidden="true"`?

**Common causes:**

- useEffect not running (check dependencies)
- querySelector not finding elements (check selector)
- Content ID mismatch (check useId() value)

### Issue: Tooltip not appearing visually

**Check:**

1. Is `showTooltip` state true? (React DevTools)
2. Are floating-ui refs attached? (check `refs.setReference`, `refs.setFloating`)
3. Is `getReferenceProps` spread correctly?
4. Check browser console for floating-ui errors

**Common causes:**

- Trigger wrapper missing ref
- OpenOn mode not matching user interaction
- Floating-ui middleware error

## References

### Detailed Documentation

- **`tooltip-accessibility-implementation.md`** - Complete implementation guide
    - Problem statement and root cause
    - Solution architecture with code walkthroughs
    - WCAG compliance details
    - Browser/screen reader compatibility
    - Testing recommendations

- **`aria-live-vs-aria-describedby-analysis.md`** - Why we chose aria-describedby
    - Detailed comparison of approaches
    - Limitations of aria-live for tooltips
    - Industry standards (GitHub, Bootstrap, Material-UI)
    - Real-world testing results

### External Resources

- [ARIA 1.2 - aria-describedby](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby)
- [Floating UI - Tooltip](https://floating-ui.com/docs/tooltip)
- [WCAG 2.1 - 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html)

## Quick Decision Tree

**"Should I modify the sr-only content rendering?"**
→ Only if also modifying visual tooltip. Keep them in sync.

**"Can I remove the DOM manipulation useEffect?"**
→ No. Required for complex trigger components.

**"Should I switch to aria-live?"**
→ No. Read `aria-live-vs-aria-describedby-analysis.md` first.

**"Can I optimize by caching querySelector results?"**
→ No. Elements can change between renders.

**"Should I apply aria-describedby to the wrapper instead?"**
→ No. Focusable elements inside need the attribute directly.

## Version History

See `CHANGELOG.md` for release notes.

**Current Status:**

- ✅ Screen reader accessible (aria-describedby pattern)
- ✅ Supports multiple focusable elements
- ✅ Works with all trigger modes
- ✅ WCAG 2.1 Level A compliant
- ✅ Compatible with all modern browsers + screen readers

## Code Review Checklist

Before approving changes to this widget:

- [ ] Sr-only content still always in DOM
- [ ] All focusable elements get aria-describedby (not just first)
- [ ] useEffect cleanup removes aria-describedby
- [ ] All 7 accessibility tests pass
- [ ] No use of aria-live for tooltip content
- [ ] floating-ui integration intact
- [ ] CHANGELOG.md updated for user-facing changes

## Emergency Contacts

If you need to make changes but are unsure:

1. Read `tooltip-accessibility-implementation.md` (comprehensive guide)
2. Check `aria-live-vs-aria-describedby-analysis.md` (explains key decisions)
3. Run tests: `cd packages/pluggableWidgets/tooltip-web && pnpm run test`
4. Test manually with screen reader if accessibility affected

**Remember:** This widget's complexity is justified by accessibility requirements. Simplifications often break screen reader support.
