## ADDED Requirements

### Requirement: Class format renders image size without inline style

When configured with `styleDataFormat: "class"`, the image node view SHALL NOT set `width` or `height` in the `style` of the image container or the `<img>` element. The container SHALL carry the size as `data-width` and `data-height`, each holding a CSS length or percentage, and the stylesheet SHALL apply that size to both the container and the image.

#### Scenario: Image with a stored pixel size

- **WHEN** the format is `class` and an image has stored width `437px` and height `554px`
- **THEN** the image container has `data-width="437px"` and `data-height="554px"`
- **AND** neither the container nor the `<img>` has `width` or `height` in its inline style

#### Scenario: Image sized by Rich Text v4

- **WHEN** the format is `class` and an image has stored width `300` and height `200` without a unit
- **THEN** the image container has `data-width="300px"` and `data-height="200px"`

#### Scenario: Image with a percentage width

- **WHEN** the format is `class` and an image has stored width `50%`
- **THEN** the image container has `data-width="50%"`
- **AND** the image renders at 50% of the available width

#### Scenario: Image with no stored size

- **WHEN** the format is `class` and an image has no stored width or height
- **THEN** the image container has neither `data-width` nor `data-height`
- **AND** the image renders at its natural size

#### Scenario: Rendered size matches the stored size

- **WHEN** a class-format image with `data-width="437px"` and `data-height="554px"` is rendered in a browser supporting typed `attr()`
- **THEN** the image is 437 pixels wide and 554 pixels tall

### Requirement: Class format renders video and embed size without inline style

When configured with `styleDataFormat: "class"`, the YouTube and generic-embed node views SHALL NOT set `width` or `height` in the `style` of the container or the `<iframe>`. The container SHALL carry the size as `data-width` and `data-height` in pixels, and the `<iframe>` SHALL keep its `width` and `height` HTML attributes.

#### Scenario: YouTube video

- **WHEN** the format is `class` and a YouTube video has width 560 and height 314
- **THEN** the video container has `data-width="560px"` and `data-height="314px"`
- **AND** the `<iframe>` has `width="560"` and `height="314"`
- **AND** neither element has `width` or `height` in its inline style

#### Scenario: Generic embed

- **WHEN** the format is `class` and a generic embed has width 640 and height 480
- **THEN** the embed container has `data-width="640px"` and `data-height="480px"`
- **AND** the `<iframe>` has `width="640"` and `height="480"`
- **AND** neither element has `width` or `height` in its inline style

#### Scenario: Unplayable YouTube source

- **WHEN** the format is `class` and a YouTube node's stored source is not a recognizable YouTube URL
- **THEN** the placeholder carries `data-width` and `data-height` for the node's stored size
- **AND** has no `width` or `height` in its inline style

### Requirement: Drag resize stays live in class format

Dragging a resize handle on an image, YouTube video or generic embed in `class` format SHALL preview the new size while dragging and SHALL NOT write inline sizing at any point.

#### Scenario: Live preview

- **WHEN** the format is `class` and the user drags a corner handle of an image
- **THEN** the container's `data-width` and `data-height` follow the pointer
- **AND** the image is redrawn at that size during the drag

#### Scenario: Committed size

- **WHEN** the user releases the handle
- **THEN** the node's stored width and height are updated once
- **AND** the container's data attributes hold the committed size

### Requirement: Inline format media rendering is unchanged

When configured with `styleDataFormat: "inline"`, the image, YouTube and generic-embed node views SHALL keep sizing the container and media element through inline style and SHALL NOT emit `data-width` or `data-height`.

#### Scenario: Inline image

- **WHEN** the format is `inline` and an image has stored width `437px` and height `554px`
- **THEN** the container and the `<img>` have `width: 437px` and `height: 554px` in their inline style
- **AND** the container has no `data-width` or `data-height`

#### Scenario: Inline video

- **WHEN** the format is `inline` and a YouTube video has width 560 and height 314
- **THEN** the container and the `<iframe>` have `width: 560px` and `height: 314px` in their inline style

### Requirement: Saved media output is independent of the format

The serialized HTML of an image, YouTube video or generic embed SHALL be identical in `class` and `inline` format: sizes as `width` / `height` HTML attributes, with no inline sizing and no `data-width` / `data-height`.

#### Scenario: Same output in both formats

- **WHEN** the same document containing a sized image and a sized video is serialized in `class` format and in `inline` format
- **THEN** the image and video markup is identical in both outputs
- **AND** contains no `style` sizing and no `data-width` / `data-height`

### Requirement: Table wrapper has no inline positioning

The editable table wrapper SHALL be positioned by the stylesheet and SHALL NOT carry `position` in its inline style, in either format.

#### Scenario: Editable table wrapper

- **WHEN** a table is rendered in an editable widget
- **THEN** the `.tableWrapper` element has no `position` in its inline style
- **AND** the table resize handles remain anchored to the table's edges
