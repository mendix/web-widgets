## Context

The DataGrid widget currently lacks screen reader feedback for row selection changes and the select-all checkbox lacks a descriptive label. When users select or deselect rows, there is no announcement to assistive technology users. Additionally, the select-all checkbox in the header has no accessible name, forcing screen readers to announce it generically as "checkbox" without context.

The selection counter component exists but is purely visual. It renders in the footer when enabled, but screen readers have no programmatic way to detect selection state changes without manually navigating to the counter.

The DataGrid uses a dependency injection system (brandi) with tokens defined in `src/model/tokens.ts` and features injected via hooks. The `WidgetFooter` component renders pagination, load-more buttons, and the selection counter in a flex layout. The select-all checkbox is rendered in the header, likely in a component that handles column headers or selection controls.

## Goals / Non-Goals

**Goals:**
- Add status region (`role="status"`) that announces selection count changes to screen readers per WCAG 4.1.3
- Place the status region in the footer, separate from the visual counter, so announcements work even when the counter is hidden
- Add `aria-label` to the select-all checkbox in the header to provide context to screen reader users
- Extract reusable selection logic from `select-all` module to `widget-plugin-grid` for use by both select-all and the new status component
- Ensure announcements are concise, atomic (complete messages), and don't spam screen readers

**Non-Goals:**
- Modifying the existing visual selection counter UI or checkbox appearance
- Adding aria-live announcements for other grid events (sorting, filtering, pagination)
- Changing the selection behavior or API
- Adding dynamic aria-label that changes based on selection state (keep it simple)

## Decisions

### 1. Place aria-live region in WidgetFooter

**Decision:** Render the `SelectionAriaLive` component in `WidgetFooter.tsx`, outside the conditional `<If>` that controls the visual counter visibility.

**Why:** The aria-live region must always be present in the DOM when selection is enabled, even if the visual counter is hidden. Screen readers ignore DOM mutations to aria-live regions that are added/removed dynamically. By placing it in the footer unconditionally, we ensure announcements work regardless of the `selectionCounterPosition` prop.

**Alternatives considered:**
- Render inside `SelectionCounter` component → rejected because the counter is conditionally rendered based on position (top/bottom/off)
- Render in widget root → rejected because it would be far from the visual counter semantically, and the footer already controls selection-related UI

### 2. Extract selection model to widget-plugin-grid

**Decision:** Create `packages/shared/widget-plugin-grid/src/core/models/selection.model.ts` with factories for `selectedCount`, `isAllItemsSelected`, and `isCurrentPageSelected` computed atoms. Also extract the `selectionStatus` text logic that handles the "all items selected" case.

**Why:** The select-all module already computes these values in `select-all.model.ts`, but they are tightly coupled to the select-all feature. The status region needs the same selection state AND the same text logic without depending on select-all (which is optional). Extracting to a shared model allows both features to reuse the same logic.

**Critical:** The status region must use the same text logic as `selectAllTextsStore.selectionStatus`, which returns:
- `allSelectedText` when `isAllItemsSelected` is true ("All 100 rows selected.")
- `selectedCountText` otherwise ("50 items selected")

Without this, the status region would announce "100 items selected" when the visual SelectAllBar shows "All 100 rows selected", causing a mismatch.

**Alternatives considered:**
- Duplicate logic in selection-counter feature → rejected to avoid divergence and maintenance burden
- Make aria-live depend on select-all → rejected because select-all is an optional feature
- Only use `selectedCountText` → rejected, misses "all items selected" case

### 3. Use role="status" for announcements

**Decision:** Use `role="status"` rather than explicit `aria-live="polite"`.

**Why:** Per WCAG 4.1.3 (Status Messages), selection count changes qualify as status messages (providing information on action results without causing a change of context). The `role="status"` is semantically correct and implicitly provides `aria-live="polite"` and `aria-atomic="true"`, ensuring:
- Screen readers announce the entire message ("3 items selected") not just the number
- Announcements are polite (non-interrupting)
- The semantic role conveys intent more clearly than just aria-live

**Alternatives considered:**
- `aria-live="polite"` alone → less semantic, requires explicit `aria-atomic="true"`
- `role="alert"` → rejected, reserved for urgent warnings/errors per WCAG guidance

### 4. Only announce when selection count changes

**Decision:** The aria-live region updates only when `selectedCount` changes, using MobX reactivity.

**Why:** We avoid redundant announcements (e.g., when the grid re-renders for other reasons). The computed atom for `selectedCount` ensures the announcement text only changes when the actual count changes.

### 5. Status region uses selectionStatus logic, not just selectedCountText

**Decision:** The status region must read from `selectionStatus` (which handles the "all items selected" case), not directly from `selectedCountText`.

**Why:** This prevents the mismatch bug found in code review: if the status region only reads `selectedCountText`, it would announce "100 items selected" even when `isAllItemsSelected` is true and the visual SelectAllBar shows "All 100 rows selected." The `selectionStatus` logic correctly returns:
- `allSelectedText` when all items across pages are selected
- `selectedCountText` otherwise (partial selection)

**Implementation:** Extract the `selectionStatus` computed property from `selectAllTextsStore` into the shared selection model so both the SelectAllBar and the status region use the same logic.

**Alternatives considered:**
- Read only `selectedCountText` → rejected, causes announcement/visual mismatch
- Duplicate the logic in status component → rejected, violates DRY and risks divergence

### 6. Add static aria-label to select-all checkbox

**Decision:** Add a static `aria-label="Select all rows"` to the select-all checkbox, without dynamic updates based on selection state.

**Why:** The checkbox already conveys its checked state through the native `checked` attribute, which screen readers announce automatically. The aria-label only needs to identify the purpose of the checkbox. Adding dynamic text (e.g., "Deselect all rows") would be redundant since screen readers already say "checked" or "not checked."

**Alternatives considered:**
- Dynamic aria-label that changes between "Select all" and "Deselect all" → rejected as redundant with native checkbox state
- Make the text configurable via widget XML property → deferred for now (can add later if localization is needed)

### 7. Ensure all selection controls are keyboard accessible

**Decision:** Verify that all selection controls are fully keyboard accessible with proper focus management and keyboard interaction patterns.

**Why:** Per WCAG 2.1.1 (Keyboard), all functionality must be operable through keyboard. There are three selection controls that must be keyboard accessible:
1. **Select-all checkbox** (header) - selects current page rows
2. **"Select all rows" button** (SelectAllBar) - selects across all pages
3. **"Clear selection" button** (SelectAllBar) - clears all selections

**Requirements for checkbox:**
- Checkbox is in the tab order (not `tabindex="-1"` unless part of roving tabindex pattern)
- Space key toggles the checkbox state
- Enter key also works for activation (browser default)
- Focus indicator is clearly visible
- Works with grid keyboard navigation (if applicable)

**Requirements for SelectAllBar buttons:**
- Buttons are native `<button>` elements (inherently keyboard accessible)
- Both are in the tab order
- Enter/Space keys activate the buttons (browser default)
- Focus indicators are clearly visible
- No `disabled` attribute unless functionally disabled

**Verification:**
- Manual keyboard testing (Tab through all controls, Space/Enter to activate)
- E2E tests covering keyboard interaction with checkbox and buttons
- Verify tab order: checkbox → other grid controls → SelectAllBar buttons

## Risks / Trade-offs

**[Risk: Announcement spam with rapid selection changes]**
→ Mitigation: Using `role="status"` (polite announcements) naturally debounces rapid changes — screen readers batch polite announcements and may skip intermediate states

**[Risk: Status region not detected if added/removed dynamically]**
→ Mitigation: Render the region in `WidgetFooter` outside conditional logic, so it's always in the DOM when selection is enabled. WCAG guidance confirms status regions must be present before content changes.

**[Risk: Partial announcements if aria-atomic not set]**
→ Mitigation: `role="status"` implicitly sets `aria-atomic="true"`, ensuring screen readers announce the entire message ("3 items selected") rather than just the changed number

**[Trade-off: Duplication of selection count text]**
The status region duplicates the text shown in the visual counter. This is necessary because:
- The visual counter may be hidden (`position: "off"`)
- Screen readers need the count in a status region, not just visually rendered text
- WCAG 4.1.3 requires status messages to be programmatically determinable through role or properties
→ Acceptable trade-off for accessibility compliance

**[Trade-off: Extracting selection model adds indirection]**
Moving selection logic to `widget-plugin-grid` adds a layer of abstraction. However, this is consistent with the existing pattern (select-all feature is already in `widget-plugin-grid`), and the logic is now reusable across multiple features.
