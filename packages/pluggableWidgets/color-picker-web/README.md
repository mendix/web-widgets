# Color picker

Pick a color from color input

## Overview

- **Folder**: `color-picker-web`
- **Category**: Display
- **Offline capable**: Yes

## XML Properties

- **Color attribute** (`colorAttribute`; type: attribute). The attribute containing a valid color, supported color formats are hexadecimal, rgb and rgba. Non-color formats such as ‘red’ are not supported. Attribute types: String.
- **Enable advanced options** (`advanced`; type: boolean, default: false).
- **Display mode** (`mode`; type: enumeration, default: popover). The presentation of the color picker Allowed values: `popover` (Button), `input` (Input box), `inline` (Inline).
- **Picker type** (`type`; type: enumeration, default: sketch). The various different styles, for how the color picker should look when clicked. Allowed values: `block` (Block), `chrome` (Chrome), `circle` (Circle), `compact` (Compact), `github` (Github), `hue` (Hue), `material` (Material), `sketch` (Sketch), `slider` (Slider), `swatches` (Swatches), `twitter` (Twitter).
- **Color format** (`format`; type: enumeration, default: hex). The format that which the selected color will be saved as. Allowed values: `hex` (HEX), `rgb` (RGB), `rgba` (RBGA).
- **Default colors** (`defaultColors`; type: object, optional, list). This is a list of pre-defined colors used within the color picker.
- **Color** (`color`; type: string). Valid color value: #d0d0d0, rgb(115,159,159) or rgba(195,226,226,1)
- **Invalid format message** (`invalidFormatMessage`; type: textTemplate, optional). Message shown when the user provides a wrong input, :colors: will be replaced by a sample format.
- **Label**. Standard Mendix system property.
- **Editability**. Standard Mendix system property.
- **On change** (`onChange`; type: action, optional).
- **Visibility**. Standard Mendix system property.
