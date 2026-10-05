## Why

On the image dialog's Media Library (`entity`) tab, clicking a file action button inside the embedded image-source widget inserts the image and closes the dialog on the **second** click, without the user ever pressing Insert.

Root cause: the dialog wraps all of its content — including the app-developer-configured `imageSourceContent` — in a `<form onSubmit={handleSubmit}>`. Per the HTML spec, a `<button>` with no `type` attribute inside a form defaults to `type="submit"`. The File Uploader widget's `action-button` (`file-uploader-web/src/components/ActionButton.tsx`) has no `type`, so every click on it performs implicit form submission of the image dialog's form. Its `e.stopPropagation()` does not help: stopping propagation does not cancel a button's default activation behaviour, only `preventDefault()` does.

The symptom presents on the second click because of the guard in `handleSubmit`:

```
CLICK 1  button activation -> submit -> handleSubmit -> preventDefault
                                                     -> src === "" -> early return   (silent)
         React onClick     -> Mendix action (async) -> "imageSelected" -> setSrc(url)

CLICK 2  button activation -> submit -> handleSubmit -> preventDefault
                                                     -> src truthy -> setImage() + onClose()
```

Click 1 already submits; `if (!editor || !src.trim()) return;` merely hides it.

`imageSourceContent` is arbitrary content configured by the app developer in Studio Pro. The image dialog therefore cannot rely on every embedded widget marking its buttons `type="button"` — the accompanying `file-uploader-web` fix (`fix-untyped-action-buttons`) removes today's trigger, but any other widget, any older File Uploader version, or an Enter keypress inside an embedded text input reproduces the failure. The dialog must be structurally immune.

## What Changes

- Remove the `<form>` wrapper from `ImageDialog`. The dialog body becomes a plain container, so no descendant can trigger implicit form submission of the dialog.
- The Insert button becomes `type="button"` with an `onClick` handler. `handleSubmit` becomes an eventless `handleInsert(): void` (no `preventDefault` needed).
- Re-add Enter-to-insert explicitly, and only on the dialog's **own** single-line inputs (URL, Alt text, Title, Width, Height). Enter inside `imageSourceContent` or the upload dropzone SHALL NOT insert. Enter respects the same guard as the Insert button (no insert while `src` is empty).
- Fix the stale-closure/non-reactive-dependency bug in the `imageSelected` listener effect: `useEffect(..., [dialogRef.current])` never re-runs (a ref's `.current` is not reactive), so `handleImageSelected` permanently captures `activeTab` from the first render. Register with `[]` and set the entity tab unconditionally.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `rich-text-image-dialog`: adds a requirement that inserting an image is triggered only by the dialog's own Insert control, and that content embedded via `imageSourceContent` cannot trigger insertion or dialog dismissal.

## Impact

**Files affected**:

- `src/components/toolbars/components/ImageDialog.tsx` — drop `<form>`/`onSubmit`; Insert becomes `type="button" onClick`; rename `handleSubmit` to `handleInsert` (eventless); add Enter handling on own inputs; fix listener effect dependencies.

**Not affected (out of scope)**:

- `LinkDialog.tsx` and `VideoDialog.tsx` use the same `<form onSubmit>` pattern but embed no app-developer-configured content, so they are not vulnerable. Left unchanged to keep this change minimal.

**User-facing changes**:

- Clicking a button inside the Media Library tab's embedded widget no longer inserts the image or closes the dialog.
- Insert still works via the Insert button and via Enter in the dialog's own text fields.
- No XML property or API changes.

**Testing scope**:

- A button with no `type` rendered inside `imageSourceContent` does not insert or close the dialog when clicked (once, or repeatedly).
- Insert button still inserts with the correct attributes (existing dimension tests must keep passing — they already click the Insert button by role, so they are unaffected).
- Enter in the URL / Alt / Title / Width / Height inputs inserts.
- Enter inside `imageSourceContent` does not insert.
- Insert is a no-op while `src` is empty.
