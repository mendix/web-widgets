## Design Overview

The fix normalizes empty editor content at the persistence boundary by checking Tiptap's `isEmpty` property and returning an empty string instead of `<p></p>`. A secondary normalization in the comparison layer prevents unnecessary updates when values are semantically equivalent.

## Architecture

```
User Deletes Content
       ↓
Tiptap Editor (internal state: <p></p>)
       ↓
onUpdate Event Fires
       ↓
┌─────────────────────────────────────────┐
│ Editor.tsx (PRIMARY FIX)                │
│                                         │
│ onUpdate: ({ editor }) => {             │
│   const html = editor.isEmpty           │
│                 ? ""                    │ ← Use isEmpty check
│                 : editor.getHTML();     │
│   onUpdate?.(html);                     │
│ }                                       │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│ EditorWrapper.tsx (OPTIMIZATION)        │
│                                         │
│ const current = stringAttribute.value || ""; │
│ const incoming = html || "";            │ ← Normalize comparison
│ if (current !== incoming) {             │
│   stringAttribute.setValue(incoming);   │
│ }                                       │
└─────────────────────────────────────────┘
       ↓
Mendix EditableValue.setValue("")
       ↓
Database: RichTextField = "" ✓
```

## Key Design Decisions

### 1. Use Tiptap's `isEmpty` Property

**Decision:** Trust Tiptap's built-in `editor.isEmpty` check rather than implementing custom logic.

**Rationale:**

- Tiptap's `isEmpty` is battle-tested and handles edge cases correctly
- Considers semantic emptiness (ignores empty marks, formatting-only nodes)
- No need to reinvent the wheel with regex or string parsing
- Future-proof as Tiptap evolves

**Edge Cases Handled by isEmpty:**

- `<p></p>` → true
- `<p><strong></strong></p>` → true (empty marks)
- `<p>   </p>` → Implementation depends on Tiptap's definition
- `<p><br></p>` → false (has content - soft break)
- `<ul><li></li></ul>` → false (has structure)

### 2. Normalize at Persistence Boundary

**Decision:** Convert `<p></p>` to `""` in the `onUpdate` handler, not on load.

**Rationale:**

- Centralizes normalization at the point where data leaves the editor
- Tiptap can maintain whatever internal state it needs
- Rendering is unaffected (Tiptap will render `<p></p>` internally regardless)
- Single source of truth for what gets persisted

**Rejected Alternative:** Normalize on load (`defaultValue`)

- Would require changing initialization logic
- Adds complexity without user-visible benefit
- Lazy migration is sufficient

### 3. Comparison Normalization

**Decision:** Treat `undefined`, `""`, and `<p></p>` as equivalent in comparison logic.

**Why:**

```javascript
// Without normalization:
stringAttribute.value = "";
html = "<p></p>";
"" !== "<p></p>"  // → triggers setValue() unnecessarily

// With normalization:
current = "" || "" = "";
incoming = "<p></p>" || "" = "";  // Wait, this doesn't work!

// Correct normalization:
const normalize = (val?: string) => val || "";
current = normalize(stringAttribute.value);   // "" or "<p></p>" → ""
incoming = normalize(html);                    // "" or "<p></p>" → ""
```

**Actually, we need:**

```javascript
const normalize = (val?: string) => {
    if (!val || val === "<p></p>") return "";
    return val;
};
```

**Rationale:**

- Prevents duplicate setValue() calls during transition period
- Reduces unnecessary database writes
- Handles both `""` and `<p></p>` gracefully

### 4. Lazy Migration

**Decision:** Don't proactively migrate existing `<p></p>` records.

**Rationale:**

- Records with `<p></p>` load and render fine
- They normalize to `""` on next edit
- No risk of data corruption
- No need for migration script
- Gradual, safe transition

## Implementation Details

### File: `src/components/Editor.tsx`

**Current Code (Line 237-240):**

```typescript
onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    onUpdate?.(html);
};
```

**New Code:**

```typescript
onUpdate: ({ editor }) => {
    const html = editor.isEmpty ? "" : editor.getHTML();
    onUpdate?.(html);
};
```

**Impact:**

- Every content change triggers this check
- Performance: Negligible (boolean property access)
- Testing: Unit test can mock editor.isEmpty

### File: `src/components/EditorWrapper.tsx`

**Current Code (Line 48-60):**

```typescript
const [setAttributeValueDebounce] = useDebounceWithStatus(
    (html?: string) => {
        if (stringAttribute.value !== html) {
            stringAttribute.setValue(html);
            if (onChangeType === "onDataChange") {
                executeAction(onChange);
            }
        }
    },
    200,
    false
);
```

**New Code:**

```typescript
const normalizeEmpty = (val?: string): string => {
    if (!val || val === "<p></p>") return "";
    return val;
};

const [setAttributeValueDebounce] = useDebounceWithStatus(
    (html?: string) => {
        const current = normalizeEmpty(stringAttribute.value);
        const incoming = normalizeEmpty(html);

        if (current !== incoming) {
            stringAttribute.setValue(incoming);
            if (onChangeType === "onDataChange") {
                executeAction(onChange);
            }
        }
    },
    200,
    false
);
```

**Impact:**

- Prevents spurious updates when switching representations
- Helper function can be tested independently
- Encapsulates normalization logic

## Testing Strategy

### Unit Tests

**File:** `src/__tests__/RichText.spec.tsx`

New test cases:

```typescript
describe("Empty content handling", () => {
    it("returns empty string when editor is empty", () => {
        const onUpdate = jest.fn();
        const editor = createMockEditor({ isEmpty: true, getHTML: () => "<p></p>" });

        // Trigger onUpdate
        editor.onUpdate({ editor });

        expect(onUpdate).toHaveBeenCalledWith("");
    });

    it("returns HTML when editor has content", () => {
        const onUpdate = jest.fn();
        const editor = createMockEditor({
            isEmpty: false,
            getHTML: () => "<p>Hello</p>"
        });

        editor.onUpdate({ editor });

        expect(onUpdate).toHaveBeenCalledWith("<p>Hello</p>");
    });

    it("normalizes <p></p> in comparison", () => {
        const setValue = jest.fn();
        const stringAttribute = { value: "<p></p>", setValue };

        // Trigger update with empty string
        handleUpdate("");

        // Should NOT call setValue (semantically equivalent)
        expect(setValue).not.toHaveBeenCalled();
    });
});
```

### E2E Tests

**File:** `e2e/RichText.spec.js`

New test:

```javascript
test("empty content persists as empty string", async ({ page }) => {
    await page.goto("/p/rich-text-test");
    await waitForMendixApp(page);

    // Type content
    const editor = page.locator(".tiptap-editor");
    await editor.click();
    await page.keyboard.type("Hello World");

    // Delete all content
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");

    // Blur to trigger save
    await page.keyboard.press("Tab");

    // Verify the attribute value is empty string
    const isEmpty = await page.evaluate(() => {
        // Access Mendix test helper
        const context = window.mx.data.get(/* richTextEntity */);
        const value = context.get("RichTextField");
        return value === "" || value === null;
    });

    expect(isEmpty).toBe(true);
});
```

## Risks and Mitigations

### Risk 1: Validation Breaking Change

**Risk:** Forms with required RichText that accepted `<p></p>` will now fail validation.

**Mitigation:**

- This is the desired behavior (bug fix)
- Document as breaking change in CHANGELOG
- Note: Since this is unreleased Tiptap version, no version bump needed

**Verdict:** Acceptable - improves correctness

### Risk 2: Tiptap's isEmpty Edge Cases

**Risk:** Tiptap's `isEmpty` might have edge cases we don't anticipate.

**Mitigation:**

- Trust Tiptap's well-tested implementation
- Add unit tests for known edge cases
- Monitor issue reports after release

**Verdict:** Low risk - Tiptap is mature

### Risk 3: Performance

**Risk:** Extra checks on every keystroke.

**Analysis:**

- `editor.isEmpty` is a boolean property (O(1))
- Normalization is string comparison (O(n), but n is small)
- Already debounced (200ms)

**Verdict:** Negligible impact

## Alternative Approaches Considered

### Alternative 1: Normalize on Load

```typescript
const editor = useEditor({
    content: normalizeEmpty(defaultValue),
    ...
});
```

**Rejected because:**

- Doesn't prevent `<p></p>` from being saved in the first place
- Adds complexity to initialization
- No user-visible benefit

### Alternative 2: Custom isEmpty Logic

```typescript
const isEmpty = (html: string) => {
    return !html || html === "<p></p>" || html.trim() === "";
};
```

**Rejected because:**

- Fragile (what about `<p> </p>`, `<p><br></p>`, etc?)
- Reinvents Tiptap's tested logic
- Harder to maintain

### Alternative 3: Database Migration

Run a script to convert all `<p></p>` → `""` in database.

**Rejected because:**

- Unnecessary risk
- Lazy migration is safer
- No user-visible benefit

## Conclusion

This design provides a minimal, safe fix for the empty content bug by leveraging Tiptap's built-in `isEmpty` property and normalizing at the persistence boundary. The secondary comparison normalization prevents unnecessary updates during the transition period.

**Key Benefits:**

- ✓ Simple implementation (two small changes)
- ✓ Low risk (uses proven Tiptap API)
- ✓ Testable (unit + E2E coverage)
- ✓ Backward compatible (lazy migration)
- ✓ Fixes validation correctness
