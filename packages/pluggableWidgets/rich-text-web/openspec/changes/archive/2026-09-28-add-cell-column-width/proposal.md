## Why

Users need precise control over table column widths in the rich text editor. Currently, while TipTap supports column widths via the `colwidth` attribute, there's no UI control to set them. Users can only click column borders which sets widths without drag-to-resize capability, making it difficult to achieve desired layouts.

## What Changes

- Add a "Column Width" number input control to the cell configuration dropdown
- Support setting exact pixel widths (25-1000px range)
- Provide "Clear" button to reset to auto width
- Handle colspan cells by setting only the first column width
- Integrate with existing `setCellAttribute` command for `colwidth` attribute

## Capabilities

### New Capabilities

- `table-column-width-control`: UI control in cell configuration dropdown allowing users to set precise column widths in pixels, with validation, auto width support, and colspan handling

### Modified Capabilities

<!-- No existing spec requirements are changing - this is a new UI feature using existing TipTap colwidth infrastructure -->

## Impact

**Affected Files:**

- `src/components/toolbars/components/ConfigurationDropdown.tsx` - Add number input type support
- `src/components/toolbars/components/ConfigurationDropdown.scss` - Add number input styling
- `src/components/toolbars/ToolbarConfig.ts` - Update ConfigurationSection type definition
- `src/components/toolbars/helpers/configurationHelpers.ts` - Add column width section

**User Impact:**

- Positive: Users gain precise control over table column widths via familiar number input UI
- No breaking changes: Feature is additive, existing tables continue to work

**Technical Impact:**

- Uses existing TipTap `colwidth` attribute mechanism (no changes to data model)
- No impact on existing table resize behavior (custom NodeView remains unchanged)
- Follows established configuration dropdown patterns
