## Why

The File Uploader's file action buttons and retry button submit any enclosing `<form>` when clicked.

Per the HTML spec, a `<button>` whose `type` attribute is missing is in the Submit Button state: its activation behaviour submits its form owner. Both button components omit `type`:

- `src/components/ActionButton.tsx` — `<button role={"button"} className={...} onClick={onClick} title={title}>`
- `src/components/RetryButton.tsx` — `<button className="retry-button" disabled={...} onClick={onClick} title={...}>`

Both `onClick` handlers call `e.stopPropagation()`, which does not help. Propagation and default actions are independent: the browser runs the button's activation behaviour after event dispatch completes, whether or not propagation was stopped. Only `preventDefault()` cancels it.

This was found via the Rich Text widget, where a File Uploader placed in the image dialog's image-source content slot sits inside the dialog's `<form>`; clicking a file's add action button submitted that form, inserting the image and closing the dialog without the user pressing Insert. The same failure occurs for any form the widget is placed inside.

## What Changes

Package: `packages/pluggableWidgets/file-uploader-web`

- `src/components/ActionButton.tsx` — add `type="button"`. Also drop the redundant `role="button"`: a native `<button>` already has that role, and the explicit attribute adds nothing.
- `src/components/RetryButton.tsx` — add `type="button"`.

No other `<button>` elements exist in the package's source.

## Capabilities

### New Capabilities

- `file-uploader-action-buttons`: the widget's own buttons perform their action only and never submit an enclosing form.

### Modified Capabilities

None.

## Impact

**Files affected**:

- `src/components/ActionButton.tsx`
- `src/components/RetryButton.tsx`

**User-facing changes**:

- Placing the File Uploader inside a form-bearing container (for example the Rich Text image dialog's image-source content slot) no longer submits that form when a file action or retry button is clicked.
- No visual change, no XML property change, no API change. `role="button"` removal is not observable to assistive technology — the computed role is unchanged.

**Related**:

- `rich-text-web` change `fix-image-dialog-nested-submit` removes the `<form>` from the image dialog. That fix is independent and still needed, because the image dialog accepts arbitrary app-developer content and cannot rely on every embedded widget typing its buttons correctly. This change is still needed because an untyped button breaks every _other_ form the widget is dropped into, including app developers' own pages.

**Testing scope**:

- Clicking a file action button inside a `<form>` does not submit the form.
- Clicking the retry button inside a `<form>` does not submit the form.
- The button's own action still runs.
