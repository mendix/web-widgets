## Context

Five dialog surfaces exist today, on three different hand-rolled shells:

| Component       | Shell today                                                 | Portalled | Height bounded              |
| --------------- | ----------------------------------------------------------- | --------- | --------------------------- |
| `ImageDialog`   | `useDropdown` + `<div style={floatingStyles}>`              | no        | no                          |
| `VideoDialog`   | same                                                        | no        | no                          |
| `LinkDialog`    | same                                                        | no        | no                          |
| `HelpDialog`    | `.confirm-dialog-overlay` + own outside-click/Escape effect | no        | `.help-dialog-content` only |
| `ConfirmDialog` | `.confirm-dialog-overlay` + own outside-click effect        | no        | no                          |

The three insert dialogs share an identical wrapper:

```tsx
<div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 1000 }}>
    <div ref={dialogRef} className="toolbar-dialog image-dialog">
        …body…
    </div>
</div>
```

All positioning concerns live in that wrapper. Nothing in the bodies — form state, tiptap commands, tabs, dropzone, entity listener — depends on how the dialog is positioned. That is what makes a shared shell cheap.

### Why the v4 dialogs cannot be ported

v4.12 was Quill (`quill: ^2.0.3`); v5 is tiptap. The v4 `ImageDialog` / `LinkDialog` / `VideoDialog` bodies call Quill APIs, and v5's bodies have since gained features v4 never had (embed-code tab with generic-embed parsing and platform detection, Media Library tab, react-dropzone upload, aspect-ratio lock). Restoring v4 components would drop those features and fork the logic.

What _is_ portable is v4's shell, which used the same `@floating-ui/react` already in `package.json` — just its modal-mode components:

```
FloatingPortal
 ├─ FloatingOverlay lockScroll .widget-rich-text-modal-overlay .mx-underlay
 └─ FloatingFocusManager
      └─ .modal-dialog.mx-window.mx-window-active   (centred via transform: translate(-50%, -50%))
```

So "focused" mode costs no new dependency.

## Goals / Non-Goals

**Goals**

- A tall dialog is always fully usable: bounded height, internal scroll, action buttons pinned.
- No ancestor styling can clip a dialog.
- One shell, five dialogs, two modes.
- Default behaviour visually unchanged for existing apps.

**Non-Goals**

- Restoring v4's Atlas markup (`mx-window`, `form-horizontal`, `col-sm-*`, `mx-button`). Focused mode reuses v5's existing dialog markup, centred under an overlay. Faithful v4 markup would mean dual render paths per dialog for a cosmetic difference.
- Portalling or resizing the toolbar popovers.
- Changing any dialog's fields, validation or tiptap commands.

## Decisions

### 1. Fixes A and B are unconditional, not gated behind `dialogStyle`

The clipping is a bug, and `Inline` is the default. Gating the fix would leave the default configuration broken and require every affected app to change a setting to recover. So the portal and the height bound apply in both modes; `dialogStyle` only chooses presentation.

### 2. Inline mode shrinks to fit — it does not escalate to focused

`size()` middleware supplies `availableHeight`; the scroll region's `max-height` is set from it. A dialog with 60 Media Library images renders as tall as the space below the trigger permits and scrolls inside. It does **not** silently become a modal when it does not fit, because a mode that changes shape based on scroll position is unpredictable and untestable.

Middleware order matters. `size()` runs last so it measures after `flip()` and `shift()` have settled placement:

```ts
middleware: [offset(4), flip(), shift({ padding: 8 }), size({ padding: 8, apply({ availableHeight, elements }) { … } })];
```

A floor is needed: with the trigger near the viewport bottom, `availableHeight` can be a few pixels. `flip()` runs first and normally moves the dialog above the trigger, but in a short viewport both sides are cramped. Apply `max-height: max(availableHeight, MIN_DIALOG_HEIGHT)` with `MIN_DIALOG_HEIGHT` around `200px`, so the dialog is never smaller than a usable scroller even if it then overhangs the viewport slightly.

### 3. The scroll region is a new element, not `max-height` on existing regions

v4 put `max-height` on one region (`.image-dialog-upload`). That bounds one part while the sum of title + tabs + that region + alt/title/width/height fields + actions can still exceed the viewport. Instead:

```
.toolbar-dialog            display: flex; flex-direction: column; max-height: <from mode>
  ├─ h3                    flex-shrink: 0          ← pinned
  ├─ .dialog-scroll        flex: 1; overflow-y: auto; min-height: 0   ← everything else
  │    tabs, tab-content, image-dialog-entity, fields, previews, errors
  └─ .dialog-actions       flex-shrink: 0          ← pinned; Insert/Cancel always visible
```

`min-height: 0` on the scroll child is required — a flex item's default `min-height: auto` refuses to shrink below content height and would defeat the cap.

Cost: each of the three insert dialogs wraps its middle content in one `<div className="dialog-scroll">`. `.dialog-tabs` moves inside the scroll region (it scrolls with the content) — the alternative, pinning tabs as a third fixed row, is a nicer UX but a larger markup change; revisit if reviewers want it.

### 4. Focused mode reuses v5 markup

Same `.toolbar-dialog` box, wrapped in `FloatingOverlay lockScroll` + `FloatingFocusManager`, centred, `max-height: 70vh` (v4's `--max-dialog-height` default). Users get "modal over dimmed background with a focus trap", which is what the preference is actually about, without a per-dialog markup fork.

### 5. `dialogStyle` reaches dialogs via `EditorContext`

`EditorContext` already carries `imageConfig` from `Editor.tsx:338` to `ImageDialog` specifically to avoid drilling props through `Toolbar`. `dialogStyle` follows the same route. `LinkDialog` rendered from `LinkBubbleMenu.tsx:70` is inside the same provider, so it gets the value with no extra plumbing — which is why "focused applies to bubble-menu link editing too" costs nothing.

Alternative considered: `ToolbarContext`, which already holds `activeDropdown`. Rejected — `LinkBubbleMenu` is not under `ToolbarContext`, so `LinkDialog`'s second entry point would miss the value.

### 6. `useDropdown` gains `size()` as opt-in, not as default

`useDropdown` is shared with `ColorPicker`, `ToolbarDropdown`, `ToolbarSplitButton`, `TableGridSelector` and `ConfigurationDropdown`. Some already self-bound (`Toolbar.scss:128`: `max-height: 300px; overflow-y: auto`). Adding `size()` unconditionally would silently re-cap all of them. New option, off by default; only `DialogShell` inline mode turns it on.

### 7. One z-index for all dialogs: `10000`

Today: inline dialogs `1000`, `.confirm-dialog-overlay` `10000`, v4 used `105`/`106` to clear Atlas's `mx-underlay`. Once portalled to `document.body`, a dialog must clear whatever Atlas modal layer the widget sits inside. `10000` is already shipping in `ConfirmDialog` without reported stacking problems, so it is the proven value. Overlay `10000`, dialog `10001`.

### 8. Focus and selection

`FloatingFocusManager` moves focus into the dialog, blurring ProseMirror. tiptap's stored selection survives the blur, and every insert path already runs `.chain().focus()…`, which restores it before applying the command. This is the one behaviour that could regress silently, so it gets an explicit test in both modes rather than being assumed — v4 relied on the same assumption under Quill and worked.

Inline mode keeps `useDropdown`'s existing mousedown-outside dismissal. Focused mode uses `useDismiss` with `outsidePressEvent: "mousedown"` plus Escape, matching v4. `HelpDialog`'s current hand-rolled Escape handler uses capture phase and `stopPropagation()` so the fullscreen/editor Escape handlers do not also fire; `DialogShell` must preserve that, or fullscreen mode will exit at the same time the dialog closes.

### 9. XML property placement

`General > General`, after `enableStatusBar`. It is an end-user-visible presentation preference, so it belongs where it is discoverable. `Advanced > Advanced` (next to `styleDataFormat`) groups rendering-format switches and would bury it.

Note: `inline` already exists as an enumeration key on `styleDataFormat` (`inline | class`). No technical conflict — keys are scoped per property — but the two mean unrelated things, so descriptions should be unambiguous.

## Risks / Trade-offs

- **Portalling breaks CSS scoping if any dialog rule is nested under `.widget-rich-text`.** Checked: `.toolbar-dialog`, `.help-dialog`, `.confirm-dialog-overlay`, `.video-dialog`, `.image-dialog` are all top-level selectors in `Dialog.scss`, so they survive the portal. The custom properties they read (`--brand-primary`, `--border-color-default`, `--spacing-medium`) come from the Atlas theme's global `:root`, not from the widget, so they survive too. To be safe, `DialogShell` still puts `widget-rich-text` on its portalled root — the same thing v4's `classNames("Dialog mx-layoutgrid widget-rich-text", …)` was doing.
- **Unit tests query a portal.** RTL's `screen` searches `document.body`, so existing `ImageDialog.spec.tsx` queries keep working; any query scoped to a `render()` container result would not. Verify rather than assume.
- **Snapshots.** `src/__tests__/__snapshots__` and `e2e/RichText.spec.js-snapshots` may shift. Dialogs are closed in the widget-level snapshots, so the expected blast radius is small.
- **Scroll lock in focused mode.** `FloatingOverlay lockScroll` locks the page. If the widget is inside an Atlas modal that also locks scroll, unlock ordering on close needs a check.

## Open Questions

- Should `.dialog-tabs` be pinned above the scroll region rather than scrolling with it? Better UX for the Media Library case; larger markup change. Deferred, not blocked.
- Should the toolbar popovers get the same portal treatment in a follow-up? They share defect B (a transformed ancestor clips them), just less visibly because they are short.
- Pre-existing, out of scope: `src/ui/RichText.scss:11` nests `:root` inside `.widget-rich-text`, compiling to `.widget-rich-text :root`, which matches nothing. Every `--white` / `--gray-*` / `--shadow` declaration in that block is dead and all `var()` reads of them silently use their fallbacks. Worth its own change.
