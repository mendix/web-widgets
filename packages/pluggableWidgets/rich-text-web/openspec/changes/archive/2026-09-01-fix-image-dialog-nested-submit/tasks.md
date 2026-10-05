## 1. Remove the form wrapper from ImageDialog

- [x] 1.1 Replace `<form onSubmit={handleSubmit}>` with a plain container element in `src/components/toolbars/components/ImageDialog.tsx`
- [x] 1.2 Rename `handleSubmit` to `handleInsert` with signature `(): void` — drop the `FormEvent` parameter and the `e.preventDefault()` call
- [x] 1.3 Drop the now-unused `FormEvent` import
- [x] 1.4 Change the Insert button to `type="button" onClick={handleInsert}`, keeping `disabled={!src?.trim()}`
- [x] 1.5 Verify the Cancel button is unaffected (already `type="button"`)
- [x] 1.6 Confirm `Dialog.scss` has no `form` element selectors and no direct-child selectors, so the swap is CSS-neutral

## 2. Re-add Enter-to-insert on the dialog's own inputs

- [x] 2.1 Add a shared `onKeyDown` handler that, on `Enter`, calls `e.preventDefault()` and `handleInsert()`
- [x] 2.2 Attach it to the Image URL input
- [x] 2.3 Attach it to the Alt text and Title inputs
- [x] 2.4 Attach it to the Width and Height inputs
- [x] 2.5 Do NOT attach it to the dialog container, the `image-dialog-entity` wrapper, the dropzone, or the maintain-ratio checkbox

Note: the empty-`src` guard lives in `handleInsert`, so the key handler needs no duplicate check. `preventDefault()` is kept deliberately — it also blocks implicit submission of any app-level form the Rich Text widget itself is placed inside.

## 3. Fix the imageSelected listener effect

- [x] 3.1 Change the effect dependency array from `[dialogRef.current]` to `[]` and drop the now-unneeded eslint-disable
- [x] 3.2 Call `setActiveTab("entity")` unconditionally instead of guarding on the stale `activeTab`
- [x] 3.3 Confirm the cleanup still removes the listener from the same element captured on mount

## 4. Unit tests

- [x] 4.1 Extend `src/components/toolbars/components/__tests__/ImageDialog.spec.tsx` with an `imageConfig` that supplies `imageSourceContent` containing a `<button>` with no `type`
- [x] 4.2 Test: clicking that button does not call `setImage` and does not call `onClose`
- [x] 4.3 Test: clicking that button twice, with an `imageSelected` event dispatched in between, still does not call `setImage` or `onClose`
- [x] 4.4 Test: Enter in the Image URL input inserts the image (parameterised across URL / Alt text / Title / Width, plus a separate Height case since Height needs the ratio checkbox unchecked)
- [x] 4.5 Test: Enter in the Image URL input does nothing while the URL is empty; keys other than Enter are ignored
- [x] 4.6 Test: Enter inside the embedded `imageSourceContent` does not call `setImage`
- [x] 4.7 Confirm the existing "ImageDialog dimensions" tests still pass unchanged (they activate Insert via `getByRole("button", { name: "Insert" })`)
- [x] 4.8 Test: the dialog renders no `<form>` element (the durable structural invariant)
- [x] 4.9 Test: Insert still applies `src`, `dataEntity` and `dataEntityId` for a selected entity image, and closes the dialog
- [x] 4.10 Verify the new tests are meaningful: with the `<form>` temporarily restored, "renders no form element" and "does not insert or close ... after an image is selected" both fail. The single-click test still passes with the form present — faithfully mirroring why the first click looked silent in the bug report.

## 5. Manual verification in Studio Pro

- [x] 5.1 Media Library tab with a File Uploader in the image-source content slot: click a file's add action button once — dialog stays open, preview appears, no insert
- [x] 5.2 Click the same action button again — still no insert, dialog still open
- [x] 5.3 Press Insert — image is inserted with the entity attributes (`data-entity`, `data-entity-id`) and the dialog closes
- [ ] 5.4 URL tab: type a URL, press Enter — image inserted
- [ ] 5.5 Upload tab: drop an image, press Insert — image inserted
- [ ] 5.6 Focus a text input inside the embedded widget and press Enter — no insert

## 6. Documentation

- [x] 6.1 Add a `CHANGELOG.md` entry under Unreleased/Fixed: clicking a button inside the image dialog's Media Library content no longer inserts the image and closes the dialog
