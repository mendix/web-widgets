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

The v2 Tree Node widget SHALL NOT preload beyond visible nodes plus one level of lookahead when "Start expanded" is No, since deeper tiers remain collapsed by default and already resolve correctly via a single real click. Preloading further in this mode would only eagerly fetch descendants of branches the user has not opened. With nothing expanded, "visible nodes plus one level" resolves to exactly the root nodes and their children; it grows only as the user actually expands.

#### Scenario: A 3rd-tier arrival does not trigger a further automatic round when collapsed by default

- **WHEN** "Start expanded" is No and a 3rd-tier item arrives as a result of the existing 2-round preload
- **THEN** no further automatic preload round is triggered for it — expanding it further still requires a real click

### Requirement: A child that arrives after its parent was expanded still restores that parent's expand affordance

The v2 Tree Node widget SHALL keep preloading one level ahead for nodes the user has already expanded, so a child that becomes known only after the expand — because it was still in flight at expand time, or because it was created later — is still preloaded, and the affected node's expand affordance is still correct. This applies whether or not the node's children were already known when `appendItems` ran for it.

#### Scenario: Children still in flight at expand time are preloaded once they arrive

- **WHEN** a user expands a node whose children have not been delivered yet, and those children arrive in a later datasource delivery
- **THEN** the widget preloads those children's own children, so each arriving child shows its correct expand affordance without the user collapsing and re-expanding the parent

#### Scenario: A child created after the expand is preloaded

- **WHEN** a node is already expanded with known children, and a microflow adds a further child to that node
- **THEN** the widget preloads the newly-added child's own children, so the new child shows its correct expand affordance as soon as it is rendered

#### Scenario: Repeated deliveries do not re-request the same parent

- **WHEN** a datasource delivery leaves the set of parents the widget needs unchanged from the set it last requested
- **THEN** no further preload request is issued for that delivery, and no parent id appears more than once in the preload filter

### Requirement: A node's expanded or collapsed state survives a tree rebuild

The v2 Tree Node widget SHALL remember each node's expanded/collapsed state by item id and restore it when that node is re-created during a rebuild of the incremental node map, so a datasource refresh never silently collapses the tree the user had opened. A remembered state MUST take precedence over the `startExpanded` default, in both directions.

#### Scenario: Expansion survives new prop instances on refresh

- **WHEN** the Mendix client hands the widget new prop instances on a refresh (which the widget compares by reference and therefore treats as a configuration change, rebuilding the node map)
- **THEN** every re-created node comes back with the expanded/collapsed state it had before the rebuild, not with the `startExpanded` default

#### Scenario: Expansion of remaining nodes survives an item removal

- **WHEN** a single item is deleted from the datasource, triggering a rebuild of the node map
- **THEN** the remaining nodes come back with the expanded/collapsed state they had before the removal

#### Scenario: A user-collapsed node stays collapsed even when "Start expanded" is Yes

- **WHEN** "Start expanded" is Yes, the user collapses a node, and a later refresh rebuilds the node map
- **THEN** that node comes back collapsed — the remembered state wins over the `startExpanded` default

#### Scenario: A node never seen before still follows the configured default

- **WHEN** an item id appears that has no remembered state (a genuinely new node)
- **THEN** that node is created directly in the state `startExpanded` dictates (`EXPANDED` or `COLLAPSED_WITH_JS`) — never in a stored `LOADING` state

### Requirement: The set of parents to preload is derived from the current tree, never accumulated from delivery history

The v2 Tree Node widget SHALL determine which parents to request on every datasource delivery by deriving them from the tree as it currently stands — the roots, plus every node all of whose ancestors have their subtree rendered, plus every child of such a node — and SHALL request exactly that set. A node's subtree counts as rendered when the node is expanded, and also when it was expanded and then collapsed again (its body remains in the DOM, hidden), but not when it has never been expanded. It MUST NOT maintain a record of what has already been fetched, a one-shot "preload done" flag, or any other delivery-history state as the basis for that decision. A node counts as a root for this purpose only when it has no parent at all, not merely when its parent is absent from the current delivery.

#### Scenario: A replaced result set still gets its expand affordance

- **WHEN** an app-level constraint replaces the datasource's entire result set (for example the user picks a different department in a gallery that filters the tree), producing a set of roots none of which the widget has seen before
- **THEN** the widget requests the new roots' children, and every new root that has children shows its expand affordance — it is not left inert with no icon, no `aria-expanded`, no clickable header and no keyboard expand

#### Scenario: Consecutive result-set replacements each behave identically

- **WHEN** the result set is replaced a second and third time in the same session, without the widget remounting
- **THEN** each replacement is treated exactly like the first — there is no round, flag, or budget that a previous replacement can have used up

#### Scenario: Parents from a previous result set are no longer requested

- **WHEN** a delivery no longer contains an item that was previously a requested parent
- **THEN** that item's id is absent from the next filter the widget applies, so its children are no longer retrieved

#### Scenario: Collapsing a node does not drop what was already fetched below it

- **WHEN** the user collapses a node whose descendants have already been retrieved
- **THEN** the widget requests the same set of parents as before the collapse, and re-expanding that node shows its children with their expand affordances intact

#### Scenario: An item whose parent is not delivered is not treated as a root

- **WHEN** a delivered item has a parent association pointing at an object the datasource does not deliver
- **THEN** the widget does not request that item's children on the grounds that it renders at root level, and it therefore shows no expand affordance — the item leaves the tree on the following delivery, once the filter stops asking for its parent

#### Scenario: Only items in the current delivery are used to build the filter

- **WHEN** the tree still holds nodes whose ids were not in the current delivery (retained per the data-refresh behaviour)
- **THEN** the filter is built only from items the current delivery provided, so no stale object reference is used to request children
