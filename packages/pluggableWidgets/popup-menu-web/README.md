# Pop-up menu

Displays a set of pre-defined items within the Pop-up menu

## Overview

- **Folder**: `popup-menu-web`
- **Category**: Menus & navigation
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/popup-menu)

## XML Properties

### General

- **Enable advanced options** (`advancedMode`; type: boolean, default: false).
- **The area to open or close the menu.** (`menuTrigger`; type: widgets, required). Responsible for toggling the Pop-up menu.
- **Menu items** (`basicItems`; type: object, optional, list). The popup menu items.
- **Item type** (`itemType`; type: enumeration, default: item). Allowed values: `item` (Button), `divider` (Divider).
- **Caption** (`caption`; type: textTemplate, optional).
- **Visible** (`visible`; type: expression, optional, default: true). Returns: Boolean.
- **On click action** (`action`; type: action, optional).
- **Style** (`styleClass`; type: enumeration, default: defaultStyle). An extra class will be added: "popupmenu-basic-item-[style]" Allowed values: `defaultStyle` (Default), `inverseStyle` (Inverse), `primaryStyle` (Primary), `infoStyle` (Info), `successStyle` (Success), `warningStyle` (Warning), `dangerStyle` (Danger).
- **Menu items** (`customItems`; type: object, optional, list). The popup menu custom items. To make sure the popup closes correctly after a click, do not configure clickable widgets inside the placeholders. Use the action property of this widget.
- **Content** (`content`; type: widgets).
- **Visible** (`visible`; type: expression, optional, default: true). Returns: Boolean.
- **On click action** (`action`; type: action, optional).
- **Open on** (`trigger`; type: enumeration, default: onclick). Allowed values: `onclick` (Click), `onhover` (Hover).
- **Close on** (`clickCloseOn`; type: enumeration, default: onClickAnywhere). Allowed values: `onClickAnywhere` (Click anywhere), `onClickOutside` (Click outside).
- **Close on** (`hoverCloseOn`; type: enumeration, default: onHoverLeave). Allowed values: `onClickOutside` (Click outside), `onHoverLeave` (Hover leave).
- **Menu position** (`position`; type: enumeration, default: bottom). The location of the menu relative to the click area. Allowed values: `left` (Left), `right` (Right), `top` (Top), `bottom` (Bottom).
- **Clipping strategy** (`clippingStrategy`; type: enumeration, default: absolute). 'Absolute' positions the floating element relative to its nearest positioned ancestor, while 'Fixed' breaks it out of any clipping ancestor. Allowed values: `absolute` (Absolute), `fixed` (Fixed).

### Development

- **Show preview** (`menuToggle`; type: boolean, default: false). Use this to see a preview of the menu items while developing.
