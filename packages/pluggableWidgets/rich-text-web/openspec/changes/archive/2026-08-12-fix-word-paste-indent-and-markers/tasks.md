## 1. Investigation (resolve design open questions first)

- [x] 1.1 Capture real Word clipboard HTML dumps into `src/__tests__/fixtures/`: `word-numbered-heading.html` (the reported sample), `word-nested-ordered-list.html`, `word-symbol-bullets.html`, `word-hanging-indent.html` — the heading is verbatim from the real report; the other three are reconstructed from Word's documented output shape. Provenance recorded in `fixtures/README.md`; swap in genuine dumps when available.
- [x] 1.2 Capture a Google Docs paste dump into `src/__tests__/fixtures/gdocs-indented.html` (pt margins, no `mso-list`) for the inferred-step path — reconstructed, not captured; see `fixtures/README.md`
- [x] 1.3 Assert against a real fixture that `element.style.marginLeft` resolves the line-broken declaration `margin-left:\n26.1pt` (design Open Question 2) — resolved: yields `"26.1pt"`. Locked in as a test in `wordPaste.spec.ts`.
- [x] 1.4 Determine the source of the trailing `<p></p>` in the reported output — Word fragment vs ProseMirror slice fitting (`openEnd`) — and record the finding in `design.md`. Only claim a fix for it if it is Word's. — resolved: it is Tiptap's trailing node, reproducible with `setContent("<h1>x</h1>")` and no Word content. Not a bug; nothing to fix.
- [x] 1.5 Confirm `listItem` content spec is `paragraph block*` in the installed `@tiptap/extension-list` version, backing Decision 2 — confirmed at `@tiptap/extension-list@3.29.0`, `dist/index.js:414`. Probe also showed `<ol><li><h1>` ejects the heading from the list entirely, strengthening Decision 2.
- [x] 1.6 NEW — established that `element.style` discards `mso-*` declarations (`getPropertyValue("mso-list")` returns `""`), so Layer 1 must read `mso-list` from the raw `getAttribute("style")` string. Attribute selectors (`span[style*="mso-list:Ignore"]`) still match. Recorded in `design.md`.

## 2. Layer 2 — unit-aware indent parsing (`src/extensions/Indent.ts`)

- [x] 2.1 Add a length-to-px helper covering `px`, `pt`, `pc`, `in`, `cm`, `mm`, `em`, `rem` against a 16px root; return `null` for `%` and unparseable values
- [x] 2.2 Replace the `inline` branch regex (`Indent.ts:82-89`) with: read the length, convert to px, `level = floor(px / 32 + ε)`
- [x] 2.3 Treat negative and zero px as level 0 (regex currently drops the sign)
- [x] 2.4 Clamp the derived level to `[minIndent, maxIndent]` at parse time, so no out-of-range value reaches the node
- [x] 2.5 Read `data-indent` first in **both** style modes; fall back to `margin-left` only in `inline` mode (Decision 6)
- [x] 2.6 Clamp `data-indent` on parse as well
- [x] 2.7 Leave `renderHTML` unchanged — its existing coercion stays as a second line of defence

## 3. Layer 2 unit tests (`src/__tests__/Indent.spec.ts`)

- [x] 3.1 One case per unit: `26.1pt`→1, `64px`→2, `1in`→3, `2cm`→2, `2em`→1, `20em`→10, `25%`→0, `0`→0, no declaration→0
- [x] 3.2 `20px`→0 (sub-level margin never rounds up)
- [x] 3.3 `-18pt`→0; `margin-left:36pt; text-indent:-18pt`→1 with `text-indent` ignored
- [x] 3.4 `100em`→`maxIndent`, asserting the **stored node attribute**, not just the rendered output
- [x] 3.5 `data-indent="2"` honoured in `inline` mode and rendered as `margin-left: 4em`
- [x] 3.6 `data-indent="1"` wins over a conflicting `margin-left: 20em`
- [x] 3.7 `class` mode unchanged: `data-indent="3"` parses to 3; `margin-left:26.1pt` with no `data-indent` parses to 0
- [x] 3.8 Regression guard — run the whole existing suite unchanged and confirm every current `em` expectation still holds (`2em`, `6em`, `20em` cases). Any failure means the `floor` decision needs revisiting, not the test.

## 4. Layer 1 — Word paste sanitizer (`src/utils/wordPaste.ts`)

- [x] 4.1 Create the module exporting a pure `string -> string` transform; parse with `DOMParser`, mutate, serialize
- [x] 4.2 Word detection: any of `mso-` declaration, `Mso*` class, `urn:schemas-microsoft-com:office:*`, Word `Generator`/`ProgId` meta, `mso` conditional comment. Return input untouched when not detected.
- [x] 4.3 Remove Word conditional-comment nodes (they arrive as comment nodes with data `[if !supportLists]` / `[endif]`), `<xml>` blocks, and Word's `<style>` block
- [x] 4.4 Strip `mso-*` and `tab-stops` declarations from every `style` attribute; strip `Mso*` class names; unwrap any element left with no meaningful attributes
- [x] 4.5 Remove office-namespace elements (`o:p`, `w:*`)
- [x] 4.6 Marker handling: locate `span[style*="mso-list:Ignore"]`, drop the nested tab-filler span, collapse to a single space, unwrap the span keeping its text
- [x] 4.7 Marker classifier: ordered pattern `^\s*(\d+|[A-Za-z]|[ivxlcdmIVXLCDM]+)\s*[.)\]]\s*$` → verbatim; symbol-font lookup (`·`/Symbol→`•`, `o`/Courier New→`◦`, `§`/Wingdings→`▪`); otherwise verbatim
- [x] 4.8 Indent from metadata: parse `levelN` out of `mso-list`, emit `data-indent="N"` clamped, remove the source `margin-left`
- [x] 4.9 Indent by inference (no `mso-list`): collect fragment `margin-left` values, cluster with tolerance, smallest cluster above the minimum threshold is the step, `level = round(value / step)`; below-threshold → 0
- [x] 4.10 Never emit `margin-left` — `data-indent` only, so the transform stays free of `styleDataFormat` (Decision 6)
- [x] 4.11 Guarantee idempotence: sanitized output must contain no Word markers, so a second pass is a no-op
- [x] 4.12 NEW (design Decision 10A) — strip `text-indent` alongside `margin-left`. Word's is the negative half of a hanging indent that only positioned the marker; with the marker inlined it would offset the first line of real text instead.
- [x] 4.13 NEW (design Decision 10B) — when flattening a marker, replace the outermost ancestor wrapping nothing but that marker. Word's `<span style='font-family:Symbol'>` wrapper is a legitimate declaration that survives attribute stripping, so the substituted `•` would otherwise still render in Symbol.

## 5. Layer 1 wiring (`src/extensions/WordPaste.ts`, `src/components/Editor.tsx`)

- [x] 5.1 Create the extension; `addProseMirrorPlugins` returns a `Plugin` whose `props.transformPastedHTML` calls the pure transform
- [x] 5.2 Register `WordPaste` in the `extensions` memo in `Editor.tsx`
- [x] 5.3 Delete the debug `transformPastedHTML`/`handlePaste` `console.log` block at `Editor.tsx:287-295`
- [x] 5.4 Verify no other extension already claims `transformPastedHTML`, so there is no prop collision

## 6. Layer 1 tests (`src/__tests__/wordPaste.spec.ts`)

- [x] 6.1 Fixture: numbered heading → single `<h1 data-indent="1">2. SCOPE OF ESTIMATE</h1>`, `h1` preserved, no `<ol>`/`<li>`, no 7pt span, no nbsp run
- [x] 6.2 Fixture: nested ordered list → `data-indent` `1,2,3` with uniform steps
- [x] 6.3 Fixture: symbol bullets → `•`, `◦`, `▪`; no literal `o` or `§` in output
- [x] 6.4 Fixture: hanging indent → level from `margin-left`, `text-indent` ignored
- [x] 6.5 Fixture: Google Docs → inferred-step path gives `1,2,3`
- [x] 6.6 Jittered `26.1pt` / `26.05pt` resolve to the same level
- [x] 6.7 Below-threshold margin (`2pt`) → level 0
- [x] 6.8 Non-Word HTML passes through byte-identical
- [x] 6.9 Idempotence: transform applied twice equals transform applied once
- [x] 6.10 `color:red;mso-bidi-font-family:Arial` keeps `color: red` and keeps the span
- [x] 6.11 End-to-end through the editor in both `styleDataFormat` modes: `inline` renders `margin-left: 2em`, `class` renders `data-indent="1"` + `indent-1`
- [x] 6.12 Regression guards for tasks 4.12/4.13: no `Symbol`/`Wingdings`/`Courier` and no `<span` survives in the bullet fixture; no `text-indent` survives
- [x] 6.13 Text assertions compare whitespace-normalized text — Word hard-wraps its clipboard HTML mid-sentence (`SCOPE\nOF ESTIMATE`), which renders as one space; asserting on source bytes would be a false failure
- [x] 6.14 Confirm the 10 pre-existing failures in `RichText.spec.tsx`, `ImageDialog.spec.tsx` and `TableHeaderBackgroundColor.spec.ts` are unrelated: identical failures with this change stashed. New suites add 71 passing tests (181 → 252).

## 7. Manual verification in Studio Pro

- [x] 7.1 Paste the original reported Word document; confirm indentation matches the source outline and `2.` is visible
- [x] 7.2 Paste a multi-level Word numbered list; confirm nesting depth reads uniformly
- [x] 7.3 Paste a Word bulleted list; confirm real bullet characters
- [x] 7.4 Paste Word content into a table cell; confirm no layout breakage
- [x] 7.5 Copy from the widget and paste back in; confirm unchanged (no double-sanitizing)
- [x] 7.6 Paste plain text and paste from a browser page; confirm untouched
- [x] 7.7 Load a stored value containing `pt` margins; confirm correct indent without any paste involved
- [x] 7.8 Keyboard `Tab`/`Shift+Tab`/`Ctrl+]`/`Ctrl+[` and the toolbar indent buttons; confirm no regression

- Verified manually in Studio Pro against the original reported Word document; all eight checks behaved as expected.

## 8. E2E

- [x] 8.1 Playwright spec pasting Word-shaped HTML via the clipboard API, asserting the resulting editor HTML has correct `margin-left` and visible marker text — following `docs/requirements/e2e-test-guidelines.md`. Written as `e2e/RichTextWordPaste.spec.js`: four tests covering indentation + marker text, absence of Word residue, `class` mode, and a non-Word paste. **Not executed** — needs a running Mendix app, so it must be run in CI or locally against one.
    - Asserts the emitted `margin-left: 2em`, not computed pixels: `em` resolves against each block's own font-size, so an `h1` at level 1 is not 32px.

## 9. Documentation

- [x] 9.1 `CHANGELOG.md`: fixed — content pasted from Word no longer collapses to maximum indentation; list numbers and bullets now paste as readable text without Word markup residue
- [x] 9.2 `CHANGELOG.md`: note the accepted limitation — numbers pasted from Word are static text and do not renumber when the content is edited (folded into the 9.1 marker entry so users read the caveat with the fix)
- [x] 9.3 Record the Open Question findings from tasks 1.3 and 1.4 in `design.md`
