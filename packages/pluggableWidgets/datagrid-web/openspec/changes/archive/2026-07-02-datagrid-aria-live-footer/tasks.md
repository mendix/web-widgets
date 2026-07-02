## 1. Extract Selection Model to Shared Package

- [x] 1.1 Create `packages/shared/widget-plugin-grid/src/core/models/selection.model.ts` with factory functions
- [x] 1.2 Extract `selectedCount` computed atom factory from `select-all.model.ts`
- [x] 1.3 Extract `isAllItemsSelected` computed atom factory from `select-all.model.ts`
- [x] 1.4 Extract `isCurrentPageSelected` computed atom factory from `select-all.model.ts`
- [x] 1.5 Extract `selectionStatus` text logic (handles allSelectedText vs selectedCountText)
- [x] 1.6 Export new model factories from `widget-plugin-grid` main entry point
- [x] 1.7 Update `select-all.model.ts` to use shared selection model factories
- [x] 1.8 Run unit tests for select-all module to verify refactoring

## 2. Create SelectionStatus Component

- [x] 2.1 Create `packages/pluggableWidgets/datagrid-web/src/features/selection-counter/SelectionStatus.tsx` component
- [x] 2.2 Implement status region with `role="status"` attribute
- [x] 2.3 Add visually-hidden CSS class (sr-only) to status region
- [x] 2.4 Use MobX observer to react to selection status changes
- [x] 2.5 Render selection status text using shared selectionStatus logic (handles allSelectedText vs selectedCountText)
- [x] 2.6 Add unit tests for SelectionStatus component

## 3. Set Up Dependency Injection for Status Component

- [x] 3.1 Add token for SelectionStatus component in `src/model/tokens.ts` (DG_TOKENS.selectionStatusVM)
- [x] 3.2 Create injection hook `useSelectionStatusViewModel` in `src/features/selection-counter/injection-hooks.ts`
- [x] 3.3 Bind SelectionStatus ViewModel in container setup
- [x] 3.4 Wire up selectionStatus observable (with allSelectedText logic) from shared selection model

## 4. Integrate Status Region into WidgetFooter

- [x] 4.1 Import SelectionStatus component in `src/components/WidgetFooter.tsx`
- [x] 4.2 Add SelectionStatus component render outside conditional footer visibility logic
- [x] 4.3 Ensure status region renders when selection is enabled (selectionType !== "None")
- [x] 4.4 Verify status region is hidden when selection is disabled

## 5. Add aria-label and Verify Keyboard Accessibility

### Select-All Checkbox (Header)

- [x] 5.1 Locate select-all checkbox in `src/components/CheckboxColumnHeader.tsx`
- [x] 5.2 Add static `aria-label="Select all rows"` attribute to checkbox input
- [x] 5.3 Verify checkbox is keyboard accessible (Tab to focus, Space/Enter to toggle)
- [x] 5.4 Ensure checkbox has visible focus indicator
- [x] 5.5 Update CheckboxColumnHeader tests to verify aria-label presence

### SelectAllBar Buttons

- [x] 5.6 Locate SelectAllBar buttons in `src/features/select-all/SelectAllBar.tsx`
- [x] 5.7 Verify "Select all rows" button is a native `<button>` element (already done)
- [x] 5.8 Verify "Clear selection" button is a native `<button>` element (already done)
- [x] 5.9 Test keyboard navigation: Tab reaches both buttons
- [x] 5.10 Test Space/Enter keys activate both buttons
- [x] 5.11 Verify both buttons have visible focus indicators
- [x] 5.12 Verify logical tab order: checkbox → grid → SelectAllBar buttons

### Verification

- [x] 5.13 Manual test: verify all selection controls work with keyboard only (no mouse)

## 6. Testing and Verification

### Unit Tests

- [x] 6.1 Write unit test: status region renders when selection enabled
- [x] 6.2 Write unit test: status region not rendered when selection disabled
- [x] 6.3 Write unit test: status text updates when selection count changes
- [x] 6.4 Write unit test: status region shows "All X rows selected" when isAllItemsSelected is true
- [x] 6.5 Write unit test: status region shows "Y items selected" when partial selection
- [x] 6.6 Write unit test: status text matches SelectAllBar text (no mismatch)
- [x] 6.7 Write unit test: status region has role="status" attribute
- [x] 6.8 Write unit test: status region is visually hidden
- [x] 6.9 Write unit test: select-all checkbox has aria-label
- [x] 6.10 Write unit test: select-all checkbox is keyboard accessible (tabindex, focus handling)

### E2E Tests (Playwright)

- [x] 6.11 Create E2E test: select-all checkbox has aria-label attribute
- [x] 6.12 Create E2E test: keyboard navigation to select-all checkbox (Tab key)
- [x] 6.13 Create E2E test: Space key toggles select-all checkbox
- [x] 6.14 Create E2E test: Enter key toggles select-all checkbox
- [x] 6.15 Create E2E test: keyboard navigation to "Select all rows" button (Tab key)
- [x] 6.16 Create E2E test: Space/Enter keys activate "Select all rows" button
- [x] 6.17 Create E2E test: keyboard navigation to "Clear selection" button (Tab key)
- [x] 6.18 Create E2E test: Space/Enter keys activate "Clear selection" button
- [x] 6.19 Create E2E test: verify logical tab order (checkbox → grid → SelectAllBar buttons)
- [x] 6.20 Create accessibility snapshot for status region (whole page with aria-live)
- [x] 6.21 Wait for user signal to run E2E tests manually in test project

### Manual Accessibility Testing

- [x] 6.22 Manual test: verify screen reader announces selection changes (NVDA/JAWS/VoiceOver)
- [x] 6.23 Manual test: verify "all items selected" announcement matches visual text
- [x] 6.24 Manual test: verify no announcements when counter hidden but status region working
- [x] 6.25 Manual test: verify select-all checkbox label announced correctly
- [x] 6.26 Manual test: verify keyboard navigation to checkbox works smoothly
- [x] 6.27 Manual test: verify keyboard navigation to SelectAllBar buttons works smoothly
- [x] 6.28 Manual test: verify all selection controls operable with keyboard only (no mouse)
- [x] 6.29 Manual test: verify focus indicators are clearly visible on all controls

## 7. Focus Management and aria-disabled

- [x] 7.1 Replace native `disabled` with `aria-disabled="true"` on SelectAllBar button to prevent focus loss
- [x] 7.2 Add click guard that returns early when `aria-disabled="true"`
- [x] 7.3 Add `aria-disabled` styling (opacity: 0.5, cursor: not-allowed)
- [x] 7.4 Create `src/utils/focus-return.ts` utility for returning focus after selection clear
- [x] 7.5 Implement focus return to select-all checkbox (checkbox grid) on clear
- [x] 7.6 Implement focus return to active cell (no-checkbox grid) on clear
- [x] 7.7 Add focus return to footer "Clear selection" button
- [x] 7.8 Add `aria-live="assertive"` to SelectAllBar button for label change announcement

## 8. Focus Indicators and CSS Cleanup

- [x] 8.1 Remove blanket `.table *:focus { outline: 0 }` rule
- [x] 8.2 Remove unnecessary `&:focus:not(:focus-visible)` workaround on `.column-header`
- [x] 8.3 Add `:focus-visible` outline to `.widget-datagrid-btn-link`

## 9. E2E Tests for Focus Management

- [x] 9.1 Test: Select all button retains focus and changes label to Clear selection
- [x] 9.2 Test: Select all button has `aria-live="assertive"` attribute
- [x] 9.3 Test: Clear selection returns focus to select-all checkbox
- [x] 9.4 Test: No-checkbox grid — clear selection returns focus to active cell
- [x] 9.5 Test: No-checkbox grid — clear after multi-select returns focus to active cell
- [x] 9.6 Test: No-checkbox grid — focus does not fall to body after clear
- [x] 9.7 Test: No-checkbox grid — select all pages then clear returns focus to active cell
- [x] 9.8 Test: No-checkbox grid — Ctrl+A selects all rows and shows select-all bar
- [x] 9.9 Test: Footer clear selection returns focus to select-all checkbox

## 10. Documentation and Cleanup

- [x] 10.1 Add JSDoc comments to SelectionStatus component
- [x] 10.2 Add JSDoc comments to shared selection model factories
- [x] 10.3 Update any relevant inline documentation
- [x] 10.4 Run linter and fix any issues
- [x] 10.5 Verify no TypeScript errors
