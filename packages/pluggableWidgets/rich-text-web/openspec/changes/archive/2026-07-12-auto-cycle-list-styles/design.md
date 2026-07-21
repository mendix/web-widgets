## Context

Rich text widget renders ordered (`<ol>`) and unordered (`<ul>`) lists using Tiptap's StarterKit extensions. Current SCSS (`RichText.scss` lines 158-162) only sets basic padding and margin:

```scss
ul,
ol {
    padding-left: 1.5em;
    margin: 0.5em 0;
}
```

All nesting levels use browser defaults:

- Ordered lists: `list-style-type: decimal` (1, 2, 3) at all levels
- Unordered lists: `list-style-type: disc` (●) at all levels

Standard word processors (Word, Google Docs, Notion) auto-cycle list styles by depth for visual hierarchy. Users coming from these tools expect similar behavior.

Recent change `fix-list-tab-indent` added Tab key support for nesting lists, making this enhancement more valuable.

## Goals / Non-Goals

**Goals:**

- Auto-cycle ordered list styles: decimal → lower-alpha → lower-roman (repeat)
- Auto-cycle unordered list styles: disc → circle → square (repeat)
- CSS-only implementation (zero JavaScript)
- Preserve inline style overrides (user-set `style="list-style-type: ..."`)
- Support 6+ nesting levels

**Non-Goals:**

- User controls for changing list style (Phase 2 scope)
- Toolbar UI changes
- Extending Tiptap list extensions
- Data model changes (no new attributes)
- RTL-specific list markers

## Decisions

### Decision 1: Pure CSS nested selectors

**Choice**: Use CSS descendant combinators (`ol ol { ... }`) to target nested lists.

**Rationale**:

- Zero JavaScript overhead
- Standard CSS, widely supported
- Works immediately with existing HTML structure
- No Tiptap extension modifications needed
- Inline styles naturally override via CSS specificity

**Alternatives considered**:

- Data attributes (`data-list-level="2"`) → Requires Tiptap extension to inject attributes, adds complexity
- JavaScript depth calculation → Performance overhead, unnecessary for static styling
- CSS `:nth-child()` or counters → Incorrect semantic (targets item position, not nesting depth)

### Decision 2: Cycle sequence matches Word

**Choice**:

- Ordered: decimal (1, 2, 3) → lower-alpha (a, b, c) → lower-roman (i, ii, iii)
- Unordered: disc (●) → circle (○) → square (■)

**Rationale**:

- Industry standard (Microsoft Word, Google Docs use same sequence)
- User familiarity reduces cognitive load
- Lower-case styles preferred for nested content (less visual weight than uppercase)

**Alternatives considered**:

- Upper-case roman/alpha at level 1 → Too visually heavy for running text
- Custom sequence → No benefit, breaks user expectations

### Decision 3: Define 6 nesting levels explicitly

**Choice**: Write CSS rules for 6 levels of nesting (2 full cycles).

**Rationale**:

- Covers 95%+ of real-world use cases
- Cost is ~30 lines of CSS (cheap)
- Deeper nesting (7+) falls back to browser defaults (acceptable edge case)

**Alternatives considered**:

- 3 levels only → Breaks at 4th level (incomplete cycle)
- 9 levels → Unnecessary (deeply nested lists are rare, unreadable)
- Infinite via preprocessor loops → Adds build complexity for marginal gain

### Decision 4: Preserve inline style precedence

**Choice**: CSS specificity naturally prioritizes inline styles. No `!important` needed for base rules.

**Rationale**:

- Users who manually set `style="list-style-type: upper-roman;"` keep their choice
- Supports future Phase 2 (user overrides via toolbar)
- Standard CSS behavior, no surprises

**CSS specificity**:

- Inline style: 1000 points (highest)
- `ol ol ol`: 3 points
- Inline wins automatically

## Risks / Trade-offs

**[Risk]** Users with existing nested lists see visual change after upgrade → **Mitigation**: Document in CHANGELOG as enhancement. Not breaking (only affects appearance, not functionality).

**[Risk]** Deeply nested lists (7+ levels) don't cycle correctly → **Mitigation**: Define extra levels if needed (cheap). Fallback to browser default (decimal/disc) is acceptable.

**[Risk]** User expectations from non-Word apps → **Mitigation**: Word/Google Docs are dominant, setting de facto standard. Other tools vary, but decimal→alpha→roman is most common.

**[Trade-off]** No per-list customization in Phase 1 → Accepted. Phase 2 adds toolbar controls for manual override.

**[Trade-off]** CSS file size increases ~40 lines → Negligible (gzipped impact <0.5KB).

## Implementation

**File modified**: `packages/pluggableWidgets/rich-text-web/src/ui/RichText.scss`

**Change location**: Lines 158-162 (existing `ul, ol` rules)

**Strategy**: Replace simple `ul, ol` selector with nested rules:

```scss
// Ordered list auto-cycling (6 levels = 2 full cycles)
ol {
    list-style-type: decimal;
    ol {
        list-style-type: lower-alpha;
        ol {
            list-style-type: lower-roman;
            ol {
                list-style-type: decimal; // Cycle repeats
                ol {
                    list-style-type: lower-alpha;
                    ol {
                        list-style-type: lower-roman;
                    }
                }
            }
        }
    }
}

// Unordered list auto-cycling (6 levels = 2 full cycles)
ul {
    list-style-type: disc;
    ul {
        list-style-type: circle;
        ul {
            list-style-type: square;
            ul {
                list-style-type: disc; // Cycle repeats
                ul {
                    list-style-type: circle;
                    ul {
                        list-style-type: square;
                    }
                }
            }
        }
    }
}
```

Keep existing padding/margin rules intact.

## Open Questions

None. Design is complete and straightforward.
