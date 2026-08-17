## ADDED Requirements

### Requirement: Pagination renders in the bar zone named by its alignment

The Gallery widget SHALL derive a pagination alignment of `left`, `center` or `right` and SHALL render the pagination control in the corresponding zone of the bar it occupies — start zone for `left`, middle zone for `center`, end zone for `right`. This SHALL apply to the top bar and the footer alike, so that a widget configured with `Position of pagination` set to `Both` aligns both bars identically.

When no alignment is configured, the widget SHALL behave as if `right` were selected, preserving the position pagination has today.

#### Scenario: Left alignment places pagination in the start zone

- **WHEN** the pagination alignment is `left` and the pagination control is visible
- **THEN** the pagination control renders in the bar's start zone

#### Scenario: Center alignment places pagination in the middle zone

- **WHEN** the pagination alignment is `center` and the pagination control is visible
- **THEN** the pagination control renders in the bar's middle zone, including in the top bar, which SHALL provide a middle zone for this purpose

#### Scenario: Right alignment and no alignment both place pagination in the end zone

- **WHEN** the pagination alignment is `right`, or no pagination alignment class is present on the widget
- **THEN** the pagination control renders in the bar's end zone

#### Scenario: Alignment applies to both bars

- **WHEN** `Position of pagination` is `Both` and the pagination alignment is `center`
- **THEN** the pagination control is centred in the top bar and in the footer

### Requirement: Occupants of a claimed zone are displaced to the end zone

When the pagination control claims a zone that another occupant would otherwise use, that occupant SHALL be rendered in the end zone instead. The selection counter's natural zone is the start zone and the Load-more button's natural zone is the middle zone; each SHALL stay there unless pagination claims it.

The widget SHALL NOT wrap the bar onto an additional row to resolve such a collision, so that the bar's height does not change when the selection counter appears or disappears.

#### Scenario: Left alignment displaces the selection counter

- **WHEN** the pagination alignment is `left`, the selection counter is visible in this bar, and the pagination control is visible
- **THEN** pagination renders in the start zone and the selection counter renders in the end zone, on the same row

#### Scenario: Center alignment displaces the Load-more button

- **WHEN** the pagination alignment is `center`, pagination is set to Load more with more items available, and the paging status is visible
- **THEN** the paging status renders in the middle zone and the Load-more button renders in the end zone

#### Scenario: All three occupants present

- **WHEN** the pagination alignment is `left`, the selection counter is visible, and the Load-more button is visible
- **THEN** pagination renders in the start zone, the Load-more button stays in the middle zone, and the selection counter renders in the end zone

#### Scenario: Right alignment displaces nothing

- **WHEN** the pagination alignment is `right` and both the selection counter and the Load-more button are visible
- **THEN** the selection counter renders in the start zone, the Load-more button in the middle zone, and pagination in the end zone

#### Scenario: Pagination not visible

- **WHEN** the pagination control is not visible — for example virtual scrolling without a total count — regardless of alignment
- **THEN** the selection counter renders in its start zone and the Load-more button in its middle zone, and no zone is reserved for pagination

### Requirement: Custom pagination is positioned as the pagination control

When custom pagination is enabled, the custom pagination widgets SHALL take the place of the built-in pagination control for placement purposes, occupying the zone named by the pagination alignment and displacing occupants of that zone in the same way. The built-in pagination bar SHALL NOT render alongside them.

#### Scenario: Custom pagination follows the alignment

- **WHEN** custom pagination is enabled and the pagination alignment is `center`
- **THEN** the custom pagination widgets render in the middle zone and the built-in pagination bar does not render

### Requirement: Placement is computed once and shared by runtime and editor preview

Zone placement SHALL be derived from a single pure function of the alignment and of which occupants are visible, and that same function SHALL drive the footer, the top bar and the widget's editor preview, so the page editor and the running app cannot disagree about placement.

#### Scenario: Editor preview matches runtime placement

- **WHEN** a given alignment and set of visible occupants is rendered in Studio Pro's page editor and in the running app
- **THEN** both place every occupant in the same zone

### Requirement: Visual order and focus order agree

The rendered document order SHALL follow the visual order of the zones — start, then middle, then end — so that keyboard focus order and assistive-technology reading order match what is seen on screen for every alignment.

#### Scenario: Left-aligned pagination is reached first by keyboard

- **WHEN** the pagination alignment is `left`, the selection counter is displaced to the end zone, and the user tabs through the bar
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
- **THEN** placement updates to the newly named zone
