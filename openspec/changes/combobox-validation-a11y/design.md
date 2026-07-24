## Context

The combobox widget currently has two accessibility issues affecting screen reader users:

1. **Decorative icons announced as "image"**: The DownArrow and ClearButton SVG icons are exposed to assistive technologies, causing screen readers to announce them as "image" elements. These icons are purely decorative - they duplicate information already conveyed through the combobox role, button roles, and ARIA labels.

2. **Empty menu structure exposed**: When the combobox has no options, the `<ul>` menu element is still rendered in the DOM and exposed to the accessibility tree, creating an empty group that screen reader users can navigate to but provides no value.

**Current Implementation:**

- `icons.tsx`: DownArrow and ClearButton components render SVGs wrapped in `<span className="widget-combobox-icon-container">`
- `ComboboxWrapper.tsx`: Renders the DownArrow inside a container div
- `ComboboxMenuWrapper.tsx`: Always renders the `<ul>` element, showing NoOptionsPlaceholder when empty

**Constraints:**

- Must not affect visual presentation
- Must preserve existing keyboard and mouse interaction behavior
- Must maintain compatibility with existing ARIA attributes (aria-invalid, aria-describedby)

## Goals / Non-Goals

**Goals:**

- Hide decorative icon SVGs from assistive technologies using `aria-hidden="true"`
- Prevent empty menu structures from being exposed to screen readers when no options exist
- Maintain WCAG 2.2 AA compliance
- Preserve all existing functionality and visual design

**Non-Goals:**

- Not changing the validation ARIA attributes (already correctly implemented)
- Not modifying icon visual appearance or interaction behavior
- Not addressing other accessibility improvements beyond these two specific issues

## Decisions

### Decision 1: Add aria-hidden to icon wrapper spans

**Approach:** Add `aria-hidden="true"` to the `<span className="widget-combobox-icon-container">` wrapper in both DownArrow and ClearButton components.

**Rationale:**

- These icons are purely decorative - they reinforce information already available through:
    - DownArrow: The combobox role implies expandability; the actual button has proper ARIA labels
    - ClearButton: The button element has `aria-label` with clear text (from `clearButtonAriaLabel` prop)
- Adding aria-hidden on the wrapper span hides both the span and its SVG child from the accessibility tree
- This is simpler and more maintainable than adding aria-hidden to each SVG element individually

**Alternatives considered:**

- Add aria-hidden directly on SVG elements: More granular but requires changes in multiple places; wrapper approach is cleaner
- Use `role="presentation"`: Less explicit than aria-hidden for hiding decorative content
- Remove icons from DOM when read-only: Overcomplicates the code for minimal benefit

### Decision 2: Conditionally render menu list when empty

**Approach:** In `ComboboxMenuWrapper.tsx`, only render the `<ul>` element when the menu is open AND there are items or loading state. When empty and closed, skip rendering the list structure entirely.

**Rationale:**

- An empty `<ul>` with no `<li>` children creates an empty group/list in the accessibility tree
- Screen readers can navigate to this empty group, providing no value and creating confusion
- Conditional rendering ensures the menu structure only exists when it has meaningful content
- The NoOptionsPlaceholder should still be visible when open but empty (useful for sighted users)

**Implementation approach:**

```tsx
// Only render <ul> when menu is open
{
    isOpen && (
        <ul className="...">
            {isEmpty && !isLoading ? <NoOptionsPlaceholder>{noOptionsText}</NoOptionsPlaceholder> : children}
            {loader}
        </ul>
    );
}
```

**Alternatives considered:**

- Add aria-hidden to empty `<ul>`: Would still render unnecessary DOM elements
- Use `role="presentation"` on empty list: Still exposed to some assistive technologies
- Always render but hide with CSS: Doesn't solve accessibility tree exposure

### Decision 3: Preserve spinner loader accessibility

**Approach:** Keep the SpinnerLoader in `ComboboxWrapper.tsx` accessible (no aria-hidden) as it provides meaningful loading state information.

**Rationale:**

- Unlike the decorative arrow, the spinner indicates an active loading state
- Screen readers should announce loading status to users
- The spinner is already rendered conditionally (`isLoading ? <SpinnerLoader /> : <DownArrow />`)

## Risks / Trade-offs

**[Risk]** Adding aria-hidden might hide icons from assistive technologies that users rely on for spatial navigation
→ **Mitigation:** These icons are purely decorative and duplicate information already available through proper ARIA labels and roles. The underlying button elements remain fully accessible.

**[Risk]** Conditional rendering of `<ul>` might cause layout shifts or affect CSS selectors
→ **Mitigation:** The menu is already hidden when closed via CSS classes. Removing it from DOM when closed won't affect visible behavior. Test thoroughly to ensure no CSS regressions.

**[Risk]** Changes might affect existing E2E tests that query for menu elements when closed
→ **Mitigation:** Review and update E2E tests if they attempt to query closed menu elements. This is actually a test improvement - tests should verify elements exist only when they should be visible.

**[Trade-off]** Slightly more complex conditional rendering logic in ComboboxMenuWrapper
→ **Accepted:** The improvement in accessibility tree cleanliness outweighs the minor complexity increase. The logic is straightforward and well-documented.
