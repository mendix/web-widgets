# Table Header (thead) Feature Guide

## Overview

Quill Table Better 1.2.4 introduces full support for semantic HTML table headers using `<thead>`, `<th>`, and related elements. This allows creating properly structured tables with distinct header rows.

## New Components

### TableThead

- Represents the `<thead>` section of a table
- Container for header rows
- Blot name: `table-thead`
- Tag: `THEAD`

### TableThRow

- Represents a row within the table header
- Blot name: `table-th-row`
- Tag: `TR`
- Parent: `TableThead`

### TableTh

- Represents a header cell
- Blot name: `table-th`
- Tag: `TH`
- Parent: `TableThRow`
- Contains: `TableThBlock`, `TableHeader`, `ListContainer`

### TableThBlock

- Block-level content within header cells
- Blot name: `table-th-block`
- Tag: `P`
- Parent: `TableTh`

## HTML Structure

**Without thead (previous):**

```html
<table>
    <tbody>
        <tr>
            <td>Header 1</td>
            <td>Header 2</td>
        </tr>
        <tr>
            <td>Data 1</td>
            <td>Data 2</td>
        </tr>
    </tbody>
</table>
```

**With thead (new):**

```html
<table>
    <thead>
        <tr>
            <th>Header 1</th>
            <th>Header 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Data 1</td>
            <td>Data 2</td>
        </tr>
    </tbody>
</table>
```

## Benefits

### Semantic HTML

- Proper semantic structure for tables
- Better accessibility for screen readers
- Clearer distinction between headers and data

### Styling Flexibility

- Headers can be styled differently from data cells
- CSS can target `thead`, `th` separately
- Default browser styling for headers (bold, centered)

### Data Management

- Easier to identify and manipulate header rows programmatically
- Copy/paste preserves header/data distinction
- Import from Excel/Word maintains header structure

## Usage in Rich Text Widget

### Creating Tables with Headers

When users create tables through the toolbar, they can:

1. Create standard tables (tbody only)
2. Add header rows (converts first row to thead)
3. Convert regular rows to/from header rows

### Context Menu Options

The table context menu should include:

- "Insert Header Row" - Adds thead if not present
- "Remove Header Row" - Converts thead back to tbody
- "Toggle Cell Type" - Convert td ↔ th

### Clipboard Handling

The updated clipboard matchers handle:

- Pasting tables with `<th>` elements → creates thead structure
- Pasting tables with `<thead>` sections → preserves structure
- Copying tables → maintains th/td distinction

## Implementation Notes

### Format Registration

All thead-related formats are registered in `quill-table-better.ts`:

```typescript
Quill.register(TableThBlock, true);
Quill.register(TableTh, true);
Quill.register(TableThRow, true);
Quill.register(TableThead, true);
```

### Keyboard Bindings

Keyboard handlers check for both regular cells and header cells:

```typescript
format: ["table-cell", "table-th"];
format: ["table-cell-block", "table-th-block"];
```

### Type Safety

TypeScript types include thead components:

```typescript
export type {
    TableThBlock,
    TableTh,
    TableThRow,
    TableThead
    // ... other types
};
```

## Testing Checklist

- [ ] Create new table with header row
- [ ] Convert existing row to header row
- [ ] Convert header row back to regular row
- [ ] Edit content in `<th>` cells
- [ ] Apply formatting (bold, italic, etc.) in headers
- [ ] Merge header cells
- [ ] Copy/paste table with headers from Word
- [ ] Copy/paste table with headers from Excel
- [ ] Verify `<thead>` structure in saved HTML
- [ ] Test with CSP (class attributor mode)
- [ ] Screen reader accessibility

## Browser Compatibility

Table header elements are supported in all modern browsers:

- Chrome/Edge (Chromium)
- Firefox
- Safari
- All support `<thead>`, `<th>`, `<tbody>` natively

## CSS Styling

Headers can be styled with:

```scss
table thead {
    background-color: var(--header-bg);
    font-weight: bold;
}

table th {
    text-align: center;
    border-bottom: 2px solid var(--border-color);
}
```

Atlas UI classes will automatically style header elements appropriately.
