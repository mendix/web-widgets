## ADDED Requirements

### Requirement: ValidationAlert requires ID prop

The ValidationAlert component SHALL require an `id` prop in its TypeScript interface. The TypeScript compiler MUST error when ValidationAlert is used without an `id` prop.

#### Scenario: Component used without ID fails type checking

- **WHEN** developer writes `<ValidationAlert>Error message</ValidationAlert>` without id prop
- **THEN** TypeScript compiler produces error "Property 'id' is missing in type"

#### Scenario: Component used with ID passes type checking

- **WHEN** developer writes `<ValidationAlert id="field-validation">Error message</ValidationAlert>`
- **THEN** TypeScript compiler accepts the code without errors

### Requirement: ValidationAlert renders with ID attribute

The ValidationAlert component SHALL render its `id` prop as the `id` attribute on the alert DOM element. The rendered element MUST have the exact ID value provided.

#### Scenario: ID prop is rendered as DOM attribute

- **WHEN** ValidationAlert is rendered with `id="my-field-error"`
- **THEN** the rendered alert element has attribute `id="my-field-error"`

#### Scenario: ID is accessible to ARIA references

- **WHEN** input has `aria-describedby="my-field-error"` and ValidationAlert has `id="my-field-error"`
- **THEN** screen readers announce the validation message when the input is focused

### Requirement: Input elements connect to validation

Form input components that display validation MUST set both `aria-invalid` and `aria-describedby` attributes when validation exists. The `aria-describedby` value SHALL reference the ValidationAlert's ID.

#### Scenario: Input with validation sets ARIA attributes

- **WHEN** input component has validation message present
- **WHEN** ValidationAlert is rendered with `id="input-123-error"`
- **THEN** input element has `aria-invalid="true"`
- **THEN** input element has `aria-describedby="input-123-error"`

#### Scenario: Input without validation clears ARIA attributes

- **WHEN** input component has no validation message
- **THEN** input element does not have `aria-invalid` attribute
- **THEN** input element does not have `aria-describedby` attribute

#### Scenario: Multi-handle widget shares validation message

- **WHEN** range slider has two handles (lower and upper bound)
- **WHEN** either attribute has validation message
- **WHEN** ValidationAlert is rendered with `id="widget-123-validation-message"`
- **THEN** both handle elements have `aria-describedby="widget-123-validation-message"`
- **THEN** both handle elements have `aria-invalid="true"`

### Requirement: Validation ID helper utility

A helper function SHALL be provided to generate consistent validation IDs from input IDs. The function SHALL append "-validation-message" suffix to the input ID. The function SHALL handle undefined input IDs gracefully.

#### Scenario: Generate validation ID from input ID

- **WHEN** helper function called with `inputId="myInput"`
- **THEN** function returns "myInput-validation-message"

#### Scenario: Handle undefined input ID

- **WHEN** helper function called with `inputId=undefined`
- **THEN** function returns `undefined`

#### Scenario: Consistent naming convention

- **WHEN** multiple widgets use the helper function with their input IDs
- **THEN** all validation IDs follow the same "-validation-message" suffix pattern
- **THEN** ARIA connections can be validated consistently across widgets
