## Why

The rich text toolbar has 8 button elements spread across 7 components, each hand-rolling a near-identical `<button className="icon-button" title>` with an `<span className="icons icon-*">` inside. Trigger markup, ref forwarding, and active/disabled state are copy-pasted, so styling and accessibility fixes must be applied in many places. A single `ToolbarDefaultButton` removes the duplication and gives one place to own button behavior.

## What Changes

- Add `ToolbarDefaultButton` — a `forwardRef<HTMLButtonElement>` component that renders the toolbar `<button>`, defaulting to an icon `<span>` child and composing `icon-button` / `is-active` classes.
- Route all toolbar button `<button>` elements through it:
    - `ToolbarButton` (default action button — icon, activeIcon, isActive, disabled, Tab keydown)
    - `CodeViewToolbarButton` (icon + isActive)
    - `ColorPickerToolbarButton`, `DialogToolbarButton`, `TableGridToolbarButton`, `ConfigurationDropdown` (icon triggers with forwarded ref)
    - `ToolbarDropdown` (custom label+arrow children, `toolbar-dropdown-button` class)
    - `ToolbarSplitButton` (main + dropdown-arrow buttons, custom classes + aria)
- Preserve native `disabled` (Tab handler relies on `button:not([disabled])`), all `aria-*`, `type`, and `onKeyDown` passthrough via extending `ButtonHTMLAttributes`.
- No user-facing behavior change — pure refactor. No spec/requirement changes.

## Capabilities

### New Capabilities

- `rich-text-toolbar-button`: Shared toolbar button component contract — icon/activeIcon rendering, active/disabled state, class composition, ref forwarding, and native attribute passthrough used by every rich text toolbar control.

### Modified Capabilities

<!-- None — pure internal refactor, no existing spec requirements change. -->

## Impact

- Package: `@mendix/rich-text-web`
- New file: `src/components/toolbars/components/ToolbarDefaultButton.tsx`
- Modified: `ToolbarButton.tsx`, `CodeView.tsx`, `ColorPicker.tsx`, `Dialog.tsx`, `TableGrid.tsx`, `ConfigurationDropdown.tsx`, `ToolbarDropdown.tsx`, `ToolbarSplitButton.tsx`
- Styling: `Toolbar.scss` unchanged — class names preserved (`icon-button`, `toolbar-dropdown-button`, `split-button-main`, `split-button-dropdown`).
- No XML, no dependencies, no runtime API change.
