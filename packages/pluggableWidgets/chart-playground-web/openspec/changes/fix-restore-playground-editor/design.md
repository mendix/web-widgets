## Test Cases

All unit tests, `@testing-library/react`, in
`packages/pluggableWidgets/chart-playground-web/src/components/__tests__/CodeEditor.spec.tsx`
(new file — `CodeEditor` has no tests today).

The editor is `react-simple-code-editor`, which renders a real `<textarea>` under a highlighted
`<pre>`. Query the textarea via `role="textbox"` / value; assert highlight + lint via rendered
output. These tests define the contract before the textarea → highlighted-editor swap.

### Reproduction Tests

- **Renders JSON with syntax highlighting** - the editor highlights the value instead of showing
  plain unstyled text (the regression the textarea introduced). (unit)
    - **Given**: `CodeEditor` rendered with `value='{"type":"scatter","x":[1,2,3]}'`.
    - **When**: component mounts.
    - **Then**: the rendered output contains `highlight.js` token markup (at least one
      `.hljs-*` span, e.g. `hljs-attr` / `hljs-string` / `hljs-number`) wrapping parts of the
      value — not a bare unstyled text node.

- **Surfaces invalid JSON** - malformed JSON is flagged, not silently accepted (the DX gap the
  textarea left; ties to Leonardo's "no silent catch" note). (unit)
    - **Given**: `CodeEditor` rendered with `value='{"type": '` (truncated / invalid JSON).
    - **When**: component mounts (or value changes to invalid).
    - **Then**: an error indication is shown (an element with the error class / role carrying the
      `JSON.parse` message); the editor still renders the raw text (does not blank out or throw).

- **Valid JSON shows no error** - complement to the above. (unit)
    - **Given**: `CodeEditor` with `value='{"a":1}'`.
    - **When**: component mounts.
    - **Then**: no error indication element is present.

### Edge Cases

- **Empty value renders no error and no crash** (unit)
    - **Given**: `CodeEditor` with `value=''`.
    - **When**: mounts.
    - **Then**: renders an empty editor, no error indication (empty ≠ invalid), no throw.

- **onChange fires with new text on edit** (unit)
    - **Given**: `CodeEditor` with `value='{}'` and a jest mock `onChange`.
    - **When**: user types into the textbox (`fireEvent.input` / `userEvent.type`).
    - **Then**: `onChange` is called with the updated string.

- **readOnly blocks edits** - modeler panel uses `readOnly`. (unit)
    - **Given**: `CodeEditor` with `readOnly` and a mock `onChange`.
    - **When**: user attempts to type in the textbox.
    - **Then**: the textbox is non-editable (disabled/readonly attribute) and `onChange` is not
      called.

- **Highlighter degrades gracefully on throw** - a highlight failure must not break the editor. (unit)
    - **Given**: highlighting a value that would make `hljs.highlight` throw (illegal sequence).
    - **When**: mounts.
    - **Then**: falls back to rendering the raw code (no crash), matching the rich-text pattern's
      try/catch + `console.warn`.

### Regression Tests

- **Prop contract unchanged** - `ComposedEditor` calls `CodeEditor` with `value/onChange/height`
  (editable panel) and `readOnly/value/height` (modeler panel). Both must keep working. (unit)
    - **Given**: `CodeEditor` rendered with `height="var(--editor-h)"`.
    - **When**: mounts.
    - **Then**: renders without error and applies the `height` (editor container reflects the
      passed height, as the textarea did).

- **No CodeMirror dependency reintroduced** - the whole point of WC-3348. (build/lint guard)
    - **Given**: the widget package after the change.
    - **When**: inspecting imports/deps of `chart-playground-web`.
    - **Then**: no `codemirror`/`@codemirror/*` import or dependency is present; only
      `react-simple-code-editor` + `highlight.js` added.

- **preview.spec snapshot** - existing `ChartPlayground.editorPreview` snapshot still passes
  (design-time preview is unaffected — it renders a static Toggle button, not `CodeEditor`). (unit)
    - **Given**: existing `src/__tests__/preview.spec.tsx`.
    - **When**: test suite runs.
    - **Then**: snapshot matches (or is intentionally updated only if the preview markup changes).

## Notes

- `react-simple-code-editor` renders a genuine textarea → RTL `getByRole("textbox")` works;
  editing via `fireEvent.input(textarea, { target: { value } })`.
- Import `highlight.js/lib/core` + register only `languages/json` (tree-shaken) — assert token
  markup, not a specific theme.
- The "No CodeMirror" check can be a dependency/import assertion or a package.json test rather
  than a runtime RTL test — decide at tasks.md time.
