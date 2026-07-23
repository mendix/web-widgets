## Context

The Rich Text widget is a TipTap-based editor. Keyboard shortcuts come from three scattered sources with no central registry:

- **TipTap built-ins** — bold `Mod-b`, italic `Mod-i`, etc., baked into extension packages under `node_modules` (not this repo's code).
- **Custom extensions** — `src/extensions/Indent.ts` (`Mod-]` / `Mod-[`), `src/extensions/Fullscreen.ts` (Escape to exit fullscreen).
- **Accessibility navigation** — `src/extensions/KeyboardNavigation.ts` (Alt+F10 focus toolbar, Alt+F11 focus status bar, Escape return to editor).

TipTap exposes no runtime API to enumerate active shortcuts, so any help panel must use a hand-maintained list.

The toolbar is configured declaratively in `src/components/toolbars/ToolbarConfig.ts` (`TOOLBAR_GROUPS`) and rendered by `src/components/toolbars/Toolbar.tsx` via a `ToolbarButtonFactory` switch on `button.action`. Two dialog patterns already exist: anchored floating dropdowns (`DialogToolbarButton` + `ToolbarContext`) and a centered overlay modal (`ConfirmDialog`, using `Dialog.scss`).

The icon font (`src/ui/RichTextIcons.scss`) has no help/question glyph.

Toolbar group toggles (`history`, `fontStyle`, … `tableBetter`) live in the "Custom toolbar" property group and are gated in Studio Pro to `preset === "custom"` via `toolbarGroupKeys` in `src/RichText.editorConfig.ts`. The `preset` (basic/standard/full/custom) and per-group booleans flow through `EditorWrapper.tsx` into `Toolbar`, which computes `filteredGroups` from them.

## Goals / Non-Goals

**Goals:**

- Add a discoverable help button that opens a centered modal listing keyboard shortcuts, similar to TinyMCE's help menu.
- Gate the button behind a new `helpButton` property (default true) AND require the full toolbar to be shown.
- Reuse existing modal/dialog and styling patterns; add no runtime dependencies.
- Ship an accessible dialog (role/aria, focus, Escape).

**Non-Goals:**

- No runtime enumeration of TipTap shortcuts — the catalog is static and manually synced.
- No internationalization of shortcut labels (the widget has no i18n infra today; strings stay English, matching existing toolbar titles).
- No new icon-font glyph — use a text "?" for now.
- No editing/customization of shortcut bindings from the modal.

## Decisions

### Decision 1: Centered modal, mirroring `ConfirmDialog`

Use a centered overlay modal (`HelpDialog`) reusing `Dialog.scss`, rather than the anchored floating dropdown pattern. Rationale: matches TinyMCE's help UX and the user's requested style; `ConfirmDialog` already proves the overlay + click-outside + `Dialog.scss` pattern in this codebase.

**Alternative considered:** anchored dropdown (`DialogToolbarButton`). Rejected — a shortcuts reference is a focused, content-heavy panel better suited to a centered modal than a small anchored popover.

### Decision 2: Render outside `TOOLBAR_GROUPS`, gated on "all groups shown"

The help button is appended in `Toolbar.tsx` outside the mapped `filteredGroups`, not added as a `TOOLBAR_GROUPS` entry. Rationale: it must escape the normal preset/group filtering and follow its own gating rule. Gating condition:

```
helpButton !== false && filteredGroups.length === TOOLBAR_GROUPS.length
```

`filteredGroups.length === TOOLBAR_GROUPS.length` is true for preset `full` and for `custom` with every group enabled; false for basic/standard and for custom missing any group. This directly implements "only visible when full toolbar."

**Alternative considered:** a dedicated `help` group in `TOOLBAR_GROUPS` with a `presetValue`. Rejected — presetValue gating can't express "all groups present," and it would appear under partial custom configs.

### Decision 3: New `helpButton` property in the custom-toolbar group

Add `<property key="helpButton" type="boolean" defaultValue="true">` after `tableBetter` in `RichText.xml`, and add `"helpButton"` to `toolbarGroupKeys` in `editorConfig.ts` so it's hidden unless `preset === "custom"`, consistent with sibling toggles. `typings/RichTextProps.d.ts` is regenerated from XML (never hand-edited). Prop is plumbed through `RichText.tsx` → `EditorWrapper.tsx` → `Editor.tsx` → `Toolbar`.

**Note on gating interplay:** the property is only _editable_ under `custom`, but the button is only _rendered_ under the full toolbar. Under preset `full` the property keeps its default (`true`), so the button shows. Under `custom`, the user can both enable all groups and toggle `helpButton`.

### Decision 4: Static shortcut catalog module

A new module (e.g. `shortcuts.ts`) exports a grouped, static list (Formatting, Paragraph, History, Accessibility). `HelpDialog` renders it. Key combos shown generically as `Ctrl` (TinyMCE-style) to avoid OS-detection complexity.

**Alternative considered:** platform detection to show Cmd on macOS. Deferred — adds branching for marginal benefit; can revisit.

### Decision 5: Text "?" button via `ToolbarDefaultButton` children

Render the button using `ToolbarDefaultButton` with `children="?"`, bypassing the icon-font `<span>`. Rationale: no help glyph exists in the font; adding one requires font tooling. The `.icons` CSS hides `svg` inside toolbar buttons, so an inline SVG would need a CSS exception — text is simpler.

## Risks / Trade-offs

- **Static catalog drifts from real bindings** → Colocate the catalog with clear "keep in sync" comments; add a unit test asserting the catalog covers the shortcuts owned by this repo's custom extensions (Indent, Fullscreen, KeyboardNavigation). Built-in TipTap combos remain manually verified.
- **Generic `Ctrl` labels are inaccurate on macOS** (Cmd) → Documented as a known limitation; low impact, revisitable via platform detection later.
- **Escape key collision** — Escape already closes fullscreen (`Fullscreen.ts`) and returns focus to editor (`KeyboardNavigation.ts`). The modal's Escape handler must stop propagation / take precedence while open so it doesn't also trigger those → scope the handler to the open modal and `stopPropagation`.
- **Text "?" visual inconsistency** with icon-font buttons → acceptable interim; style via existing button classes for alignment.

## Migration Plan

Additive, non-breaking. New property defaults to `true` but only surfaces under the full toolbar, so existing basic/standard configurations are unchanged. No data migration. Rollback = revert the change; no persisted state introduced.

## Open Questions

- Should a follow-up add a dedicated help icon glyph to the font (replacing the text "?")? Out of scope now.
- Should platform-aware key labels (Cmd vs Ctrl) be added later? Deferred.
