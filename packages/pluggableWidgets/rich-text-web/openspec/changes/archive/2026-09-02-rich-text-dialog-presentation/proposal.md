## Why

Rich Text toolbar dialogs get clipped when their content is tall. The reported case: the image dialog's Media Library tab renders `imageSourceContent` — an app-developer-configured list of images. With enough images the dialog grows past the viewport, and the Insert / Cancel buttons at the bottom of `.dialog-actions` become unreachable. The user cannot complete the action at all.

Two independent defects produce this:

**A. Content height is unbounded.** No dialog region caps its height or scrolls. `Dialog.scss` has:

```scss
.image-dialog-entity {
    margin: 0 var(--spacing-medium, 16px);
    min-height: 100px; // no max-height, no overflow
}
```

v4.12 bounded the equivalent region (`.image-dialog-upload { max-height: var(--max-dialog-height, 70vh); overflow-y: auto; }`); v5 dropped it. `.help-dialog-content` still uses that pattern (`max-height: 60vh; overflow-y: auto`), so the fix is established in this codebase — it just was never applied to the insert dialogs.

**B. Dialogs cannot escape their container.** `useDropdown` positions with `strategy: "fixed"` and `offset/flip/shift`, but the dialog is rendered as a DOM descendant of the toolbar and there is **no portal** and **no `size()` middleware**:

```
.widget-rich-text.form-control { overflow: hidden }   ← src/ui/RichText.scss:40
  └─ Toolbar
       └─ <div style="position: relative">              ← Dialog.tsx:20
            └─ dialog (position: fixed)
```

`position: fixed` escapes ancestor `overflow: hidden` only while no ancestor establishes a containing block. Any ancestor with `transform`, `filter`, `will-change` or `contain` — including a Mendix popup page, whose `.mx-window` is transform-centred — demotes the dialog to that ancestor's coordinate space, where `overflow: hidden` clips it. `shift({ padding: 8 })` can only translate the dialog; when its height exceeds the viewport, both edges overflow and there is no scroll container, so `flip()` cannot help either.

`.confirm-dialog-overlay` (used by `ConfirmDialog` and `HelpDialog`) is `position: fixed` and also not portalled, so it has defect B as well.

Separately, some users prefer v4's presentation — a centred modal over a dimmed, scroll-locked page — over v5's button-anchored popover. That is a preference, not the bug, so it ships as an opt-in property rather than as the fix.

## What Changes

### Unconditional fixes (both dialog styles, all dialogs)

- Render every dialog through a single shared `DialogShell` that portals to `document.body`. No ancestor `overflow`, `transform` or `contain` can clip a dialog.
- Bound dialog height to the viewport and scroll internally. `.toolbar-dialog` becomes a flex column: the title and `.dialog-actions` stay pinned, a new scroll region between them takes the overflow. Insert / Cancel are always reachable.
- Inline dialogs **shrink to fit**: `size()` middleware feeds `availableHeight` into the scroll region's `max-height`, so the dialog is as tall as the space below (or above) the trigger allows, and scrolls beyond that. No auto-escalation to a modal.
- Unify dialog stacking on the value `ConfirmDialog` already ships with (`z-index: 10000`), replacing today's mix of `1000` (inline dialogs) and `10000` (overlay dialogs).

### New property

- `dialogStyle` enumeration in `RichText.xml`, `Inline | Focused`, default `Inline` (current behaviour — non-breaking).
    - **Inline**: anchored to the trigger, no overlay, outside click closes. Today's behaviour plus the fixes above.
    - **Focused**: dimmed scroll-locked overlay, centred dialog, focus trap, Escape closes, `aria-modal`. Reinstates the v4.12 presentation.
- Applies to the three content-insert dialogs: Image, Video, Link.
- `HelpDialog` and `ConfirmDialog` are always focused and ignore the property; they move onto `DialogShell` purely to inherit the portal and sizing fixes.

### Explicitly not changed

- Toolbar popovers — `ColorPicker`, `ToolbarDropdown`, `ToolbarSplitButton`, `TableGridSelector`, `ConfigurationDropdown` — are menus, not dialogs. They keep `useDropdown`'s current behaviour and are not portalled by this change.
- `LinkBubbleMenu` itself stays an anchored floating bubble. Only the `LinkDialog` it opens follows `dialogStyle`.
- `CodeView` is an in-editor view, not a dialog.

## Capabilities

### New Capabilities

- `rich-text-dialog-presentation`: how Rich Text dialogs are positioned, sized, layered and dismissed; the `dialogStyle` property; which dialogs honour it.

### Modified Capabilities

- `rich-text-image-dialog`: the Media Library region and the dialog body scroll instead of growing past the viewport.
- `rich-text-link-bubble-menu`: the existing "Dialog anchored to the link" scenario becomes conditional on `dialogStyle` being `Inline`; under `Focused` the dialog is centred.

## Impact

**Files affected**:

- `src/RichText.xml` — new `dialogStyle` enumeration property under `General > General`.
- `typings/RichTextProps.d.ts` — regenerated from XML (build output; not hand-edited).
- `src/components/toolbars/components/DialogShell.tsx` — **new**. Portal, mode switch, sizing, overlay, focus trap.
- `src/components/toolbars/hooks/useDropdown.ts` — optional `size()` limiter, opt-in so the popovers are unaffected.
- `src/components/toolbars/components/ImageDialog.tsx`, `VideoDialog.tsx`, `LinkDialog.tsx` — replace the `useDropdown` + positioning wrapper with `DialogShell`; wrap the middle content in the scroll region. No change to form logic or tiptap commands.
- `src/components/toolbars/components/HelpDialog.tsx`, `ConfirmDialog.tsx` — replace the hand-rolled overlay / outside-click / Escape code with `DialogShell` in focused mode.
- `src/components/toolbars/components/Dialog.scss` — flex-column dialog, scroll region, overlay, centred modal, unified z-index.
- `src/components/EditorContext.tsx`, `src/components/Editor.tsx` — carry `dialogStyle` to the dialogs via the existing editor context (same route as `imageConfig`).
- `CHANGELOG.md` — one entry for the clipping fix, one for the new property.

**User-facing changes**:

- A tall dialog (large Media Library, long embed code) now scrolls internally; Insert and Cancel stay visible.
- Dialogs no longer get cut off when the widget sits inside a popup page or an `overflow: hidden` container.
- New "Dialog style" property. Existing apps keep the current look with no action.

**Testing scope**:

- Inline mode: a dialog whose content exceeds the space below the trigger caps its height, scrolls, and keeps the action buttons visible.
- Inline mode: outside click still closes; no overlay is rendered.
- Focused mode: overlay rendered, page scroll locked, dialog centred, Escape closes, Tab cycles within the dialog, `aria-modal="true"`.
- Both modes: dialog markup is not a descendant of `.widget-rich-text`'s widget node (portalled).
- Selection is preserved: caret mid-paragraph, open dialog, insert — content lands at the caret in both modes.
- Help and Confirm dialogs stay focused with `dialogStyle` set to `Inline`.
- Popovers (colour picker, dropdowns, table grid) keep anchored, non-portalled behaviour.
- E2E: one spec per mode covering the Media Library scroll case.
