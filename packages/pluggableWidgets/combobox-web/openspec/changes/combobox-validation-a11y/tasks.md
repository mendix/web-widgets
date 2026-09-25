## 1. Hide Decorative Icons from Assistive Technologies

- [x] 1.1 Add `aria-hidden="true"` to DownArrow icon wrapper span in `src/assets/icons.tsx`
- [x] 1.2 Add `aria-hidden="true"` to ClearButton icon wrapper span in `src/assets/icons.tsx`
- [x] 1.3 Verify SpinnerLoader does NOT have aria-hidden (should remain accessible)
- [x] 1.4 Verify clear button parent elements retain their aria-label attributes

## 2. Prevent Empty Menu Structure Exposure

- [x] 2.1 Modify `ComboboxMenuWrapper.tsx` to conditionally render `<ul>` only when `isOpen` is true
- [x] 2.2 Ensure NoOptionsPlaceholder still renders when menu is open but empty
- [x] 2.3 Ensure loader element renders when menu is open and loading
- [x] 2.4 Verify menu header and footer render only when menu is open

## 3. Unit Tests

- [x] 3.1 Add test for DownArrow having aria-hidden="true" on wrapper span
- [x] 3.2 Add test for ClearButton having aria-hidden="true" on wrapper span
- [x] 3.3 Add test that menu `<ul>` is not in DOM when closed
- [x] 3.4 Add test that menu `<ul>` is in DOM when open with items
- [x] 3.5 Add test that menu `<ul>` is in DOM when open but empty (with NoOptionsPlaceholder)
- [x] 3.6 Add test that SpinnerLoader does not have aria-hidden
- [x] 3.7 Verify existing aria-invalid and aria-describedby tests still pass

## 4. E2E Tests

- [x] 4.1 Review existing E2E tests for queries on closed menu elements
- [x] 4.2 Update E2E tests if they expect menu DOM elements when closed
- [x] 4.3 Add E2E test verifying menu appears only when opened

## 5. Manual Accessibility Testing

- [x] 5.1 Test with screen reader (NVDA/JAWS/VoiceOver) - verify no "image" announcements for decorative icons
- [x] 5.2 Test with screen reader - verify no empty group navigation when menu is closed
- [x] 5.3 Test with screen reader - verify clear button announces with proper label
- [x] 5.4 Verify keyboard navigation still works (Tab, Enter, Arrow keys)
- [x] 5.5 Verify visual appearance unchanged for sighted users

## 6. Final Verification

- [x] 6.1 Verify existing validation ARIA attributes (aria-invalid, aria-describedby) still function
- [x] 6.2 Run full test suite for combobox widget
- [x] 6.3 Test both single and multi-selection modes
- [x] 6.4 Test with different data sources (static, association, database)
