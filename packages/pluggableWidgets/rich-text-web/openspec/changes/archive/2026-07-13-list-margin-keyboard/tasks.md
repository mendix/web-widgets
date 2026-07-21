# Tasks: List Margin via Keyboard Shortcut

## 1. Indent extension — list-margin commands

- [x] 1.1 Add `findListAncestor(editor)` helper — nearest `bulletList`/`orderedList`/`taskList` ancestor `{ node, pos }` or null
- [x] 1.2 Add `listIndent` command — `setNodeMarkup` on nearest list node, `indent + step`, clamp to `maxIndent`; targets list node only (no descent)
- [x] 1.3 Add `listOutdent` command — same, `indent - step`, clamp to `minIndent` (no unlist, no negative)

## 2. Indent extension — keyboard shortcuts

- [x] 2.1 Add `addKeyboardShortcuts` with `Mod-]` → list ? `listIndent` : `increaseIndent`
- [x] 2.2 Add `Mod-[` → list ? `listOutdent` : `decreaseIndent`
- [x] 2.3 Verify shortcuts return false / pass through when no change (so browser default is not blocked unnecessarily)

## 3. Indent extension — decouple attribute registration from the walk

- [x] 3.1 Register the `indent` global attribute on list types (`bulletList`, `orderedList`, `taskList`) in addition to paragraph/heading/blockquote
- [x] 3.2 Keep `updateIndentLevel` walk iterating paragraph/heading/blockquote ONLY (lists excluded) so toolbar buttons stay paragraph-only
- [x] 3.3 Confirm invariant: lists carry the attribute but the walk never touches them

## 4. Editor configuration

- [x] 4.1 Pass the list types for attribute registration to `Indent.configure` (new option or fixed superset)

## 5. CSS — margin renders in both modes

- [x] 5.1 Inline mode: inline `margin-left` renders on `<ol>`/`<ul>` (unit-verified in HTML; visual specificity vs `margin: 0.5em 0` still needs a browser check)
- [x] 5.2 Class mode: added list-scoped rule so `ol.indent-N`/`ul.indent-N` apply `margin-left` + keep `padding-left: 1.5em` gutter
- [ ] 5.3 Verify in a browser that markers (numbers/bullets) are not collapsed against text in class mode (jsdom cannot compute layout)

## 6. Unit tests

- [x] 6.1 `Ctrl+]` (or `listIndent`) on top-level ordered list → margin on `<ol>`, no nesting, no paragraph margin
- [x] 6.2 `listIndent` on nested list → margin on innermost list node, no structural change
- [x] 6.3 `listIndent` on unordered list → margin on `<ul>`
- [x] 6.4 `listIndent` on task list → margin on `taskList` node, no paragraph margin
- [x] 6.5 Repeated `listIndent` → cumulative; capped at `maxIndent`
- [x] 6.6 `listOutdent` decreases margin; at 0 is a no-op (no unlist, no negative)
- [x] 6.7 `Ctrl+]` in paragraph → paragraph margin via existing walk
- [x] 6.8 Tab still nests, Shift+Tab still lifts (regression)
- [x] 6.9 Toolbar increase/decrease-indent does NOT margin a list (paragraph-only regression)
- [x] 6.10 Style/class merge: `list-style-type` + margin coexist (both modes)

## 7. E2E tests (Playwright)

- [ ] 7.1 `Ctrl+]` shifts a list right; assert visual margin
- [ ] 7.2 `Ctrl+[` shifts back and stops at zero
- [ ] 7.3 Tab still nests (not margined) — guard against regression
- [ ] 7.4 `Ctrl+ArrowLeft`/`Right` still moves by word inside a list

## 8. Docs

- [x] 8.1 Add CHANGELOG.md entry (user-facing: Ctrl+]/Ctrl+[ indents lists and blocks)
- [ ] 8.2 Document the shortcut wherever editor keyboard shortcuts are listed (if such a list exists)
