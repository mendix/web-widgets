# Tooltip

Shows a value inside a colored tooltip or label

## Overview

- **Folder**: `tooltip-web`
- **Category**: Display
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/tooltip)

## XML Properties

### General

- **Trigger: place widgets here** (`trigger`; type: widgets).
- **Render method** (`renderMethod`; type: enumeration, default: text). Allowed values: `text` (Text), `custom` (Custom).
- **Tooltip content: place widgets here** (`htmlMessage`; type: widgets, optional).
- **Tooltip** (`textMessage`; type: textTemplate, optional).
- **Tooltip position** (`tooltipPosition`; type: enumeration, default: top). How to position the tooltip in relation to the trigger element - at the top, to the left, at the bottom or to the right. Allowed values: `left` (Left), `right` (Right), `top` (Top), `bottom` (Bottom).
- **Arrow position** (`arrowPosition`; type: enumeration, default: none). How to position the tooltip arrow in relation to the tooltip - at the start, in the center or at the end. Allowed values: `start` (Start), `none` (Center), `end` (End).
- **Open on** (`openOn`; type: enumeration, default: hover). How the tooltip is triggered - click, hover, hover and focus. On mobile device “hover” will be triggered on touch. Allowed values: `click` (Click), `hover` (Hover), `hoverFocus` (Hover,focus).
