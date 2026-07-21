## Why

Nested lists in rich text widget currently use same numbering style at all levels (1, 2, 3 everywhere). Standard word processors (Word, Google Docs) automatically cycle through different styles for visual hierarchy (decimal → lower-alpha → lower-roman). This improves readability of complex nested lists.

## What Changes

- Ordered lists (`<ol>`) will auto-cycle numbering styles based on nesting depth:
    - Level 1: decimal (1, 2, 3)
    - Level 2: lower-alpha (a, b, c)
    - Level 3: lower-roman (i, ii, iii)
    - Level 4+: cycle repeats (decimal → lower-alpha → lower-roman)
- Unordered lists (`<ul>`) will auto-cycle bullet styles based on nesting depth:
    - Level 1: disc (●)
    - Level 2: circle (○)
    - Level 3: square (■)
    - Level 4+: cycle repeats (disc → circle → square)
- CSS-only implementation (no JavaScript changes)
- No toolbar changes or user override controls (Phase 1 scope)

## Capabilities

### New Capabilities

- `list-style-auto-cycle`: Nested ordered and unordered lists automatically cycle through numbering/bullet styles based on depth

### Modified Capabilities

<!-- No existing spec requirements changing - this is pure visual enhancement -->

## Impact

**Files affected**:

- `packages/pluggableWidgets/rich-text-web/src/ui/RichText.scss` — Add nested selector rules for `ol` and `ul`

**User-facing changes**:

- Nested lists will display different numbering/bullet styles automatically
- Matches standard word processor behavior
- Existing lists with manual `style="list-style-type: ..."` inline styles unchanged (inline styles override CSS)
- No breaking changes — pure visual enhancement

**Testing scope**:

- Visual verification of 6 nesting levels for ordered lists
- Visual verification of 4 nesting levels for unordered lists
- Mixed list types (ordered inside unordered, vice versa)
- Task lists (`ul[data-type="taskList"]`) should remain unaffected
