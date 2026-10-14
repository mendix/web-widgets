## 1. Create OrderedListStyled extension

- [x] 1.1 Create new file `src/extensions/OrderedListStyled.ts`
- [x] 1.2 Extend Tiptap's OrderedList with listStyleType attribute (default: null)
- [x] 1.3 Implement parseHTML to read from inline style or data-list-style attribute
- [x] 1.4 Implement renderHTML to output based on styleDataFormat option (inline vs class mode)
- [x] 1.5 Add setOrderedListStyle command that calls updateAttributes with styleType parameter

## 2. Update Editor to use OrderedListStyled

- [x] 2.1 Import OrderedListStyled extension in Editor.tsx
- [x] 2.2 Configure StarterKit to disable built-in OrderedList extension
- [x] 2.3 Add OrderedListStyled to extensions array with styleDataFormat option from props
- [x] 2.4 Verify ordered list toggle still works (inherited behavior)

## 3. Add toolbar dropdown button

- [x] 3.1 Add orderedListStyle dropdown config to ToolbarConfig.ts in list group
- [x] 3.2 Configure 3 dropdown options: "1, 2, 3" (null), "a, b, c" (lower-alpha), "i, ii, iii" (lower-roman)
- [x] 3.3 Implement getCurrentValue function to read listStyleType from editor.getAttributes('orderedList')
- [x] 3.4 Add canExecute check: only show when editor.isActive('orderedList')
- [x] 3.5 Map dropdown selections to setOrderedListStyle command with correct styleType

## 4. Add CSS override rules

- [x] 4.1 Add manual override rule for ol[data-list-style="lower-alpha"] with cycle offset (children start at lower-roman)
- [x] 4.2 Add manual override rule for ol[data-list-style="lower-roman"] with cycle offset (children start at decimal)
- [x] 4.3 Add manual override rule for ol[data-list-style="decimal"] (optional, for explicit decimal at any level)
- [x] 4.4 Add class mode CSS: .list-style-lower-alpha, .list-style-lower-roman, .list-style-decimal
- [x] 4.5 Verify !important priority works (manual overrides beat auto-cycle rules)

## 5. Manual testing

- [x] 5.1 Test dropdown appears when cursor in ordered list, hidden otherwise
- [x] 5.2 Test create lower-alpha list via dropdown, verify a, b, c numbering
- [x] 5.3 Test create lower-roman list via dropdown, verify i, ii, iii numbering
- [x] 5.4 Test convert decimal list to lower-alpha via dropdown
- [x] 5.5 Test convert lower-alpha list back to decimal (revert to auto-cycle)
- [x] 5.6 Test cycle offset: lower-alpha parent → lower-roman children → decimal grandchildren
- [x] 5.7 Test cycle offset: lower-roman parent → decimal children → lower-alpha grandchildren
- [x] 5.8 Test dropdown checkmark shows on correct option based on current listStyleType
- [x] 5.9 Test inline mode outputs style="list-style-type: ..."
- [x] 5.10 Test class mode outputs data-list-style + class
- [x] 5.11 Test copy-paste preserves manual style attribute

## 6. Documentation

- [x] 6.1 Add entry to CHANGELOG.md describing manual list style override feature (Phase 2)
