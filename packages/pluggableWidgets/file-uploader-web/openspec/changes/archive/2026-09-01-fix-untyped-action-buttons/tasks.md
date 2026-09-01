## 1. Type the buttons

- [x] 1.1 `src/components/ActionButton.tsx` — add `type="button"` to the `<button>` element
- [x] 1.2 `src/components/ActionButton.tsx` — remove the redundant `role={"button"}` attribute
- [x] 1.3 `src/components/RetryButton.tsx` — add `type="button"` to the `<button>` element
- [x] 1.4 Confirm no other `<button>` elements exist in `src/` (`grep -rn "<button" src`)

## 2. Unit tests

- [x] 2.1 Add `src/components/__tests__/ActionButton.spec.tsx` following the pattern in `src/components/__tests__/DismissActionsBar.spec.tsx`
- [x] 2.2 Test: rendering `ActionButton` inside a `<form onSubmit={spy}>` and clicking it calls the button's `action` and does not call the submit spy
- [x] 2.3 Test: the rendered element is a `<button>` with `type="button"` and no explicit `role` attribute
- [x] 2.4 Add equivalent coverage for `RetryButton` inside a `<form>` (retry runs, form not submitted) — placed in its own `src/components/__tests__/RetryButton.spec.tsx`
- [x] 2.5 Verify the new submit test is meaningful: with `type="button"` temporarily removed, "runs its action without submitting an enclosing form" fails with `Received number of calls: 1`

## 3. Manual verification in Studio Pro

- [ ] 3.1 Place a File Uploader on a page inside a container that renders a `<form>`, upload a file, click its action button — the page does not submit or reload
- [ ] 3.2 Force an upload failure, click retry — retry runs, no form submission
- [ ] 3.3 Keyboard: Tab to a file action button, press Enter and Space — action runs, no form submission
- [ ] 3.4 Confirm clicking an action button still does not activate the surrounding `.file-entry` / dropzone (the `stopPropagation()` behaviour is unchanged)

## 4. Documentation

- [x] 4.1 Add a `CHANGELOG.md` entry under Unreleased/Fixed: file action and retry buttons no longer submit an enclosing form
