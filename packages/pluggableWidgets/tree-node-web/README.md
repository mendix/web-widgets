# Tree node

Display a tree view structure

## Overview

- **Folder**: `tree-node-web`
- **Category**: Data containers
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/modules/tree-node)

## XML Properties

### General

- **Enable advanced options** (`advancedMode`; type: boolean, default: false).
- **Data source** (`datasource`; type: datasource, list).
- **Parent association** (`parentAssociation`; type: association, optional, data source: datasource). Select the self-referencing association that connects each item to its parent, enabling infinite depth hierarchies.
- **Header type** (`headerType`; type: enumeration, default: text). Allowed values: `text` (Text), `custom` (Custom).
- **Open node when** (`openNodeOn`; type: enumeration, default: headerClick). Define which part of the node, when clicked, should open or close this node. "Header is clicked" means the whole header is clickable, while "Icon is clicked" means only the icon is used to switch node state. Allowed values: `headerClick` (Header is clicked), `iconClick` (Icon is clicked).
- **Header** (`headerContent`; type: widgets, optional, data source: datasource).
- **Header caption** (`headerCaption`; type: textTemplate, optional, data source: datasource).
- **Has children** (`hasChildren`; type: expression, data source: datasource). Indicate whether the node has children or is an end node. When set to yes, a composable region becomes available to define the child nodes. Returns: Boolean.
- **Start expanded** (`startExpanded`; type: boolean, default: false).
- **Place other Tree nodes here** (`children`; type: widgets, optional, data source: datasource).
- **Animate** (`animate`; type: boolean, default: true).

### Icon

- **Show icon** (`showIcon`; type: enumeration, default: left). Allowed values: `left` (Left), `right` (Right), `no` (No).
- **Expanded icon** (`expandedIcon`; type: icon, optional).
- **Collapsed icon** (`collapsedIcon`; type: icon, optional).
- **Animate icon** (`animateIcon`; type: boolean, default: true). Animate the icon when the group is collapsing or expanding.

### Texts

- **No data message** (`noDataMessage`; type: textTemplate, optional). Message to show when there are no items to display.

## Additional Notes

<!-- TODO: -->
