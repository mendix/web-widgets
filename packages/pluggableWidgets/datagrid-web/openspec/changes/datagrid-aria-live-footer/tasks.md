## 1. Extract Selection Model to Shared Package

- [ ] 1.1 Create `packages/shared/widget-plugin-grid/src/core/models/selection.model.ts` with factory functions
- [ ] 1.2 Extract `selectedCount` computed atom factory from `select-all.model.ts`
- [ ] 1.3 Extract `isAllItemsSelected` computed atom factory from `select-all.model.ts`
- [ ] 1.4 Extract `isCurrentPageSelected` computed atom factory from `select-all.model.ts`
- [ ] 1.5 Extract `selectionStatus` text logic (handles allSelectedText vs selectedCountText)
- [ ] 1.6 Export new model factories from `widget-plugin-grid` main entry point
- [ ] 1.7 Update `select-all.model.ts` to use shared selection model factories
- [ ] 1.8 Run unit tests for select-all module to verify refactoring

## 2. Create SelectionStatus Component

- [ ] 2.1 Create `packages/pluggableWidgets/datagrid-web/src/features/selection-counter/SelectionStatus.tsx` component
- [ ] 2.2 Implement status region with `role="status"` attribute
- [ ] 2.3 Add visually-hidden CSS class (sr-only) to status region
- [ ] 2.4 Use MobX observer to react to selection status changes
- [ ] 2.5 Render selection status text using shared selectionStatus logic (handles allSelectedText vs selectedCountText)
- [ ] 2.6 Add unit tests for SelectionStatus component

## 3. Set Up Dependency Injection for Status Component

- [ ] 3.1 Add token for SelectionStatus component in `src/model/tokens.ts` (DG_TOKENS.selectionStatusVM)
- [ ] 3.2 Create injection hook `useSelectionStatusViewModel` in `src/features/selection-counter/injection-hooks.ts`
- [ ] 3.3 Bind SelectionStatus ViewModel in container setup
- [ ] 3.4 Wire up selectionStatus observable (with allSelectedText logic) from shared selection model

## 4. Integrate Status Region into WidgetFooter

- [ ] 4.1 Import SelectionStatus component in `src/components/WidgetFooter.tsx`
- [ ] 4.2 Add SelectionStatus component render outside conditional footer visibility logic
- [ ] 4.3 Ensure status region renders when selection is enabled (selectionType !== "None")
- [ ] 4.4 Verify status region is hidden when selection is disabled

## 5. Add aria-label and Verify Keyboard Accessibility

### Select-All Checkbox (Header)

- [ ] 5.1 Locate select-all checkbox in `src/components/CheckboxColumnHeader.tsx`
- [ ] 5.2 Add static `aria-label="Select all rows"` attribute to checkbox input
- [ ] 5.3 Verify checkbox is keyboard accessible (Tab to focus, Space/Enter to toggle)
- [ ] 5.4 Ensure checkbox has visible focus indicator
- [ ] 5.5 Update CheckboxColumnHeader tests to verify aria-label presence

### SelectAllBar Buttons

- [ ] 5.6 Locate SelectAllBar buttons in `src/features/select-all/SelectAllBar.tsx`
- [ ] 5.7 Verify "Select all rows" button is a native `<button>` element (already done)
- [ ] 5.8 Verify "Clear selection" button is a native `<button>` element (already done)
- [ ] 5.9 Test keyboard navigation: Tab reaches both buttons
- [ ] 5.10 Test Space/Enter keys activate both buttons
- [ ] 5.11 Verify both buttons have visible focus indicators
- [ ] 5.12 Verify logical tab order: checkbox → grid → SelectAllBar buttons

### Verification

- [ ] 5.13 Manual test: verify all selection controls work with keyboard only (no mouse)

## 6. Testing and Verification

### Unit Tests

- [ ] 6.1 Write unit test: status region renders when selection enabled
- [ ] 6.2 Write unit test: status region not rendered when selection disabled
- [ ] 6.3 Write unit test: status text updates when selection count changes
- [ ] 6.4 Write unit test: status region shows "All X rows selected" when isAllItemsSelected is true
- [ ] 6.5 Write unit test: status region shows "Y items selected" when partial selection
- [ ] 6.6 Write unit test: status text matches SelectAllBar text (no mismatch)
- [ ] 6.7 Write unit test: status region has role="status" attribute
- [ ] 6.8 Write unit test: status region is visually hidden
- [ ] 6.9 Write unit test: select-all checkbox has aria-label
- [ ] 6.10 Write unit test: select-all checkbox is keyboard accessible (tabindex, focus handling)

### E2E Tests (Playwright)

- [ ] 6.11 Create E2E test: select-all checkbox has aria-label attribute
- [ ] 6.12 Create E2E test: keyboard navigation to select-all checkbox (Tab key)
- [ ] 6.13 Create E2E test: Space key toggles select-all checkbox
- [ ] 6.14 Create E2E test: Enter key toggles select-all checkbox
- [ ] 6.15 Create E2E test: keyboard navigation to "Select all rows" button (Tab key)
- [ ] 6.16 Create E2E test: Space/Enter keys activate "Select all rows" button
- [ ] 6.17 Create E2E test: keyboard navigation to "Clear selection" button (Tab key)
- [ ] 6.18 Create E2E test: Space/Enter keys activate "Clear selection" button
- [ ] 6.19 Create E2E test: verify logical tab order (checkbox → grid → SelectAllBar buttons)
- [ ] 6.20 Create accessibility snapshot for status region (whole page with aria-live)
- [ ] 6.21 Wait for user signal to run E2E tests manually in test project

### Manual Accessibility Testing

- [ ] 6.22 Manual test: verify screen reader announces selection changes (NVDA/JAWS/VoiceOver)
- [ ] 6.23 Manual test: verify "all items selected" announcement matches visual text
- [ ] 6.24 Manual test: verify no announcements when counter hidden but status region working
- [ ] 6.25 Manual test: verify select-all checkbox label announced correctly
- [ ] 6.26 Manual test: verify keyboard navigation to checkbox works smoothly
- [ ] 6.27 Manual test: verify keyboard navigation to SelectAllBar buttons works smoothly
- [ ] 6.28 Manual test: verify all selection controls operable with keyboard only (no mouse)
- [ ] 6.29 Manual test: verify focus indicators are clearly visible on all controls

## 7. Documentation and Cleanup

- [ ] 7.1 Add JSDoc comments to SelectionStatus component
- [ ] 7.2 Add JSDoc comments to shared selection model factories
- [ ] 7.3 Update any relevant inline documentation
- [ ] 7.4 Run linter and fix any issues
- [ ] 7.5 Verify no TypeScript errors
