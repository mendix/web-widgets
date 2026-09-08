# Signature

Signature

## Overview

- **Folder**: `signature-web`
- **Category**: Input elements
- **Offline capable**: Yes

## XML Properties

### Data source

- **Image value** (`imageSource`; type: image).
- **File name** (`fileName`; type: textTemplate, optional). Custom filename for the file (without extension). If empty, generates automatically based on format and value.
- **Has signature** (`hasSignatureAttribute`; type: attribute, optional). Optional boolean attribute, which will be set to true after the canvas is signed. When the attribute is set to false, the signature is cleared, but will not clear the stored image Attribute types: Boolean.
- **Editability**. Standard Mendix system property.

### Appearance

- **Type** (`penType`; type: enumeration, default: fountain). Allowed values: `fountain` (Fountain pen), `ballpoint` (Ball point pen), `marker` (Highlight marker).
- **Color** (`penColor`; type: string, default: #000). Color of the line e.g. green, #00FF00, rgb(0,255,0)

### Dimensions

- **Width unit** (`widthUnit`; type: enumeration, default: percentage). Allowed values: `pixels` (Pixels), `percentage` (Percentage).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: pixels). Allowed values: `auto` (Auto), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Height** (`height`; type: integer, default: 250).
- **Minimum Height unit** (`minHeightUnit`; type: enumeration, default: pixels). Allowed values: `none` (None), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Minimum height** (`minHeight`; type: integer, default: 250).
- **Maximum Height unit** (`maxHeightUnit`; type: enumeration, default: none). Allowed values: `none` (None), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Maximum height** (`maxHeight`; type: integer, default: 250).
- **Vertical Overflow** (`overflowY`; type: enumeration, default: auto). Allowed values: `auto` (Auto), `scroll` (Scroll), `hidden` (Hidden).

- **On sign end** (`onSignEndAction`; type: action, optional). Action that is executed when the user finishes signing. The action will receive the signature image as a parameter.

### Accessibility

- **Aria required** (`ariaRequired`; type: expression, default: false). Returns: Boolean.
- **Aria label** (`ariaLabel`; type: textTemplate, optional).

- **Show background grid** (`showGrid`; type: boolean, default: false).
- **Line color** (`gridBorderColor`; type: string, default: #D7D7D7).
- **Cell height** (`gridCellHeight`; type: integer, default: 50). Grid column size
- **Cell width** (`gridCellWidth`; type: integer, default: 50). Grid row size
- **Line width** (`gridBorderWidth`; type: integer, default: 1). Grid border line width (pixels)
