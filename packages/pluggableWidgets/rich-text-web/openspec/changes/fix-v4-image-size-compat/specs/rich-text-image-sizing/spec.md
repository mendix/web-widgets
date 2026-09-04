## ADDED Requirements

### Requirement: A stored image dimension is rendered as a CSS length

The Rich Text editor SHALL render an image at its stored `width`/`height` regardless of whether the stored value carries a CSS unit. A value consisting of digits only SHALL be treated as pixels. A value that already carries a unit or a percentage SHALL be used as it is. This SHALL apply in the editor and in read-only mode, both of which use the same image node view.

#### Scenario: Image sized by Rich Text v4

- **GIVEN** content saved by Rich Text v4 containing `<img src="a.png" width="300" height="200">`
- **WHEN** the content is opened in the Rich Text widget
- **THEN** the image renders 300 pixels wide and 200 pixels tall
- **AND** it renders at that same size when the widget is read-only

#### Scenario: Image sized by Rich Text v5

- **GIVEN** content containing `<img src="a.png" width="300px">`
- **WHEN** the content is opened in the Rich Text widget
- **THEN** the image renders 300 pixels wide

#### Scenario: Image sized with a percentage

- **GIVEN** content containing an image whose stored width is `50%`
- **WHEN** the content is opened in the Rich Text widget
- **THEN** the image renders at 50% of its container width

#### Scenario: Image with no stored size

- **WHEN** an image node has no stored `width` or `height`
- **THEN** the image renders at its natural size

### Requirement: Image dimensions are serialized as valid HTML attribute values

The widget SHALL serialize an image's dimensions as `width` and `height` HTML attributes, not as inline `style`, so that generated content is usable under a strict Content Security Policy. A pixel dimension SHALL be written as a bare number without the `px` suffix, matching the HTML definition of a dimension attribute. A percentage SHALL be written as it is. A dimension that a `width`/`height` attribute cannot express SHALL be omitted rather than written in a form a browser would mis-parse.

#### Scenario: Pixel dimension serialized

- **GIVEN** an image node whose stored width is `300px`
- **WHEN** the content is serialized
- **THEN** the output contains `width="300"`
- **AND** the output contains no inline `style` for the image's size

#### Scenario: Percentage dimension serialized

- **GIVEN** an image node whose stored width is `50%`
- **WHEN** the content is serialized
- **THEN** the output contains `width="50%"`

#### Scenario: Dimension that an attribute cannot express

- **GIVEN** an image node whose stored width is `20em`
- **WHEN** the content is serialized
- **THEN** no `width` attribute is written for that image

#### Scenario: No stored size

- **WHEN** an image node has no stored `width` or `height`
- **THEN** no `width` or `height` attribute is written for that image

### Requirement: Loading and saving v4 content does not change its stored size

Opening content written by Rich Text v4 and saving it without editing any image SHALL leave each image's `width`/`height` attribute value unchanged. Parsing SHALL NOT rewrite the stored dimension; unit normalization happens only when rendering to CSS and when serializing.

#### Scenario: v4 content saved untouched

- **GIVEN** content containing `<img src="a.png" width="300" height="200">`
- **WHEN** the content is opened and saved without resizing the image
- **THEN** the saved image still has `width="300"` and `height="200"`

#### Scenario: Inline style input is not preserved as style

- **GIVEN** content containing `<img src="a.png" style="width:300px;height:200px">`
- **WHEN** the content is opened and saved
- **THEN** the saved image carries `width="300"` and `height="200"` as attributes

### Requirement: A v4-sized image resizes from its rendered size

Resizing an image that was sized by Rich Text v4 SHALL start from the size it currently renders at, not from the image's natural size, and SHALL store the new dimensions in the same form as any other v5 resize.

#### Scenario: Dragging a handle on a v4-sized image

- **GIVEN** an image whose stored width is `300` and which renders 300 pixels wide
- **WHEN** the user drags a resize handle 50 pixels outward
- **THEN** the image ends up approximately 350 pixels wide, not 50 pixels wider than its natural size
- **AND** the stored width is a pixel dimension that serializes to `width="350"`
