## 1. Modify Tab handler in Indent extension

- [x] 1.1 Add list item detection in handleKeyDown (check `editor.isActive('listItem')`)
- [x] 1.2 When in list item and Shift+Tab pressed, call `editor.commands.liftListItem('listItem')` and return result
- [x] 1.3 When in list item and Tab pressed, call `editor.commands.sinkListItem('listItem')` and return result
- [x] 1.4 Ensure existing non-list Tab behavior preserved (paragraphs, headings, blockquotes)

## 2. Manual testing

- [x] 2.1 Test Tab in ordered list (1, 2, 3) creates nested sublist
- [x] 2.2 Test Tab in unordered list (bullets) creates nested sublist
- [x] 2.3 Test Shift+Tab in nested list item lifts it one level
- [x] 2.4 Test Shift+Tab at top-level list item has no effect
- [x] 2.5 Test Tab with cursor at start, middle, and end of list line
- [x] 2.6 Test Tab in paragraph still applies margin indentation
- [x] 2.7 Test Tab on toolbar button moves focus (not intercepted)
- [x] 2.8 Test multiple Tab presses nest multiple levels
- [x] 2.9 Test switching between ordered and unordered lists preserves nesting

## 3. Documentation

- [x] 3.1 Add entry to CHANGELOG.md describing new Tab behavior in lists
