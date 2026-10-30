## Context

The Rich Text widget (`@mendix/rich-text-web`) builds its table editor from TipTap nodes in `src/components/Editor.tsx`. Cell styling is currently implemented only for data cells via `TableCellBackgroundColor` (extends `@tiptap/extension-table-cell`). Header cells use the stock `TableHeader` extension and therefore ignore all styling commands.

The styling attributes and rendering logic are cell-tag-agnostic apart from the final DOM tag (`td` vs `th`). Validation helpers already exist in `src/utils/tableStyle.ts` (`safeColor`, `safeSize`, `buildBorderStyleSegments`) and class-mode CSS (`.has-background-color`, `.has-cell-border`, `data-*` attributes in `src/ui/RichTextFormatStyle.scss`) works for any element. The toolbar configuration UI (`src/components/toolbars/helpers/configurationHelpers.ts`) already reads and writes both `tableCell` and `tableHeader` node attributes via the generic `setCellAttribute` command.

## Goals / Non-Goals

**Goals:**

- Header cells (`<th>`) support background color, border color, border style, and border width — matching data cells.
- Behavior is identical across both `inline` and `class` style-data formats.
- Eliminate duplication by extracting the shared cell-styling logic into one place used by both `td` and `th` extensions.

**Non-Goals:**

- No changes to the configuration UI, commands, or CSS (already header-capable).
- No content migration (feature unreleased).
- The header's default gray background (from `TableStyle.scss`) is intentionally left as-is; user-set inline styles override it.

## Decisions

### Extract shared cell-styling into a helper used by both extensions

Both `TableCellBackgroundColor` (`td`) and the new `TableHeaderBackgroundColor` (`th`) share the same `addAttributes()` map, the same `renderHTML` style/class-building body, and the same border commands. Extract these into a shared helper (parameterized by the `styleDataFormat` option and the output tag), so the two extensions become thin wrappers that only differ in the base extension (`TableCell` vs `TableHeader`) and the emitted tag.

**Rationale:** Prevents the two node types from drifting apart over time; a single source of truth for validation and emission.

**Alternative considered:** Copy-paste the logic into a second extension. Rejected — guarantees future drift and doubles the surface for bugs.

### New `TableHeaderBackgroundColor` extension replaces stock `TableHeader`

Mirror `TableCellBackgroundColor`: extend `@tiptap/extension-table-header`, apply the shared attributes/renderHTML, and emit `["th", attrs, 0]`. Swap it into `Editor.tsx` in place of `TableHeader`.

## Test Cases

### Header cell rendering — inline format

- Header background color renders inline (unit)
    - **Given**: An editor configured with `styleDataFormat: "inline"` and a table with a header cell
    - **When**: `backgroundColor` is set on the header cell and the document is serialized to HTML
    - **Then**: The `<th>` carries `style="…background-color: <color>…"`

- Header border properties render inline (unit)
    - **Given**: `styleDataFormat: "inline"`, a header cell
    - **When**: `borderColor`, `borderStyle`, and `borderWidth` are set on the header cell
    - **Then**: The `<th>` style string includes the corresponding validated `border-*` segments

### Header cell rendering — class format

- Header background color renders as data attribute + class (unit)
    - **Given**: `styleDataFormat: "class"`, a header cell
    - **When**: `backgroundColor` is set and serialized
    - **Then**: The `<th>` has `data-background-color="<color>"` and class `has-background-color` (no inline `background-color`)

- Header border properties render as data attributes + class (unit)
    - **Given**: `styleDataFormat: "class"`, a header cell
    - **When**: border color/style/width are set and serialized
    - **Then**: The `<th>` has the matching `data-border-*` attributes and class `has-cell-border`

### Round-trip (parse ↔ serialize)

- Header styling round-trips (unit)
    - **Given**: HTML containing a styled `<th>` (inline and class variants)
    - **When**: The HTML is parsed into the editor and re-serialized
    - **Then**: The header styling attributes are preserved identically

### Validation / safety

- Unsafe header values are rejected (unit)
    - **Given**: An invalid color, size, or border-style value on a header cell
    - **When**: The header cell renders
    - **Then**: The unsafe value is dropped (consistent with `safeColor`/`safeSize`/`isSafeCssBorderStyle` behavior for data cells)

### Parity / regression

- Data cell (`<td>`) styling unchanged (unit)
    - **Given**: The refactored `TableCellBackgroundColor` using the shared helper
    - **When**: Styling is applied to a data cell in both formats
    - **Then**: Output is identical to pre-refactor behavior

- Configuration UI applies to header cells (unit)
    - **Given**: The cursor is inside a header cell
    - **When**: A background/border configuration command runs
    - **Then**: `getCellAttributes()` reflects the new value and the `<th>` renders it

## Risks / Trade-offs

- Refactoring the existing `TableCellBackgroundColor` into a shared helper risks regressing data-cell output. Mitigated by the parity test asserting unchanged `td` rendering in both formats.
- The header's SCSS default background remains; a user "clear background" resets to that gray rather than transparent. Accepted per scope.
