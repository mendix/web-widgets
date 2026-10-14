## Why

When users delete all content from the rich text editor, it currently saves as `<p></p>` instead of an empty string. This creates several problems:

1. **Validation issues**: Required fields incorrectly pass validation with `<p></p>` as the value
2. **Comparison inconsistencies**: Checking `if (value === "")` or `if (!value)` fails because `<p></p>` is truthy
3. **Data semantics**: Semantically empty content should be represented as an empty string, not HTML markup
4. **Developer confusion**: Backend logic must special-case `<p></p>` when checking for empty content

This is a bug in the current implementation where Tiptap's `getHTML()` returns `<p></p>` for an empty editor, but we should normalize this to an empty string before persisting to the database.

## What Changes

- Modify `onUpdate` handler in `Editor.tsx` to return empty string (`""`) when editor is empty using Tiptap's built-in `isEmpty` property
- Normalize value comparison in `EditorWrapper.tsx` to treat `undefined`, `""`, and `<p></p>` as equivalent, preventing unnecessary database updates
- Add unit tests for empty content handling
- Add E2E test to verify empty content persists as empty string

## Capabilities

### New Capabilities

<!-- No new capabilities - this is a bug fix -->

### Modified Capabilities

- `rich-text-persistence`: Empty editor content now correctly saves as empty string (`""`) instead of `<p></p>`, ensuring proper validation and consistent data representation

## Impact

**Affected Files:**

- `src/components/Editor.tsx` - Modify `onUpdate` handler to check `editor.isEmpty` and return `""` when true
- `src/components/EditorWrapper.tsx` - Normalize value comparison to prevent spurious updates
- `src/__tests__/RichText.spec.tsx` - Add tests for empty content handling
- `e2e/RichText.spec.js` - Add E2E test for empty content persistence

**User Impact:**

- **Validation improvement** (Breaking): Required RichText fields will now correctly reject empty content. Previously, `<p></p>` incorrectly passed validation.
- **Data consistency**: Empty content is consistently represented as `""` across all scenarios
- **Backward compatibility**: Existing records with `<p></p>` will load normally and get normalized to `""` on next edit (lazy migration)

**Technical Impact:**

- Leverages Tiptap's built-in `isEmpty` property (battle-tested, no custom logic needed)
- Minimal performance impact (one boolean property check per update)
- No changes to Tiptap configuration or extensions
- No version bump needed (Tiptap version is unreleased)

## Migration

**Lazy Migration Strategy:**

- Existing records with `<p></p>` in database remain unchanged
- Values normalize to `""` when user next edits the content
- No database migration script required
- Safe, gradual transition
