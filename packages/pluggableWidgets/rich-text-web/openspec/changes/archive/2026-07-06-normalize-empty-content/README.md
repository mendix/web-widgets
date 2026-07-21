# Normalize Empty Content

**Status:** Proposed  
**Type:** Bug Fix  
**Impact:** Breaking (Validation behavior)  
**Effort:** ~3.5 hours

## Quick Summary

Fix the rich text editor to save empty content as `""` instead of `<p></p>`, ensuring correct validation and consistent data representation.

## Problem

When users delete all content, the editor currently saves `<p></p>` to the database. This breaks:

- Required field validation (incorrectly passes)
- Empty checks (`if (value)` returns true)
- Data consistency (semantically empty ≠ empty string)

## Solution

Use Tiptap's `editor.isEmpty` property to return `""` when content is empty, and normalize comparison logic to treat `""` and `<p></p>` as equivalent.

## Files

- [`proposal.md`](./proposal.md) - Problem statement, scope, and impact
- [`design.md`](./design.md) - Technical design, decisions, and architecture
- [`tasks.md`](./tasks.md) - Implementation checklist and effort estimate

## Key Decisions

1. **Trust Tiptap's isEmpty** - Use built-in check, no custom logic
2. **Normalize at persistence** - Convert to `""` when saving, not loading
3. **Lazy migration** - Existing `<p></p>` records normalize on next edit
4. **No version bump** - This Tiptap version is unreleased

## Changes Required

### Editor.tsx (line 237-240)

```typescript
// Before:
const html = editor.getHTML();

// After:
const html = editor.isEmpty ? "" : editor.getHTML();
```

### EditorWrapper.tsx (line 48-60)

```typescript
// Add normalization in comparison:
const normalizeEmpty = (val?: string) => (!val || val === "<p></p>" ? "" : val);

const current = normalizeEmpty(stringAttribute.value);
const incoming = normalizeEmpty(html);
if (current !== incoming) {
    stringAttribute.setValue(incoming);
}
```

## Testing

- ✓ Unit tests for empty content behavior
- ✓ E2E test for persistence
- ✓ Manual validation testing

## Breaking Change

**Required field validation will now correctly reject empty content.**

Previously: `<p></p>` passed validation ❌  
After fix: `""` fails validation ✓

This is desired behavior (bug fix), but may affect existing forms.

## Next Steps

1. Review proposal and design
2. Approve or request changes
3. Implement following tasks.md
4. Test thoroughly
5. Update CHANGELOG
6. Merge to main branch
