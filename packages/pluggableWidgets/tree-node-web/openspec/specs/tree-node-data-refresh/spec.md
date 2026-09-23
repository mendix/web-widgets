# tree-node-data-refresh Specification

## Purpose

Governs how the v2 incremental tree map reacts to a datasource update — sibling and root ordering following the current datasource order, the tree surviving a reload rather than being torn down and rebuilt, and a replaced result set not leaving rows from the previous one behind.

## Requirements

### Requirement: Sibling and root order always follows the current datasource order

The v2 Tree Node widget SHALL order root nodes, and each node's children, according to the order in which the datasource currently delivers those items — re-applied on every datasource update, not captured once when a node's id is first seen. A node whose incremental tree map already contains an id MUST still be re-positioned among its siblings when the datasource's order for that id changes.

#### Scenario: Root nodes are re-ordered when the datasource returns them in a new order

- **WHEN** the datasource re-delivers the same root items in a different order (for example after a microflow changed a sequence attribute that the datasource sorts on)
- **THEN** the widget renders the root nodes in the new datasource order, without requiring the page to be reopened or the widget to remount

#### Scenario: A node's children are re-ordered when the datasource returns them in a new order

- **WHEN** the datasource re-delivers the same child items of an already-known parent in a different order
- **THEN** the widget renders that parent's children in the new datasource order

#### Scenario: Re-ordering does not disturb node state

- **WHEN** sibling order changes across a datasource update
- **THEN** each node keeps its own expanded/collapsed state, its title, and its already-placed children — only its position among its siblings changes

#### Scenario: A node absent from the current delivery keeps a stable position

- **WHEN** a node is present in the tree but its id is not in the current datasource delivery (so the datasource expresses no order for it)
- **THEN** the widget keeps that node ordered after every node the current delivery does order, preserving the absent nodes' relative order among themselves rather than reordering them arbitrarily

### Requirement: The rendered tree is preserved while the datasource is reloading

The v2 Tree Node widget SHALL treat an undefined `datasource.items` as "not yet delivered" and keep the tree it has already built, rather than interpreting it as an empty result. A reload MUST NOT clear the tree, discard the node map, or surface the empty-message state for the duration of the load.

#### Scenario: A reload does not empty the tree

- **WHEN** the datasource starts reloading and `items` becomes undefined
- **THEN** the widget keeps rendering the nodes it had before the reload, with their existing expanded/collapsed state, and does not show the "no data available" empty message

#### Scenario: An undefined delivery is not mistaken for removed items

- **WHEN** `items` is undefined
- **THEN** the widget does not conclude that every previously-known item was removed, and therefore does not trigger a rebuild of the node map for that reason

#### Scenario: The tree updates once the reload settles

- **WHEN** the reload completes and the datasource delivers items again
- **THEN** the widget applies the new items — including any additions, removals, and the current datasource order — to the tree it preserved

### Requirement: A replaced result set does not leave rows from the previous one behind

The v2 Tree Node widget SHALL NOT keep requesting children of parents that belong to a superseded result set. When an app-level constraint replaces the datasource's result set, rows that are only present because a previous set's parents are still being requested MUST NOT persist in the tree.

#### Scenario: Leftover rows from the previous result set disappear

- **WHEN** an app-level constraint replaces the result set, and the first delivery after that switch still contains items retrieved on account of the previous set's parents
- **THEN** those items are gone from the tree by the time the widget has settled, rather than remaining alongside the new set's genuine roots for the rest of the session

#### Scenario: Retrieval does not grow across result-set changes

- **WHEN** the result set is replaced repeatedly during a session
- **THEN** the number of parents the widget asks for reflects only the current tree, and does not accumulate the parents of every set seen so far
