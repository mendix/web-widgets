# Proposal: Ordered List Split Button

## Problem

Current toolbar has separate buttons for ordered list toggle and style picker:

```
[Bullets] [Numbers] [Checklist] [▼ Style]
```

Issues:

- Style dropdown separated from list toggle (poor spatial grouping)
- Style dropdown disabled when no OL active (discovery problem)
- No visual feedback of current style when OL inactive
- Doesn't match Word/Office UX pattern users expect

## Solution

Merge ordered list toggle and style picker into single split button:

```
[Bullets ▼] [Numbers ▼] [Checklist]
```

Split button behavior:

- **Main button**: Toggle OL on/off
- **Dropdown arrow**: Open style picker
- **Icon**: Dynamic based on active/last-used style (1, a, i)
- **Sticky state**: Remember last used style across toggles

### Word-like interaction flow

**When OL inactive:**

- Main click → Enable OL with last-used style (default: decimal)
- Dropdown click → Show styles, selecting applies style + enables OL
- Icon shows last-used style

**When OL active:**

- Main click → Disable OL
- Dropdown click → Show styles, selecting changes style
- Icon shows current active style

**Dropdown options (icon + text):**

- [#] 1, 2, 3 (decimal)
- [a] a, b, c (lower-alpha)
- [i] i, ii, iii (lower-roman)

## Benefits

- **Spatial proximity**: Style control attached to list trigger
- **Discoverability**: Dropdown always visible, not hidden when inactive
- **Visual feedback**: Icon changes to reflect style (1 → a → i)
- **Familiar UX**: Matches Word/Office split button pattern
- **Less toolbar clutter**: 4 buttons → 3 buttons

## Implementation approach

### 1. New component

Create `ToolbarSplitButton.tsx`:

- Two buttons in group (main + dropdown)
- Independent click handlers
- Shared active state styling
- Keyboard nav: arrows move between buttons, ArrowDown opens menu
- ARIA: `role="group"`, `aria-pressed`, `aria-expanded`

### 2. Config changes

Update `ToolbarConfig.ts`:

- Add `"splitButton"` action type
- Add `icon` field to `ToolbarDropdownOption` interface
- Update `orderedList` button config with dropdown options
- Remove standalone `orderedListStyle` button
- Add icon mapping helper

### 3. State management

Module-level sticky state:

```typescript
let lastOrderedListStyle: "decimal" | "lower-alpha" | "lower-roman" = "decimal";
```

Updated on style selection, used when toggling OL while inactive.

### 4. Icon mapping

```typescript
const STYLE_ICON_MAP = {
    decimal: "List-numbers",
    "lower-alpha": "List-lower-alpha",
    "lower-roman": "List-roman"
};
```

Icons already exist in `RichTextIcons.scss`.

### 5. Dropdown options

Add icons to dropdown items:

```tsx
<button className="toolbar-dropdown-item">
    <span className="icons icon-List-numbers" />
    <span>1, 2, 3</span>
</button>
```

### 6. SCSS

`.split-button` wrapper with:

- `.split-button-main` (left side, border-right)
- `.split-button-dropdown` (right side, chevron)
- `&.is-active` highlighting
- Focus indicators on both buttons

## Out of scope

- Bullet list split button (future enhancement for bullet styles)
- Multi-instance isolation (module-level state acceptable for MVP)
- Persistent storage (session-scoped sticky state sufficient)

## Risks

- **Multi-editor instances**: Shared module state across instances on same page. Mitigation: Rare use case, can enhance later with per-editor storage.
- **Touch targets**: 56px combined width adequate for touch, verify on mobile.
- **Keyboard complexity**: Split button nav more complex than single button. Mitigation: Follow ARIA authoring practices.

## Testing

Unit tests:

- Icon changes based on active style
- Sticky state persists across toggles
- Main button toggles OL with correct style
- Dropdown options apply style + toggle when inactive
- Dropdown options change style only when active
- Keyboard navigation

E2E test:

- Full workflow: select style via dropdown, toggle off/on, verify sticky

## Success criteria

- [ ] Ordered list button merged with style picker
- [ ] Icon updates dynamically (List-numbers, List-lower-alpha, List-roman)
- [ ] Last-used style remembered across toggles
- [ ] Dropdown accessible when OL inactive
- [ ] Keyboard navigation works
- [ ] Tests pass
- [ ] Visual match to Word split button pattern
