# Design: Ordered List Split Button

## Context

Current toolbar implementation:

- Separate `ToolbarButton` and `ToolbarDropdown` components
- Button actions: `toggle`, `command`, `custom`, `dropdown`, `colorPicker`, `dialog`, `tableGrid`, `codeView`, `configurationDropdown`
- List group has 4 buttons: bulletList, orderedList, taskList, orderedListStyle
- `orderedListStyle` dropdown only enabled when OL active (`canExecute: editor => editor.isActive("orderedList")`)
- Icons exist in RichTextIcons.scss: `List-numbers`, `List-lower-alpha`, `List-roman`
- Toolbar config driven by `TOOLBAR_GROUPS` array in `ToolbarConfig.ts`
- Factory pattern in `Toolbar.tsx` renders buttons based on action type

Current limitation:

- No composite button pattern (split button, segmented control)
- No per-button state tracking (style preference)
- Dropdown options only support text labels, no icons

## Goals / Non-Goals

**Goals:**

- Create reusable `ToolbarSplitButton` component for composite button patterns
- Merge OL toggle + style picker into single UI element
- Dynamic icon based on active/last-used style
- Sticky state for style preference across toggles
- Keyboard navigation following ARIA authoring practices
- Zero breaking changes to existing toolbar buttons

**Non-Goals:**

- Bullet list split button (future work)
- Per-editor instance state isolation (module-level acceptable for MVP)
- LocalStorage persistence (session-scoped sufficient)
- Refactor existing button components (reuse where possible)

## Decisions

### 1. Component architecture: New vs Composite

**Decision**: Create new `ToolbarSplitButton` component, not composite wrapper.

**Rationale**:

- Split button has distinct interaction model (two focus targets, shared active state)
- Keyboard nav differs from separate buttons (arrow keys move between parts)
- ARIA requirements specific to split button pattern (role="group", coordinated aria-pressed/expanded)
- Reusability for future split buttons (bullet styles, etc)

**Alternative considered**: Wrap existing `ToolbarButton` + `ToolbarDropdown` in container

- **Rejected**: Focus management and keyboard nav would be complex to coordinate externally. Interaction logic belongs in component.

### 2. State management: Where to store lastOrderedListStyle

**Decision**: Module-level variable in component file.

```typescript
// ToolbarSplitButton.tsx
let lastOrderedListStyle: "decimal" | "lower-alpha" | "lower-roman" = "decimal";
```

**Rationale**:

- Simplest implementation, no extra infrastructure
- Multiple editor instances on same page is rare edge case
- Easy to migrate to per-editor storage later if needed

**Alternatives considered**:

| Approach       | Pro                      | Con                                        | Verdict          |
| -------------- | ------------------------ | ------------------------------------------ | ---------------- |
| Editor.storage | Per-editor isolation     | Need to update OrderedListStyled extension | Overkill for MVP |
| React Context  | React-idiomatic          | More boilerplate, context provider changes | Overengineered   |
| LocalStorage   | Persists across sessions | Unnecessary complexity, sync issues        | Out of scope     |

### 3. Icon update mechanism: Pull vs Push

**Decision**: Component pulls icon on render via `getCurrentIcon()` helper.

```typescript
const getCurrentIcon = (): string => {
    if (editor?.isActive("orderedList")) {
        const attrs = editor.getAttributes("orderedList");
        const style = attrs.listStyleType || "decimal";
        return STYLE_ICON_MAP[style];
    }
    return STYLE_ICON_MAP[lastOrderedListStyle];
};
```

**Rationale**:

- Consistent with existing button patterns (re-render on editor.on("selectionUpdate"))
- No need to track icon state separately
- Single source of truth: editor attributes when active, sticky state when inactive

**Alternative considered**: Push updates via editor events

- **Rejected**: Would require tracking previous style, detecting changes, syncing with component state. Pull is simpler.

### 4. Dropdown behavior when OL inactive

**Decision**: Dropdown always enabled, selecting option enables OL + applies style.

**Rationale**:

- Matches Word/Office pattern (dropdown accessible before list enabled)
- Improves discoverability (user can preview style options)
- Eliminates confusion of disabled dropdown

**Alternative considered**: Dropdown disabled when inactive (current behavior)

- **Rejected**: Forces two-step workflow (enable OL, then pick style). Poor UX.

### 5. Command strategy: New vs Compose

**Decision**: Compose existing commands in component handlers, don't add new editor command.

```typescript
// Main button click
editor.chain().focus().toggleOrderedList().updateAttributes("orderedList", { listStyleType: style }).run();

// Dropdown option click
if (isActive) {
    editor.chain().focus().setOrderedListStyle(style).run();
} else {
    editor.chain().focus().toggleOrderedList().updateAttributes("orderedList", { listStyleType: style }).run();
}
```

**Rationale**:

- Existing commands cover all operations
- Logic belongs in component (UI concern, not editor operation)
- Easier to test (no editor extension changes)

**Alternative considered**: Add `toggleOrderedListWithStyle` command to OrderedListStyled extension

- **Rejected**: Mixes UI state (sticky preference) with editor logic. Commands should be stateless.

### 6. Keyboard navigation model

**Decision**: Two-stop tab model with arrow key navigation between parts.

```
Tab          → Focus whole split button (outline both parts)
Enter/Space  → Execute focused part's action
ArrowRight   → Move focus from main to dropdown
ArrowLeft    → Move focus from dropdown to main
ArrowDown    → Open dropdown (from either part)
```

**Rationale**:

- Follows WCAG ARIA authoring practices for split button
- Efficient keyboard workflow (Tab once, arrows to navigate parts)
- Matches Office/Windows split button behavior

**Alternative considered**: Separate tab stops for main/dropdown

- **Rejected**: Doubles tab stops in toolbar, slows keyboard navigation. Split button should behave as single control.

### 7. ToolbarConfig changes: Extend vs Replace

**Decision**: Add `icon` field to `ToolbarDropdownOption`, add `"splitButton"` action type, keep existing config structure.

```typescript
export interface ToolbarDropdownOption {
    label: string;
    value: string;
    command: string;
    attrs?: Record<string, any>;
    icon?: string; // NEW
}

export type ToolbarActionType =
    | "toggle"
    | "command"
    | "custom"
    | "heading"
    | "dropdown"
    | "splitButton" // NEW
    | "tableGrid"
    | "colorPicker"
    | "dialog"
    | "codeView"
    | "configurationDropdown";
```

**Rationale**:

- Backward compatible (icon optional, splitButton only used by OL)
- Follows existing action type pattern
- Dropdown options reusable by ToolbarDropdown (icon rendering conditional)

### 8. SCSS structure: BEM vs Nested

**Decision**: Nested selectors under `.split-button` parent class.

```scss
.split-button {
    .split-button-main {
        /* ... */
    }
    .split-button-dropdown {
        /* ... */
    }
    &.is-active {
        /* ... */
    }
}
```

**Rationale**:

- Matches existing toolbar SCSS structure (`.toolbar-group`, `.toolbar-dropdown-button`)
- Scoping prevents class name collisions
- Active state applies to container, styling inherited by parts

## Component API

### ToolbarSplitButton Props

```typescript
interface ToolbarSplitButtonProps {
  config: ToolbarButtonConfig;  // Reuse existing config type
}

// Config shape for split button:
{
  name: "orderedList",
  title: "Numbered List",
  icon: "List-numbers",           // Default icon (overridden by getCurrentIcon)
  action: "splitButton",
  command: "toggleOrderedList",   // Main button command
  isActive: (editor) => editor.isActive("orderedList"),
  dropdownOptions: [
    {
      label: "1, 2, 3",
      value: "decimal",
      command: "setOrderedListStyle",
      attrs: { styleType: null },
      icon: "List-numbers"
    },
    // ... more options
  ],
  getCurrentValue: (editor) => {
    const attrs = editor.getAttributes("orderedList");
    return attrs.listStyleType || "decimal";
  }
}
```

### Internal State

```typescript
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [focusedPart, setFocusedPart] = useState<"main" | "dropdown">("main");
const mainButtonRef = useRef<HTMLButtonElement>(null);
const dropdownButtonRef = useRef<HTMLButtonElement>(null);
```

### Event Handlers

```typescript
handleMainClick(): void
  // Toggle OL with sticky style when inactive
  // Toggle OL off when active

handleDropdownClick(): void
  // Toggle dropdown open/closed

handleOptionSelect(option: ToolbarDropdownOption): void
  // Update sticky state
  // Apply style + enable OL if inactive
  // Just apply style if active
  // Close dropdown

handleKeyDown(e: KeyboardEvent, part: "main" | "dropdown"): void
  // ArrowRight/Left: move focus between parts
  // ArrowDown: open dropdown
  // Enter/Space: execute focused part action
```

## Accessibility

### ARIA attributes

```tsx
<div className="split-button" role="group" aria-label="Numbered List">
    <button
        className="split-button-main"
        aria-label="Toggle numbered list"
        aria-pressed={isActive}
        onKeyDown={handleKeyDown}
    >
        <span className={`icons icon-${currentIcon}`} />
    </button>

    <button
        className="split-button-dropdown"
        aria-label="Numbering style options"
        aria-expanded={isDropdownOpen}
        aria-haspopup="menu"
        onKeyDown={handleKeyDown}
    >
        <span className="icons icon-Chevron-down" />
    </button>
</div>;

{
    isDropdownOpen && (
        <div role="menu" className="toolbar-dropdown-menu">
            <button role="menuitem" className={activeClass}>
                <span className="icons icon-List-numbers" />
                <span>1, 2, 3</span>
            </button>
        </div>
    );
}
```

### Focus management

- Split button container has visual focus indicator when either part focused
- Focus outline on active part (`:focus-visible`)
- Arrow keys move focus without triggering actions
- Dropdown opens with first option pre-highlighted (via `aria-activedescendant`)

### Screen reader announcements

- Main button: "Toggle numbered list, button, pressed" (when active)
- Dropdown button: "Numbering style options, button, collapsed/expanded"
- Menu item: "1, 2, 3, menu item, selected" (when active style)

## File changes

### New files

- `src/components/toolbars/components/ToolbarSplitButton.tsx` - Split button component
- `src/components/toolbars/helpers/listHelpers.ts` - Icon mapping utilities

### Modified files

- `src/components/toolbars/ToolbarConfig.ts`
    - Add `icon?: string` to `ToolbarDropdownOption`
    - Add `"splitButton"` to `ToolbarActionType`
    - Update `orderedList` button config in `TOOLBAR_GROUPS`
    - Remove `orderedListStyle` standalone button
    - Add icon to dropdown options

- `src/components/toolbars/Toolbar.tsx`
    - Import `ToolbarSplitButton`
    - Add `case "splitButton"` to `ToolbarButtonFactory`

- `src/components/toolbars/Toolbar.scss`
    - Add `.split-button` styles
    - Update `.toolbar-dropdown-item` for icon + text layout

- `src/components/toolbars/components/ToolbarDropdown.tsx` (optional enhancement)
    - Conditionally render option icons if present

## Risks / Trade-offs

### Risk: Multi-editor instance state collision

**Scenario**: Page has two RichText widgets, user selects lower-alpha in widget A, then clicks OL in widget B. Widget B gets lower-alpha instead of decimal.

**Mitigation**:

- Acceptable for MVP (rare use case)
- If reported, migrate to `editor.storage.orderedListStyled.lastUsedStyle`

**Trade-off**: Simple implementation now vs perfect isolation

---

### Risk: Touch target size on mobile

**Scenario**: Split button parts too small for touch (iOS Safari needs 44x44pt minimum)

**Mitigation**:

- Combined split button width: 56px (adequate)
- Main button: 32px min-width
- Dropdown: 24px min-width
- Vertical height: 32px (matches other toolbar buttons)

**Verification**: Test on iPhone during QA

**Trade-off**: Desktop compactness vs mobile usability

---

### Risk: Keyboard nav complexity

**Scenario**: Users confused by arrow key behavior (moves focus instead of navigating toolbar)

**Mitigation**:

- Standard split button pattern (Word, Office, Windows)
- Arrow keys only active when split button focused
- Tab continues to next toolbar button (normal flow)

**Trade-off**: Richer interaction vs learning curve

---

### Risk: Icon not updating after style change

**Scenario**: Component doesn't re-render after dropdown selection

**Mitigation**:

- `useEffect` on editor "selectionUpdate" and "transaction" events (same as existing buttons)
- `getCurrentIcon()` recalculates on every render
- Force re-render with state trigger: `setUpdateTrigger(prev => prev + 1)`

**Trade-off**: Extra re-renders vs guaranteed sync

---

### Risk: Dropdown positioning with Floating UI

**Scenario**: Dropdown anchored to whole split button, not dropdown part

**Mitigation**:

- Pass `dropdownButtonRef.current` to `useDropdown` hook (not container ref)
- Floating UI anchors to dropdown part

**Verification**: Test with scrolling, overflow containers

## Migration Plan

No user-facing migration needed (UI change only).

### Deployment steps

1. Deploy changes to dev environment
2. Manual testing:
    - Verify icon changes (decimal → alpha → roman)
    - Verify sticky state across toggles
    - Keyboard nav (Tab, arrows, Enter, ArrowDown)
    - Touch on mobile (iPad/iPhone)
    - Multiple editor instances (if possible)
3. Run unit tests + E2E test
4. Deploy to staging
5. Notify QA team for UX verification
6. Deploy to production

### Rollback strategy

If critical issue found:

1. Revert PR (single PR includes all changes)
2. Split button reverts to separate buttons
3. No data loss (OrderedListStyled extension unchanged)

## Open Questions

None. Design ready for implementation.
