# Paste fixtures

Clipboard HTML samples used by `wordPaste.spec.ts`. Provenance matters here: these
assert against quirks of real word processor output, so a hand-written
approximation can pass a test that real output would fail.

| fixture                         | provenance                                                                                                                                                                                                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `word-numbered-heading.html`    | **Real.** The `<h1>` is verbatim from a reported Microsoft Word paste, including the line-broken `margin-left:\n26.1pt` declaration and the `<![if !supportLists]>` guards. The surrounding `<html>`/`<head>`/`WordSection1` wrapper is reconstructed from Word's documented clipboard shape. |
| `word-nested-ordered-list.html` | Reconstructed from Word's documented `mso-list:lN levelM lfoK` output shape. Not captured from the app.                                                                                                                                                                                       |
| `word-symbol-bullets.html`      | Reconstructed. Uses Word's three bullet font hacks (`·` Symbol, `o` Courier New, `§` Wingdings). Not captured from the app.                                                                                                                                                                   |
| `word-hanging-indent.html`      | Reconstructed. `margin-left` with a negative `text-indent`, Word's standard hanging indent. Not captured from the app.                                                                                                                                                                        |
| `gdocs-indented.html`           | Reconstructed from Google Docs' documented output shape (`docs-internal-guid` id, `pt` margins, no `mso-*`). Not captured from the app.                                                                                                                                                       |

If a reconstructed fixture is later replaced with a genuine clipboard dump, update
this table and re-run `pnpm run test wordPaste`.
