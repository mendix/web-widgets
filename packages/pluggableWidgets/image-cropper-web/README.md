# Image Cropper

Crop an image attribute

## Overview

- **Folder**: `image-cropper-web`
- **Category**: Images, videos & files
- **Offline capable**: No
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/image-cropper)

## XML Properties

### Source

- **Image attribute** (`image`; type: image, required). The image to crop. The cropped result is saved back to it.

### Crop area

- **Crop shape** (`cropShape`; type: enumeration, required, default: rect). Shape of the crop. Circle masks the corners. Allowed values: `rect` (Rectangle), `circle` (Circle).
- **Aspect ratio** (`aspectRatio`; type: enumeration, required, default: free). Locks the crop proportions. Free lets the user resize freely. Allowed values: `free` (Free), `square` (1:1), `landscape16x9` (16:9), `landscape4x3` (4:3), `portrait3x4` (3:4), `custom` (Custom).
- **Custom aspect width** (`customAspectWidth`; type: expression, required, default: 1). Width side of the ratio (e.g. 3 in 3:2). Used when Aspect ratio is Custom. Can be bound to an attribute or expression. Returns: Integer.
- **Custom aspect height** (`customAspectHeight`; type: expression, required, default: 1). Height side of the ratio (e.g. 2 in 3:2). Used when Aspect ratio is Custom. Can be bound to an attribute or expression. Returns: Integer.

### Events

- **On crop** (`onCropAction`; type: action, optional). Runs each time the crop is auto-applied to the image attribute.

### Canvas

- **Canvas max width (px)** (`boundaryWidth`; type: integer, required, default: 800). Maximum on-screen width of the crop area. The image scales down to fit; the canvas wraps the rendered image, so smaller crops produce a smaller canvas with no blank gaps. Does not change the saved image size.
- **Canvas max height (px)** (`boundaryHeight`; type: integer, required, default: 800). Maximum on-screen height of the crop area. The image scales down to fit; the canvas wraps the rendered image, so smaller crops produce a smaller canvas with no blank gaps. Does not change the saved image size.

### Interaction

- **Resizable handles** (`resizableEnabled`; type: boolean, required, default: true). Let the user resize the selection by dragging its corners.

### Buttons

- **Enable rotation** (`enableRotation`; type: boolean, required, default: true). Show rotate-left / rotate-right buttons. The rotation is baked into the saved image.
- **Enable grayscale** (`enableGrayscale`; type: boolean, required, default: false). Show a grayscale toggle. When on, the saved image is converted to grayscale (black and white).
- **Enable reset** (`showResetButton`; type: boolean, required, default: true). Show a Reset button that restores the original image and clears zoom, rotation, and crop.

### Zoom

- **Enable zoom** (`zoomEnabled`; type: boolean, required, default: true). Master switch for zooming. When off, the slider and mouse-wheel zoom are disabled and the image stays at 1×.
- **Show zoom slider** (`showZoomSlider`; type: boolean, required, default: true). Show the zoom slider below the crop area. Turn off to keep mouse-wheel zoom while hiding the slider.
- **Mouse wheel zoom** (`wheelZoomMode`; type: enumeration, required, default: onWithCtrl). Whether the mouse wheel zooms the image. "On (hold Ctrl)" keeps page scroll working. Allowed values: `off` (Off), `on` (On), `onWithCtrl` (On (hold Ctrl)).
- **Minimum zoom** (`minZoom`; type: decimal, required, default: 1). Smallest zoom level. 1 = image fits the canvas. Below 1 lets the user zoom out further.
- **Maximum zoom** (`maxZoom`; type: decimal, required, default: 4). Largest zoom level. 4 means up to 4× the canvas size. Must be greater than Minimum zoom.

### Toolbar captions

- **Grayscale caption** (`grayscaleCaption`; type: textTemplate, optional). Visible text and tooltip for the grayscale toggle.
- **Reset caption** (`resetCaption`; type: textTemplate, optional). Visible text and tooltip for the reset button.
- **Zoom caption** (`zoomCaption`; type: textTemplate, optional). Visible label for the zoom slider.
- **No image message** (`noImageCaption`; type: textTemplate, optional). Shown when no image is bound to the image attribute.

### Aria labels

- **Rotate left** (`rotateLeftLabel`; type: textTemplate, optional). Accessible name and tooltip for the rotate-left button.
- **Rotate right** (`rotateRightLabel`; type: textTemplate, optional). Accessible name and tooltip for the rotate-right button.
- **Grayscale** (`grayscaleAriaLabel`; type: textTemplate, optional). Accessible name for the grayscale toggle (announced by screen readers).
- **Reset** (`resetAriaLabel`; type: textTemplate, optional). Accessible name for the reset button (announced by screen readers).
- **Zoom** (`zoomAriaLabel`; type: textTemplate, optional). Accessible name for the zoom slider (announced by screen readers).

### Output

- **Output format** (`outputFormat`; type: enumeration, required, default: png). File format. PNG keeps transparency; JPEG produces smaller files. Allowed values: `png` (PNG), `jpeg` (JPEG).
- **JPEG quality (0.0 - 1.0)** (`outputQuality`; type: decimal, required, default: 0.92). JPEG compression. Higher = sharper and larger. Ignored for PNG.
- **Output size** (`outputSize`; type: enumeration, required, default: original). Resolution of the saved crop. Original is sharpest; Viewport matches the on-screen canvas size. Allowed values: `viewport` (Viewport (canvas dimensions)), `original` (Original (source resolution)).
