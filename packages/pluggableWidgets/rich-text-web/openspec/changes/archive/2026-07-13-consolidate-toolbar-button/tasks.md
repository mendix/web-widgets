## 1. Create the component

- [x] 1.1 Add `src/components/toolbars/components/ToolbarDefaultButton.tsx` as a `forwardRef<HTMLButtonElement>` component with props `extends ButtonHTMLAttributes<HTMLButtonElement>` plus `icon?`, `activeIcon?`, `isActive?`
- [x] 1.2 Render `<button>` with `type={type ?? "button"}`, `className={classNames(className || "icon-button", { "is-active": isActive })}`, ref forwarded, and rest attributes spread
- [x] 1.3 Default child: `{children ?? <span className={\`icons icon-${isActive && activeIcon ? activeIcon : icon}\`} />}`

## 2. Migrate icon-only trigger sites

- [x] 2.1 `ColorPicker.tsx` — replace raw `<button>` with `<ToolbarDefaultButton ref={buttonRef} icon={config.icon} title={config.title} onClick={...} />`
- [x] 2.2 `Dialog.tsx` — same replacement, forwarding `buttonRef`
- [x] 2.3 `TableGrid.tsx` — same replacement, forwarding `buttonRef`
- [x] 2.4 `ConfigurationDropdown.tsx` — same replacement, forwarding `buttonRef`
- [x] 2.5 `CodeView.tsx` — replace with `isActive={codeViewState.isCodeView}` (base class stays `icon-button`)

## 3. Migrate the default action button

- [x] 3.1 `ToolbarButton.tsx` — replace `<button>` with `ToolbarDefaultButton`, passing `icon`, `activeIcon`, `isActive`, `disabled={isDisabled}`, `onClick={handleClick}`, `onKeyDown={handleKeyDown}`, `title`
- [x] 3.2 Confirm native `disabled` still renders (Tab handler `querySelectorAll("button:not([disabled])")` must keep working)

## 4. Migrate dropdown and split buttons

- [x] 4.1 `ToolbarDropdown.tsx` — trigger button: `className={\`toolbar-dropdown-button ${config.name}\`}`, pass label+arrow as `children`
- [x] 4.2 `ToolbarSplitButton.tsx` — main button via `ToolbarDefaultButton` with `className="split-button-main"`, `aria-pressed`, arrow-icon `children`, `onKeyDown`
- [x] 4.3 `ToolbarSplitButton.tsx` — dropdown button via `ToolbarDefaultButton` with `className="split-button-dropdown"`, `aria-expanded`, `aria-haspopup="menu"`, arrow-icon `children`, `onKeyDown`

## 5. Verify

- [x] 5.1 Add/update unit tests asserting rendered class names, `is-active`, native `disabled`, and `aria-*` passthrough for `ToolbarDefaultButton`
- [x] 5.2 Run package unit tests (Jest + RTL) — new suite passes 8/8 (pre-existing RichText snapshot + customList/fonts failures are unrelated, present on clean HEAD)
- [ ] 5.3 Run E2E (`e2e/RichText.spec.js`) — toolbar rendering, dropdown/split keyboard nav, and Tab-to-editor unchanged
- [ ] 5.4 Manual check in Studio Pro (`pnpm start` with `MX_PROJECT_PATH`) — no visual regression across presets
