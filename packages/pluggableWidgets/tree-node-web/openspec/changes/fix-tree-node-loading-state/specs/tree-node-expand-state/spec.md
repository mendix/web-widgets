## ADDED Requirements

### Requirement: Expand affordance visibility is driven by known children, not by a load-timing-sensitive stored state

The v2 Tree Node widget SHALL determine whether a node's expand affordance (chevron/icon) is shown based on whether that node currently has any children placed under it (`node.children.length > 0`), computed fresh on every render — never from the `hasChildren` widget property, which is unavailable in v2's configuration mode (`parentAssociation` set), and never from a stored per-node flag that a later, unrelated datasource delivery could incorrectly mutate.

#### Scenario: A node with children shows an expand affordance

- **WHEN** a node has at least one child currently placed under it
- **THEN** the widget renders an expand affordance for that node

#### Scenario: A node with no known children shows no expand affordance (absent a spinner)

- **WHEN** a node has no children currently placed under it and the datasource is not currently loading
- **THEN** the widget renders no expand affordance for that node

#### Scenario: Expanding one node does not affect a sibling's expand affordance

- **WHEN** a user expands node A, causing a datasource redelivery that includes node B's id (node B was never expanded and has no relation to node A)
- **THEN** node B's expand affordance and underlying children are unchanged from before node A was expanded

### Requirement: A loading spinner is shown only while the datasource is genuinely fetching, never as stored per-node state

The v2 Tree Node widget SHALL show a loading spinner in place of the expand affordance for a node that has no known children yet, exactly while `datasource.status === ValueStatus.Loading`. This is a render-time computation only — no per-node "is loading" flag is stored, so the spinner cannot become stuck and cannot be affected by an unrelated node's resolution.

#### Scenario: Spinner shown while the datasource is loading and children are unknown

- **WHEN** a node has no children placed under it yet and the datasource's `status` is `Loading`
- **THEN** the widget shows a spinner in place of the expand affordance for that node

#### Scenario: Spinner clears once the datasource settles, regardless of outcome

- **WHEN** the datasource's `status` transitions away from `Loading`
- **THEN** every node's spinner clears immediately — showing an expand affordance if children arrived, or no affordance at all if they didn't

#### Scenario: Spinner never shows for a node that already has children

- **WHEN** a node already has at least one child placed under it
- **THEN** the widget never shows a spinner for that node, regardless of `datasource.status`

#### Scenario: A stalled or filter-ignoring datasource never produces a stuck spinner

- **WHEN** a microflow datasource ignores `setFilter` and its `status` never transitions to `Loading` for a given fetch attempt
- **THEN** no node is left showing a spinner indefinitely as a result of that fetch attempt

### Requirement: A manually expanded node's own children's expand affordance is known without requiring a collapse-and-reopen

The v2 Tree Node widget SHALL preload one level past a node's children when that node is expanded by a user click, so each child's own expand affordance is already correct the first time its parent is expanded — never requiring the user to collapse and re-expand that same node to reveal it. This preload is bounded to exactly one level past what's already known for this path; it does not eagerly walk the full tree beyond the node that was actually clicked.

#### Scenario: A node's own children's children are known on its first expand

- **WHEN** a user expands a node for the first time (its children are already known, but whether those children themselves have children is not)
- **THEN** each of that node's children already shows its correct expand affordance immediately, without requiring that child to be separately collapsed and re-expanded

### Requirement: Under "Start expanded" = Yes, every auto-expanded level's own expand affordance is known automatically, all the way to the tree's real depth

Because every node defaults to expanded (not just roots) when "Start expanded" is Yes, the v2 Tree Node widget SHALL keep preloading one level further for as long as new descendants keep appearing — not a fixed number of levels — so that every already-visible node's expand affordance is correct without any manual collapse-and-reopen, regardless of how deep the actual tree data goes. This cascade is self-terminating: it stops automatically once a level introduces no previously-unseen items, bounded by the tree's real depth rather than an arbitrary count or recursing indefinitely.

#### Scenario: A 3rd (or deeper) tier's own expand affordance is known automatically

- **WHEN** "Start expanded" is Yes and the underlying data has 3 or more tiers
- **THEN** every tier's nodes show their correct expand affordance immediately on load, with no tier requiring a manual collapse-and-reopen to reveal the next tier down

#### Scenario: The cascade stops once the real data is exhausted

- **WHEN** a subsequent datasource delivery introduces no items beyond what's already known
- **THEN** no further automatic preload round is triggered — the cascade does not continue indefinitely or re-fetch unchanged data

#### Scenario: A transient empty datasource delivery during initial load does not disable the cascade

- **WHEN** the datasource is still loading and delivers an empty item set one or more times before the real data arrives
- **THEN** the cascade does not lock itself out on that empty delivery — it only advances once it actually finds real, previously-unseen items, and keeps retrying harmlessly until it does

### Requirement: The auto-cascade does not apply when "Start expanded" is No

The v2 Tree Node widget SHALL NOT auto-cascade the preload beyond the existing capped behavior (root's children, plus one level of lookahead) when "Start expanded" is No, since deeper tiers remain collapsed by default and already resolve correctly via a single real click. Auto-cascading further in this mode would only eagerly fetch descendants of branches the user has not opened.

#### Scenario: A 3rd-tier arrival does not trigger a further automatic round when collapsed by default

- **WHEN** "Start expanded" is No and a 3rd-tier item arrives as a result of the existing 2-round preload
- **THEN** no further automatic preload round is triggered for it — expanding it further still requires a real click

### Requirement: Auto-expanded root nodes (`startExpanded = Yes`) — NOT YET IMPLEMENTED

The equivalent one-level lookahead for automatically auto-expanded root nodes (so a root's children already show their correct expand affordance without needing the root collapsed and re-expanded) was attempted and reverted after it broke a live repro project (see `design.md` D3). No requirement is claimed here for this case. A collapse+re-expand of a root node is currently still needed to reveal a 3rd tier under `startExpanded = Yes`; this is a known, pre-existing, unfixed gap, tracked for a future change once root-caused.
