## Context

`ActionButton` renders the per-file action buttons in the files list (`.action-button`, e.g. the "add" / "remove" / custom list-action buttons). `RetryButton` renders the retry affordance on a failed upload. Both are plain `<button>` elements with an `onClick` handler and no `type` attribute.

HTML spec — the `type` attribute of `<button>` is an enumerated attribute whose _missing value default_ is `submit`. A submit button's activation behaviour is to submit its form owner (the nearest ancestor `<form>`, absent a `form` attribute). So inside any form, these buttons are submit buttons.

### Why `stopPropagation()` is not a defence

```
CLICK on .action-button
  ├─ event dispatch: capture -> target -> bubble     stopPropagation() truncates THIS
  └─ activation behaviour: submit the form owner     only preventDefault() cancels THIS
```

The current handler:

```tsx
const onClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        action?.();
    },
    [action]
);
```

`stopPropagation()` exists here to stop the click reaching the `.file-entry` / dropzone handlers, which is a separate and legitimate concern. It has no effect on form submission.

### How this surfaced

The widget can be placed into another widget's content slot. The Rich Text image dialog wraps its content — including the app-developer-configured image-source slot — in a `<form onSubmit={...}>`:

```
<form>                                  (rich-text ImageDialog)
  <div class="image-dialog-entity">
    <div class="widget-file-uploader">
      ...
      <button class="action-button">    type defaults to submit -> submits the form above
```

The same happens on any page where an app developer nests the widget inside a form.

## Goals / Non-Goals

**Goals:**

- The widget's buttons perform their action only, never an implicit form submission.

**Non-Goals:**

- Changing `stopPropagation()` behaviour — still required for entry/dropzone isolation.
- Any styling, layout, or XML property change.
- Fixing the Rich Text image dialog's use of `<form>` — separate package, separate change (`fix-image-dialog-nested-submit`). Both are needed: this change protects every form the widget is placed in; that change protects the dialog from _any_ embedded widget, not just this one.

## Decisions

### Decision: `type="button"` on both components

The minimal, spec-correct fix. Neither button has any relationship to form submission; declaring `type="button"` states that. Preferred over adding `e.preventDefault()` in the handlers, which would suppress the submission as a side effect of an event handler rather than by declaring the element's kind, and would also suppress other default behaviours.

### Decision: drop `role="button"` from ActionButton

`<button>` has an implicit ARIA role of `button`. The explicit `role={"button"}` is redundant and, being adjacent to the missing `type`, reads as if it were making the element interactive — which it isn't. Removing it does not change the computed role, so it is not an accessibility change. `RetryButton` already omits it.
