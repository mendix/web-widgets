## Implementation Tasks

### Core Implementation

- [ ] **Modify Editor.tsx onUpdate handler**
    - File: `src/components/Editor.tsx`
    - Line: 237-240
    - Change: Replace `const html = editor.getHTML();` with `const html = editor.isEmpty ? "" : editor.getHTML();`
    - Validation: Verify editor.isEmpty property is accessible via TypeScript types

- [ ] **Add normalizeEmpty helper in EditorWrapper.tsx**
    - File: `src/components/EditorWrapper.tsx`
    - Add helper function above component:
        ```typescript
        function normalizeEmpty(value?: string): string {
            if (!value || value === "<p></p>") return "";
            return value;
        }
        ```
    - Update comparison logic in setAttributeValueDebounce (line 48-60)
    - Use `normalizeEmpty()` for both current and incoming values

### Testing

- [ ] **Add unit tests for empty content handling**
    - File: `src/__tests__/RichText.spec.tsx`
    - Test cases:
        - Empty editor returns empty string
        - Editor with content returns HTML
        - Normalization treats "" and "<p></p>" as equivalent
        - Edge case: whitespace-only content behavior

- [ ] **Add E2E test for empty content persistence**
    - File: `e2e/RichText.spec.js`
    - Test scenario:
        - Type content in editor
        - Delete all content
        - Blur to trigger save
        - Verify attribute value is empty string (not "<p></p>")

- [ ] **Manual testing checklist**
    - [ ] Create new record with required RichText field
    - [ ] Try to save with empty content → validation should fail
    - [ ] Add content and save → should succeed
    - [ ] Delete all content and save → validation should fail
    - [ ] Verify database stores "" not "<p></p>"
    - [ ] Load existing record with "<p></p>" → should render correctly
    - [ ] Edit and save → should normalize to ""
    - [ ] Test undo/redo with empty content
    - [ ] Test code view → code view toggle with empty content

### Documentation

- [ ] **Update CHANGELOG.md**
    - Add entry under "Fixed" section:
        - "Empty editor content now correctly saves as empty string instead of `<p></p>`, fixing validation and comparison issues"
    - Note breaking change: Required field validation now correctly rejects empty content

- [ ] **Update README.md (if needed)**
    - Check if empty content behavior is documented
    - Add note about empty value representation if relevant

### Code Review Checklist

- [ ] Verify isEmpty property is correctly used
- [ ] Confirm no TypeScript errors
- [ ] Check that normalization logic handles all cases (undefined, "", "<p></p>")
- [ ] Verify debounce behavior is maintained
- [ ] Ensure onChange events still fire correctly
- [ ] Confirm no regression in existing functionality
- [ ] Review test coverage for edge cases

### Pre-Merge Verification

- [ ] All unit tests pass: `pnpm test`
- [ ] All E2E tests pass: `pnpm e2e`
- [ ] Linting passes: `pnpm lint`
- [ ] Format check passes: `pnpm format`
- [ ] Build succeeds: `pnpm build`
- [ ] Manual testing completed
- [ ] CHANGELOG updated
- [ ] No console errors in browser during testing

## Estimated Effort

- Core implementation: **30 minutes**
- Unit tests: **1 hour**
- E2E tests: **1 hour**
- Manual testing: **30 minutes**
- Documentation: **15 minutes**
- Code review and fixes: **30 minutes**

**Total: ~3.5 hours**

## Dependencies

None - this is a self-contained fix within the RichText widget.

## Success Criteria

✓ Empty editor persists as `""` instead of `<p></p>`  
✓ Required field validation correctly rejects empty content  
✓ Existing `<p></p>` records load and normalize on next edit  
✓ No regression in content editing functionality  
✓ All tests pass (unit + E2E)  
✓ No TypeScript errors  
✓ Code review approved
