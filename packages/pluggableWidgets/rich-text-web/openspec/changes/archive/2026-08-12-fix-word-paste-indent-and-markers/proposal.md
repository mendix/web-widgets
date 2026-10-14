## Why

Pasting from Microsoft Word produces broken indentation and literal list-marker garbage.

Concrete failure. Word clipboard HTML:

```html
<h1
    style="margin-top:6.0pt;margin-right:0in;margin-bottom:6.0pt;margin-left:26.1pt;
           mso-list:l0 level1 lfo1;tab-stops:list 26.1pt left .5in"
>
    <![if !supportLists]><span style="mso-fareast-font-family:Arial"
        ><span style="mso-list:Ignore"
            >2.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span
        ></span
    ><![endif]>
    <span style="mso-bidi-font-family:Arial">SCOPE OF ESTIMATE<o:p></o:p></span>
</h1>
```

lands in the editor as:

```html
<h1 style="text-align: left; margin-left: 20em;">
    <span>2.</span><span style='font-family: "Times New Roman"; font-size: 7pt;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span
    ><span>SCOPE OF ESTIMATE</span>
</h1>
<p></p>
```

Two independent defects.

**1. `Indent.parseHTML` is unit-blind** (`src/extensions/Indent.ts:82-89`). It takes the numeric part of `margin-left` and divides by 2 — correct only if the unit is `em`, because the render side emits `indent * 2em`. Word emits `pt`:

```
"26.1pt" --regex--> 26.1 --/2--> 13.05 --round--> 13 --render clamps maxIndent--> margin-left: 20em
```

Two smaller bugs in the same block: the regex has no `-`, so Word's hanging indents (`margin-left:-18pt`) parse as positive indent; and the out-of-range value (13) is stored on the node — only `renderHTML` clamps.

**2. No Word paste cleanup.** `mso-*` declarations, office-namespace elements (`<o:p>`), and the `mso-list:Ignore` fake list marker all survive into the document. The marker leaves a literal `2.` plus a 7pt non-breaking-space run that Word only ever intended as tab filler.

## What Changes

Two layers with distinct trigger points and distinct responsibilities.

**Layer 1 — Word paste sanitizer** (new; runs on paste only)

- Detect Word-sourced HTML and rewrite it before ProseMirror parses it.
- Strip `mso-*` declarations and `tab-stops`; unwrap spans left with no meaningful attributes.
- Unwrap `span[style*="mso-list:Ignore"]`, keeping its marker text as plain text in the block. Drop the nested tab-filler span, collapsing to a single space.
- Map Word's symbol-font bullet markers to real characters (`·` Symbol → `•`, `o` Courier New → `◦`, `§` Wingdings → `▪`) so they do not render as literal letters.
- Remove office-namespace elements (`o:p`, `w:*`), Word conditional-comment nodes, `<xml>` blocks, and Word's `<style>` block.
- Derive the indent level from Word's own metadata — `mso-list:l0 level1 lfo1` states the level explicitly. When absent, infer the fragment's own indent step from the set of `margin-left` values and divide by it.
- Emit the result as `data-indent="N"`, removing the source `margin-left`.

**Layer 2 — unit-aware indent parsing** (existing extension; runs always)

- Normalize any CSS length unit to px before deriving the level; `floor` so the parse never over-indents relative to the source.
- Treat negative and zero margins as indent 0.
- Clamp to `[minIndent, maxIndent]` at parse time, not only at render.
- Read `data-indent` first in **both** `styleDataFormat` modes, falling back to `margin-left` only in `inline` mode. This gives Layer 1 one canonical, config-free output channel.

Layer 2 is required independently of Layer 1: `transformPastedHTML` does not run for `content: defaultValue` (`src/components/Editor.tsx:297`) or for the external-value `setContent` effect (`src/components/Editor.tsx:328`), both of which can carry `pt`/`px`/`in` margins from stored or externally-produced HTML.

Also removes the leftover paste debug logging at `src/components/Editor.tsx:287-295`.

## Capabilities

### New Capabilities

- `word-paste-cleanup`: Pasting from Microsoft Word yields clean HTML — list markers preserved as text, indentation at the correct level, no `mso-*` residue.
- `block-indent-html-parsing`: The `indent` attribute is parsed correctly from any CSS length unit, from any content source (paste, initial value, external update), and is always within the configured range.

### Modified Capabilities

<!-- None. `list-margin-indent` and `list-tab-indent` describe keyboard-driven indent commands; this change touches only HTML parsing and paste, leaving those behaviors byte-identical. -->

## Impact

**Files affected**:

- `src/extensions/Indent.ts` — rewrite the inline branch of `indent.parseHTML`; add unit normalization, negative handling, parse-time clamp, `data-indent` precedence
- `src/utils/wordPaste.ts` — NEW, pure `string -> string` transform (exported for direct unit testing)
- `src/extensions/WordPaste.ts` — NEW, thin Tiptap extension wiring the transform into `transformPastedHTML` via a ProseMirror plugin prop
- `src/components/Editor.tsx` — register `WordPaste`; delete debug `console.log` block
- `src/__tests__/Indent.spec.ts` — unit cases per length unit, negative, clamp
- `src/__tests__/wordPaste.spec.ts` — NEW, fixture-driven
- `src/__tests__/fixtures/word-*.html` — NEW, real clipboard dumps
- `CHANGELOG.md` — user-facing entry

**User-facing changes**:

- Word content pastes with indentation matching its source outline depth instead of collapsing to the maximum indent.
- Word list numbers and bullets survive as visible text; the surrounding `mso-*` markup does not.
- Numbers pasted from Word are static text, not live list numbering — they do not renumber on edit, and Enter does not continue them. Real list reconstruction is explicitly out of scope (see design).
- `getText()` and the status-bar word count now include pasted marker tokens (`2.`) as content.
- No change to any keyboard indent behavior, toolbar behavior, or non-Word paste.

**Testing scope**:

- Each CSS length unit through `Indent.parseHTML` (`px`, `pt`, `pc`, `in`, `cm`, `mm`, `em`, `rem`, `%`, `0`)
- Negative `margin-left`; above-max `margin-left`
- Existing `em` round-trip (must be byte-identical — regression guard on all of `Indent.spec.ts`)
- Word numbered heading (the `h1` sample above)
- Word nested numbered list; Word Symbol/Courier/Wingdings bullet list
- Word hanging indent (`margin-left:36pt; text-indent:-18pt`)
- Non-Word paste with `pt` margins (Google Docs) — inferred-step path
- Plain-text paste and same-editor copy/paste — must be untouched
- Both `styleDataFormat` modes (`inline` and `class`)
