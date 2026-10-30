## 1. Override Tab handler in TableBackgroundColor extension

- [x] 1.1 Add `addKeyboardShortcuts()` to the `Table.extend` block in `src/extensions/TableBackgroundColor.ts`
- [x] 1.2 Capture parent bindings via `const parent = this.parent?.();` and spread `...parent` into the returned object
- [x] 1.3 `Tab`: when `editor.isActive("listItem")` return `false` (yield); else `parent?.Tab?.() ?? false`
- [x] 1.4 `Shift-Tab`: when `editor.isActive("listItem")` return `false` (yield); else `parent?.["Shift-Tab"]?.() ?? false`

## 2. Manual testing

- [ ] 2.1 Table cell, unordered list, 2nd item, Tab → nests into sublist (list-in-list)
- [ ] 2.2 Table cell, ordered list, 2nd item, Tab → nests into sublist
- [ ] 2.3 Table cell, task list, 2nd item, Tab → nests into sublist
- [ ] 2.4 Table cell, nested list item, Shift+Tab → un-nests one level (liftListItem)
- [ ] 2.5 Table cell, 1st list item, Tab → no nest AND cursor does NOT jump to next cell
- [ ] 2.6 Table cell, plain text, Tab → navigates to next cell (unchanged)
- [ ] 2.7 Table last cell, plain text, Tab → adds a new row (unchanged)
- [ ] 2.8 Table cell, plain text, Shift+Tab → navigates to previous cell (unchanged)
- [ ] 2.9 List outside a table, Tab/Shift+Tab → nesting still works (no regression)
- [ ] 2.10 Multiple Tab presses inside a cell list → nest multiple levels

## 3. E2E

- [x] 3.1 Add/extend Playwright spec covering list nesting inside a table cell and cell navigation for non-list content

## 4. Documentation

- [x] 4.1 Add CHANGELOG.md entry: list nesting via Tab/Shift+Tab now works inside table cells
