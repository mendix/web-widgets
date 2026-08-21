## ADDED Requirements

### Requirement: Pagination renders in the bar slot named by its alignment

The Gallery widget SHALL derive a pagination alignment of `left`, `center` or `right` and SHALL render the pagination control in the corresponding slot of the bar it occupies — start slot for `left`, middle slot for `center`, end slot for `right`. This SHALL apply to the top bar and the footer alike, so that a widget configured with `Position of pagination` set to `Both` aligns both bars identically.

When no alignment is configured, the widget SHALL behave as if `right` were selected, preserving the position pagination has today.

#### Scenario: Left alignment places pagination in the start slot

- **WHEN** the pagination alignment is `left` and the pagination control is visible
- **THEN** the pagination control renders in the bar's start slot

#### Scenario: Center alignment places pagination in the middle slot

- **WHEN** the pagination alignment is `center` and the pagination control is visible
- **THEN** the pagination control renders in the bar's middle slot, including in the top bar, which SHALL provide a middle slot for this purpose

#### Scenario: Right alignment and no alignment both place pagination in the end slot

- **WHEN** the pagination alignment is `right`, or no pagination alignment class is present on the widget
- **THEN** the pagination control renders in the bar's end slot

#### Scenario: Alignment applies to both bars

- **WHEN** `Position of pagination` is `Both` and the pagination alignment is `center`
- **THEN** the pagination control is centred in the top bar and in the footer

### Requirement: Elements of a claimed slot are displaced to the end slot

When the pagination control claims a slot that another element would otherwise use, that element SHALL be rendered in the end slot instead. The selection counter's natural slot is the start slot and the Load-more button's natural slot is the middle slot; each SHALL stay there unless pagination claims it.

The widget SHALL NOT wrap the bar onto an additional row to resolve such a collision, so that the bar's height does not change when the selection counter appears or disappears.

#### Scenario: Left alignment displaces the selection counter

- **WHEN** the pagination alignment is `left`, the selection counter is visible in this bar, and the pagination control is visible
- **THEN** pagination renders in the start slot and the selection counter renders in the end slot, on the same row

#### Scenario: Center alignment displaces the Load-more button

- **WHEN** the pagination alignment is `center`, pagination is set to Load more with more items available, and the paging status is visible
- **THEN** the paging status renders in the middle slot and the Load-more button renders in the end slot

#### Scenario: All three elements present

- **WHEN** the pagination alignment is `left`, the selection counter is visible, and the Load-more button is visible
- **THEN** pagination renders in the start slot, the Load-more button stays in the middle slot, and the selection counter renders in the end slot

#### Scenario: Right alignment displaces nothing

- **WHEN** the pagination alignment is `right` and both the selection counter and the Load-more button are visible
- **THEN** the selection counter renders in the start slot, the Load-more button in the middle slot, and pagination in the end slot

#### Scenario: Pagination not visible

- **WHEN** the pagination control is not visible — for example virtual scrolling without a total count — regardless of alignment
- **THEN** the selection counter renders in its start slot and the Load-more button in its middle slot, and no slot is reserved for pagination

### Requirement: Custom pagination is positioned as the pagination control

When custom pagination is enabled, the custom pagination widgets SHALL take the place of the built-in pagination control for placement purposes, occupying the slot named by the pagination alignment and displacing elements of that slot in the same way. The built-in pagination bar SHALL NOT render alongside them.

#### Scenario: Custom pagination follows the alignment

- **WHEN** custom pagination is enabled and the pagination alignment is `center`
- **THEN** the custom pagination widgets render in the middle slot and the built-in pagination bar does not render

### Requirement: Placement is computed once and shared by runtime and editor preview

Slot placement SHALL be derived from a single pure function of the alignment and of which elements are visible, and that same function SHALL drive the footer, the top bar and the widget's editor preview, so the page editor and the running app cannot disagree about placement.

#### Scenario: Editor preview matches runtime placement

- **WHEN** a given alignment and set of visible elements is rendered in Studio Pro's page editor and in the running app
- **THEN** both place every element in the same slot

### Requirement: Visual order and focus order agree

The rendered document order SHALL follow the visual order of the slots — start, then middle, then end — so that keyboard focus order and assistive-technology reading order match what is seen on screen for every alignment.

#### Scenario: Left-aligned pagination is reached first by keyboard

- **WHEN** the pagination alignment is `left`, the selection counter is displaced to the end slot, and the user tabs through the bar
- **THEN** focus reaches the pagination controls before the Clear-selection button

### Requirement: Alignment is read from the pagination alignment design property

The widget SHALL determine its pagination alignment from the design-property classes applied to its root element — `widget-gallery-pagination-left`, `widget-gallery-pagination-center` and `widget-gallery-pagination-right` — and SHALL react to changes to those classes without remounting, so that selecting a value in Studio Pro's Design mode updates placement immediately.

Class names not among those three SHALL be ignored for alignment purposes.

#### Scenario: Alignment class recognised

- **WHEN** the widget root carries `widget-gallery-pagination-center` among its classes
- **THEN** the widget resolves its alignment as `center`

#### Scenario: Unrelated classes ignored

- **WHEN** the widget root carries only unrelated classes such as `widget-gallery-striped`
- **THEN** the widget resolves its alignment as `right`

#### Scenario: Design mode edit takes effect without remount

- **WHEN** the alignment class on the root changes while the widget is mounted
- **THEN** placement updates to the newly named slot
