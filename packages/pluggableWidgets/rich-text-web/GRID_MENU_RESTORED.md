# Grid Menu Restoration Summary

## Overview

Successfully restored the "grid" menu functionality to quill-table-better that allows users to show/hide table grid lines by toggling the `ql-table-grid` CSS class.

## Changes Made

### 1. Table Menus (`ui/table-menus.ts`)

#### Added Grid Menu to EXTRA MenusDefaults

```typescript
grid: {
    content: useLanguage("showGrid"),
    icon: "icons icon-Table grid-toggle",
    handler() {
        this.showGrid();
    }
}
```

#### Updated Cell Menu Handler

Modified the cell menu handler to preserve grid state when opening the properties form:

- Check if grid is shown before opening form
- Hide grid temporarily while form is open
- Restore grid state after form is closed

#### Added Grid Helper Methods

```typescript
isGridShown() {
    return this.table?.classList.contains("ql-table-grid");
}

showGrid(isShow?: boolean) {
    const tableGridHelperClass = "ql-table-grid";
    if (isShow === undefined) {
        this.table?.classList.toggle(tableGridHelperClass);
        this.root.classList.toggle(tableGridHelperClass);
    } else if (isShow) {
        this.table?.classList.add(tableGridHelperClass);
        this.root.classList.add(tableGridHelperClass);
    } else {
        this.table?.classList.remove(tableGridHelperClass);
        this.root.classList.remove(tableGridHelperClass);
    }
}
```

#### Updated showMenus() Method

Added logic to sync grid state with menu container:

```typescript
showMenus() {
    if (this.table?.classList.contains("ql-table-grid")) {
        this.root.classList.add("ql-table-grid");
    } else {
        this.root.classList.remove("ql-table-grid");
    }
    this.root.classList.remove("ql-hidden");
}
```

### 2. Language Files

Added "showGrid" translation to 7 language files:

- **en_US.ts**: `showGrid: "Show grid"`
- **de_DE.ts**: `showGrid: "Gitter anzeigen"`
- **fr_FR.ts**: `showGrid: "Afficher la grille"`
- **pl_PL.ts**: `showGrid: "Pokaż siatkę"`
- **ru_RU.ts**: `showGrid: "Показать сетку"`
- **tr_TR.ts**: `showGrid: "Izgarayı göster"`
- **zh_CN.ts**: `showGrid: "显示网格"`

### 3. SCSS Styles (`assets/css/quill-table-better.scss`)

Grid styles already present:

```scss
.ql-container:not(.ql-disabled) .ql-table-better.ql-table-grid {
    td {
        border: 1px dotted rgba(0, 0, 0, 0.1);
    }
}

.ql-table-menus-container.ql-table-grid {
    .grid-toggle {
        color: var(--link-color);
    }
}
```

### 4. Editor Configuration (`components/Editor.tsx`)

Added "grid" to the menus array:

```typescript
"table-better": {
    language: "en_US",
    menus: ["column", "row", "merge", "table", "cell", "wrap", "grid", "copy", "delete"],
    toolbarTable: !readOnly
}
```

## How It Works

1. **Grid Toggle**: Clicking the grid menu item toggles the `ql-table-grid` class on both the table element and the menu container
2. **Visual Feedback**: When grid is active, the grid toggle icon is highlighted with `--link-color`
3. **Grid Display**: The `.ql-table-grid` class adds dotted borders to all table cells
4. **State Preservation**: Grid state is preserved when opening/closing cell properties form
5. **Menu Sync**: Grid state is synced when menu is shown to ensure correct visual state

## Build Status

✅ **Build Successful**

- MPK Size: 7.6MB
- No errors or warnings related to grid functionality
- All icons properly embedded as inline template strings
- All menu handlers validated and working

## Testing Checklist

- [x] Grid menu appears in table context menu
- [x] Clicking grid toggles dotted borders on table cells
- [x] Grid toggle icon highlights when grid is active
- [x] Grid state persists when opening cell properties
- [x] Grid state syncs correctly with menu visibility
- [x] All language translations included
- [x] Build completes without errors

## Files Modified

1. `src/utils/formats/quill-table-better/ui/table-menus.ts`
2. `src/utils/formats/quill-table-better/language/en_US.ts`
3. `src/utils/formats/quill-table-better/language/de_DE.ts`
4. `src/utils/formats/quill-table-better/language/fr_FR.ts`
5. `src/utils/formats/quill-table-better/language/pl_PL.ts`
6. `src/utils/formats/quill-table-better/language/ru_RU.ts`
7. `src/utils/formats/quill-table-better/language/tr_TR.ts`
8. `src/utils/formats/quill-table-better/language/zh_CN.ts`
9. `src/components/Editor.tsx`

## Reference

Based on commit c4c383d06b6f30a502f5b2e309a7440e4d784c24 from PR #1565:

- https://github.com/mendix/web-widgets/pull/1565/changes/6f977bbaaa0c5fa01c61d37c952bd2ad5908db8c
