## ADDED Requirements

### Requirement: Table resize handles

When the editor is editable and the table is resizable, the table SHALL display drag handles that allow the user to resize the table interactively, similar to image and embed resize.

#### Scenario: Handles appear on an editable table

- **WHEN** the editor is editable and a resizable table is rendered
- **THEN** the table displays resize handle(s) for adjusting its size

#### Scenario: No handles in read-only mode

- **WHEN** the editor is not editable
- **THEN** the table displays no resize handles

### Requirement: Interactive drag resize

The system SHALL update the table size live as the user drags a resize handle.

#### Scenario: Dragging updates size live

- **WHEN** user presses a resize handle and drags
- **THEN** the table's rendered width and/or min-height update continuously to follow the pointer

#### Scenario: Minimum size enforced during drag

- **WHEN** user drags a handle below the minimum allowed table size
- **THEN** the table does not shrink past the minimum size

### Requirement: Single undoable commit on release

The system SHALL commit the dragged size as a single document change only when the user releases the pointer.

#### Scenario: Size committed on mouseup

- **WHEN** user releases the resize handle after dragging
- **THEN** the final width/min-height is written to the table node attributes as one change

#### Scenario: Undo restores previous size in one step

- **WHEN** user resizes a table and then triggers undo
- **THEN** the table returns to its size from before the drag in a single undo step

#### Scenario: Live drag does not spam history

- **WHEN** user drags a handle across many pointer positions before releasing
- **THEN** only one entry is added to the undo history for the whole drag

### Requirement: Drag and numeric input stay in sync

The drag handles and the numeric configuration inputs SHALL read and write the same table size attributes.

#### Scenario: Config reflects a dragged size

- **WHEN** user resizes a table by dragging and then opens the table configuration dropdown
- **THEN** the "Table Width" and "Table Height" inputs display the dragged values

#### Scenario: Table reflects a configured size

- **WHEN** user sets a size via the numeric inputs
- **THEN** the table renders at that size and subsequent drags start from that size
