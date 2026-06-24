## Why

Combobox shrinks to 1px when placed in a flex container with `align-items: center` (row). The widget becomes unusable — invisible to the user — without any CSS override from the app developer.

## Root cause

The actual DOM chain in the bug scenario:

```
.row-center  (user's CSS: display:flex, flex-flow:row, align-items:center)
  └─ .form-group.no-columns  (Atlas: flex-direction:column, no explicit width)
       └─ .widget-combobox  (flex-grow:1 — grows height in column container, not width)
            └─ .widget-combobox-input-container.form-control  (Atlas: min-width:50px — too narrow)
                 └─ .widget-combobox-selected-items  (min-width:0 — intentional for tag wrapping)
                      └─ .widget-combobox-input  (max-width:0 unfocused, width:1px multiselect inactive)
```

The user created `.row-center`. Atlas injected `.form-group.no-columns` (column flex, no explicit width). Inside it, `flex-grow:1` on `.widget-combobox` distributes height, not width. Width is sized by content.

Atlas has `min-width: 0` on `.widget-combobox` and `min-width: 50px` on `.form-control` (`.widget-combobox-input-container`). The `50px` floor propagates up — but it is too narrow: the down-arrow icon alone consumes ~53px, leaving zero space for text input.

**Why native textbox is not affected:**

Textbox renders `.form-control` directly inside `.form-group` — Atlas's `min-width: 50px` is wide enough for a plain input. Combobox `.form-control` must also contain the down-arrow icon, making `50px` insufficient.

## What changes

`packages/pluggableWidgets/combobox-web/src/ui/Combobox.scss` — `.widget-combobox-input-container` rule.

Add `min-width: 15ch` — overrides Atlas's `50px` floor on `.form-control` with a value wide enough to be usable. Scoped to the combobox, not a global Atlas change. `ch` scales with font-size.

## Impact

Must not break:

- Single-select combobox layout in all container types
- Multiselect combobox layout (active and inactive states)
- Atlas UI demo site rendering (already unaffected per ticket)
