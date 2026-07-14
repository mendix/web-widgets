# image-cropper Specification

## Purpose

The Image Cropper widget lets a Mendix end user crop, rotate, and recolor an image bound to
an image attribute, writing the edited result back to that same attribute. It is a client-side
widget: all image transforms happen on an HTML canvas in the browser, and the edited bytes are
pushed to the Mendix runtime via `EditableValue.setValue`. This spec captures the behavior of
the shipped widget (v1.0.0) as a baseline.

## Requirements

### Requirement: Image source binding and lifecycle states

The widget SHALL bind to a single required image attribute and SHALL render distinct states for
the Mendix value lifecycle. All edits (crop, rotate, grayscale, reset) SHALL write back to that
same attribute via `setValue`.

#### Scenario: Loading state

- **WHEN** the bound image value status is `Loading`
- **THEN** the widget SHALL render a placeholder container marked `aria-busy="true"`
- **AND** SHALL NOT render the crop area or toolbar

#### Scenario: No image available

- **WHEN** the bound image status is not `Available` or has no value
- **THEN** the widget SHALL render an empty state showing the configurable `noImageCaption` (default "No uploaded image to crop")

#### Scenario: Read-only attribute

- **WHEN** the bound image is `readOnly`
- **THEN** editing operations SHALL NOT call `setValue` and the attribute SHALL be left unchanged

### Requirement: Crop shape

The widget SHALL support a rectangular and a circular crop shape, selected by the `cropShape`
property.

#### Scenario: Circle shape masks corners

- **WHEN** `cropShape` is `circle`
- **THEN** the on-screen selection SHALL be rendered as a circle
- **AND** the exported image SHALL be clipped to an ellipse inscribed in the crop rectangle so the corners are transparent (PNG) or filled (JPEG)

#### Scenario: Rectangle shape

- **WHEN** `cropShape` is `rect`
- **THEN** the full crop rectangle SHALL be exported with no corner masking

### Requirement: Aspect ratio

The widget SHALL constrain the crop selection to the ratio chosen in `aspectRatio`, supporting
free-form, preset ratios, and a custom ratio built from `customAspectWidth` / `customAspectHeight`.

#### Scenario: Preset ratio locks proportions

- **WHEN** `aspectRatio` is a preset (`square` = 1:1, `landscape16x9` = 16:9, `landscape4x3` = 4:3, `portrait3x4` = 3:4)
- **THEN** the crop selection SHALL keep that width-to-height proportion while being resized

#### Scenario: Free ratio

- **WHEN** `aspectRatio` is `free`
- **THEN** the crop selection SHALL be resizable to any proportion

#### Scenario: Custom ratio

- **WHEN** `aspectRatio` is `custom` and both `customAspectWidth` and `customAspectHeight` are greater than 0
- **THEN** the crop selection SHALL be locked to `customAspectWidth / customAspectHeight`
- **AND** if either value is not greater than 0, the crop SHALL fall back to free-form

### Requirement: Default crop selection

On image load, the widget SHALL seed a default crop box centered on the image at the resolved
aspect ratio.

#### Scenario: Initial box covers 80% centered

- **WHEN** an image finishes loading
- **THEN** the default selection SHALL cover 80% of the image, centered, at the resolved aspect ratio (falling back to the image's own ratio when free)

### Requirement: Resizable handles

The widget SHALL show or hide the selection's resize handles based on `resizableEnabled`.

#### Scenario: Handles disabled

- **WHEN** `resizableEnabled` is `false`
- **THEN** the user SHALL NOT be able to resize the selection by dragging its corners

### Requirement: Crop persistence (auto-apply)

The widget SHALL persist the edited image to the bound attribute automatically, with no manual
"apply" button. Direct crop-box edits SHALL be written back immediately on pointer release, while
zoom and grayscale changes SHALL be written back on a 400 ms debounce so rapid changes collapse
into a single write. Programmatic changes to the crop box (image load, source change, reset) SHALL
NOT trigger an auto-apply.

#### Scenario: Crop box edit applies immediately

- **WHEN** the user moves or resizes the crop box and releases the pointer
- **THEN** the cropped result SHALL be written back to the bound attribute immediately, cancelling any pending debounced write

#### Scenario: Zoom and grayscale apply on a debounce

- **WHEN** the user changes the zoom level or toggles grayscale
- **THEN** the edited result SHALL be written back after a 400 ms debounce
- **AND** further zoom or grayscale changes within that window SHALL reset the timer so only one write occurs

#### Scenario: Programmatic re-seed does not auto-save

- **WHEN** the crop box is re-seeded programmatically (image load, bound source change, or reset)
- **THEN** the widget SHALL NOT auto-apply a crop, because auto-apply only fires after a real user interaction

### Requirement: Zoom

The widget SHALL let the user zoom the image between `minZoom` and `maxZoom` via a slider and/or
the mouse wheel, gated by `zoomEnabled`, `showZoomSlider`, and `wheelZoomMode`.

#### Scenario: Zoom master switch off

- **WHEN** `zoomEnabled` is `false`
- **THEN** the slider and mouse-wheel zoom SHALL be disabled and the image SHALL stay at 1×

#### Scenario: Slider hidden but wheel active

- **WHEN** `zoomEnabled` is `true` and `showZoomSlider` is `false`
- **THEN** the zoom slider SHALL be hidden while mouse-wheel zoom remains available per `wheelZoomMode`

#### Scenario: Wheel zoom modes

- **WHEN** `wheelZoomMode` is `onWithCtrl`
- **THEN** the wheel SHALL zoom only while Ctrl is held, leaving normal page scroll otherwise
- **AND** when `wheelZoomMode` is `on` the wheel SHALL always zoom, and when `off` the wheel SHALL never zoom

#### Scenario: Zoom anchored on the crop-box center

- **WHEN** the zoom level changes
- **THEN** the zoom SHALL be anchored at the crop box's current center so the framed region stays put on screen
- **AND** the exported pixels SHALL use the same anchor so the saved image matches the on-screen framing

### Requirement: Rotation

When `enableRotation` is true, the widget SHALL show rotate-left and rotate-right buttons that
rotate the image in 90° steps and bake the rotation into the saved image.

#### Scenario: Rotate buttons hidden

- **WHEN** `enableRotation` is `false`
- **THEN** the rotate-left / rotate-right buttons SHALL NOT be shown

#### Scenario: Rotate bakes into the image

- **WHEN** the user clicks rotate-left (−90°) or rotate-right (+90°)
- **THEN** the image SHALL be redrawn on a canvas sized to the rotated dimensions and written back to the attribute
- **AND** a live preview of the rotated (color) pixels SHALL be shown immediately, before the Mendix commit lands

#### Scenario: Rotation preserves grayscale reversibility

- **WHEN** the grayscale toggle is on and the user rotates
- **THEN** the committed file SHALL be baked black-and-white, while the working image kept in memory SHALL remain color so toggling grayscale off stays reversible

### Requirement: Grayscale

When `enableGrayscale` is true, the widget SHALL show a grayscale toggle; enabling it SHALL render
the image gray on screen and convert the saved image to black-and-white.

#### Scenario: Grayscale toggle hidden

- **WHEN** `enableGrayscale` is `false`
- **THEN** the grayscale toggle SHALL NOT be shown

#### Scenario: Grayscale on

- **WHEN** the grayscale toggle is on
- **THEN** the crop area SHALL render the image with a grayscale CSS filter
- **AND** the exported image SHALL be drawn with `grayscale(1)` so the saved bytes are black-and-white

### Requirement: Reset

When `showResetButton` is true, the widget SHALL show a Reset button that restores the original
image and clears zoom, rotation, and grayscale, re-seeding the default crop box.

#### Scenario: Reset button availability

- **WHEN** `showResetButton` is `true` and the original image bytes were captured
- **THEN** the Reset button SHALL be enabled; if the original could not be captured it SHALL be disabled

#### Scenario: Reset restores original state

- **WHEN** the user clicks Reset
- **THEN** zoom SHALL return to `minZoom`, grayscale SHALL turn off, the original image bytes SHALL be written back, and the default 80%-centered crop box SHALL be re-seeded
- **AND** the reset itself SHALL NOT trigger an auto-apply write of a crop

### Requirement: Output encoding

The widget SHALL encode the saved image according to `outputFormat`, `outputQuality`, and
`outputSize`.

#### Scenario: PNG output

- **WHEN** `outputFormat` is `png`
- **THEN** the file SHALL be encoded as `image/png` with a `.png` extension and transparency preserved, ignoring `outputQuality`

#### Scenario: JPEG output

- **WHEN** `outputFormat` is `jpeg`
- **THEN** the file SHALL be encoded as `image/jpeg` with a `.jpg` extension, a white background filled behind the image, and `outputQuality` clamped to 0.0–1.0

#### Scenario: Output resolution

- **WHEN** `outputSize` is `original`
- **THEN** the crop SHALL be exported at the source (natural) resolution of the cropped region
- **AND** when `outputSize` is `viewport` the crop SHALL be exported at the canvas dimensions (`boundaryWidth` × `boundaryHeight`) and the attribute thumbnail size SHALL be set to match

### Requirement: On crop event

When configured, the widget SHALL run the `onCropAction` each time a crop is auto-applied.

#### Scenario: Action runs on apply

- **WHEN** a crop is written back to the attribute and `onCropAction.canExecute` is true
- **THEN** the widget SHALL call `onCropAction.execute()`

### Requirement: Canvas sizing

The widget SHALL scale the on-screen crop area to fit within `boundaryWidth` × `boundaryHeight`
without changing the saved image resolution.

#### Scenario: Image scales to fit the canvas

- **WHEN** the source image is larger than `boundaryWidth` × `boundaryHeight`
- **THEN** the rendered image SHALL scale down to fit, and the canvas SHALL wrap the rendered image so smaller crops produce a smaller canvas with no blank gaps
- **AND** the on-screen scaling SHALL NOT change the exported resolution
