# Image

Display an image and enlarge it on click.

## Overview

- **Folder**: `image-web`
- **Category**: Images, videos & files
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/image)

## XML Properties

### Data source

- **Image type** (`datasource`; type: enumeration, default: image). Allowed values: `image` (Image), `imageUrl` (Image URL), `icon` (Icon).
- **Image source** (`imageObject`; type: image, optional).
- **Default image** (`defaultImageDynamic`; type: image, optional). This is the image that is displayed if no image is uploaded.
- **Image URL** (`imageUrl`; type: textTemplate, optional). The link of the external image.
- **Icon** (`imageIcon`; type: icon, optional). The icon image.
- **Background image** (`isBackgroundImage`; type: boolean, default: false). Whether the image is rendered as a background. More content can be put inside, while design properties will have no effect.
- **Place content here** (`children`; type: widgets, optional).

### Events

- **On click type** (`onClickType`; type: enumeration, default: action). Allowed values: `action` (Action), `enlarge` (Enlarge).
- **On click** (`onClick`; type: action, optional).

### Accessibility

- **Alternative text** (`alternativeText`; type: textTemplate, optional). Alternative text of the image for accessibility purposes.

### Conditional Visibility

- **Name**. Standard Mendix system property.
- **Visibility**. Standard Mendix system property.

### Dimensions

- **Width unit** (`widthUnit`; type: enumeration, default: auto). Allowed values: `auto` (Auto), `pixels` (Pixels), `percentage` (Percentage).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: auto). Auto will keep the aspect ratio of the image. Allowed values: `auto` (Auto), `pixels` (Pixels), `percentage` (Percentage), `viewport` (Viewport).
- **Height** (`height`; type: integer, default: 100).
- **Minimum Height unit** (`minHeightUnit`; type: enumeration, default: none). Allowed values: `none` (None), `pixels` (Pixels), `percentage` (Percentage), `viewport` (Viewport).
- **Minimum height** (`minHeight`; type: integer, required, default: 0).
- **Maximum Height unit** (`maxHeightUnit`; type: enumeration, default: pixels). Allowed values: `none` (None), `pixels` (Pixels), `percentage` (Percentage), `viewport` (Viewport).
- **Maximum height** (`maxHeight`; type: integer, required, default: 250).
- **Icon size** (`iconSize`; type: integer, default: 14). The size of the icon in pixels.
- **Show** (`displayAs`; type: enumeration, default: fullImage). Allowed values: `fullImage` (Full image), `thumbnail` (Thumbnail).
- **Responsive** (`responsive`; type: boolean, default: true). Image will never get larger than its original size. It can become smaller.
