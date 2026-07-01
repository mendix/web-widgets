## 1. Type Definition Updates

- [x] 1.1 Update `ConfigurationSection` interface in `src/components/toolbars/ToolbarConfig.ts` to add `"numberInput"` to type union
- [x] 1.2 Add optional fields to `ConfigurationSection` interface: `min?: number`, `max?: number`, `step?: number`, `placeholder?: string`, `unit?: string`
- [x] 1.3 Update `ConfigurationSection` interface in `src/components/toolbars/components/ConfigurationDropdown.tsx` to match the updated type definition
- [x] 1.4 Update `getCurrentValue` return type to allow `string | number | null` instead of just `string | null`

## 2. UI Component Implementation

- [x] 2.1 Add number input rendering case in `ConfigurationDropdown.tsx` after the dropdown case (around line 73)
- [x] 2.2 Create wrapper div with className `configuration-number-input` containing the input, unit label, and clear button
- [x] 2.3 Implement number input with type="number", min/max/step/placeholder props from section config
- [x] 2.4 Implement conditional unit label display using `configuration-unit` className when `section.unit` exists
- [x] 2.5 Implement conditional clear button (×) with `configuration-clear-button` className, shown only when `currentValue !== null`
- [x] 2.6 Wire up onChange handler to call `section.onChange(e.target.value)` on input change
- [x] 2.7 Wire up clear button onClick handler to call `section.onChange("")` to reset to auto width

## 3. Styling

- [x] 3.1 Add `.configuration-number-input` styles in `ConfigurationDropdown.scss` with flex layout and 4px gap
- [x] 3.2 Add `.configuration-input` styles matching `.configuration-select` with padding, borders, transitions, and focus states
- [x] 3.3 Add number input specific styles to hide spinner arrows (`::-webkit-inner-spin-button`, `::-webkit-outer-spin-button`, `-moz-appearance: textfield`)
- [x] 3.4 Add `.configuration-input::placeholder` styles with gray color and italic font
- [x] 3.5 Add `.configuration-unit` styles with 12px font size, gray color, and nowrap
- [x] 3.6 Add `.configuration-clear-button` styles with padding, borders, hover/active states matching the design

## 4. Cell Configuration Logic

- [x] 4.1 Add new configuration section object in `createCellConfigurationSections()` function in `src/components/toolbars/helpers/configurationHelpers.ts` after `cellBorderWidth`
- [x] 4.2 Set section id to `"cellWidth"`, label to `"Column Width"`, type to `"numberInput"`
- [x] 4.3 Set min to 25, max to 1000, step to 1, placeholder to "Auto", unit to "px"
- [x] 4.4 Implement `getCurrentValue` function that calls `getCellAttributes(editor)`, extracts `colwidth` array, and returns `colwidth[0]` or null
- [x] 4.5 Implement `onChange` function that parses input value, validates it, clamps to min/max range, and calls `setCellAttribute("colwidth", [value])` or `setCellAttribute("colwidth", null)` for empty input
- [x] 4.6 Handle edge case where input is empty string by calling `setCellAttribute("colwidth", null)` to reset to auto width
- [x] 4.7 Handle colspan cells by creating colwidth array with single value `[clampedValue]` regardless of colspan

## 5. Testing & Verification

- [x] 5.1 Test setting column width to valid value (e.g., 150px) and verify column resizes
- [x] 5.2 Test clearing column width via clear button and verify column auto-sizes
- [x] 5.3 Test entering value below minimum (e.g., 10) and verify it clamps to 25
- [x] 5.4 Test entering value above maximum (e.g., 2000) and verify it clamps to 1000
- [x] 5.5 Test entering invalid input (e.g., "abc") and verify it's ignored
- [x] 5.6 Test with colspan cell (colspan=3) and verify only first column width is set
- [x] 5.7 Test that width persists after save/reload of document
- [x] 5.8 Test that clear button visibility toggles correctly (hidden when empty, shown when value exists)
- [x] 5.9 Test that placeholder "Auto" displays when input is empty
- [x] 5.10 Test keyboard navigation and accessibility of number input control
