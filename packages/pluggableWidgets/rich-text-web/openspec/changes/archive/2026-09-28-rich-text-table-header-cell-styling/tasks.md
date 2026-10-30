## 1. Test Setup

- [x] 1.1 Add extension test file (e.g. `src/extensions/__tests__/TableHeaderBackgroundColor.spec.ts`) with a helper to build an editor + table and serialize to HTML
- [x] 1.2 Write failing tests: header background renders inline (`inline` format)
- [x] 1.3 Write failing tests: header border color/style/width render inline
- [x] 1.4 Write failing tests: header background + border render as `data-*` attributes and `has-background-color` / `has-cell-border` classes (`class` format)
- [x] 1.5 Write failing round-trip test: styled `<th>` HTML parses and re-serializes identically (both formats)
- [x] 1.6 Write validation tests: unsafe color/size/border-style values are dropped on header cells
- [x] 1.7 Write parity test asserting `TableCellBackgroundColor` (`td`) output is unchanged after refactor

## 2. Implementation

- [x] 2.1 Extract shared cell-styling logic (attributes map, `renderHTML` style/class building, border commands) into a shared helper parameterized by `styleDataFormat` and output tag
- [x] 2.2 Refactor `TableCellBackgroundColor` to consume the shared helper (still renders `td`); make parity test pass
- [x] 2.3 Add `TableHeaderBackgroundColor` extending `@tiptap/extension-table-header`, using the shared helper and emitting `["th", attrs, 0]`; make header tests pass
- [x] 2.4 Wire `TableHeaderBackgroundColor.configure({ styleDataFormat })` into `Editor.tsx`, replacing stock `TableHeader`

## 3. Refactoring

- [x] 3.1 Ensure no duplicated attribute/renderHTML logic remains between the two extensions
- [x] 3.2 Confirm the configuration UI (`getCellAttributes`, `setCellAttribute` handlers) needs no changes and remove any header-specific dead paths if present

## 4. Verification

- [x] 4.1 Run unit tests: `cd packages/pluggableWidgets/rich-text-web && pnpm run test`
- [x] 4.2 Lint: `cd packages/pluggableWidgets/rich-text-web && pnpm run lint`
- [x] 4.3 Build: `pnpm --filter @mendix/rich-text-web run build`
- [ ] 4.4 Manual check in Studio Pro test project: set background + border on a header cell and confirm it renders (both inline and class CSP modes)
