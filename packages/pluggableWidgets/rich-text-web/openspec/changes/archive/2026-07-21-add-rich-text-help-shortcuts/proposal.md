## Why

The Rich Text widget supports many keyboard shortcuts (formatting, indentation, history, and accessibility navigation), but users have no way to discover them from within the editor. TinyMCE and other editors expose a help menu listing shortcuts; the Rich Text widget lacks an equivalent, so shortcuts remain hidden and underused — hurting both productivity and keyboard/accessibility users.

## What Changes

- Add a help button ("?" text icon) to the Rich Text toolbar.
- Clicking the button opens a centered modal dialog listing available keyboard shortcuts, grouped by category (Formatting, Paragraph, History, Accessibility navigation).
- The modal follows the existing dialog pattern (overlay, click-outside to close, Escape to close) and is accessible (`role="dialog"`, `aria-modal`, focus management).
- Add a new `helpButton` boolean widget property (default `true`), placed after `tableBetter` in the toolbar-groups configuration.
- The help button renders only when the full set of toolbar groups is shown (preset `full`, or custom mode with all groups enabled) AND `helpButton` is not disabled.
- The shortcut list is a static, manually-synced source (no runtime enumeration — TipTap provides no such API).

No breaking changes. The property defaults to `true`, but the button only appears under the full toolbar, so basic/standard presets are unaffected.

## Capabilities

### New Capabilities

- `rich-text-help-shortcuts`: A toolbar help button and keyboard-shortcuts modal for the Rich Text widget — its visibility gating, modal behavior, accessibility, and the catalog of shortcuts displayed.

### Modified Capabilities

<!-- None. No existing OpenSpec specs; this is the first capability documented for this behavior. -->

## Impact

- **Widget XML**: new `helpButton` property in `src/RichText.xml` after `tableBetter`.
- **Generated typings**: `typings/RichTextProps.d.ts` regenerated from XML (not hand-edited).
- **Editor config**: `src/RichText.editorConfig.ts` — add `helpButton` to `toolbarGroupKeys` so it hides in Studio Pro unless preset is `custom`, matching sibling group toggles.
- **Props plumbing**: `src/RichText.tsx` → `src/components/EditorWrapper.tsx` → `src/components/Editor.tsx` → `Toolbar`.
- **Toolbar rendering**: `src/components/toolbars/Toolbar.tsx` — conditional help button + "all groups shown" gating; new `HelpDialog` component and a static `shortcuts` list module.
- **Styling**: reuse existing `Dialog.scss` (centered-modal pattern already present via `ConfirmDialog`).
- **Tests**: unit tests for gating logic, modal open/close, and accessibility attributes.
- No new runtime dependencies.
