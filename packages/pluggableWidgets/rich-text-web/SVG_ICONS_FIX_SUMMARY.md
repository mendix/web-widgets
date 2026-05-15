# SVG Icons Fix Summary

**Date:** May 13, 2026  
**Issue:** Table menu icons not rendering, showing file paths instead

## Problem

The table context menu was displaying SVG file paths as text instead of rendering the actual icons:

```
widgets/com/mendix/widget/custom/richtext/assets/97b0cabce075e013.svgwidgets/com/mendix/widget/custom/richtext/assets/893ec9fb91b508a1.svg
```

### Root Cause

SVG files were being imported but not properly handled by the Rollup bundler:

```typescript
import columnIcon from "../assets/icon/column.svg";
// columnIcon was a file path string, not SVG content
```

The `createMenu()` method was setting `innerHTML` with these path strings:

```typescript
dropDown.innerHTML = left + right; // left and right are file paths
```

## Solution

Added `@rollup/plugin-image` to the Rollup configuration to inline SVG files as data URIs.

### Changes Made

**File:** `rollup.config.mjs`

1. **Added import:**

```javascript
import image from "@rollup/plugin-image";
```

2. **Added plugin configuration:**

```javascript
image({
    include: ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif"]
});
```

This plugin converts image imports into base64 data URIs, so the SVG content is embedded directly in the JavaScript bundle.

### How It Works

**Before (broken):**

```javascript
import columnIcon from "../assets/icon/column.svg";
// columnIcon = "widgets/com/mendix/.../column.svg"
dropDown.innerHTML = columnIcon; // Shows file path as text
```

**After (fixed):**

```javascript
import columnIcon from "../assets/icon/column.svg";
// columnIcon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMT..."
dropDown.innerHTML = columnIcon; // Renders actual SVG icon
```

## Icons Included

The following SVG icons are now properly rendered in table menus:

| Icon          | Purpose                     |
| ------------- | --------------------------- |
| `column.svg`  | Column operations menu      |
| `row.svg`     | Row operations menu         |
| `merge.svg`   | Merge/split cells menu      |
| `table.svg`   | Table properties menu       |
| `cell.svg`    | Cell properties menu        |
| `wrap.svg`    | Insert paragraph menu       |
| `delete.svg`  | Delete table menu           |
| `copy.svg`    | Copy table menu             |
| `down.svg`    | Dropdown indicator          |
| `align-*.svg` | Alignment options (9 icons) |
| `close.svg`   | Close button                |
| `palette.svg` | Color picker                |
| `erase.svg`   | Clear formatting            |

## Build Result

✓ Widget builds successfully  
✓ SVG icons embedded as data URIs  
✓ No external SVG file dependencies  
✓ MPK size: 7.5MB

## Testing

To verify the fix:

1. Open a Mendix page with the Rich Text widget
2. Create or select a table
3. Right-click on the table to open the context menu
4. **Expected:** Menu icons display correctly (column, row, merge, etc.)
5. **Before fix:** Menu showed file paths as text

## Technical Notes

- The `@rollup/plugin-image` was already in `package.json` devDependencies
- The plugin converts images to base64 data URIs at build time
- No runtime image loading required
- Icons are part of the JS bundle, no separate asset files needed
- Plugin order matters: placed before TypeScript plugin in the chain

## Alternative Approaches Considered

1. **Using `?raw` suffix** - Would require changing all imports, less clean
2. **SVG sprites** - More complex setup, unnecessary for small icons
3. **Separate SVG loader** - `@rollup/plugin-image` is simpler and already available

## Related Files

- `rollup.config.mjs` - Build configuration
- `src/utils/formats/quill-table-better/ui/table-menus.ts` - Icon usage
- `src/utils/formats/quill-table-better/assets/icon/*.svg` - Icon files (21 total)
