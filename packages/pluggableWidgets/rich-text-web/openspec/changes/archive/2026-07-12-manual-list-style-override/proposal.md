## Why

Phase 1 auto-cycle provides good defaults, but users sometimes need specific numbering styles for documents with formal conventions (legal docs use lower-roman, outlines use lower-alpha at specific levels). Adding manual override gives users control while preserving automatic cycling where not overridden.

## What Changes

- New `OrderedListStyled` Tiptap extension replaces default `OrderedList` from StarterKit
    - Adds `listStyleType` attribute to store manual style choice (lower-alpha, lower-roman, or null for auto-cycle)
    - Supports both inline (`style="list-style-type: ..."`) and class-based (`data-list-style="..."` + class) modes for CSP compliance
- New toolbar dropdown button "Numbering Style" visible only when cursor is in ordered list
    - 3 options: "1, 2, 3" (decimal/auto-cycle), "a, b, c" (lower-alpha), "i, ii, iii" (lower-roman)
    - Checkmark shows current style
    - Selecting option converts entire `<ol>` to that style
- CSS cycle offset behavior: manually styled lists continue cycle from their position
    - lower-alpha (level 2 in cycle) → children start at lower-roman (level 3)
    - lower-roman (level 3 in cycle) → children start at decimal (level 4)
    - Selecting decimal removes override, reverts to auto-cycle
- Regular "Numbered List" button unchanged — creates decimal list with no attribute (uses auto-cycle)

## Capabilities

### New Capabilities

- `manual-list-style`: Users can manually override ordered list numbering style via toolbar dropdown (lower-alpha and lower-roman)

### Modified Capabilities

<!-- No existing spec requirements changing - this extends auto-cycle behavior -->

## Impact

**Files affected**:

- `packages/pluggableWidgets/rich-text-web/src/extensions/OrderedListStyled.ts` — NEW extension extending OrderedList
- `packages/pluggableWidgets/rich-text-web/src/components/Editor.tsx` — Replace OrderedList import with OrderedListStyled
- `packages/pluggableWidgets/rich-text-web/src/components/toolbars/ToolbarConfig.ts` — Add dropdown button config
- `packages/pluggableWidgets/rich-text-web/src/ui/RichText.scss` — Add CSS override rules for manual styles (~60 lines)

**Dependencies**:

- No new npm packages
- Extends existing Tiptap `OrderedList` extension
- Uses existing dropdown component pattern

**User-facing changes**:

- New toolbar button appears when in ordered list
- Users can create/convert lists to lower-alpha or lower-roman styles
- Manual styles persist in HTML as `data-list-style` attribute (class mode) or inline style
- Backward compatible — existing lists without attribute use auto-cycle

**Testing scope**:

- Create list with manual style from dropdown
- Convert existing decimal list to lower-alpha/lower-roman
- Verify cycle offset (nested children continue from parent's position)
- Dropdown state (checkmark on active style)
- Class vs inline mode output
- Copy-paste preserves manual style
- Inline style overrides (user-edited HTML)
