## Context

`::marker` inherits from its `<li>`. The `FontSize`, `TextColorClass`, and `FontFamilyClass` extensions all write to the inline `textStyle` mark, and `Bold`/`Italic` are their own inline marks — so every format the user can apply to list text lands on a `<span>` two levels below the `<li>`:

```
<ol>                              font-size: 14px   (inherited from theme)
 └─ <li>                          font-size: 14px   ← ::marker reads THIS
     └─ <p>                       font-size: 14px
         └─ <span                 font-size: 32px   ← user set this
              style="font-size:32px">Big text</span>

    renders:   1. Big text
               ▲  ▲
            14px  32px
```

CSS has no child-to-ancestor selector and no way to read a descendant's value, so the `<li>` must be told the format by JavaScript.

Two facts constrain the implementation:

**`listItem` content is `paragraph block*`** (`@tiptap/extension-list`, `ListItem`). The first child of a list item is always a paragraph, so "the first inline run" is unambiguous: `node.firstChild.firstChild`.

**The widget renders all content through ProseMirror, including read-only.** `Editor.tsx:350` sets `editable: !readOnly` rather than swapping in a plain HTML renderer, so anything the editor view does applies to read-only display too.

**Constraint that shapes everything: the document must not be mutated.** `Editor.tsx:381-391` reconciles by string comparison:

```js
const newContent = editor.getHTML();
if (newContent !== defaultValue) {
    editor.commands.setContent(defaultValue || "");
}
```

An `appendTransaction` that injected marker attributes into the document would make `getHTML()` differ from the stored `defaultValue` for every pre-existing document. Combined with `onUpdate` (`Editor.tsx:351`) pushing HTML back out on every transaction, opening any existing list content would write to the attribute — dirtying forms, triggering unsaved-changes prompts, and firing `onDataChange` microflows. It also drags in `appendTransaction`'s usual costs: undo grouping, paste handling, and split/merge synchronization.

## Goals / Non-Goals

**Goals:**

- Markers follow the first inline run's font size, weight, style, color, and family.
- Partial formatting affects the marker only when it covers the first character.
- Correct in the live editor as the user types, in read-only mode, and in the saved HTML.
- Works in both `styleDataFormat` modes (`inline` and `class`).
- Zero document mutation; no migration; no change to stored content until the user edits.
- Enlarged markers get enough gutter that they are neither clipped nor overlapping the item text.

**Non-Goals:**

- **Task lists.** `taskItem` renders `<li data-type="taskItem"><label><input type="checkbox">…` with `list-style: none`. There is no `::marker`; formatting the checkbox would be a different mechanism.
- **Block-level typography in list items.** If the first block is a heading, or the paragraph carries a block-level size, the marker does not follow it — only inline marks are read. Word does follow the heading; matching that would reintroduce the base-size problem described under Decision 3. Deferred, recorded in Open Questions.
- **Self-contained external rendering.** The saved HTML carries marker format as data, not as resolved font properties. Rendering it without the widget stylesheet degrades to base-size markers. See Decision 3.
- No new toolbar control, XML property, or user-facing setting.
- No change to marker glyph selection: the level cycling in `RichText.scss:180-230` and the `data-list-style` overrides are untouched.

## Decisions

### Decision 1: Derive at render time, in two places, from one shared function

Reject document mutation (see Context). Instead compute the marker format from the node during rendering. This needs two delivery paths, because neither alone is sufficient:

```
        computeMarkerFormat(listItemNode)     ← one pure function
         │   → { fontSize, fontWeight, fontStyle, color, fontFamily }
         │
   ┌─────┴──────────────────────┐
   │                            │
renderHTML                  ProseMirror decoration
saved HTML, copy/paste,     keeps the live <li> element
initial view render         fresh as the user types
```

**Why `renderHTML` alone is not enough.** `ListItem.renderHTML` receives the full node — the signature is `renderHTML({ node, HTMLAttributes })`, and `TaskItem` at `@tiptap/extension-list/dist/index.js:1300` already destructures `node`, so reading `node.firstChild.firstChild.marks` is supported and idiomatic. But ProseMirror only re-invokes `toDOM` when a node's _markup_ changes. `sameMarkup` compares type, attrs, and marks — not content. Restyling the first run produces a listItem with identical markup, so the view reuses the existing `<li>` element and patches only its children. A content-derived attribute would go stale.

**Why decorations alone are not enough.** Decorations live in the view, not the document. `getHTML()` re-serializes the document through `DOMSerializer`, so decorations never appear in saved output.

Together they cover exactly what the other cannot, and because both call the same pure function they cannot disagree.

**Decoration merge semantics are safe** — verified in `prosemirror-view@1.42.2`:

```js
// patchAttributes, dist/index.js:1740-1750
if (cur.style) dom.style.cssText += cur.style; // appends
// class handled via classList.add/remove, touching only decorated classes
```

So the decoration adds `--rt-marker-*` on top of whatever `toDOM` emitted rather than clobbering it, and removes only the properties it previously set. `data-*` attributes go through `setAttribute`/`removeAttribute`, letting the decoration act as the authoritative value in the view — which is what we want.

**Round-tripping is self-healing.** Because no node attribute is declared for marker format, `parseHTML` ignores `--rt-marker-*` and `data-marker-*` on input. Pasted or reloaded content drops any stale marker data and recomputes it on render.

**Alternative considered — `:has()` enumeration.** `FONT_SIZE_LIST` (`fontHelpers.ts:21-36`) is a closed set of 14 values, so 14 static rules could cover font size with no JavaScript. Rejected: it cannot handle arbitrary sizes from pasted content; `:first-child` breaks when other marks wrap the span (mark nesting order varies, e.g. `<strong><span>`); inline mode would need `[style*="font-size: 32px"]` substring matching; and it does not extend to color or font-family at all. Reading marks from the document model sidesteps every one of these.

### Decision 2: Read only the first inline child of the first block

```js
const firstBlock = node.firstChild; // always a paragraph (content: "paragraph block*")
const firstInline = firstBlock?.firstChild; // text node, or image/hardBreak
const marks = firstInline?.marks;
```

From `marks`, take `textStyle`'s `fontSize`, `color`, and `fontFamily`, plus the presence of the `bold` and `italic` marks.

This is what makes the "first character" rule fall out for free, because partial selection splits the text into separate marked runs:

| user selects   | resulting content         | marker    |
| -------------- | ------------------------- | --------- |
| all of "Hello" | `<span 32px>Hello</span>` | 32px      |
| only "H"       | `<span 32px>H</span>ello` | 32px      |
| only "llo"     | `He<span 32px>llo</span>` | unchanged |

Cases that yield no marker format (leave the marker at base): empty list item, item starting with an image or hard break, first run with no relevant marks.

`fontFamily` in class mode must reuse the `fontValue` → `fontFamily` fallback that `ToolbarConfig.ts:341-353` applies, or markers will silently miss the font on legacy content.

### Decision 3: CSS custom properties + `::marker`, not real font properties on the `<li>`

Emit the format as data and let the stylesheet apply it to `::marker`:

```scss
li::marker {
    font-size: var(--rt-marker-font-size, inherit);
    font-weight: var(--rt-marker-font-weight, inherit);
    font-style: var(--rt-marker-font-style, inherit);
    color: var(--rt-marker-color, inherit);
    font-family: var(--rt-marker-font-family, inherit);
}
```

Setting a custom property on the `<li>` does not affect its content rendering — only `::marker` reads it. Following the widget's existing convention for the two modes:

| mode     | `<li>` markup                                                                    |
| -------- | -------------------------------------------------------------------------------- |
| `inline` | `style="--rt-marker-font-size:32px;--rt-marker-color:red"`                       |
| `class`  | `class="has-marker-format" data-marker-font-size="32" data-marker-color="red" …` |

Class mode maps these through `attr()` in `RichTextFormatStyle.scss`, matching the existing `has-font-size` / `has-text-color` rules.

**Alternative considered — real font properties on the `<li>`.** `<li style="font-size:32px">` scales the marker _and_ the gutter for free, since `padding-left: 1.5em` would resolve against the larger size. Rejected: the `<li>` then cascades into its own content, so it needs a `li > p` reset, and CSS cannot express "inherit from grandparent." In class mode you can fake the base (`--rt-base: 1em` declared at the ProseMirror root, which computes to absolute px there — it must not be declared on the list itself, or a nested list inside an enlarged `<li>` would capture the enlarged value). In inline mode you would have to read the computed base in JavaScript and bake a theme-dependent pixel value into stored content, so theme changes would stop propagating and content moved between apps would render wrong. That is a correctness bug, not a cosmetic one.

The trade-off accepted: markers rendered outside the widget without its stylesheet fall back to base size — identical to today's behavior. The rejected alternative degrades _worse_: without the stylesheet the reset is missing, so the first run's format would apply to the entire list item, which is actively wrong rather than merely unfixed.

**Naming:** the widget's own custom properties are otherwise unprefixed (`--file-dropzone-color`, `--file-icon`), but `--marker-font-size` is generic enough to risk colliding with a theme variable, so `--rt-marker-*` is used.

### Decision 4: Scale the gutter via a formulation that is a no-op by default

`RichText.scss:181` and `:209` set `padding-left: 1.5em` on `ol`/`ul`, and `RichTextFormatStyle.scss:24` repeats it for the `ol.indent-N`/`ul.indent-N` rules. That em resolves against the _list's_ font size (~21px at a 14px base), so an 84px marker overflows it:

```
current:   |◀ 21px ▶|
           10. Big text
           ╰──────╯ needs ~120px
```

Leaving it alone is not the conservative choice — it is _newly_ broken, since today's undersized marker at least fits. All three sites become:

```scss
padding-left: max(1.5em, calc(1.5 * var(--rt-marker-max-size, 0px)));
```

With the variable absent, `calc(1.5 * 0px)` is `0px` and `max()` yields `1.5em` — byte-identical to today. `orderedList` and `bulletList` emit `--rt-marker-max-size` as the largest first-run font size among their **direct** `li` children, so it is only present when a list actually contains an enlarged marker.

Keeping the `1.5` multiplier in CSS rather than computing pixels in JavaScript means the ordered/unordered gutter ratio stays adjustable in the stylesheet.

Ordered lists already have a home for this in `OrderedListStyled.ts`. Bullet lists currently use StarterKit's `BulletList` unmodified and need extending.

### Decision 5: Extension layout

| file                                     | role                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/utils/markerFormat.ts`              | pure `computeMarkerFormat(node)` + the two attribute serializers (inline vs class)                                 |
| `src/extensions/ListItemMarkerFormat.ts` | `ListItem.extend({ renderHTML, addProseMirrorPlugins })` — hosts the decoration plugin, which walks all list types |
| `src/extensions/BulletListStyled.ts`     | `BulletList.extend({ renderHTML })` for `--rt-marker-max-size`                                                     |
| `src/extensions/OrderedListStyled.ts`    | add `--rt-marker-max-size` to the existing extension                                                               |

`Editor.tsx:250` currently passes `StarterKit.configure({ orderedList: false })`; it gains `listItem: false` and `bulletList: false`, with the replacements registered alongside `OrderedListStyled`. `ListItem`'s `bulletListTypeName`/`orderedListTypeName` options must be preserved so list toggling and lifting keep working.

The decoration plugin recomputes on doc-changing transactions only (not selection changes), scanning list items within the changed ranges rather than the whole document.

## Risks / Trade-offs

**`::marker` may not accept all five font properties in every target browser** → **Chrome verified, Safari/Firefox outstanding.** Measured in Chrome 152 via `/tmp/marker-support-check.html`: `font-size`, `font-weight`, `font-style`, `color`, and `font-family` all resolve on `li::marker` through CSS custom properties, confirmed both by `getComputedStyle(el, "::marker")` and by visual rendering, for `<ol>` and `<ul>` alike. An item with no marker variables keeps the base 14px, confirming the `inherit` fallback is a no-op.

Firefox is not installed on this machine and Safari cannot be automated without `safaridriver --enable`. The probe page self-reports PASS/FAIL, so opening it in Safari is a one-look manual check. Residual risk is low: `RichTextFormatStyle.scss:37-77` already ships typed `attr()` (`attr(data-font-size px)`, `attr(data-text-color type(<color>))`), which is Chrome 133+ and absent in Safari and Firefox — so class-mode font size does not work in Safari _today_. `::marker` with font properties is more broadly supported than what the widget already depends on.

If a property does fail, the blast radius is contained to task group 5 (stylesheet) — the extension work is unaffected. The fallback is `list-style: none` + `li::before { content: counter(…) }`, which would have to reimplement the six-level cycling and the `data-list-style` overrides, and should be treated as a separate change.

**The `1.5` gutter multiplier was a heuristic, and it was not enough** → Measured in Chrome at the 98px maximum (task 8.2): a flat `1.5` gives a 147px gutter, but `998.` needs 191px and `1000.` needs 245px, so three- and four-digit markers were clipped. Two digits (136px) fit. The multiplier is now marker-length-aware:

```scss
padding-left: max(1.5em, calc(var(--rt-marker-max-size, 0px) * (0.6 * var(--rt-marker-chars, 1) + 0.5)));
```

`0.6` per character comes from the ~0.55em digit advance width plus headroom; `0.5` covers the trailing `.` and the gap to the text. `computeMarkerLength(listNode)` supplies the count from the _longest_ marker — the last item's, at `start + childCount - 1` — because markers sit to the left of the text, so the gutter has to fit the widest one, not a typical one. It resolves the counter style from `listStyleType` or the HTML `type` attribute, since `lower-roman` needs the numeral's length rather than the number's digits (`xxxviii` is 7 characters where 38 is 2), and `lower-alpha` stays one character through `z`.

`--rt-marker-chars` is emitted only above 1, so bullet lists (always 1 glyph) and short numbered lists keep byte-identical markup and fall back to the stylesheet's default of 1. Verified in Chrome against the compiled declaration for 1/3/4 characters, in both style modes, with an unformatted list still computing to exactly `1.5em`.

Residual: the per-character factor is calibrated on digit widths, so a marker in an unusually wide font could still crowd. Both factors remain in CSS and are adjustable without touching the extensions.

**Decoration and `renderHTML` could drift** → Both call `computeMarkerFormat`; unit-test the shared function directly, and assert that a `getHTML()` round-trip and the rendered view agree for the same document.

**Stale marker data in pasted HTML** → Harmless by construction: no node attribute is declared, so `parseHTML` drops `--rt-marker-*` / `data-marker-*` and the value is recomputed. Worth an explicit test so a future refactor that adds an attribute does not silently reintroduce stickiness.

**Replacing StarterKit's `listItem` and `bulletList`** → Widens the blast radius to list toggling, Tab nesting, and `Indent.ts:280-281`'s `liftListItem`/`sinkListItem`. `OrderedListStyled` is precedent that this is safe, but the existing list specs (`list-margin-indent`, `list-tab-indent`, `list-style-auto-cycle`, `manual-list-style`, `ordered-list-interaction`) are the regression surface and should be re-run.

**Performance on large documents** → Every doc-changing transaction rebuilds the decoration set, and the implemented rebuild walks the whole document rather than only changed ranges (see task 3.5). Per node the work is one `node.firstChild?.firstChild?.marks` read, and prosemirror-view already diffs the resulting `DecorationSet` so an unchanged rebuild redraws nothing. A changed-range scan would have to map surviving decorations and handle nested lists straddling a range; it is available as a later optimization if profiling on a large document justifies it.

**Class mode cannot set the font properties on `::marker` directly** → Discovered while implementing task 5.2. The `li::marker` rule in `RichText.scss` is both more specific and later in source order than anything in `RichTextFormatStyle.scss` (`@use` hoists that file above it), so a class-mode `::marker` rule would lose, and the base rule's `var(…, inherit)` fallback would reset the marker to the base. Resolved by having class mode assign the `--rt-marker-*` custom properties from `attr()` instead, keeping one consumption point for both modes. Verified in Chrome 152 that typed `attr()` resolves inside a custom property declaration (`/tmp/marker-attr-var-check.html`). Sass simplifies `calc(1.5 * var(…))` to `1.5 * var(…)` inside `max()`; that form was verified to compute identically.

**The load-time attribute rewrite had to be stopped, which moves the "Characters (HTML)" count** → Task 7.1's hazard turned out to be pre-existing and not list-specific: `Editor.tsx`'s sync effect called `setContent(defaultValue)` with updates enabled, so on every mount the editor's own serialization was written back over any stored value that was not already byte-identical to `getHTML()` — dirtying the attribute and firing On change without a user edit. Derived marker formatting would have made that true of every previously saved formatted list, so the effect now passes `{ emitUpdate: false }`.

Consequence: `characterCountHtml` counts `stringAttribute.value` (`EditorWrapper.tsx:99-100`), which is now the value as actually stored rather than the editor's re-serialization. The bundled fixture's count drops from 82 to 49. This is arguably the more truthful number, but the count will still shift on the user's first real edit, when the canonical serialization is written. Pointing that metric at the editor's own HTML instead would make it stable, but that is a separate decision about a different feature and is left alone here.

## Open Questions

1. **Should the marker follow block-level typography?** Currently out of scope (Non-Goals). If a list item's first block is a heading, Word sizes the marker to the heading but this design leaves it at base. Resolving it means reading a computed block size, which reintroduces the base-size problem from Decision 3.
2. **Does the gutter change land here or in a follow-up?** It is separable from the marker formatting itself. Shipping marker formatting alone leaves large markers overflowing, so the recommendation is to keep them together — but they could be staged if the gutter work grows.
3. ~~**Safari `::marker` support for `font-weight`, `font-style`, and `font-family`**, not just `font-size` and `color`.~~ Resolved for Chrome 152 — all five properties verified by computed style and by rendering. Safari and Firefox remain unverified (neither is drivable here); see Risks. Proceeding on the basis that the widget's existing typed `attr()` usage already sets a higher support bar than `::marker` does.
