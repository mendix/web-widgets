## Why

The Charts playground editor (WC-3348) lost its real code editor. In Charts v6.3.0 the
playground shipped a CodeMirror-based editor that threw a bundling error at load, breaking
the playground in both dojo and React runtimes. To unblock the release of WC-3345, CodeMirror
was replaced with a bare `<textarea>` and shipped as charts-web 6.3.1.

The textarea works but is a developer-experience regression: no syntax highlighting and no
feedback when the JSON a developer types is invalid. The playground is a developer-facing tool
where authors hand-edit Plotly trace/layout/config JSON, so highlighting and lint matter.

## Root Cause

CodeMirror could not be bundled by the widget build (Rollup) and threw at runtime. The
workaround removed CodeMirror entirely (0 refs remain in `chart-playground-web`, `shared/charts`,
or its deps). The remaining work is to restore a real editor **without** reintroducing a
CodeMirror-class bundling dependency.

## What Changes

Replace the plain `<textarea>` in `CodeEditor.tsx` with a lightweight highlighted editor,
adapting the proven pattern from `rich-text-web`'s `HighlightedCodeEditor.tsx`
(`react-simple-code-editor` + `highlight.js`), tuned for JSON:

- `packages/pluggableWidgets/chart-playground-web/src/components/CodeEditor.tsx`
    - Render `react-simple-code-editor` with a `highlight.js` JSON highlighter instead of a raw textarea.
    - Preserve the existing prop contract exactly: `value`, `onChange?`, `readOnly?`, `height?`.
    - Surface JSON validity: when `value` fails `JSON.parse`, show a non-blocking error indication
      (do not swallow silently — the prior review flagged silent empty-catch blocks).
    - Keep Tab-in-editor behavior compatible with the surrounding `TabGuard` / "Esc + Tab to move
      focus" hint (react-simple-code-editor `ignoreTabKey={false}`).
- `packages/pluggableWidgets/chart-playground-web/package.json`
    - Add `react-simple-code-editor` and `highlight.js` (**new deps — approved with user**).
- Add unit tests for `CodeEditor` (none exist today).
- Changelog entry (user-facing): playground editor restores syntax highlighting and invalid-JSON
  feedback.

Not in scope: Leonardo de Souza's review findings on the already-merged custom-chart / playground
rework (`computed().get()` misuse, dead `containerStyle`, hardcoded `layoutOptions/configOptions`,
`store.data` cast, `@types/jest` in deps, deleted `mergeChartProps.spec.ts`, and related minors).
Those are real, still-live issues but sit in adjacent files (`useCustomChart.ts`,
`CustomChartControllerHost.ts`, `useComposedEditorController.ts`, `shared/charts`) and are tracked
in follow-up ticket WC-3488 so this change stays a single-purpose editor restore. The two
JSON-safety items from that review that DO belong here — silent empty-JSON catch blocks and the
"CodeMirror is a UX regression" note — are folded into the JSON-lint work above.

## Impact

- **Consumers:** `ComposedEditor.tsx` uses `CodeEditor` in two spots — an editable panel
  (`value`/`onChange`/`height`) and a read-only modeler panel (`readOnly`/`value`/`height`).
  The prop contract is unchanged, so both keep working. Not breaking.
- **Must NOT break:** no CodeMirror (or CodeMirror-class heavy dep) reintroduced; widget bundle
  stays small; the runtime "Toggle Editor" sidebar keeps working; read-only panel stays read-only.
- **New dependencies:** two, both lightweight and used in-repo pattern (`rich-text-web`). No
  CodeMirror bundling risk.
- **Users:** Charts playground authors get syntax highlighting + invalid-JSON feedback back.
  Version bump deferred to release time per repo convention.
