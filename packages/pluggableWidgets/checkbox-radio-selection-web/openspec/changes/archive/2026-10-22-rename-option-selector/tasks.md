## 1. Widget XML

- [x] 1.1 Set `<name>Option Selector</name>` in `src/CheckboxRadioSelection.xml`
- [x] 1.2 Replace the empty `<description />` with text that names the widget and mentions both "checkbox" and "radio button"
- [x] 1.3 Retitle the `readOnlyStyle` property description to refer to the option selector
- [x] 1.4 Leave `id`, `studioProCategory`, `studioCategory`, and `helpUrl` untouched

## 2. Packaging metadata

- [x] 2.1 Set `marketplace.appName` to `"Option Selector"` in `package.json`
- [x] 2.2 Update the `description` field in `package.json` to the new name, keeping checkbox/radio wording
- [x] 2.3 Verify `name`, `widgetName`, `mxpackage.*`, `packagePath`, `marketplace.appNumber`, and `testProject.branchName` are unchanged
- [x] 2.4 Verify no version bump in `package.json` or `src/package.xml`

## 3. Design-time copy

- [x] 3.1 Update the three dropzone placeholders in `src/CheckboxRadioSelection.editorConfig.ts`
- [x] 3.2 Set `emptyStringFormat` to `"Option Selector"` in `src/helpers/utils.ts`
- [x] 3.3 Set `emptyCaption` to `"Option Selector"` in `src/helpers/Preview/PreviewCaptionsProvider.tsx`
- [x] 3.4 Refresh the stale name in the four `// … don't need clearable …` comments under `src/helpers/*/utils.ts` and the two SCSS banner comments

## 4. In-repo documentation

- [x] 4.1 Retitle `README.md` and update the usage step that names the widget
- [x] 4.2 Add a `### Changed` entry under `[Unreleased]` in `CHANGELOG.md` announcing the rename

## 5. Verification

- [x] 5.1 `pnpm run test` — all unit specs pass (8/8)
- [x] 5.2 `pnpm turbo build` — XML validates against the widget XSD and generated artifacts rebuild (7/7 tasks)
- [x] 5.3 `git diff typings/` is empty, and the generated locale filename still contains `com.mendix.widget.web.checkboxradioselection.checkboxradioselection`
- [x] 5.4 Case-insensitive grep for `checkbox radio selection` and `check box / radio selector` across `src/`, `README.md`, `package.json` returns zero hits
- [ ] 5.5 Optional Studio Pro check with `MX_PROJECT_PATH` set: toolbox shows "Option Selector" under Input elements, a toolbox search for "checkbox"/"radio" finds it, and an existing page using the widget still renders

## 6. Follow-up (outside this change)

- [ ] 6.1 Docs-site page in the `mendix/docs` repo: `<helpUrl>` points at `/appstore/widgets/checkboxradioselection`, which has no page yet. Title it "Option Selector", keep the slug.
