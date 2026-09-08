# Rich Text

Rich inline or toolbar text editing

## Overview

- **Folder**: `rich-text-web`
- **Category**: Input elements
- **Offline capable**: Yes

## XML Properties

### Data source

- **Value attribute** (`stringAttribute`; type: attribute). The attribute used for the content of the text editor, recommendation is to use an unlimited string data type. Attribute types: String.

### General

- **Enable status bar** (`enableStatusBar`; type: boolean, default: false). Show a status bar at the bottom of the editor displaying document metrics
- **Label**. Standard Mendix system property.

### Toolbar

- **Toolbar** (`preset`; type: enumeration, default: basic). Allowed values: `basic` (Basic), `standard` (Standard), `full` (Full), `custom` (Custom).
- **Location** (`toolbarLocation`; type: enumeration, required, default: top). Allowed values: `auto` (Sticky), `top` (Top), `bottom` (Bottom), `hide` (Hide).

### Editability

- **Read-only style** (`readOnlyStyle`; type: enumeration, default: text). How the rich text editor will appear in read-only mode. Allowed values: `text` (Rich text), `bordered` (Bordered), `readPanel` (Read panel).
- **Editability**. Standard Mendix system property.

### Visibility

- **Visibility**. Standard Mendix system property.

### Dimensions

- **Width unit** (`widthUnit`; type: enumeration, default: percentage). Allowed values: `pixels` (Pixels), `percentage` (Percentage).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: pixels). Allowed values: `percentageOfWidth` (Auto), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Height** (`height`; type: integer, default: 250).
- **Minimum Height unit** (`minHeightUnit`; type: enumeration, default: pixels). Allowed values: `none` (None), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Minimum height** (`minHeight`; type: integer, default: 250).
- **Maximum Height unit** (`maxHeightUnit`; type: enumeration, default: none). Allowed values: `none` (None), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Maximum height** (`maxHeight`; type: integer, default: 250).
- **Vertical Overflow** (`OverflowY`; type: enumeration, default: auto). Allowed values: `auto` (Auto), `scroll` (Scroll), `hidden` (Hidden).

### Events

- **On change** (`onChange`; type: action, optional).
- **On enter** (`onFocus`; type: action, optional).
- **On leave** (`onBlur`; type: action, optional).
- **On load** (`onLoad`; type: action, optional).

### On change behavior

- **On change type** (`onChangeType`; type: enumeration, default: onLeave). Allowed values: `onLeave` (When user leaves input field), `onDataChange` (While user is entering data).

### Advanced

- **Enable spell checking** (`spellCheck`; type: boolean, default: false).
- **Enable link URL validation** (`linkValidation`; type: boolean, default: true). If enabled, only valid URLs will be accepted in links.
- **Default font family** (`defaultFontFamily`; type: textTemplate, optional).
- **Default font size** (`defaultFontSize`; type: textTemplate, optional).
- **Custom fonts** (`customFonts`; type: object, optional, list).
- **Font name** (`fontName`; type: string, optional). A title for this font combination (e.g., Arial).
- **Font style** (`fontStyle`; type: string, optional). The full CSS font-family declaration that will be applied (e.g., arial, helvetica, sans-serif).
- **Selectable images** (`imageSource`; type: datasource, optional, list).
- **Content** (`imageSourceContent`; type: widgets, optional). Content of a image uploader
- **Enable default upload** (`enableDefaultUpload`; type: boolean, default: true).
- **Status bar content** (`statusBarContent`; type: enumeration, default: wordCount). Choose what to display in the status bar Allowed values: `wordCount` (Word count), `characterCount` (Character count (text only)), `characterCountHtml` (Character count (including HTML)).
- **Style data format** (`styleDataFormat`; type: enumeration, default: inline). Choose how to render styling attribute in HTML Allowed values: `inline` (Inline), `class` (Class).

### Custom toolbar

- **Toolbar group** (`toolbarConfig`; type: enumeration, default: basic). Allowed values: `basic` (Basic), `advanced` (Advanced).
- **Edit History** (`history`; type: boolean, default: true).
- **Font style** (`fontStyle`; type: boolean, default: true).
- **Font script** (`fontScript`; type: boolean, default: true).
- **List** (`list`; type: boolean, default: true).
- **Indentation** (`indent`; type: boolean, default: true).
- **Embedded media** (`embed`; type: boolean, default: true).
- **Alignment** (`align`; type: boolean, default: true).
- **Syntax** (`code`; type: boolean, default: true).
- **Font colors** (`fontColor`; type: boolean, default: true).
- **Content type** (`header`; type: boolean, default: true).
- **View** (`view`; type: boolean, default: true).
- **Removal** (`remove`; type: boolean, default: true).
- **Table** (`tableBetter`; type: boolean, default: true).
- **Keyboard shortcuts** (`helpButton`; type: boolean, default: true). Show a help button that opens a keyboard shortcuts dialog. Only visible when the full toolbar is shown.
- **Advanced groups** (`advancedConfig`; type: object, optional, list).
- **Button** (`ctItemType`; type: enumeration, required, default: separator). Button Type Allowed values: `separator` (separator), `undo` (Undo), `redo` (Redo), `bold` (Bold), `italic` (Italic), `underline` (Underline), `strike` (Strike), `superScript` (Super Script), `subScript` (Sub Script), `orderedList` (Ordered List), `bulletList` (Bullet List), `lowerAlphaList` (Lower Alpha List), `checkList` (Check List), `minIndent` (Left Indent), `plusIndent` (Right Indent), `direction` (Direction), `link` (Link), `image` (Image), `video` (Video), `formula` (Formula), `blockquote` (Blockquote), `code` (Code), `codeBlock` (Code Block), `viewCode` (View Code), `leftAlign` (Left Align), `centerAlign` (Center Align), `rightAlign` (Right Align), `justifyAlign` (Justify Align), `font` (Font Type), `size` (Font Size), `color` (Color), `background` (Background), `header` (Header), `fullscreen` (Full screen), `clean` (Clean), `tableBetter` (Table).
