---
name: combobox
description: How to configure the Combo box widget (com.mendix.widget.web.combobox.Combobox). Use when adding or changing a dropdown, select, picker, autocomplete or multi-select for an association, enumeration, boolean, or a list of objects.
---

# Combo box

Searchable dropdown for picking one or several options. Options can come from an association, an enumeration or boolean attribute, a database list, or a fixed list of static values.

## When to use

- Use Combo box when the user picks a value in a form from a list of options: an associated object, an enumeration value, a boolean, or a fixed set of values.
- Use Combo box when the list is long or the user needs to search in it. It filters as the user types and loads options lazily.
- Use Combo box when the user must pick several objects for a reference set.
- Prefer radio buttons when there are only 2 to 4 options and all of them should be visible at once.
- Prefer a check box for a single yes/no boolean, unless the user asks for a dropdown.
- Do not use Combo box to browse, compare or act on records. Use Data grid 2 or Gallery for that.

## Choosing the data source

Decide `source` first. Every other property depends on it.

| The user wants to pick...                          | `source`   | Then set                                            |
| -------------------------------------------------- | ---------- | --------------------------------------------------- |
| An associated object (one, or several)             | `context`  | `optionsSourceType` = `association`                 |
| A value of an enumeration attribute                | `context`  | `optionsSourceType` = `enumeration`                 |
| Yes/No for a boolean attribute                     | `context`  | `optionsSourceType` = `boolean`                     |
| Objects from a list, without an association to set | `database` | `optionsSourceDatabaseDataSource`                   |
| One of a few fixed values written at design time   | `static`   | `staticAttribute` + `optionsSourceStaticDataSource` |

## Recipes

### Pick one associated object

- `source` = `context`, `optionsSourceType` = `association`
- `attributeAssociation` = a reference (one-to-many or one-to-one) from the context entity
- `optionsSourceAssociationDataSource` = the selectable objects
- `optionsSourceAssociationCaptionType` = `attribute`, `optionsSourceAssociationCaptionAttribute` = a String attribute of the target entity

### Pick several associated objects

- Same as above, but `attributeAssociation` = a reference set (many-to-many).
- Single or multiple selection follows from the association type. There is no separate switch.
- Optional: `selectionMethod` (`checkbox` or `rowclick`), `selectedItemsStyle` (`text` or `boxes`), `selectAllButton`.

### Pick an enumeration or boolean value

- `source` = `context`, `optionsSourceType` = `enumeration` or `boolean`
- `attributeEnumeration` or `attributeBoolean` = the attribute
- No data source or caption is needed. Captions come from the enumeration.

### Pick from a list and store a plain value

- `source` = `database`
- `optionsSourceDatabaseDataSource` = the selectable objects
- `optionsSourceDatabaseCaptionAttribute` = what to show
- `databaseAttributeString` = the attribute on the context object to write to
- `optionsSourceDatabaseValueAttribute` = the attribute of the selected object whose value is written
- Storing a value only works with `optionsSourceDatabaseItemSelection` = `Single`.

### Pick from a list without storing a value

- `source` = `database`, leave `databaseAttributeString` empty.
- React to the choice with `onChangeDatabaseEvent` ("On selection"), not `onChangeEvent`.
- `optionsSourceDatabaseItemSelection` = `Single` or `Multi`.

### Pick from a fixed list of values

- `source` = `static`
- The Combo box must be inside a data view (or other context) that provides an object. `staticAttribute` = the attribute of that object that stores the chosen value. It is required.
- `optionsSourceStaticDataSource` = one item per option, each with:
    - `staticDataSourceValue`: a Mendix expression of the same type as `staticAttribute`. For a String attribute write a quoted literal, for example `'frodo'`, not `frodo`.
    - `staticDataSourceCaption`: the text shown to the user.
- If the page has no object to store the value on, one must be provided first (for example a data view on an entity with a String attribute). Tell the user which entity, attribute or microflow you add for this.

### Large lists

- Keep `lazyLoading` = `true` (default).
- Keep `filterType` at `contains` (default) or use `startsWith`. Do not set it to `none` for long lists.

### Caption built from several attributes

- Set the caption type to `expression` and write the expression in `optionsSourceAssociationCaptionExpression` or `optionsSourceDatabaseCaptionExpression`.

## Rules

- `source` = `context` and `source` = `static` both need a context object, because the selected value is stored on it. `source` = `database` without a target attribute stores nothing, but it needs existing objects to list as options.
- Property names in this file are the widget's XML keys. In the widget schema, text properties carry a prefix, for example `ct:staticDataSourceCaption`, `ct:emptyOptionText`. Always write the key exactly as the schema prints it.
- Set only the properties that belong to the chosen `source`. Properties of other sources are hidden and ignored.
- For `boolean`, do not set `clearable` or `emptyOptionText`. They do not apply.
- With `source` = `database` and `Multi` selection, `databaseAttributeString` and `optionsSourceDatabaseValueAttribute` do not apply.
- `selectedItemsStyle` does not apply when `selectionMethod` = `rowclick` or when custom content is used.
- `customEditability` applies only to `source` = `database` without a target attribute. In all other cases use the standard Editability setting.
- Caption attributes must be of type String. Use a caption expression for anything else.
