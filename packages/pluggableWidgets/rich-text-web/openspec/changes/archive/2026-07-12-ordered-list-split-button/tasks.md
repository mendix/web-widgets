# Implementation Tasks

## 1. Type and Config Updates

- [x] 1.1 Add `icon?: string` field to `ToolbarDropdownOption` interface in `ToolbarConfig.ts`
- [x] 1.2 Add `"splitButton"` to `ToolbarActionType` union type in `ToolbarConfig.ts`
- [x] 1.3 Create `listHelpers.ts` with `getIconForOrderedListStyle()` function and `STYLE_ICON_MAP` constant

## 2. Toolbar Configuration Changes

- [x] 2.1 Update `orderedList` button config in `TOOLBAR_GROUPS` to use `action: "splitButton"`
- [x] 2.2 Add `dropdownOptions` array to `orderedList` config with decimal, lower-alpha, lower-roman options
- [x] 2.3 Add `icon` field to each dropdown option (List-numbers, List-lower-alpha, List-roman)
- [x] 2.4 Add `getCurrentValue` function to `orderedList` config to return active style
- [x] 2.5 Remove standalone `orderedListStyle` button from list group buttons array

## 3. ToolbarSplitButton Component

- [x] 3.1 Create `ToolbarSplitButton.tsx` component file with props interface
- [x] 3.2 Add module-level `lastOrderedListStyle` sticky state variable
- [x] 3.3 Implement `getCurrentIcon()` helper function using active/sticky state
- [x] 3.4 Add component state: `isDropdownOpen`, `focusedPart` with refs for both buttons
- [x] 3.5 Implement `useDropdown` hook integration for floating menu positioning
- [x] 3.6 Add `useEffect` to re-render on editor `selectionUpdate` and `transaction` events

## 4. Split Button Event Handlers

- [x] 4.1 Implement `handleMainClick()` to toggle OL with sticky style when inactive, disable when active
- [x] 4.2 Implement `handleDropdownClick()` to toggle dropdown open/closed state
- [x] 4.3 Implement `handleOptionSelect()` to update sticky state, apply style, enable OL if needed, close dropdown
- [x] 4.4 Implement `handleKeyDown()` with ArrowRight/Left focus movement between buttons
- [x] 4.5 Add ArrowDown handling to open dropdown from either button
- [x] 4.6 Add Enter/Space handling to execute focused part's action

## 5. Split Button Render

- [x] 5.1 Render container div with `role="group"` and `aria-label`
- [x] 5.2 Render main button with dynamic icon, `aria-pressed`, and click/keydown handlers
- [x] 5.3 Render dropdown button with chevron icon, `aria-expanded`, `aria-haspopup="menu"`
- [x] 5.4 Conditionally render dropdown menu with Floating UI positioning when open
- [x] 5.5 Render dropdown options with icon + text, `role="menuitem"`, active class
- [x] 5.6 Apply `is-active` class to split button container when OL active

## 6. Toolbar Factory Integration

- [x] 6.1 Import `ToolbarSplitButton` component in `Toolbar.tsx`
- [x] 6.2 Add `case "splitButton"` to `ToolbarButtonFactory` switch statement
- [x] 6.3 Return `<ToolbarSplitButton key={button.name} config={button} />` in split button case

## 7. Dropdown Option Icon Support

- [x] 7.1 Update `ToolbarDropdown.tsx` to conditionally render icon if `option.icon` present
- [x] 7.2 Update dropdown item layout to support icon + text (flex with gap)

## 8. SCSS Styling

- [x] 8.1 Add `.split-button` base styles with inline-flex layout in `Toolbar.scss`
- [x] 8.2 Add `.split-button-main` styles with border-right separator
- [x] 8.3 Add `.split-button-dropdown` styles with chevron rotation on `aria-expanded="true"`
- [x] 8.4 Add `.split-button.is-active` styles for active state highlighting
- [x] 8.5 Add focus indicator styles for both button parts (`:focus-visible`)
- [x] 8.6 Update `.toolbar-dropdown-item` to support icon + text layout (flex with gap)
- [x] 8.7 Add hover states for main and dropdown buttons

## 9. Unit Tests

- [ ] 9.1 Create `orderedListSplitButton.spec.tsx` test file
- [ ] 9.2 Test: Split button renders with both parts and correct icons
- [ ] 9.3 Test: Main button click toggles OL with sticky style when inactive
- [ ] 9.4 Test: Main button click disables OL when active
- [ ] 9.5 Test: Dropdown button opens/closes menu
- [ ] 9.6 Test: Dropdown option selection updates sticky state and applies style
- [ ] 9.7 Test: Dropdown option enables OL + applies style when inactive
- [ ] 9.8 Test: Dropdown option only changes style when active
- [ ] 9.9 Test: Icon updates based on active style
- [ ] 9.10 Test: Icon shows sticky state when inactive
- [ ] 9.11 Test: Sticky state persists after toggle off/on
- [ ] 9.12 Test: Keyboard ArrowRight/Left moves focus between buttons
- [ ] 9.13 Test: Keyboard ArrowDown opens dropdown
- [ ] 9.14 Test: ARIA attributes (role, aria-pressed, aria-expanded, aria-haspopup)

## 10. E2E Test

- [ ] 10.1 Create `orderedListSplitButton.spec.js` E2E test file
- [ ] 10.2 Test: Click dropdown, select lower-alpha, verify OL enabled with a,b,c style
- [ ] 10.3 Test: Toggle off via main button, verify OL disabled
- [ ] 10.4 Test: Click main button, verify OL re-enabled with lower-alpha (sticky)
- [ ] 10.5 Test: Open dropdown, select lower-roman, verify icon updates
- [ ] 10.6 Test: Verify dropdown accessible when OL inactive

## 11. Manual Verification

- [ ] 11.1 Test on desktop: Click workflow, keyboard navigation, icon updates
- [ ] 11.2 Test on mobile/tablet: Touch targets adequate (56px combined width)
- [ ] 11.3 Test screen reader: ARIA announcements for button states
- [ ] 11.4 Test with multiple editor instances (if available): Verify sticky state behavior
- [ ] 11.5 Verify visual match to Word split button pattern
