## 0. Dependencies

- [x] 0.1 Add `react-simple-code-editor` and `highlight.js` to `chart-playground-web/package.json` (approved with user); run install
- [x] 0.2 Confirm no `codemirror` / `@codemirror/*` present in the package

## 1. Test Setup

<!-- RED: Write failing tests first -->

- [x] 1.1 Create `src/components/__tests__/CodeEditor.spec.tsx`; write failing test: renders JSON with `.hljs-*` token markup (not plain text)
- [x] 1.2 Add failing test: invalid JSON surfaces an error indication; valid JSON shows none; empty value shows none
- [x] 1.3 Add edge tests: `onChange` fires with new text on edit; `readOnly` disables editor. (Note: "highlighter throw" dropped — can't trigger a genuine hljs throw with `ignoreIllegals:true` without a mock that tests implementation, not behavior; try/catch remains as defensive code.)
- [x] 1.4 Add regression tests: `height` prop honored; no CodeMirror dep (package.json assertion); existing `preview.spec` snapshot still passes

## 2. Implementation

<!-- GREEN: Make tests pass with minimal code -->

- [x] 2.1 Replace `<textarea>` in `CodeEditor.tsx` with `react-simple-code-editor` + `highlight.js` JSON highlighter (import `highlight.js/lib/core` + register `languages/json`); keep prop contract `value/onChange?/readOnly?/height?`
- [x] 2.2 Add JSON lint: `JSON.parse(value)` in try/catch, surface error message (empty value = not an error); no silent catch
- [x] 2.3 Wrap highlight call in try/catch → fall back to raw code + `console.warn` (rich-text pattern)
- [x] 2.4 Honor `height` prop and `readOnly` (disabled); keep Tab behavior compatible with `TabGuard` (`ignoreTabKey={false}`)

## 3. Refactoring

<!-- REFACTOR: Clean up while keeping tests green -->

- [x] 3.1 Clean up component; highlight theme (`atom-one-light`) imported once in component; added scoped `.widget-charts-playground-code-editor` + error SCSS
- [x] 3.2 `highlight` + `jsonError` extracted as local module functions (kept local — no adjacent rework files touched)

## 4. Verification

- [x] 4.1 All new `CodeEditor` tests passing (8 tests)
- [x] 4.2 Full `chart-playground-web` suite passes (9 tests, preview snapshot green); `pnpm build` produces MPK with no bundling error
- [x] 4.3 Add user-facing changelog entry (highlighting + invalid-JSON feedback restored)
- [ ] 4.4 `/code-review` before PR; do not regress Leonardo's prior review; PR ready

## Notes

<!-- Track test failures, refactoring decisions, blockers. -->

- "No CodeMirror" test decided as a package.json / import assertion (per design.md open question), not a runtime RTL test.
- Scope guard: this change touches only `CodeEditor.tsx`, its test, and `package.json`. Adjacent files (`useCustomChart.ts`, `CustomChartControllerHost.ts`, `useComposedEditorController.ts`, `shared/charts`) are reserved for the follow-up ticket (`followup-ticket-draft.md`).
- Version bump deferred to release time per repo convention.
