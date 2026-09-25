## 1. Add the `dialogStyle` property

- [x] 1.1 Add a `dialogStyle` enumeration property to `src/RichText.xml` under `General > General`, after `enableStatusBar`, `defaultValue="inline"`, values `inline` ("Inline") and `focused` ("Focused")
- [x] 1.2 Write a description that distinguishes it from `styleDataFormat`'s unrelated `inline` key — name the behaviour ("anchored to the toolbar button" vs "centred modal over a dimmed page"), not just the label
- [x] 1.3 Run a build so `typings/RichTextProps.d.ts` regenerates with `DialogStyleEnum`; do not hand-edit the generated file
- [x] 1.4 Confirm `src/RichText.editorConfig.ts` needs no visibility rule for the new property (it is never conditionally hidden)

Note on 1.4: `getProperties` only hides properties that become irrelevant under some configuration. `dialogStyle` stays relevant in every configuration — even with `toolbarLocation: "hide"` the link bubble menu can still open the link dialog — so no rule is added.

## 2. Plumb `dialogStyle` through the editor context

- [x] 2.1 Add `dialogStyle: DialogStyleEnum` to `EditorContextValue` and to `EditorContextProvider`'s props in `src/components/EditorContext.tsx`
- [x] 2.2 Pass `dialogStyle` from container props at the `EditorContextProvider` call site in `src/components/Editor.tsx` (~line 346), alongside `imageConfig`
- [x] 2.3 Verify `LinkBubbleMenu` renders inside the same provider, so `LinkDialog`'s bubble-menu entry point receives the value with no extra plumbing

Note on 2.2: the prop needed two more hops than the task assumed — `dialogStyle` added to `EditorProps`' `Pick<RichTextContainerProps, …>`, destructured in `Editor` with an `"inline"` default, and forwarded from `EditorWrapper` (which destructures container props explicitly rather than spreading).

## 3. Add the `size()` limiter to `useDropdown` as an opt-in

- [x] 3.1 Add an option to `UseDropdownOptions` in `src/components/toolbars/hooks/useDropdown.ts` that enables the `size()` middleware (default off) — `trackAvailableHeight`
- [x] 3.2 Append `size({ padding: 8, apply })` **after** `offset`, `flip` and `shift` so it measures the settled placement
- [x] 3.3 In `apply`, expose the resolved available height to the caller (return it from the hook, or set a CSS custom property on the floating element) rather than writing `max-height` on the floating wrapper directly — returned as `availableHeight`
- [x] 3.4 Clamp with a minimum usable height (~200px) so a trigger near the viewport edge does not collapse the dialog to a sliver — exported `MIN_AVAILABLE_HEIGHT`
- [x] 3.5 Verify `ColorPicker`, `ToolbarDropdown`, `ToolbarSplitButton`, `TableGridSelector` and `ConfigurationDropdown` pass the new option nowhere, so their behaviour is byte-identical

Note on 3.3: `availableHeight` is derived from trigger/viewport geometry, not from the floating element's own height, so feeding it back into the element's `max-height` cannot oscillate. `Math.floor` quantises subpixel jitter so the state setter bails out on unchanged values instead of re-rendering on every `autoUpdate` tick.

## 4. Create the shared `DialogShell`

- [x] 4.1 Create `src/components/toolbars/components/DialogShell.tsx` accepting `{ mode, referenceElement, onClose, className, children }`, where `mode` is `"inline" | "focused"`
- [x] 4.2 Wrap both modes in `FloatingPortal` from `@floating-ui/react` (already a dependency — no new package)
- [x] 4.3 Put `widget-rich-text` on the portalled root so widget-scoped styling and custom properties still resolve outside the widget subtree (this is what v4's `classNames("Dialog mx-layoutgrid widget-rich-text", …)` was for)
- [x] 4.4 Inline mode: `useDropdown` with the `size()` option enabled, anchored to `referenceElement`, keeping the existing mousedown-outside dismissal; render no overlay and do not lock scroll
- [x] 4.5 Focused mode: `FloatingOverlay lockScroll` + `FloatingFocusManager` + `useDismiss({ outsidePressEvent: "mousedown" })` + `useRole`, centred, with `role="dialog"`, `aria-modal="true"` and `aria-labelledby` wired to the dialog title
- [x] 4.6 Focused mode Escape: close the dialog, and stop propagation in the capture phase so the editor's fullscreen-exit Escape handler does not also fire — preserve the behaviour `HelpDialog` implements today
- [x] 4.7 Render `children` inside `.toolbar-dialog` together with the caller-supplied `className`, so `.image-dialog` / `.video-dialog` / `.help-dialog` styling keeps applying
- [x] 4.8 Apply the resolved max-height to the dialog box: available height in inline mode, `70vh` in focused mode

Notes:

- 4.1 gained two props the task did not anticipate. `dialogRef` forwards a ref onto `.toolbar-dialog`, because `ImageDialog` registers the `imageSelected` listener on that exact node — app-developer JS actions dispatch the event at it, so replacing the node would break an app-visible contract. `ariaLabelledBy` carries `HelpDialog`'s existing `TITLE_ID`.
- 4.5 sets `escapeKey: false` on `useDismiss` so it does not compete with the capture-phase handler from 4.6, and centres via flexbox on the overlay rather than v4's `translate(-50%, -50%)` — a transform on the dialog would make it the containing block for its own descendants, the very mechanism this change exists to avoid.
- 4.6 is defence in depth rather than a live bug: `Fullscreen`'s Escape is a ProseMirror keymap, so it only fires while the editor DOM holds focus, which the focus trap prevents. Kept because it is the behaviour `HelpDialog` documented and relied on.

## 5. Restructure the dialog box for internal scrolling

- [x] 5.1 In `Dialog.scss`, make `.toolbar-dialog` a flex column with the resolved `max-height`
- [x] 5.2 Add `.dialog-scroll` with `flex: 1; overflow-y: auto; min-height: 0` — `min-height: 0` is required, since a flex item's default `min-height: auto` refuses to shrink below content height and would defeat the cap
- [x] 5.3 Give `h3` and `.dialog-actions` `flex-shrink: 0` so they stay pinned
- [x] 5.4 Remove the now-redundant `min-height: 100px` growth path on `.image-dialog-entity`; keep its margin
- [x] 5.5 Replace `.confirm-dialog-overlay`'s ad-hoc rules with the shared overlay class used by `DialogShell`
- [x] 5.6 Unify stacking: overlay `10000`, dialog `10001`, replacing the current mix of `1000` (inline dialogs) and `10000` (overlay dialogs); define both as SCSS variables in one place
- [x] 5.7 Keep `.help-dialog-content`'s own `max-height: 60vh` or drop it in favour of the shared scroll region — pick one so the help dialog does not end up with two nested scrollers

Note on 5.7: dropped the `max-height: 60vh`. `.help-dialog-content` is now matched by the shared scroll-child rule, so the shell's `max-height` on `.toolbar-dialog` is the single bound.

## 6. Move the three insert dialogs onto `DialogShell`

- [x] 6.1 `ImageDialog.tsx`: drop the `useDropdown` call and the `<div ref={refs.setFloating} style={…}>` wrapper; wrap the return in `<DialogShell mode={dialogStyle} referenceElement={referenceElement} onClose={onClose} className="image-dialog">`
- [x] 6.2 `ImageDialog.tsx`: wrap tabs, tab content, `.image-dialog-entity`, previews and the alt/title/width/height fields in `<div className="dialog-scroll">`, leaving `h3` and `.dialog-actions` outside it
- [x] 6.3 `VideoDialog.tsx`: same shell swap and scroll-region wrap; keep the `<form onSubmit>` and all tab/detection logic untouched
- [x] 6.4 `LinkDialog.tsx`: same shell swap and scroll-region wrap
- [x] 6.5 Read `dialogStyle` from `useCurrentEditor()` in each dialog; `referenceElement` stays in the props signature and is simply unused in focused mode
- [x] 6.6 Confirm no dialog body logic changed — no edits to tiptap commands, validation, tab state, dropzone or the `imageSelected` listener

Notes:

- The wrapper each dialog already had between `.toolbar-dialog` and its content — a `<form>` for video and link, an intentional non-`<form>` `<div>` for image — carries `.dialog-layout`, so the column layout survives that extra element.
- Each dialog gained a `TITLE_ID` and `<h3 id>` so the shell can wire `aria-labelledby` in focused mode.
- `ImageDialog` keeps its own `dialogRef` and passes it to the shell; `LinkDialog`'s `dialogRef` was only there for `useDropdown` outside-click and is gone. `urlInputRef` (autofocus) stays.
- Existing `EditorContext.Provider` fixtures in `ImageDialog.spec.tsx`, `ToolbarDefaultButton.spec.tsx`, `RichText.spec.tsx` and `HelpButton.spec.tsx` gained `dialogStyle: "inline"` — the context value and container props are now non-optional, so a typecheck fails without it.

## 7. Move Help and Confirm dialogs onto `DialogShell`

- [x] 7.1 `HelpDialog.tsx`: replace `.confirm-dialog-overlay`, the outside-click effect, the Escape effect and the manual `dialogRef.current?.focus()` with `<DialogShell mode="focused">`; keep `TITLE_ID` wiring
- [x] 7.2 `ConfirmDialog.tsx`: replace `.confirm-dialog-overlay` and its outside-click effect with `<DialogShell mode="focused">`
- [x] 7.3 Verify both ignore `dialogStyle` — hardcode `mode="focused"`, do not read it from context
- [x] 7.4 Verify the code-view exit confirmation still behaves the same, including that Escape does not leak to the fullscreen handler

Notes:

- `ConfirmDialog` now closes on Escape (mapped to `onCancel`), which it did not before. Consistent with every other dialog, and the capture-phase handler keeps the keystroke away from the fullscreen extension.
- `ConfirmDialog`'s message sits in a `.dialog-scroll` region so a long confirmation cannot push its buttons out of view either.
- Portalling changed mount ordering: a portal's children mount one commit after the dialog, so `HelpDialog`'s old synchronous `focus()` is gone (`FloatingFocusManager` handles it, and its focus lands in a microtask — `HelpButton.spec.tsx`'s focus assertion now awaits), and `ImageDialog` holds the `.toolbar-dialog` node in state instead of a ref so the `imageSelected` listener still attaches. `LinkDialog`'s mount-time `urlInputRef.current?.focus()` was removed for the same reason; the input's `autoFocus` already covers it.

## 8. Unit tests

- [x] 8.1 `DialogShell` inline mode: renders no overlay, does not lock body scroll, closes on outside mousedown
- [x] 8.2 `DialogShell` focused mode: renders the overlay, locks body scroll, sets `role="dialog"` and `aria-modal="true"`, moves focus into the dialog, closes on Escape and on overlay press
- [x] 8.3 `DialogShell` focused mode: Escape does not propagate to a spy handler registered on `document` in the capture phase — the regression guard for fullscreen exiting alongside the dialog
- [x] 8.4 Both modes: the dialog element is not a descendant of the widget's rendered root (portal assertion)
- [x] 8.5 `ImageDialog`: with `imageSourceContent` taller than the available height, the `.dialog-scroll` region carries the height cap and the Insert / Cancel controls are outside it
- [x] 8.6 `ImageDialog` / `VideoDialog` / `LinkDialog`: `dialogStyle: "focused"` renders an overlay; `"inline"` does not
- [x] 8.7 `HelpDialog` and `ConfirmDialog`: render focused even with `dialogStyle: "inline"` in context
- [x] 8.8 Selection preservation: caret mid-paragraph, open dialog, insert — the insert command runs against the stored selection, in both modes
- [x] 8.9 Verify existing `src/components/toolbars/components/__tests__/ImageDialog.spec.tsx` queries still resolve through the portal (RTL `screen` searches `document.body`; any query scoped to the `render()` container result needs updating)
- [x] 8.10 Check `src/__tests__/__snapshots__` for drift and update only where the change is intended
- [x] 8.11 Popover regression guard: `ColorPicker` and `TableGridSelector` render anchored with no overlay while `dialogStyle` is `focused`

Notes:

- New specs: `DialogShell.spec.tsx` (8.1–8.4) and `DialogPresentation.spec.tsx` (8.6–8.8, 8.11). 8.5 lives in `ImageDialog.spec.tsx` as "ImageDialog scroll region".
- 8.3 spies on `document.body` in the capture phase rather than on `document`: the shell's own handler is on `document`, so a same-target spy would be ordered by registration and prove nothing. A listener one level down is exactly what `stopPropagation` has to block.
- 8.5 asserts the bound on `.toolbar-dialog` (which owns `max-height`) with `.dialog-scroll` as the overflow region, not a cap on the scroll region itself.
- 8.8 checks that `chain().focus()` runs before the insert command — `focus()` is what restores the selection the editor held when the dialog opened.
- The three container-scoped queries in `ImageDialog.spec.tsx` moved to `document` (8.9); the "renders no form element" assertion now scopes to `.image-dialog form` so it still means something.
- 8.10: the six existing snapshots render the editor without any dialog open, so there is no drift to review.
- `DialogShell` gained an inline fallback `max-height` of `70vh` while no measured height is available — including the case where there is no anchor at all, which is otherwise an unbounded dialog again.

## 9. E2E tests

- [x] 9.1 Extend `e2e/RichText.spec.js` (or add a spec) covering the reported case: image dialog, Media Library tab with enough images to overflow, assert the Insert button is visible and clickable without the dialog being clipped
- [ ] 9.2 Cover the same case with `dialogStyle: "focused"` — **blocked on 9.5**
- [ ] 9.3 Focused mode: overlay visible, Escape closes, Tab cycles inside the dialog — **blocked on 9.5**
- [x] 9.4 Follow `docs/requirements/e2e-test-guidelines.md`; check `e2e/RichText.spec.js-snapshots` for drift
- [ ] 9.5 Add the test-project page configuration needed for both modes — **blocked: needs Studio Pro**

Notes:

- Portalling broke two existing widget-scoped dialog locators, which had to be fixed before anything
  else: `.mx-name-richText1 .toolbar-dialog.image-dialog` (the `insertImageDialog.png` screenshot) and
  `widget.locator(".toolbar-dialog.video-dialog")` in the YouTube test. Both now resolve at page level.
  The popup test already used a page-level locator.
- 9.1 reproduces the overflow with a 1024×420 viewport instead of a Media Library full of thumbnails:
  no existing test-project page configures an image source (the `insertImageDialog.png` baseline shows
  only the URL and Upload tabs), and the short viewport exercises the same code path — the shell's
  measured `max-height`, the `.dialog-scroll` overflow and the pinned action row. The test asserts the
  dialog box is inside the viewport, that `.dialog-scroll` actually overflows, and that Insert still
  inserts.
- A second test covers the transformed-ancestor case (10.2) in CI: a dialog opened from the widget
  inside the Demo popup page is not a descendant of the widget subtree, sits fully inside the viewport
  and stays interactive.
- 9.4: no baseline drift expected — the dialogs are unchanged below `70vh`, and no new screenshot
  assertions were added (the new tests assert geometry, which a baseline image cannot express). Still
  to be confirmed on the first CI run.
- 9.2, 9.3 and 9.5 need a test-project page with `dialogStyle: "focused"`. The project lives in
  `mendix/testProjects` (branch `rich-text-web`) as a binary `.mpr`, so the page cannot be added from
  the repo — it needs Studio Pro. Focused-mode overlay, Escape and focus-trap behaviour is covered by
  `DialogShell.spec.tsx` and `DialogPresentation.spec.tsx` in the meantime.

## 10. Manual verification in Studio Pro

- [ ] 10.1 Widget inside an `overflow: hidden` container: tall image dialog is not clipped, in both modes
- [ ] 10.2 Widget inside a Mendix popup page (transformed ancestor): dialog is not clipped and paints above the popup underlay, in both modes
- [ ] 10.3 Trigger near the viewport bottom, inline mode: dialog flips or shrinks and stays usable
- [ ] 10.4 Focused mode inside a popup page that also locks scroll: page scroll is restored correctly after the dialog closes
- [ ] 10.5 Link editing from the bubble menu in both modes
- [ ] 10.6 Fullscreen mode: Escape closes only the dialog

Note: section 10 is human verification in Studio Pro and cannot be done from the repo. 10.2 is partly
covered in CI by the popup-page E2E test added in 9.1's commit; 10.6 by `DialogShell.spec.tsx`'s
Escape-containment guard. The rest — an `overflow: hidden` container, a trigger near the viewport
bottom, scroll restore after a focused dialog closes inside a scroll-locking popup, and link editing
from the bubble menu — still need a manual pass.

## 11. Changelog

- [x] 11.1 Add a `Fixed` entry to `CHANGELOG.md`: dialogs no longer get clipped when their content is tall or when the widget sits in a container that clips overflow; tall dialogs now scroll internally
- [x] 11.2 Add an `Added` entry: "Dialog style" property to choose between the anchored inline dialogs and centred focused dialogs
- [x] 11.3 Keep both entries behavioural — no component names, no mention of the portal or middleware
- [x] 11.4 Do not bump the package version; that happens at release time

Note: both entries went under the existing `[Unreleased]` heading, alongside the Media Library submit
fix. The clipping entry names the pop-up page as the example an app developer would recognise, without
mentioning transforms, portals or Floating UI.
