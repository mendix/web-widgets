# Proposal: List Margin via Keyboard Shortcut

## Why

Lists cannot be shifted right/left as a block for layout (e.g., aligning a list with an indented paragraph). Tab is already taken by structural nesting (`sinkListItem`/`liftListItem`) and that behavior works well — we do not want to touch it.

An earlier attempt overloaded Tab to do margin on top-level lists and nesting on child lists. It entangled two different mental models on one key and was reverted. This proposal keeps Tab exactly as-is and adds a **separate, dedicated keyboard control** for list margin.

## What Changes

Add `Ctrl+]` / `Ctrl+[` (Tiptap `Mod-]` / `Mod-[`, so Cmd on macOS) as a block indent/outdent control:

- **In a list (any type, any depth)**: adjusts `margin-left` on the nearest list node.
- **In a paragraph / heading / blockquote**: adjusts `margin-left` via the existing indent walk (gives paragraphs a keyboard indent beyond Tab).

`Ctrl+]` / `Ctrl+[` was chosen over `Ctrl+Arrow` because Ctrl+Arrow is the standard word-by-word cursor navigation shortcut; overriding it would break core text editing. `Ctrl+]` / `Ctrl+[` is the Word / Google Docs indent idiom and collides with nothing in this codebase.

### Behavior Table

```
┌──────────────┬───────────────────────────┬───────────────────────────┐
│ Input        │ Context                   │ Result                    │
├──────────────┼───────────────────────────┼───────────────────────────┤
│ Tab          │ list item                 │ sinkListItem  (UNCHANGED) │
│ Shift+Tab    │ list item                 │ liftListItem  (UNCHANGED) │
│ Tab          │ paragraph/heading/bq      │ paragraph margin (UNCH.)  │
│ Ctrl+]       │ any list, any depth       │ list margin +1   (NEW)    │
│ Ctrl+]       │ paragraph/heading/bq      │ block margin +1  (NEW kb) │
│ Ctrl+[       │ any list, any depth       │ list margin −1, clamp 0   │
│ Ctrl+[       │ paragraph/heading/bq      │ block margin −1, clamp 0  │
└──────────────┴───────────────────────────┴───────────────────────────┘
```

"Any list, any depth" means depth is ignored — the shortcut always means "shift this list right/left". It never nests and never advances the numbering cycle. Nesting stays exclusively on Tab.

## Implementation Approach

### 1. Dedicated list-margin commands (Approach A — target the list node)

New `listIndent` / `listOutdent` commands find the nearest `bulletList` / `orderedList` / `taskList` ancestor and `setNodeMarkup` its `indent` attribute by ±1, clamped to `[minIndent, maxIndent]`. They target the **list node only** — never descend into the inner paragraph — so the double-margin trap (list +2em AND its paragraph +2em) cannot occur.

```typescript
function findListAncestor(editor) {
    const { $from } = editor.state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (["bulletList", "orderedList", "taskList"].includes(node.type.name)) {
            return { node, pos: $from.before(depth) };
        }
    }
    return null;
}
```

### 2. Keyboard shortcuts route list-first

```typescript
addKeyboardShortcuts() {
    return {
        "Mod-]": () => (findListAncestor(this.editor) ? listIndent() : increaseIndent()),
        "Mod-[": () => (findListAncestor(this.editor) ? listOutdent() : decreaseIndent())
    };
}
```

List-first, exclusive: if the cursor is in a list, only the list node is touched and the command returns; otherwise the existing paragraph walk runs. A cursor in a list is also inside a paragraph, so this ordering is what prevents double margin.

### 3. Decouple attribute registration from the walk

The `types` option currently does double duty: it registers the `indent` global attribute AND drives the `updateIndentLevel` walk (which the toolbar buttons and paragraph-Tab use). Lists need the attribute to store/render margin, but must stay invisible to the walk so the **toolbar buttons remain paragraph-only** (per scope decision).

Split the concern:

```
Attribute registration (addGlobalAttributes):
    [paragraph, heading, blockquote, bulletList, orderedList, taskList]

updateIndentLevel walk iterates:
    [paragraph, heading, blockquote]   ← lists excluded

Only listIndent/listOutdent touch list nodes.
```

Introduce a separate option (e.g. `attributeTypes` for registration vs `types` for the walk), or keep `types` walk-only and register the attribute on a fixed superset. Exact shape decided during implementation; the invariant is: **lists carry the attribute, the walk ignores them.**

### 4. CSS: margin must render for lists in BOTH modes

Current indent rendering differs by mode, and neither is correct for lists yet:

```
inline mode:  style="margin-left: N*2em"          (Indent.ts renderHTML)
class mode:   .indent-N { padding-left: N*3px }    (RichTextFormatStyle.scss)
```

Two problems for lists:

- **Unit mismatch**: inline uses `margin-left` in `em`; class mode uses `padding-left` in `px`. Inconsistent shift distance between modes (pre-existing, but lists make it visible).
- **Class-mode padding collision**: `ol`/`ul` already have `padding-left: 1.5em` for the marker gutter. A `.indent-N { padding-left }` rule would **override** the gutter (not add to it), collapsing the numbers/bullets against the text instead of shifting the list.

Resolution for lists (class mode): the indent must apply `margin-left` on list elements, not `padding-left`, so it stacks with the marker gutter. Add a list-scoped rule, e.g. `ol.indent-N, ul.indent-N { margin-left: … }`, or switch the `.indent-N` contribution to `margin-left`. Verify inline-mode lists too: element-selector `ol { margin: 0.5em 0 }` sets `margin-left: 0`, but an inline `style="margin-left"` wins on specificity — confirm with a test.

## Edge Cases

- **Task lists**: margin targets the `taskList` container node (found via `findListAncestor`), not `taskItem`. `isActive("listItem")` vs `taskItem` is irrelevant here.
- **Nested list**: gets margin on its own node, independent of parent. Cumulative with the parent's own margin/gutter — same as nested indented paragraphs.
- **Clamp**: `Ctrl+[` at `margin 0` is a no-op (does not unlist, does not go negative). This differs from the reverted design — no unlist behavior on this shortcut.
- **Style/class merge**: Indent's margin coexists with `OrderedListStyled`'s `list-style-type` on the same `<ol>` (both `style` strings / classes merge). Applies in both modes.

## Impact

**Files affected**:

- `packages/pluggableWidgets/rich-text-web/src/extensions/Indent.ts` — `listIndent`/`listOutdent` commands, `findListAncestor` helper, `addKeyboardShortcuts`, split attribute-vs-walk types
- `packages/pluggableWidgets/rich-text-web/src/components/Editor.tsx` — register the `indent` attribute on list types
- `packages/pluggableWidgets/rich-text-web/src/ui/RichTextFormatStyle.scss` (and/or `RichText.scss`) — list-scoped margin rule for class mode so it stacks with the marker gutter

**Capability**: adds `list-margin-indent` (new). Does NOT modify `list-tab-indent` — Tab semantics are untouched.

**User-facing changes**:

- New `Ctrl+]` / `Ctrl+[` shortcut shifts lists (and other blocks) right/left by margin
- Tab still nests list items structurally; word navigation (`Ctrl+Arrow`) unaffected
- Toolbar indent buttons unchanged (still paragraph-only) — keyboard-only for now

## Out of Scope

- Toolbar buttons gaining list-margin (keyboard-only this round)
- Any change to Tab / structural nesting
- Advancing the numbering/bullet cycle on indent (explicitly rejected)
- `Ctrl+[` unlisting at margin 0

## Success Criteria

- [ ] `Ctrl+]` in a list adds `margin-left` to the nearest list node (any depth)
- [ ] `Ctrl+[` decreases list margin, clamped at 0 (no unlist, no negative)
- [ ] `Ctrl+]` in a paragraph/heading/blockquote adds margin via existing walk
- [ ] Inner paragraph of a list never receives its own margin (no double indent)
- [ ] Tab / Shift+Tab behavior completely unchanged (still sink/lift)
- [ ] Toolbar indent buttons still paragraph-only (do not margin lists)
- [ ] `Ctrl+Arrow` word navigation still works inside lists
- [ ] List margin renders correctly in BOTH inline and class modes
- [ ] Class-mode list margin stacks with the marker gutter (markers not collapsed)
- [ ] `list-style-type` and margin coexist on the same `<ol>`
- [ ] Works for ordered, unordered, and task lists
