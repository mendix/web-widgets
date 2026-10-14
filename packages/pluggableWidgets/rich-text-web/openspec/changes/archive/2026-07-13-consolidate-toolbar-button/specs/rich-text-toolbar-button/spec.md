## ADDED Requirements

### Requirement: Shared toolbar button component

The rich text toolbar SHALL provide a single `ToolbarDefaultButton` component that renders the `<button>` element for every toolbar control. All toolbar button and toggle controls SHALL render their `<button>` through this component rather than hand-rolling their own `<button>` markup.

#### Scenario: Icon-only control renders default icon child

- **WHEN** a `ToolbarDefaultButton` is given an `icon` prop and no children
- **THEN** it renders a `<button>` containing `<span className="icons icon-{icon}">`

#### Scenario: Custom children override the icon

- **WHEN** a `ToolbarDefaultButton` is given `children`
- **THEN** it renders the provided children in place of the default icon `<span>`

### Requirement: Active and disabled state

`ToolbarDefaultButton` SHALL reflect active state via the `is-active` CSS class and MUST render a native `disabled` attribute when disabled, so keyboard focus queries relying on `button:not([disabled])` continue to work.

#### Scenario: Active state applies is-active class

- **WHEN** `isActive` is true
- **THEN** the rendered `<button>` includes the `is-active` class

#### Scenario: Active icon swap

- **WHEN** `isActive` is true and an `activeIcon` prop is provided and no children are given
- **THEN** the default icon `<span>` uses `icon-{activeIcon}` instead of `icon-{icon}`

#### Scenario: Disabled uses native attribute

- **WHEN** the button is disabled
- **THEN** the rendered element carries the native HTML `disabled` attribute (not `aria-disabled`)

### Requirement: Class composition

`ToolbarDefaultButton` SHALL default to the `icon-button` base class, and SHALL allow a caller-supplied `className` to replace that base so controls needing distinct base classes (e.g. `toolbar-dropdown-button`, `split-button-main`, `split-button-dropdown`) render with their own class. The `is-active` class SHALL compose on top of whichever base is used.

#### Scenario: Default base class

- **WHEN** no `className` is supplied
- **THEN** the rendered `<button>` uses the `icon-button` base class

#### Scenario: Caller replaces base class

- **WHEN** a `className` such as `split-button-main` is supplied
- **THEN** the rendered `<button>` uses that class as its base and does not include `icon-button`

### Requirement: Ref forwarding and attribute passthrough

`ToolbarDefaultButton` SHALL forward a ref to the underlying `<button>` element so floating dropdowns and pickers can anchor to it, and SHALL pass through standard button attributes including `onClick`, `onKeyDown`, `title`, `type`, `aria-*`, and `data-*`. The `type` SHALL default to `"button"` when not supplied.

#### Scenario: Ref anchors floating UI

- **WHEN** a component passes a ref to `ToolbarDefaultButton` and opens a floating dropdown
- **THEN** the ref resolves to the underlying `<button>` element used as the floating reference

#### Scenario: Accessibility attributes pass through

- **WHEN** `aria-pressed`, `aria-expanded`, or `aria-haspopup` are supplied
- **THEN** they appear on the rendered `<button>`

#### Scenario: Default button type

- **WHEN** no `type` prop is supplied
- **THEN** the rendered `<button>` has `type="button"`
