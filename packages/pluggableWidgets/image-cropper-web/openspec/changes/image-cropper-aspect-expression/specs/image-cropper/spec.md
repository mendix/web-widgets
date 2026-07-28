## MODIFIED Requirements

### Requirement: Aspect ratio

The widget SHALL constrain the crop selection to the ratio chosen in `aspectRatio`, supporting
free-form, preset ratios, and a custom ratio built from `customAspectWidth` / `customAspectHeight`,
which are Integer-returning expressions (attribute bindings or expressions) and therefore resolve
asynchronously.

#### Scenario: Preset ratio locks proportions

- **WHEN** `aspectRatio` is a preset (`square` = 1:1, `landscape16x9` = 16:9, `landscape4x3` = 4:3, `portrait3x4` = 3:4)
- **THEN** the crop selection SHALL keep that width-to-height proportion while being resized

#### Scenario: Free ratio

- **WHEN** `aspectRatio` is `free`
- **THEN** the crop selection SHALL be resizable to any proportion

#### Scenario: Custom ratio

- **WHEN** `aspectRatio` is `custom` and both `customAspectWidth` and `customAspectHeight` resolve to values greater than 0
- **THEN** the crop selection SHALL be locked to `customAspectWidth / customAspectHeight`
- **AND** if either resolved value is not greater than 0, the crop SHALL fall back to free-form

#### Scenario: Custom ratio expression not yet resolved

- **WHEN** `aspectRatio` is `custom` and either side is not yet Available
- **THEN** the resolved ratio SHALL be treated as not yet known, which is distinct from free-form

### Requirement: Default crop selection

On image load, the widget SHALL seed a default crop box centered on the image at the resolved
aspect ratio. When the custom ratio is not yet resolved, seeding SHALL be deferred so the box is
never shown at a placeholder ratio that changes once the real ratio arrives.

#### Scenario: Initial box covers 80% centered

- **WHEN** an image finishes loading
- **THEN** the default selection SHALL cover 80% of the image, centered, at the resolved aspect ratio (falling back to the image's own ratio when free)

#### Scenario: Image loads before the custom ratio resolves

- **WHEN** an image finishes loading while `aspectRatio` is `custom` and either side is still unavailable
- **THEN** no crop selection SHALL be seeded until both sides are Available
- **AND** once both resolve, the selection SHALL be seeded once at the correct ratio

#### Scenario: Resolved custom ratio changes to a new value

- **WHEN** the resolved custom ratio changes from one positive value to another (e.g. a different record is shown)
- **THEN** the crop selection SHALL be rebuilt in a single step at the new ratio
- **AND** the change alone SHALL NOT write a re-cropped image back to the bound attribute

#### Scenario: Resolved custom ratio becomes unavailable

- **WHEN** the custom ratio was resolved and either side becomes unavailable
- **THEN** the existing crop selection SHALL be retained until a new ratio resolves

## ADDED Requirements

### Requirement: Image reload and crop retention across re-renders

The widget SHALL treat the bound image as changed only when its uri or name actually changes, so
that unrelated re-renders neither re-download the original bytes nor discard the crop selection.

#### Scenario: Unrelated re-render with an unchanged image

- **WHEN** the widget re-renders with a new props object but the bound image's uri and name are unchanged
- **THEN** the original-bytes capture SHALL NOT be re-run
- **AND** the current crop selection SHALL be retained

#### Scenario: Genuinely new image

- **WHEN** the bound image's uri changes to a different external image
- **THEN** the original bytes SHALL be re-captured for Reset
- **AND** the crop selection SHALL be cleared

### Requirement: Design-time preview of a custom aspect ratio

In Studio Pro the widget SHALL render a representative crop from the custom ratio expression text,
which is all that is available at design time.

#### Scenario: Numeric-literal expressions

- **WHEN** both custom sides are numeric literals (e.g. "3" and "2")
- **THEN** the preview SHALL render the crop at that ratio

#### Scenario: Attribute or non-literal expressions

- **WHEN** either custom side is an attribute binding or an expression that cannot be evaluated at design time
- **THEN** the preview SHALL fall back to free aspect without erroring
