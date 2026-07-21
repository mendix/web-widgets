## Context

The rich text toolbar (`@mendix/rich-text-web`) renders every control through `ToolbarButtonFactory` in `Toolbar.tsx`, which dispatches to 7 components. Eight `<button>` elements across those components each hand-roll the same trigger markup — `<button className="icon-button" title>` wrapping `<span className="icons icon-{icon}">` — plus their own ref forwarding and active/disabled handling.

Current `<button>` sites:

| Component                  | Buttons | Distinctive traits                                                                                                   |
| -------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `ToolbarButton` (default)  | 1       | `activeIcon`, `disabled` via `canExecute`, Tab-to-editor `onKeyDown`, `isActive`                                     |
| `CodeViewToolbarButton`    | 1       | `isActive` from `codeViewState`                                                                                      |
| `ColorPickerToolbarButton` | 1       | ref anchors floating picker                                                                                          |
| `DialogToolbarButton`      | 1       | ref anchors dialog                                                                                                   |
| `TableGridToolbarButton`   | 1       | ref anchors grid selector                                                                                            |
| `ConfigurationDropdown`    | 1       | ref anchors config panel                                                                                             |
| `ToolbarDropdown`          | 1       | `toolbar-dropdown-button` class, label+arrow children                                                                |
| `ToolbarSplitButton`       | 2       | `split-button-main` / `split-button-dropdown` classes, `aria-pressed`/`aria-expanded`/`aria-haspopup`, arrow-key nav |

`Toolbar.scss` styles both a global `.tiptap-toolbar button {}` block and specific base classes (`.icon-button`, `.toolbar-dropdown-button`, `.split-button-main`, `.split-button-dropdown`).

## Goals / Non-Goals

**Goals:**

- One `ToolbarDefaultButton` component owning the toolbar `<button>` element.
- Route all 8 button sites through it with zero user-facing behavior change.
- Preserve existing CSS class names, native `disabled`, `aria-*`, and keyboard handlers.

**Non-Goals:**

- No change to `Toolbar.scss` selectors or class names.
- No consolidation of dropdown-menu-item `<button>`s (`toolbar-dropdown-item`) — they are list rows, not toolbar controls.
- No change to `ToolbarButtonFactory` dispatch logic, editor commands, or floating-UI hooks.

## Decisions

### Extend `ButtonHTMLAttributes<HTMLButtonElement>` + `forwardRef`

```tsx
interface ToolbarDefaultButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: string;
    activeIcon?: string;
    isActive?: boolean;
}
```

Extending the native attribute type gives free, type-safe passthrough for `onClick`, `onKeyDown`, `title`, `type`, `disabled`, `aria-*`, and `data-*` without enumerating each. `forwardRef<HTMLButtonElement>` is mandatory — 6 of 8 sites anchor floating UI to `buttonRef.current`.

_Alternative considered:_ explicit prop list. Rejected — would drop-and-miss attributes (Split's three aria props) and drift from native semantics.

### Icon child is a default, not fixed

```tsx
{
    children ?? <span className={`icons icon-${isActive && activeIcon ? activeIcon : icon}`} />;
}
```

Icon-only sites pass just `icon`. Dropdown/Split pass `children` (label+arrow, or arrow). `activeIcon` swap only applies to the default child, matching current `ToolbarButton` behavior.

### `className` replaces the base, `is-active` composes

```tsx
className={classNames(className || "icon-button", { "is-active": isActive })}
```

Because the SCSS targets distinct base classes, a supplied `className` (e.g. `split-button-main`) must _replace_ `icon-button`, not append. `is-active` layers on top of whichever base is used. This preserves all existing selectors untouched.

_Alternative considered:_ always emit `icon-button` and append extra classes. Rejected — Dropdown/Split styles are not scoped under `.icon-button`, so double-base classes could pull unwanted global button rules.

### Default `type="button"`

`type={type ?? "button"}` — matches Split's explicit `type="button"` and prevents accidental form submission at other sites that currently omit it.

## Risks / Trade-offs

- **Tab-to-editor handler breaks** → keep native `disabled` attribute (never `aria-disabled`); the handler's `querySelectorAll("button:not([disabled])")` stays valid. Verified as an explicit spec requirement.
- **Split button's two children render differently** → Split passes each of its two buttons through separate `ToolbarDefaultButton` instances with distinct `className` + `children`; no shared-state coupling introduced.
- **Silent class regression** → snapshot/DOM assertions per site plus existing E2E (`e2e/RichText.spec.js`) guard against class-name drift.
- **Over-consolidation of menu items** → explicitly out of scope; menu-item buttons keep their own markup.

## Migration Plan

1. Add `ToolbarDefaultButton.tsx`.
2. Migrate icon-only sites first (ColorPicker, Dialog, TableGrid, ConfigurationDropdown, CodeView) — lowest risk.
3. Migrate `ToolbarButton` (default) preserving `onKeyDown` + `disabled`.
4. Migrate `ToolbarDropdown` (className + children) and `ToolbarSplitButton` (two instances + aria).
5. Run unit tests + E2E; verify rendered class names and keyboard flows unchanged.

Rollback: revert the call-site edits; the new file is additive and can remain unused.

## Open Questions

- None. Menu-item scope resolved (excluded); class-composition rule resolved (replace base).
