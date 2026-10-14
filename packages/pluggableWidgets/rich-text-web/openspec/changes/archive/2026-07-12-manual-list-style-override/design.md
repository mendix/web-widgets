## Context

Rich text widget uses Tiptap editor with StarterKit's `OrderedList` extension. Recent Phase 1 (`auto-cycle-list-styles`) added CSS-based automatic style cycling:

- Level 1: decimal → Level 2: lower-alpha → Level 3: lower-roman (repeats)

Current limitations:

- No way for users to manually override list style
- All top-level lists must be decimal
- Cannot start document with lower-alpha or lower-roman lists

Widget supports two output modes via `styleDataFormat` prop:

- `inline`: Outputs `style="..."` attributes
- `class`: Outputs `data-*` attributes + CSS classes (CSP-compliant)

Existing toolbar has "Numbered List" button (toggles ordered list on/off, no style control).

## Goals / Non-Goals

**Goals:**

- Add toolbar dropdown for manual list style selection (lower-alpha, lower-roman, decimal)
- Store style choice in `listStyleType` attribute on `<ol>` element
- Support both inline and class-based output modes
- Cycle offset behavior — manual styles continue cycle for nested children
- Dropdown visible only when cursor in ordered list
- Convert entire `<ol>` when style selected

**Non-Goals:**

- Upper-alpha / upper-roman styles (future Phase 3)
- Unordered list style overrides (disc/circle/square remain auto-only)
- Per-item styling (apply per `<li>` instead of per `<ol>`)
- Split-button UI (icon + chevron in single button)
- Keyboard shortcuts for style cycling
- Preview of styles before selection

## Decisions

### Decision 1: Extend OrderedList vs create wrapper

**Choice**: Create `OrderedListStyled` that extends Tiptap's `OrderedList`, add `listStyleType` attribute.

**Rationale**:

- Inherits all existing functionality (toggle, keyboard shortcuts, paste handling)
- Adds single attribute without duplicating logic
- Standard Tiptap extension pattern
- Easy to maintain when StarterKit updates

**Alternatives considered**:

- Wrap OrderedList in higher-order component → More complex, loses access to extension internals
- Modify StarterKit directly → Breaks future updates, not maintainable

### Decision 2: Separate dropdown button vs split button

**Choice**: Add new dropdown button "Numbering Style" next to existing "Numbered List" button. Dropdown only visible when in ordered list (`canExecute` check).

**Rationale**:

- Uses existing `action: "dropdown"` pattern (matches font family, font size)
- Simpler implementation (no new component needed)
- Better accessibility (single focus target per button)
- Conditional visibility keeps toolbar clean when not applicable

**Alternatives considered**:

- Split button (icon | chevron) → Requires new component, harder accessibility, complex focus management
- Always-visible dropdown → Clutters toolbar, confusing when not in list

### Decision 3: Cycle offset for nested lists

**Choice**: Manual `listStyleType` acts as "cycle position marker". Children without attribute continue cycle from that position.

Example:

- Parent has `listStyleType="lower-alpha"` (position 2) → children start at lower-roman (position 3)
- Parent has `listStyleType="lower-roman"` (position 3) → children start at decimal (position 4)

**CSS Implementation**:

```scss
ol[data-list-style="lower-alpha"] {
    list-style-type: lower-alpha !important;

    > li > ol:not([data-list-style]) {
        list-style-type: lower-roman; // Continue from position 3
    }
}
```

**Rationale**:

- Intuitive for users — "a, b, c" nests to "i, ii, iii"
- Consistent with auto-cycle mental model
- Predictable across nesting depths

**Alternatives considered**:

- Reset children to decimal → Breaks visual hierarchy, confusing
- All children inherit same style → No nesting distinction, defeats purpose
- No cycle offset (children use auto-cycle from level 1) → "a" → "1" → weird jump

### Decision 4: Dropdown options

**Choice**: 3 options:

1. "1, 2, 3" (decimal) — removes attribute, uses auto-cycle
2. "a, b, c" (lower-alpha) — sets `listStyleType="lower-alpha"`
3. "i, ii, iii" (lower-roman) — sets `listStyleType="lower-roman"`

Option 1 acts as "reset to auto" (removes attribute).

**Rationale**:

- Covers 95% of use cases (legal docs, formal outlines)
- Keeps UI simple (3 choices, not overwhelming)
- Decimal option allows intentional override (force decimal at level 2+)

**Alternatives considered**:

- 5 options (add upper-alpha, upper-roman) → Too many, clutters dropdown, rare use case
- 2 options (only lower-alpha, lower-roman) → No way to reset to auto-cycle
- No decimal option → Can't intentionally set decimal at non-top levels

### Decision 5: Attribute storage format

**Choice**: Use `listStyleType` attribute name (matches CSS property). Output format depends on `styleDataFormat`:

- **Inline mode**: `<ol style="list-style-type: lower-alpha;">`
- **Class mode**: `<ol data-list-style="lower-alpha" class="list-style-lower-alpha">`

**parseHTML** accepts both formats (backward compat).

**Rationale**:

- Inline mode: Direct CSS, works immediately without stylesheet changes
- Class mode: CSP-compliant, separates content from presentation
- Dual parsing supports mixed content (e.g., pasted from other editors)

**Alternatives considered**:

- Always use inline style → Fails strict CSP policies
- Always use class → Harder debugging, requires CSS class definitions
- Custom attribute name (`data-mx-list-style`) → Diverges from web standards

## Risks / Trade-offs

**[Risk]** Users create lower-alpha at top level, expect children to be lower-roman, get decimal instead → **Mitigation**: Cycle offset CSS ensures lower-alpha (pos 2) → lower-roman (pos 3). Only issue if user expects "b" → "ii" (which would be wrong).

**[Risk]** CSS specificity conflicts with existing auto-cycle rules → **Mitigation**: Use `!important` on manual overrides (`ol[data-list-style]` rules). Specificity: attribute selector (11 points) beats nested selectors (3 points).

**[Risk]** Copy-paste from Word might have incompatible `list-style-type` values → **Mitigation**: `parseHTML` filters to allowed values (decimal, lower-alpha, lower-roman). Unknown values ignored, fall back to auto-cycle.

**[Risk]** Users forget they set manual style, confused why nesting behaves differently → **Mitigation**: Dropdown checkmark shows current style. Decimal option allows reset.

**[Trade-off]** Adding `OrderedListStyled` increases bundle size (~2KB) → Acceptable for functionality gain.

**[Trade-off]** Toolbar gets more crowded with new dropdown → Mitigated by conditional visibility (only shows when in ordered list).

**[Trade-off]** Two buttons for ordered lists ("Numbered List" + "Numbering Style") might confuse users → Acceptable, matches other dual-button patterns (e.g., "Bold" + "Font Family").

## Implementation

### Component Architecture

```
Editor.tsx
  ├─ StarterKit (without OrderedList)
  ├─ OrderedListStyled (replaces OrderedList)
  │    ├─ Inherits: toggle, keyboard, paste
  │    ├─ Adds: listStyleType attribute
  │    ├─ Commands: setOrderedListStyle()
  │    └─ parseHTML/renderHTML: dual-mode support
  └─ Other extensions...

ToolbarConfig.ts
  ├─ orderedList button (existing)
  └─ orderedListStyle dropdown (NEW)
       ├─ canExecute: editor.isActive('orderedList')
       ├─ getCurrentValue: reads listStyleType attribute
       └─ dropdownOptions: decimal/lower-alpha/lower-roman
```

### Data Flow

1. User clicks dropdown option "a, b, c"
2. Calls `editor.commands.setOrderedListStyle('lower-alpha')`
3. Command uses `updateAttributes('orderedList', { listStyleType: 'lower-alpha' })`
4. `renderHTML` hook outputs:
    - Inline mode: `<ol style="list-style-type: lower-alpha;">`
    - Class mode: `<ol data-list-style="lower-alpha" class="list-style-lower-alpha">`
5. CSS rule `ol[data-list-style="lower-alpha"]` applies `list-style-type: lower-alpha !important`
6. Nested children match `ol[data-list-style="lower-alpha"] > li > ol:not([data-list-style])` → get `list-style-type: lower-roman`

### CSS Structure

```scss
// Base auto-cycle rules (existing, from Phase 1)
ol {
    list-style-type: decimal;
}
ol ol {
    list-style-type: lower-alpha;
}
ol ol ol {
    list-style-type: lower-roman;
}

// Manual override rules (NEW)
ol[data-list-style="lower-alpha"] {
    list-style-type: lower-alpha !important;

    > li > ol:not([data-list-style]) {
        list-style-type: lower-roman; // Cycle offset
        > li > ol:not([data-list-style]) {
            list-style-type: decimal;
        }
    }
}

ol[data-list-style="lower-roman"] {
    list-style-type: lower-roman !important;

    > li > ol:not([data-list-style]) {
        list-style-type: decimal; // Cycle offset
        > li > ol:not([data-list-style]) {
            list-style-type: lower-alpha;
        }
    }
}

// Class mode classes (NEW)
.list-style-lower-alpha {
    list-style-type: lower-alpha !important;
}
.list-style-lower-roman {
    list-style-type: lower-roman !important;
}
.list-style-decimal {
    list-style-type: decimal !important;
}
```

## Open Questions

None. Design is complete and validated through exploration phase.
