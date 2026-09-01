## Context

`ImageDialog` (`src/components/toolbars/components/ImageDialog.tsx`) renders three source tabs — `url`, `upload`, `entity` — inside a single `<form onSubmit={handleSubmit}>`. The `entity` tab renders `imageSourceContent` from the editor context:

```tsx
<div className="image-dialog-entity">{imageSourceContent}</div>
```

`imageSourceContent` is a `widgets` XML property: whatever the app developer drops into the image-source content slot in Studio Pro. In the reported case that is a File Uploader widget.

### Why the form is the defect

HTML spec, "submit button" definition: a `<button>` element whose `type` attribute is missing or invalid is in the **Submit Button state**. Its activation behaviour is to submit its form owner. `file-uploader-web/src/components/ActionButton.tsx` renders:

```tsx
<button role={"button"} className={...} onClick={onClick} title={title}>
```

No `type` — so it is a submit button, and its form owner is the image dialog's `<form>` (nearest ancestor form).

`onClick` calls `e.stopPropagation()`. That is not a defence. Propagation and default actions are independent: the browser runs the button's activation behaviour (form submission) after event dispatch finishes, regardless of whether propagation was stopped. Only `preventDefault()` suppresses it.

```
CLICK on .action-button
  ├─ dispatch: capture -> target -> bubble        (stopPropagation() truncates THIS only)
  └─ activation behaviour: form.requestSubmit()   (only preventDefault() cancels THIS)
        └─ ImageDialog handleSubmit
```

### Why "second click"

`handleSubmit` starts with `e.preventDefault(); if (!editor || !src.trim()) return;`.

| Click | Form submits? | `src` at submit time               | Observable result                          |
| ----- | ------------- | ---------------------------------- | ------------------------------------------ |
| 1     | yes           | `""`                               | early return — nothing visible             |
| 2     | yes           | url from click 1's `imageSelected` | `setImage()` + `onClose()` — dialog closes |

The Mendix list action behind the button runs asynchronously and dispatches the `imageSelected` custom event, which sets `src`. So the submit on click 1 is silent and the submit on click 2 is not. The bug is on every click; only the guard makes it look like a second-click bug.

### Note on nested forms

If an embedded widget renders its own `<form>`, the uploader button's form owner would be that inner form instead, and the dialog would be spared. That is not a reliable defence either: it depends entirely on the embedded widget's markup. (Nested forms are rejected by the HTML _parser_, but React builds the DOM through `document.createElement`, which has no such restriction — so nested forms created by React do exist in the DOM.)

## Goals / Non-Goals

**Goals:**

- No descendant of the image dialog — including arbitrary app-developer content — can trigger image insertion or dialog dismissal.
- Preserve Enter-to-insert for the dialog's own text fields.
- Preserve the existing Insert button behaviour and attribute mapping exactly.

**Non-Goals:**

- Fixing `file-uploader-web`'s untyped buttons. That is a separate per-package change (`fix-untyped-action-buttons`) and is necessary — an untyped button still breaks any _other_ form it lands in — but it is not sufficient here, because `imageSourceContent` accepts any widget.
- Changing `LinkDialog` / `VideoDialog`.
- Validating or sandboxing `imageSourceContent` in any broader way.

## Decisions

### Decision: remove the `<form>` rather than filter submissions

Considered alternative: keep the form and ignore submissions that did not come from the Insert button.

```tsx
const insertRef = useRef<HTMLButtonElement>(null);
const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    if (submitter && submitter !== insertRef.current) return;
    ...
};
```

Smaller diff, and native Enter-to-submit stays for free. Rejected because it treats the symptom: the dialog still hands a form owner to every embedded widget, so an embedded submit button still causes a real form submission that the dialog then has to recognise and discard. It also relies on `SubmitEvent.submitter`, and it silently does the wrong thing if a future embedded widget calls `preventDefault()`-free `requestSubmit()` with no submitter (`submitter === null` is treated as legitimate Enter-to-submit).

Chosen: no `<form>`. There is nothing to submit, so there is nothing to filter. The dialog is a floating panel, not a document form — it never posts anywhere, and `handleSubmit` already ends in `e.preventDefault()`.

### Decision: Enter handling scoped to the dialog's own inputs

Dropping the form removes implicit submission, which is a real loss — Enter in the URL field currently inserts. Re-adding it via `onKeyDown` on the dialog _container_ would recreate the same class of bug in the other direction: Enter inside an embedded widget's text input would insert an image.

So the Enter handler attaches per-input, on the dialog's own five single-line inputs only:

```
URL  Alt  Title  Width  Height     -> Enter inserts
imageSourceContent                 -> Enter does nothing (dialog-wise)
upload dropzone                    -> Enter does nothing (dialog-wise)
Maintain-ratio checkbox            -> Enter does nothing (Space toggles, native)
```

Guard parity with the Insert button: Enter is ignored while `src` is empty, matching `disabled={!src?.trim()}`.

### Decision: fix the listener effect while here

```tsx
useEffect(() => { ... }, [dialogRef.current]);   // never re-runs
```

A ref's `.current` is not reactive — React compares dependency values at render time, and the ref object's identity is stable, so this effect behaves as `[]` with a misleading dependency list. Consequently `handleImageSelected` closes over `activeTab` from the very first render, which is always `"url"`. Line `if (activeTab !== "entity") setActiveTab("entity")` is therefore always taken. Harmless today (the tab already _is_ `entity` when the event can fire), but it is a stale-closure trap for anyone who later reads other state in that handler.

Resolution: declare `[]` honestly and call `setActiveTab("entity")` unconditionally — same result, no stale read. `setSrc` / `setSelectedEntityImage` are stable setters and need no dependency.

## Risks / Trade-offs

- **Enter behaviour drift.** Native implicit submission also honours "the form has exactly one field" edge cases and submits from any form control. The per-input handler is narrower by design; the five listed inputs are the full set the dialog owns today, so behaviour is equivalent in practice. Any input added to the dialog later must opt in.
- **Native form validation lost.** The dialog uses no `required` / `pattern` attributes and validates in `handleInsert` (via `toPixelValue` and the `src` guard), so nothing is lost.
- **`type="number"` inputs.** Enter in a number input already does not produce a newline; adding the handler is consistent with the text inputs.
