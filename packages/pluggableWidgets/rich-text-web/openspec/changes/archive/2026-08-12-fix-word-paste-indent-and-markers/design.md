## Context

Rich text widget uses Tiptap 3.x. Block indentation is a global attribute `indent` (an integer level) registered by `Indent` (`src/extensions/Indent.ts`) on paragraph, heading, blockquote, and the three list types. It is configured in `src/components/Editor.tsx:224-233` with `minIndent: 0`, `maxIndent: 10`, `indentStep: 1`.

Render side (`Indent.ts:112-116`, `inline` mode):

```js
return { style: `margin-left: ${indent * 2}em` };
```

Parse side (`Indent.ts:81-90`, `inline` mode) — the bug:

```js
const marginLeft = element.style.marginLeft;
if (marginLeft) {
    const match = marginLeft.match(/(\d+(?:\.\d+)?)/);
    if (match) {
        return Math.round(parseFloat(match[1]) / 2);
    }
}
return 0;
```

The `/2` is the inverse of `* 2em` — so parse silently assumes the unit is `em`. Three defects follow:

1. **Unit-blind.** `26.1pt` is read as if it were `26.1em`.
2. **Sign-blind.** The regex has no `-`, so `-18pt` yields `18`.
3. **Unclamped at parse.** The out-of-range level is written to the node; only `renderHTML` clamps.

Trace of the reported failure:

```
"26.1pt"  --regex-->  26.1  --/2-->  13.05  --round-->  13
                                                          |
                                     stored on node as indent: 13  (out of range)
                                                          |
                                     renderHTML clamps to maxIndent 10
                                                          |
                                                margin-left: 20em
```

Note this defect is confined to `styleDataFormat: "inline"`. In `"class"` mode the parser reads `data-indent` only, so Word paste loses indentation entirely rather than exploding.

### Where the paste enters

```
Word app
   |  clipboard text/html
   v
transformPastedHTML          <-- paste only  (Layer 1 hooks here)
   |
ProseMirror DOMParser
   |
Indent.parseHTML             <-- runs for paste AND for setContent/defaultValue  (Layer 2)
   |
doc { indent: <integer level> }
```

`transformPastedHTML` does not run for `content: defaultValue` (`Editor.tsx:297`) nor for the external-value effect that calls `setContent` (`Editor.tsx:328`). Stored Mendix attribute values can contain `pt`/`px`/`in` margins — from the widget's pre-Tiptap Quill era, from another editor, or from a microflow. So the unit fix must live in `Indent.parseHTML`, not only in the sanitizer.

### Word's list markup

Word emits **no list element at all**. Each list paragraph is a flat sibling carrying the level in a style declaration, and the visible number/bullet as literal text inside an `mso-list:Ignore` span guarded by downlevel-revealed conditional comments:

```
<p style='...mso-list:l0 level2 lfo1'>
  <![if !supportLists]><span style='mso-list:Ignore'>a.<span style='font:7.0pt "Times New Roman"'>&nbsp;</span></span><![endif]>
  text
</p>
```

Per the HTML parsing spec, `<![if !supportLists]>` hits the bogus-comment state (`<!` not followed by `--`, `DOCTYPE`, or `[CDATA[`), so `DOMParser` yields comment nodes with data `[if !supportLists]` and `[endif]`. The marker content between them is real DOM.

## Goals / Non-Goals

**Goals:**

- Word paste indents at the correct outline level instead of collapsing to `maxIndent`.
- Word list numbers and bullets remain visible; the `mso-*` scaffolding does not.
- `indent` parses correctly from any CSS length unit and any content source.
- `indent` on a node is always a finite integer within `[minIndent, maxIndent]`.
- Existing `em` round-trip stays byte-identical — no regression in `Indent.spec.ts`.

**Non-Goals:**

- Reconstructing real `<ol>`/`<ul>` structure from Word markup (see Decision 2).
- Adding a `start` attribute to `orderedList`.
- Live renumbering of pasted Word numbers.
- Google Docs–specific handling (the inferred-step path helps it incidentally; no dedicated code).
- Word table, font, colour, or smart-quote normalization.
- Mapping `MsoNormal` / `MsoListParagraph` classes to widget styles — they are stripped, not translated.
- Any change to keyboard indent commands (`Tab`, `Ctrl+]`, `Ctrl+[`) or the toolbar.

## Decisions

### Decision 1: Two layers, not one

**Choice**: A paste-only Word sanitizer (Layer 1) plus an always-on unit-aware parser (Layer 2).

**Rationale**: They have different trigger surfaces and different knowledge. Layer 1 sees the whole fragment and Word-specific metadata, and can do structural repair. Layer 2 sees one element with no context, runs on every content source, and must stay source-agnostic. Neither subsumes the other:

| concern                    | layer | needs Word knowledge? | fires on `setContent`? |
| -------------------------- | ----- | --------------------- | ---------------------- |
| fake list markers          | 1     | yes                   | no                     |
| `mso-list levelN` → indent | 1     | yes                   | no                     |
| unit conversion            | 2     | no                    | yes                    |
| negative / clamp           | 2     | no                    | yes                    |

The layering also removes the need for any Word-specific hack inside `Indent.ts`.

**Alternatives considered**:

- Sanitizer only → leaves `defaultValue` and `setContent` paths broken.
- Parser only → cannot repair markers or read `mso-list` levels (no fragment context, no cross-element view).

### Decision 2: Keep Word list markers as plain text; do not reconstruct lists

**Choice**: Unwrap the `mso-list:Ignore` span and leave its marker text inline in the block. Applies uniformly to **all** block types — headings and paragraphs alike.

Result for the reported sample:

```html
<h1 data-indent="1">2. SCOPE OF ESTIMATE</h1>
```

**Rationale**:

- **Schema collision makes reconstruction unsafe for headings.** `listItem` content spec is `paragraph block*` (`node_modules/@tiptap/extension-list/dist/index.js:414`) — the first child of `<li>` must be a paragraph. `<ol><li><h1>…</h1></li></ol>` is not valid, so ProseMirror's fitting either injects an empty leading `<p>` or demotes the heading to a paragraph. Word numbered _headings_ are the dominant case in the documents this bug was reported against (contracts, estimates: "2. SCOPE OF ESTIMATE"), so this is the main path, not an edge case.
- **Reconstruction is 5–10× the work and carries most of the risk**: group consecutive siblings by `lfo` id; drive a 9-level open/close stack from flat `levelN` values; classify ordered vs bullet from marker text plus font-family heuristics; map to `listStyleType` (`OrderedListStyled.ts` currently supports only `decimal`, `lower-alpha`, `lower-roman` — Word also emits upper-alpha, upper-roman, decimal-leading-zero); add a `start` attribute that does not exist yet, with its own parse/render/round-trip.
- **The value of reconstruction is speculative; its cost is certain.** Live renumbering is a nice-to-have for a document that was pasted in order to read and edit its text.
- **Not a detour.** The marker-detection selector this decision needs is precisely what reconstruction would need later. A follow-up change can replace the paragraph branch without discarding anything here.

**Accepted losses** (must appear in the changelog):

- Numbers are frozen — no renumbering on edit, reorder, or delete.
- Enter does not continue the numbering; Tab does not nest.
- `getText()` and the `StatusBar` word count include marker tokens (`2.`).

**Accessibility note**: heading text becomes `"2. SCOPE OF ESTIMATE"`, so the number is announced. Preferable to the alternative of demoting an `<h1>` to a paragraph to satisfy the list schema, which would break the document outline.

**Alternatives considered**:

- Real `<ol>` reconstruction → the schema and cost problems above.
- Reconstruct for `<p>`, text-marker for headings → two permanent code paths and all of reconstruction's cost, for partial benefit.
- Drop the marker entirely → loses information the user can see in the source document.

### Decision 3: Substitute Word's symbol-font bullet markers

**Choice**: Before keeping marker text verbatim, classify it:

```
marker text + font-family
   |
   +-- ordered pattern  ^\s*(\d+|[A-Za-z]|[ivxlcdmIVXLCDM]+)\s*[.)\]]\s*$
   |      -> keep verbatim                     "2."  "a."  "iv)"
   |
   +-- font in { Symbol, Courier New, Wingdings }
   |      -> substitute a real character
   |           ·  (U+00B7, Symbol)      -> •  (U+2022)
   |           o  (Courier New)         -> ◦  (U+25E6)
   |           §  (Wingdings)           -> ▪  (U+25AA)
   |
   +-- else -> keep verbatim (safe default)
```

**Rationale**: Word renders bullets as font hacks, not as bullet characters. Keeping them verbatim while stripping the font declaration would put a literal `o` or `§` in the document — worse than the bug being fixed. The table is a ~10-line lookup; it does not reintroduce any of Decision 2's structural cost.

**Alternatives considered**:

- Keep all markers verbatim → literal `o`/`§` in output.
- Preserve the Symbol/Wingdings font on the marker span → font almost certainly absent on the reader's machine, and it contradicts stripping `mso-*` font junk.
- Drop symbol markers → silently loses the bullet.

### Decision 4: Read the indent level from Word metadata, do not measure it

**Choice**: In Layer 1, when `mso-list` is present, take the level from the declaration itself:

```
mso-list:l0 level1 lfo1
              ^^^^^^  Word states the level
```

`level N` → `indent N`.

**Rationale**: The two grids are incompatible. Word's indent step is `0.5in` = `36pt` = `48px`; the widget's is `2em` = `32px`, and `48 / 32 = 1.5`. Because the widget stores an integer level, it can only render 32/64/96/128 px — Word's 48/96/144/192 px are mostly unreachable. Any measuring approach therefore cannot preserve visual width, and worse, it destroys uniform nesting:

```
Word     px    /32     round   floor
L1       48    1.5  ->   2       1
L2       96    3.0  ->   3       3
L3      144    4.5  ->   5       4
L4      192    6.0  ->   6       6

round: level steps 2,1,2,1   <- irregular
floor: level steps 1,2,1,2   <- irregular
```

Irregular steps make nested lists visibly stagger — a sub-item can end up less indented than its parent's sibling. Reading `levelN` yields steps of exactly 1 at every depth: uniformly ~33% tighter than Word, which reads as an intentional editor style rather than as damage.

**Alternatives considered**:

- Measure px and divide by 32 → the irregular nesting above. Retained only as the Layer 2 last resort, where no metadata exists.
- Change the widget's render step to `3em` (48px) so the grids align → changes every existing document's appearance and breaks `Indent.spec.ts` expectations. Out of proportion to the bug.

### Decision 5: Infer the fragment's own indent step when `mso-list` is absent

**Choice**: For Word blocks with a `margin-left` but no `mso-list`, Layer 1 collects every `margin-left` value in the fragment, clusters them with tolerance (Word emits jitter such as `26.1pt` alongside `26.05pt`), takes the smallest cluster above a minimum threshold as the step, and computes `level = round(value / step)`.

```
{34.8px}          -> step 34.8  -> L1
{48, 96, 144}     -> step 48    -> L1, L2, L3
{36pt, 72pt}      -> step 36pt  -> L1, L2
```

**Rationale**: Derives uniform levels from any source without hardcoding Word's `0.5in` grid — it happens to work for Google Docs too, which also uses a `36pt` step and carries no level metadata. Only a whole-fragment view can do this, which is exactly what Layer 1 has and Layer 2 does not.

**Risk / mitigation**: A fragment with a single small odd value (e.g. one paragraph at `7pt`) would make that value the step and yield level 1, over-indenting. Mitigated by a minimum step threshold below which the value maps to indent 0.

### Decision 6: `data-indent` as the single machine-set indent channel

**Choice**: Layer 1 always emits `data-indent="N"` and removes the source `margin-left`. Layer 2's `parseHTML` reads `data-indent` first in **both** `styleDataFormat` modes, falling back to `margin-left` only in `inline` mode.

**Rationale**: The alternative is passing `styleDataFormat` into the sanitizer so it can emit `margin-left` or `data-indent` to match the active mode. That couples a pure HTML transform to widget configuration, and a mode-blind sanitizer emitting `margin-left` would lose all indentation in `class` mode (where the parser ignores `margin-left` entirely).

Backward compatible: the widget's own `inline`-mode output never contains `data-indent`, so adding the lookup changes nothing for existing content. `class`-mode parsing is unchanged.

**Alternatives considered**:

- Sanitizer takes `styleDataFormat` → config coupling in a pure function; two output shapes to test.
- Sanitizer emits both `margin-left` and `data-indent` → redundant, and leaves a stale `margin-left` in the DOM whose value disagrees with the stored level.

### Decision 7: `floor` in Layer 2's unit conversion

**Choice**: Normalize to px against a 16px root, then `level = floor(px / 32 + ε)`; clamp to range; negative or zero → 0.

| unit        | px factor                                                               |
| ----------- | ----------------------------------------------------------------------- |
| `px`        | 1                                                                       |
| `pt`        | 4/3                                                                     |
| `pc`        | 16                                                                      |
| `in`        | 96                                                                      |
| `cm`        | 96/2.54 ≈ 37.795                                                        |
| `mm`        | ≈ 3.7795                                                                |
| `em`, `rem` | 16                                                                      |
| `%`         | ignored → 0 (relative to container width; not resolvable at parse time) |

**Rationale**:

- `em` round-trip is preserved exactly: `2em → 32px → floor(32/32) = 1`, `20em → 320px → 10`. The new formula reduces to the old `/2` for `em` inputs, so existing expectations hold.
- `floor` never _increases_ indent beyond the source. Under-indenting is a mild cosmetic loss; over-indenting is the reported bug (`20em`). Fail toward less.
- The small ε absorbs float noise (e.g. `cm`/`mm` conversions landing at 31.9999px).
- 32px per level is fixed by the render formula (`indent * 2em`) and is independent of `indentStep`, which is the per-keypress increment, not the per-level width.

**Known behavior change**: a foreign `margin-left: 3em` previously parsed as 2 (`round(1.5)`) and now parses as 1. Intentional and consistent with the fail-toward-less rule. The full `Indent.spec.ts` suite must be run to confirm no existing expectation depended on round-up.

### Decision 8: Pure transform in `utils/`, thin extension in `extensions/`

**Choice**: `src/utils/wordPaste.ts` exports a pure `string -> string` function. `src/extensions/WordPaste.ts` is a Tiptap extension whose `addProseMirrorPlugins` returns a `Plugin` with a `transformPastedHTML` prop that calls it.

**Rationale**: Matches the existing 17-extension folder convention for registration, while keeping the logic testable as plain string-in/string-out with no editor instance. `transformPastedHTML` is a ProseMirror _prop_, not a command, so a plugin is the idiomatic way for an extension to contribute it.

### Decision 9: Leave existing per-extension Word tolerance alone

**Choice**: Do not migrate `TextHighlightClass.ts:78` (which already handles Word's `background` shorthand) or any other parse-time Word tolerance into the sanitizer.

**Rationale**: Two different jobs. Per-extension parse tolerance is source-agnostic robustness that also benefits Google Docs and LibreOffice, and it runs on `setContent`. The sanitizer does Word-specific structural repair that no single extension can do alone. Centralizing would reduce robustness on the non-paste paths.

### Decision 10: Strip `text-indent`, and strip the marker's font wrapper with the marker

Two refinements found while the Layer 1 tests were being written. Both follow from Decision 2 (markers become inline text) rather than adding anything new to it.

**Choice A**: `text-indent` is removed from Word blocks alongside `margin-left`.

**Rationale**: Word's `text-indent` on a list paragraph is almost always the negative half of a hanging indent — `margin-left:36pt; text-indent:-18pt` — whose sole purpose is to pull the list marker leftwards to a tab stop while the wrapped text lines up at the margin. Flattening the marker into the text dismantles that mechanism, so a surviving `text-indent:-18pt` no longer positions a marker; it just drags the first line of real text 18pt to the left of every other line. Tiptap parses no `text-indent` attribute either, so keeping it would preserve visual damage and nothing else.

**Choice B**: When flattening a marker, replace the outermost ancestor that wraps nothing but the marker (walking up through `span`/`font` only), not the marker span itself.

**Rationale**: Word nests the marker one level deep inside a wrapper that exists purely to carry the bullet's font:

```html
<span style="font-family:Symbol"><span style="mso-list:Ignore">·</span></span>
```

`font-family:Symbol` is a legitimate declaration, so `stripWordAttributes` correctly leaves it alone — meaning the wrapper outlives the marker it was wrapping. The substituted `•` then inherits Symbol and renders as the wrong glyph again, which is the exact failure Decision 3 exists to prevent. Substituting the character and discarding its font are one operation, not two. The walk is bounded to wrappers whose only child is the marker, so a wrapper that also holds real text is never touched.

## Resolved Questions

Both open questions were settled by a throwaway jsdom probe during implementation. The probe surfaced a third finding that changes the implementation, recorded below.

### 1. The trailing `<p></p>` is Tiptap's, not Word's — do not "fix" it

Probe results against a plain `StarterKit` editor with no Word content and no sanitizer:

```
setContent("<h1>SCOPE OF ESTIMATE</h1>")        ->  <h1>SCOPE OF ESTIMATE</h1><p></p>
setContent("<div><h1>SCOPE OF ESTIMATE</h1></div>") ->  <h1>SCOPE OF ESTIMATE</h1><p></p>
clearContent()                                  ->  <p></p>
```

The trailing empty paragraph appears for a bare `<h1>` with no Word markup involved — it is Tiptap's trailing-node behavior, which guarantees a caret position after a non-paragraph final block. It is expected output, not damage from the paste path. The sanitizer must not attempt to remove it, and no spec scenario asserts its absence.

### 2. `element.style.marginLeft` does resolve the line-broken declaration

```
getAttribute("style")  ->  "margin-top:6.0pt;margin-left:\n26.1pt;mso-list:l0 level1 lfo1;tab-stops:..."
style.marginLeft       ->  "26.1pt"
```

CSS is whitespace-insensitive, so the newline inside the declaration is harmless. Layer 2 can read `element.style.marginLeft` as it does today. Note CSSOM normalizes numbers on the way through (`6.0pt` becomes `6pt`), which is irrelevant to the level calculation.

### 3. NEW — `element.style` cannot see `mso-*` at all; the raw attribute can

This was not anticipated and constrains Layer 1. CSSOM discards declarations for unknown properties, so `mso-list` is invisible through the `style` object:

```
style.cssText                    ->  "margin-top: 6pt; margin-left: 26.1pt;"   (mso-list, tab-stops gone)
style.getPropertyValue("mso-list") ->  ""
style.length                     ->  2
```

Consequences:

- **Reading** `mso-list` (Decision 4's level lookup) MUST go through `getAttribute("style")` and a regex over the raw string. `element.style.getPropertyValue` returns empty.
- **Attribute selectors still work**, because they match the raw attribute string, not CSSOM. Verified: `querySelector('span[style*="mso-list:Ignore"]')` matches. Decision 3's marker lookup is therefore sound as written.
- **Writing** through CSSOM silently strips `mso-*` as a side effect (`removeProperty("margin-left")` rewrote the attribute to `"margin-top: 6pt;"`, dropping both `mso-list` and `tab-stops`). Convenient, but it is implicit and also renormalizes unrelated values. Layer 1 therefore manipulates the raw `style` attribute string explicitly rather than depending on this behavior.

### 4. Bonus — Decision 2's schema collision is worse than predicted

The design predicted an injected empty leading paragraph. What actually happens is that the heading is **ejected from the list entirely**, leaving a stranded empty list item:

```
setContent("<ol><li><h1>SCOPE OF ESTIMATE</h1></li></ol>")
  ->  <ol><li><p></p></li></ol><h1>SCOPE OF ESTIMATE</h1><p></p>
```

Confirmed against `@tiptap/extension-list@3.29.0`, whose `listItem` content spec is `paragraph block*` (`dist/index.js:414`). This strengthens Decision 2: reconstructing a real list around a Word numbered heading would produce a stranded empty bullet plus an un-listed heading.
