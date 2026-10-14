## Context

`TreeNode.tsx` (root dispatcher) routes to v2 (`src/components/v2/`) whenever `parentAssociation` is configured — the self-referencing "infinite tree" mode this ticket's repro projects use. `TreeNode.editorConfig.ts:38-39` hides the `hasChildren` widget property from Studio Pro whenever `parentAssociation` is set, and it has no XML default value — so on every v2 instance, `props.hasChildren` is `undefined` at runtime. (Confirmed live: an initial attempt to read it crashed the widget with `TypeError: Cannot read properties of undefined (reading 'get')`.) v2 must derive "does this node have children" structurally, from `node.children.length > 0` — there is no other signal available to it.

Why this requires fetching at all, rather than a cheap existence check: Mendix's pluggable-widget data API (`ListValue`) gives a widget exactly one shared, filter-driven list — there is no lighter-weight "does association X have any related record" or per-item count primitive exposed to pluggable widgets. Determining "does node N have children" means asking the datasource for items whose parent is N and checking whether anything comes back; there's no way to get that answer without the datasource actually returning (at least) the matching item(s). This is why the whole preload mechanism (`loadedParentsByIdRef`/`loadedChildsByIdRef`, both in `appendItems` and the bootstrap effect below) exists at all — it's not a workaround for a missed optimization, it's the only mechanism this API surface provides for v2's configuration mode.

`useIncrementalTreeData.ts:114-119` (pre-fix) flipped a node out of `TreeNodeState.LOADING` the moment its id reappeared in _any_ subsequent `items` delivery — not specifically a delivery meant to answer "does this node have children." A microflow datasource (`useInfiniteTreeNode.ts`) always redelivers its full flattened result regardless of the filter passed to `datasource.setFilter(...)`, since microflow datasources ignore filters entirely. Two consequences, confirmed via live instrumented repro against customer-attached repro projects for WC-3564:

- **Bug 1**: with "Start expanded" = Yes, a node stays `LOADING` forever if the only mechanism meant to resolve it (a filtered re-delivery) never distinguishes "answered" from "not yet answered" — the spinner never clears.
- **Bug 2**: with "Start expanded" = No, expanding any node triggers `appendItems` → `setFilter`, which (because the microflow ignores the filter) redelivers everything, including the ids of _unrelated_, not-yet-clicked nodes. Those nodes flip out of `LOADING` per lines 114-119, landing in `COLLAPSED_WITH_JS` with an empty `children` array — permanently killing their icon, since the icon-render condition (`TreeNode.tsx:49`, pre-fix) was `hasChildren || treeNodeState === LOADING` and neither is true anymore.

Git history (`dcbf9bdb51`, "fix: add empty message, loading, and keyboard nav") shows `LOADING` was added later, purely for polish: before that commit, a new node was created directly as `EXPANDED`/`COLLAPSED_WITH_JS`, and a node that would turn out to have children simply showed no icon for one render until its children got placed — a minor "icon pops in" flicker. `LOADING` was introduced to bridge that instant with a spinner instead of nothing, but the _resolution_ criterion it shipped with was wrong, and that wrong criterion is the root cause of both WC-3564 bugs.

## Goals / Non-Goals

**Goals:**

- Expand-icon visibility for v2 must never depend on a widget property that is architecturally unavailable in v2's own configuration mode (`hasChildren`).
- A node's spinner state must never be "stuck" (Bug 1) or capable of corrupting an unrelated node's state (Bug 2).
- Preserve the original polish goal (avoid an abrupt icon pop-in) using a signal that cannot exhibit either bug.
- Both WC-3564 bugs fixed by the same underlying mechanism (not two separate patches).
- The preload filter must stay correct after the datasource's entire result set is replaced by an app-level constraint (a gallery filtering by department, a changed page parameter), not only across incremental deliveries of the same set.

**Non-Goals:**

- Not changing v1 behavior — v1 correctly reads `hasChildren` (it has no association-based alternative) and is untouched by this change.
- Not fixing incorrect Studio Pro configuration of `hasChildren` — irrelevant to v2 now, since v2 never reads it.
- Not changing how `useIncrementalTreeData` renders an orphan — an item whose `parentId` is set but whose parent the datasource does not deliver. It is still promoted to root level, because that promotion is what makes out-of-order delivery (child before parent) work. D6 records the consequence.
- Not guaranteeing a spinner ever shows for every conceivable timing gap — the fix only guarantees the spinner is never stuck and never corrupts a sibling; if the datasource's `status` never reports `Loading` for a given fetch, no spinner shows for it (functionally harmless, matches original pre-`LOADING`-commit behavior).

## Decisions

### D1 (revised): `hasChildren` stays derived from `node.children.length > 0`; `props.hasChildren` is never read in v2

Initial design used `props.hasChildren.get(node.item).value` as the icon-visibility source, on the premise that the prop was simply unused, not unusable. Live testing against the actual WC-3564 repro project crashed the widget (`props.hasChildren` is `undefined` for any v2 instance — see Context). Reverted: `TreeNode.tsx`'s `hasChildren` local goes back to `node.children.length > 0`, exactly as before this ticket. `renderRecursiveNode` no longer threads a `hasChildren` expression parameter at all.

This is safe against both bugs once D2 (below) lands, because `node.children` is only ever mutated by real, structurally-correct placement (`useIncrementalTreeData.ts`'s `placeNode`) — there is no longer a spurious "resolve" step that can zero out a node's children array based on unrelated data.

### D2 (revised): `LOADING` is a render-time-only spinner decision, never stored per node

A newly-created node is created directly as `EXPANDED`/`COLLAPSED_WITH_JS` (per `config.startExpanded`) in `useIncrementalTreeData.ts` — `TreeNodeState.LOADING` is never assigned to `treeNodeState` anywhere in that file, and the click handler in `TreeNode.tsx` goes back to unconditionally setting `EXPANDED` (matching pre-`LOADING`-commit behavior; no guard needed since nothing sets `LOADING` on click anymore).

The spinner is computed fresh on every render in `TreeNode.tsx`: `showSpinner = node.children.length === 0 && props.datasource.status === ValueStatus.Loading`. `datasource.status` is Mendix's own first-party, real-time "is this datasource actually fetching right now" signal (`ListValue.status: ValueStatus`) — not bookkeeping we maintain ourselves. `renderHeaderIcon` receives `showSpinner ? TreeNodeState.LOADING : node.treeNodeState`, so `LOADING` still exists as an icon-rendering signal (satisfying the original "repurpose, don't remove" call), just never persisted on the node.

This is structurally immune to both bugs:

- **Bug 1 can't recur**: nothing is ever "waiting" in a stored sense. The spinner shows exactly while `status` says `Loading`, and clears the instant it doesn't — including the case where a microflow's `setFilter` call is a genuine no-op and `status` never even transitions to `Loading` (spinner correctly never shows, rather than showing forever).
- **Bug 2 can't recur**: there's no per-node mutable "resolved" flag to wrongly flip. Every render recomputes `hasChildren` fresh from the current `children` array and `showSpinner` fresh from the single global `status` flag — one node's expand action can only ever change _its own_ children array (via real placement) or the shared `status` (which, if it flips, affects all unresolved nodes' spinners equally and correctly, not selectively/incorrectly).

**Alternatives considered**:

- _Track per-node fetch-request ids from `useInfiniteTreeNode.ts` and gate resolution on that._ Rejected — solves the wrong layer; still lets a node start `LOADING` and wait indefinitely if the tracked request never resolves (Bug 1's actual mechanism), and adds bookkeeping complexity for no additional correctness over the `datasource.status` approach.
- _Resolve `LOADING` immediately whenever a node's first child is placed, entered via click when `children.length === 0`._ Rejected — requires guarding the click handler against genuine leaves (ambiguous: `children.length === 0` means both "confirmed leaf" and "real parent not yet preloaded," indistinguishable from node state alone), and turned out to be moot anyway once `hasChildren` was reverted to being structurally-derived (a node is only ever clickable once its children are already known, via the existing one-level-lookahead preload — see Context).
- _Drop `LOADING`/the spinner entirely._ Considered when it looked like the preload design left no genuine "waiting" window at all. Rejected per explicit user request to keep a spinner "just in case" — `datasource.status` gives a correct way to do that without reintroducing either bug.

### D3 (added — found during manual verification, not part of the original two bugs): the one-level-lookahead preload had two gaps, both closed

While verifying D1/D2 live, manual testing surfaced that a node's expand affordance for a _deeper_ tier sometimes didn't appear until the user collapsed and re-expanded a node — a real, pre-existing bug on `main`, unrelated to the `LOADING`/`hasChildren` mechanism above (it lives entirely in `useInfiniteTreeNode.ts`, which D1/D2 never touch). Two separate gaps in the same "preload one level past what's currently expanded" mechanism:

- **Click-driven gap** (`appendItems`): the grandchildren-preload step (`children.forEach(...)`, adding a node's children to `loadedChildsByIdRef` so _their_ children get fetched too) was nested inside `if (loadedParentsByIdRef.current.has(parentId))` — true only from a node's _second_ expand onward. A node's first-ever expand skipped preloading its children's children, so a deeper tier's expand icon only appeared after a collapse+re-expand. **Fix**: removed that outer gate — the preload step now always runs when children are passed in, regardless of whether this is the first or a later expand. Verified live: a single click now reveals a 4th tier that previously needed collapse+re-expand.
- **Bootstrap-path gap** (the second `useEffect`, `startExpanded = Yes` specifically): root nodes auto-expand via a separate path that populates `loadedParentsByIdRef` directly from `datasource.items`, bypassing `appendItems` entirely — so the click-driven fix above doesn't reach them. This path was also capped at exactly one automatic round (`if (loadedParentsByIdRef.current.size === 0)`, true only once ever), so it preloaded roots' children but never went one level further.

    **First attempt, reverted after breaking live**: replaced the one-shot gate with a `bootstrapRoundRef` counter that advanced unconditionally on every effect firing, capped at 2. Passed unit tests against a mocked datasource, but broke the real "Expanded bug" tab live — the tree stopped rendering anything past the root level. Root-caused with temporary per-widget-tagged debug instrumentation (three tree widgets mount simultaneously on that page regardless of which tab is active, so untagged logs were unreadable): both rounds fired, and _locked themselves in_, while `datasource.items` was still transiently empty during initial load — before the real root items ever arrived. A blind counter can't distinguish "this effect fired" from "this effect fired with something worth preloading"; it burned both capped rounds on nothing, permanently disabling the mechanism.

    **Second attempt**: replaced the counter with two content-based flags (`round1DoneRef`, `round2DoneRef`) that only flip once real, not-yet-tracked items are actually found — mirroring the pre-existing round-1 gate's own self-correcting semantics (`loadedParentsByIdRef.current.size === 0`, checked _after_ attempting to populate: harmlessly retries on an empty delivery, locks in only once real data lands). Round 2 only locks in once its scan finds at least one item that isn't already a known parent or child. Verified live: the "Expanded bug" tab (2-tier test data at the time) showed all tiers automatically on load, with no regressions to Bug 1/Bug 2/the `appendItems` fix.

    **Third attempt (final, kept)**: against a deeper (4-tier) dataset, the 2-round cap turned out insufficient — the 3rd tier appeared as visible content but without its own expand icon, needing one more real click on an ancestor to reveal, one level deeper than the original repro exposed. Root insight: under `startExpanded = Yes`, _every_ level defaults to `EXPANDED`, not just roots (`useIncrementalTreeData.ts`'s node-creation branch — see D2) — so every level needs the same automatic one-level-lookahead treatment, not a fixed count of 2. The original "avoid eagerly walking the whole tree" concern (below) doesn't actually apply to `startExpanded = Yes`: since nothing is collapsed in that mode, walking the whole tree _is_ the correct, intended behavior — bounded by the tree's real depth (a finite, self-terminating cascade), not an unbounded/runaway one. Fixed by replacing the 2-round cap with an unbounded cascade, gated specifically on `startExpanded === true`: keep treating newly-arrived items as loaded-parents and fetching their children for as long as new descendants keep appearing; stop once a round finds nothing new. `startExpanded = false` keeps the original capped round1+round2 behavior — for that mode, deeper tiers are still collapsed by default and resolve correctly via a single real click already (group 6's fix), so auto-cascading further would only be wasted eager-fetching of not-yet-visible content. Verified live: the "Expanded bug" tab (now the real 4-tier dataset) shows every tier automatically, matching the exact result the user originally showed as expected; the "Collapsed bug" tab's 2-round-capped behavior is unchanged and still passes.

**Alternative considered**: apply the unbounded cascade regardless of `startExpanded`. Rejected per explicit user decision — would eagerly prefetch descendants of branches that are still collapsed and not visible under `startExpanded = false`, for no user-visible benefit (those tiers already resolve correctly in a single click once actually expanded).
**Alternative considered** (superseded by the "why can't we just know without fetching" question — see Context below): skip preloading and derive "has children" from a cheaper existence check. There is no such check available — see Context.

### D4 (added — folding in `tmp/treenode-fix1`): the incremental map re-applies datasource order and remembers expansion state; `LOADING` is not reintroduced to carry it

A parallel branch fixed two more bugs in `useIncrementalTreeData.ts`, both consequences of the same "build incrementally, reuse nodes across updates" design that D2 also lives in. Folding them in here rather than merging separately, because both branches rewrote the same two functions — the reconciliation below is a design decision, not a textual merge.

**(a) Datasource order was captured once, never re-applied.** A node is appended to `rootsRef`/`parent.children` only on the first update its id appears in; on later updates it takes the "already exists" branch, which refreshes `item`, `title` and `parentId` but never touches sibling arrays. So a datasource that re-delivers the same items in a new order (the real case: a microflow updates a sequence attribute the datasource sorts on) leaves the tree in its first-load order until the page is reopened and the widget remounts. **Fix**: build an `orderById` map from the current delivery's index, then sort `rootsRef` and every node's `children` by it at the end of each update. Nodes whose id is absent from the current delivery sort to the end (`?? sourceItems.length`), keeping their relative order among themselves rather than being shuffled — a delivery that expresses no order for a node should not reorder it.

Chosen over re-inserting at the right index during placement: placement is order-independent by design (children can arrive before parents — see the out-of-order handling), so a positional insert would need to be re-derived anyway once the parent shows up. One sort at the end is both simpler and the only point where the full delivery order is actually known.

**(b) A refresh collapsed every node.** Three things trigger a full rebuild of the node map, and a rebuilt node started collapsed:

1. `items === undefined` while the datasource loads. The hook read `items ?? []`, which made every previously-known id look removed, tripping `removedIdsDetected` → rebuild → empty tree → "no data available" flashes mid-load.
2. `isConfigChanged` compares prop instances by reference, and the Mendix client hands over new instances on every refresh — so this fires on _every_ refresh, not just genuine configuration changes.
3. Any single item deletion legitimately trips `removedIdsDetected`.

Cause 1 is fixed at the root: return early when `items` is undefined and keep the tree, which also removes the mid-load empty message. Causes 2 and 3 are _not_ avoided — rebuilding is correct for them, and making `isConfigChanged` structural would mean deep-comparing `ListExpressionValue`/`ListReferenceValue` instances that have no meaningful value equality. Instead the rebuild is made non-destructive: snapshot every node's `treeNodeState` into a `statesByIdRef` map keyed by item id just before clearing, and have node creation prefer a remembered state over the `startExpanded` default.

**Reconciliation with D2 — the one real conflict.** The parallel branch expressed the restore through a `resolveRestoredState(remembered, startExpanded)` helper whose "nothing remembered" arm returned `TreeNodeState.LOADING`, and whose second arm resolved a _remembered_ `LOADING` into `EXPANDED`/`COLLAPSED_WITH_JS`. Both arms are wrong here, in opposite ways: the first reintroduces stored `LOADING` — exactly WC-3564 Bug 1's mechanism — and the second is dead code, since after D2 no node ever holds `LOADING` to remember. Resolved by dropping the helper entirely; the restore collapses to a single expression on the node-creation branch:

```
treeNodeState: statesByIdRef.current.get(nodeId) ?? (config.startExpanded ? EXPANDED : COLLAPSED_WITH_JS)
```

The remembered state deliberately wins over `startExpanded` in both directions: a node the user collapsed under "Start expanded" = Yes must stay collapsed across a refresh, which is the whole point of remembering.

Note that (b) and D2 are complementary rather than overlapping, and it is worth being precise about which bug each one owns, since both are "the tree looks wrong after a refresh": D2 stops a _spinner_ from being stuck on a node; (b) stops a node's _expansion_ from being lost. D2 alone still collapsed the tree on refresh; (b) alone still left spinners stuck. Together, the early return from (b) also makes D2's spinner correct during the load window — the tree stays mounted, so `status === Loading` has real nodes to render a spinner on instead of an empty message.

### D5 (added — folding in `tmp/treenode-fix1`): the bootstrap effect's round gates must not `return`, or they swallow the late-arrival sweep

The parallel branch also extended `useInfiniteTreeNode.ts` with a third preload mechanism: track the ids of nodes the user has expanded (`expandedIdsRef`, populated in `appendItems`), and on each subsequent update sweep `datasource.items` for any item whose `parentId` is an expanded id and which isn't tracked in either map yet, preloading it. This covers children that were still in flight when `appendItems` ran (so it received none) and children created later by a microflow — neither of which any existing mechanism reached.

That sweep and D3's `round1DoneRef`/`round2DoneRef` gates collide, and the collision is invisible to inspection. D3 replaced the original `if (loadedParentsByIdRef.current.size === 0)` gate — which was skipped whenever `appendItems` had already populated the map — with a flag that fires on the _first_ post-init update regardless, and `return`s. The sweep sits after that return. Concretely, for `startExpanded = false`:

```
render          init             -> setFilter(root-only)
appendItems("parent")            -> setFilter([root, "parent"])   ("parent" now a loaded parent)
items = [parent, child] arrives
  round1Done? no
  loadedParents.size === 0? no   -> skip populate, size > 0, round1Done = true, setFilter, RETURN
  sweep never runs               -> filter still [root, "parent"], "child" never preloaded
```

**Fix**: no early `return` from round1 or round2. Each mechanism sets a single `shouldRefilter` flag, and one `setFilter` call happens at the end of the pass. Round1 and round2 stay mutually exclusive (`else if`) since round2's premise is that round1's fetch has landed; the sweep runs unconditionally after them.

The three mechanisms stay distinct and none is redundant: round1 fetches roots' children (roots never pass through `appendItems`, so the sweep cannot see them), round2 preloads one level past that, and the sweep handles everything arriving after a real expand. D3's cascade for `startExpanded = true` is untouched and still returns early — it already treats every newly-arrived item as a loaded parent, which subsumes the sweep for that mode.

**`appendItems` reconciliation.** Both branches rewrote it and removed the same outer gate; the end state is equivalent apart from two details. Kept D3's shape (it is what this change's `CONTEXT.md` documents) plus the parallel branch's `if (!loadedParentsByIdRef.current.has(childId))` guard on the child loop — without that guard, a child that was expanded earlier and then collapsed ends up in `loadedParentsByIdRef` _and_ `loadedChildsByIdRef`, producing a duplicate parent id in the preload filter. Harmless today, but it makes the filter's contents no longer a set, which is what one of the new tests asserts.

**Known gap, deliberately not widened.** Root nodes are never added to `expandedIdsRef` under `startExpanded = false`, since they auto-expand via the bootstrap path rather than `appendItems`. So a child added to a _root_ after round2 has locked in is not swept. Pre-existing in the parallel branch too, out of scope here; fixing it means deciding whether the bootstrap path should register roots as "expanded", which changes what the sweep costs on wide trees.

### D6 (added — found live during this change's own verification pass; supersedes D3's round mechanism and D5's restructure): the preload parent set is _derived_ from the current tree, never accumulated from delivery history

**How it was found.** Live on the `treenodev2_advanced` test page: two v2 trees over the same data side by side (`.mx-name-treeNode1` with "Start expanded" = No, `.mx-name-treeNode2` with Yes), plus a gallery that filters the datasource by department. Selecting a department replaces the datasource's entire result set. After any such switch, every node in `treeNode1` renders permanently without an expand affordance — and inert in the full sense: no icon, no `aria-expanded`, no `widget-tree-node-branch-header-clickable`, and `onKeyDownHandler` gated on `hasChildren`. The user has no way left to open it. `treeNode2`, over the same data, is correct.

```
FRESH LOAD (no department selected)
treeNode1 (startExpanded = No)          treeNode2 (startExpanded = Yes)
[false] Electronics :: chevron          [true] Electronics :: chevron
  [false] Phones    :: chevron            [true] Phones    :: chevron
    [null] iOS      :: no icon              [null] iOS      :: no icon
  [null] Tablets    :: no icon            [null] Tablets   :: no icon

AFTER selecting department "Finance"
t1: Books | Tablets | Android | Sports  t2: Books | Tablets | Android | Sports[chevron]
    ^ all four inert, all at root level                                  └ Fitness Equipment

AFTER selecting department "IT"
t1: Clothing | Laptops | Home & Garden  t2: Clothing[chevron] | Laptops | Home & Garden
    ^ all three inert                         ├ Women            | Non-Fiction | Team Sports
                                              └ Men's Clothing
```

`treeNode1`'s post-switch result set is exactly `department = X AND parent ∈ {undefined, Electronics, Phones}` — the filter from the _initial_ load, frozen. `treeNode2` is correct only incidentally: its unbounded "Start expanded" = Yes cascade (D3) had already grown its own filter to include `Books`/`Sports`, so its retrieve happened to cover the new roots. Same widget, same data, different filter age.

**Two defects, one cause.** Every ref in `useInfiniteTreeNode.ts` is an append-only log scoped to the widget's mount:

- **(A) The rounds never re-arm.** `round1DoneRef`/`round2DoneRef` are one-shot for the widget's lifetime. On a replaced result set the effect skips both, the late-arrival sweep finds nothing (nothing was user-expanded), `shouldRefilter` stays false, and `setFilter` is never called — so the new roots' children are never requested and `node.children.length === 0` forever. This is the reported bug.
- **(B) The maps are never pruned.** `loadedParentsByIdRef`/`loadedChildsByIdRef`/`expandedIdsRef` only ever grow, so the filter is simultaneously stale and monotonically larger. Beyond the wasted retrieve, this is why `Tablets`/`Android`/`Laptops` appear at all under a department that excludes their parents — and, their parents being absent from the delivery, `useIncrementalTreeData`'s orphan promotion renders them at root level next to genuine roots.

**Why not simply re-arm the rounds.** That would be the fourth delivery-history heuristic in the same mechanism. This change's own `## Context` condemns the original bug as "resolve a node's state when its id reappears in some later delivery" — a history signal standing in for a derived fact. D3 and D5 then replaced it with two more history flags (`round1DoneRef`, `round2DoneRef`) and a third map (`expandedIdsRef`). Bolting a "was the result set replaced?" detector on top preserves the exact shape that has now produced four bugs, and every such detector is a heuristic in its own right (`incoming ∩ previous === ∅` is wrong the moment two departments share an item). The lesson this decision records: **derive the filter from the current tree; do not log what has already been fetched.**

**The rule.** One invariant replaces all of it:

> For every node that is **visible**, or **one expand away from visible**, the widget must know whether it has children.

```
rendered(N)    := N.treeNodeState is EXPANDED or COLLAPSED_WITH_CSS
visible(N)     := every ancestor of N is rendered     (a true root is always visible)

desiredParents = {undefined}                          <- always: fetch true roots
               ∪ {N : visible(N)}                     <- so every visible node's icon is correct
               ∪ {N : visible(parent(N))}             <- lookahead: icons are right before the expand lands
```

`setFilter` is called only when `desiredParents` differs from the set last applied.

**Why `rendered` and not simply `EXPANDED`** (found while implementing, not while designing): `COLLAPSED_WITH_CSS` means a node was opened and then closed, and per D1 its body stays in the DOM, hidden by CSS. If a collapse narrowed `visible`, the derived set would shrink, the next delivery would no longer carry the already-fetched grandchildren, the removed-ids check would rebuild the tree without them, and re-expanding the node would show its children with no expand icons — a fresh instance of the very defect this decision fixes. A collapse must therefore not change the set at all, which also means the click handler only re-derives on expand. `COLLAPSED_WITH_JS` (never opened, body never rendered) does stop the recursion, and that is the term that keeps `startExpanded = No` from eagerly walking the whole tree.

What that single rule subsumes:

| Mechanism it replaces                               | Why the rule already covers it                                                                                                                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `round1DoneRef` (preload roots' children)           | nothing expanded ⇒ visible = roots ⇒ set is `{undefined} ∪ roots ∪ children(roots)`. Identical result, no flag.                                                                                |
| `round2DoneRef` (one level past that)               | the same term of the same expression.                                                                                                                                                          |
| D3's `appendItems` grandchildren preload            | expanding R makes R's children visible ⇒ their children enter the set. Falls out.                                                                                                              |
| D5's late-arrival sweep                             | the set is recomputed from the current delivery every time, so a late child is picked up by the delivery that carries it. Falls out.                                                           |
| D3's unbounded cascade for "Start expanded" = Yes   | every level is `EXPANDED` ⇒ every delivered node is visible ⇒ set = all delivered ∪ their children. Same cascade, same self-termination, no special case.                                      |
| D5's known gap (roots never enter `expandedIdsRef`) | there is no `expandedIdsRef`, and root-ness is not a special case of expandedness.                                                                                                             |
| **(A) and (B) above**                               | the set is a function of the current tree: a replaced result set yields a new set on the first delivery, and an id that left the delivery leaves the set. Nothing to re-arm, nothing to prune. |

Refs deleted: `loadedParentsByIdRef`, `loadedChildsByIdRef`, `expandedIdsRef`, `round1DoneRef`, `round2DoneRef`. Refs remaining: `initializedRef`, plus a new `lastAppliedKeyRef` (the sorted ids of the last applied set, as one string). Five pieces of history collapse into one idempotence guard.

The rule is implemented as `deriveDesiredParentIds(treeData, deliveredIds)` in `hooks/helpers.ts` — pure, so it is unit-tested directly. It deliberately takes no `startExpanded` argument: `treeNodeState` already encodes it (D2 creates nodes `EXPANDED` under `startExpanded = Yes`), and reading the prop as well would let the two sources disagree once the user collapses something.

**"Root" means `parentId === undefined`, not "parent absent from this delivery"** — per explicit user decision. The two candidate definitions differ only for orphans, and they differ materially:

```
(a) root := parentId is undefined                       [CHOSEN]
    Finance ⇒ desiredParents = {undefined, Books, Sports, ...their children}
    Tablets/Android/Laptops are never requested ⇒ they leave the tree on the next
    delivery. One settle step.
    Cost: an orphan is never a requested parent, so it renders at root level with no
    affordance even if it does have children.

(b) root := parent absent from this delivery ("pseudo-root")
    Finance ⇒ Tablets counted as a root ⇒ its children requested ⇒ next delivery drops
    Tablets itself (Electronics is not in the set) ⇒ Tablets leaves the set the round
    after. Two settle steps: the row visibly flickers in and back out, and one retrieve
    is spent on a node that is about to disappear.
    Gain: a genuine orphan does get its affordance.
```

(a) is chosen: an item whose parent the app will not deliver is not really a tree root, and spending a retrieve plus a visible flicker to give it an affordance dignifies an accident of configuration. The consequence is recorded as a trade-off below, not hidden.

**Architecture: the feedback loop becomes explicit.** Visibility lives on `treeNodeState`, which lives in `useIncrementalTreeData` — so the filter has to be derived from the built tree. Today's code emulates that loop through an append-only log; D6 makes it a loop on purpose:

```
 datasource.items ──► useIncrementalTreeData ──► treeData (nodes + EXPANDED flags)
        ▲                                              │
        │                                              ▼
   setFilter ◄──── deriveDesiredParents(treeData, startExpanded)
                          │
                    guard: skip while items === undefined
                    guard: skip when the set equals lastAppliedParentIds
```

`TreeNodeV2` consequently calls `useIncrementalTreeData(props.datasource.items, treeConfig)` directly and passes the resulting `treeData` into the preload hook, instead of threading `items` out of it — `useInfiniteTreeNodes` returns `datasource.items` verbatim today, so that indirection buys nothing once the hook no longer owns the item flow. The file keeps its name so the diff stays legible against D3/D5.

**Why the init block survives.** The one-time init (`initializedRef`) still applies a root-only filter when "Start expanded" is No, and still applies _no_ filter when it is Yes. That asymmetry is load-bearing: for a non-microflow datasource with "Start expanded" = Yes, the unfiltered first delivery returns the whole table in a single retrieve, and the derived set computed from it is immediately stable (everything delivered is expanded, so everything is already a desired parent) — one confirming `setFilter`, then silence. Deriving from an empty tree instead would start at `{undefined}` and walk the tree down one retrieve per level, trading one round trip for depth-many.

**Convergence.** Membership in `desiredParents` depends on a node's _ancestry_ only, never on its descendants, so the set cannot feed itself: requesting P's children can add P's children to the set, but never changes P's own membership. Combined with the equality guard, that bounds the loop:

- Normal datasource: the set grows only as the user expands. Each delivery recomputes to the same set ⇒ one `setFilter`, then silence.
- Microflow datasource (WC-3564's villain, ignores `setFilter` and redelivers everything): the tree is full, the set derived from it is stable, the one `setFilter` is ignored, the next delivery is identical ⇒ no further calls. No loop and no stuck state — strictly better than D3's `addedAny` termination, which depended on deliveries differing.
- Shrinking (a department switch): the set shrinks once and settles, per the ancestry-only argument above.

**Stale `ObjectItem`s.** `setFilter` needs real `ObjectItem`s for `literal()`, and `useIncrementalTreeData` deliberately keeps nodes the current delivery did not mention (D4a). The derived set is therefore built only from ids present in the current delivery, so a node holding an `ObjectItem` from an older delivery never reaches `literal()`.

**Expansion stays a mutation.** The click handler mutates `node.treeNodeState` and calls `forceRender`, so an effect keyed on `treeData` does not re-fire on expand; the handler calls the recompute imperatively instead. `appendItems(newItem, children)` therefore becomes an argument-less `syncPreloadFilter()` — the expansion state it used to be told about is now already on the node. Lifting expansion into real React state would let the effect fire on its own, but it rewrites D2/D4 territory for no behavioural gain, so it stays out.

## Risks / Trade-offs

- **[Trade-off]** If a real (non-microflow) datasource's `status` never meaningfully transitions to `Loading` for some fetch (e.g. resolves synchronously from cache), the spinner simply won't show for that fetch — same as the original pre-`LOADING`-commit behavior (brief icon pop-in instead of a spinner). Cosmetic only, not a functional regression.
- **[Risk]** None identified that could reproduce either original bug — see D2's "structurally immune" reasoning above. Covered by unit tests asserting spinner-shows-while-loading, spinner-clears-on-settle (whether or not children arrived), and one node's resolution never affecting a sibling's spinner/children/state.
- **[Risk]** D3's bootstrap round-2 preload fetches one extra level for every currently-known item, regardless of whether the user has looked at it — a bounded, one-time eager-fetch (proportional to tree _width_ at that level, not depth) → **Mitigation**: capped at exactly 2 rounds via content-based flags, verified live and by a unit test asserting a 3rd datasource change does not trigger a 3rd round. This matches the cost the widget already pays for round 1 (unconditionally preloading roots' children regardless of collapse state) — round 2 is the same category of cost, one level deeper, not a new category of risk.
- **[Risk — realized and fixed, kept as a lesson]** A first attempt at this exact fix (a fire-count-based cap) passed every unit test against a mocked datasource but broke a real repro project live, because mocked datasources don't reproduce the transient "still loading, items temporarily empty" window that real ones do. Mitigation going forward: any change to `useInfiniteTreeNode.ts` that touches `setFilter` call timing/count must be live-verified against a real datasource before being trusted, not just unit-tested against a mock.
- **[Risk]** D4's `statesByIdRef` grows for the lifetime of the widget instance and is never pruned — an id whose item is deleted keeps its remembered state. Bounded by the number of distinct ids the datasource has ever delivered to this instance, holding one enum value each, and reset on unmount. → **Mitigation**: none taken deliberately; pruning on removal would break the legitimate case of an id disappearing and returning within the same session (a filter change, or an item re-delivered after a microflow round-trip), which is the case the map exists to serve.
- **[Risk]** D4's per-update sort runs over `rootsRef` plus every node's `children` array on every datasource delivery — O(n log n) across the tree rather than the previous O(1)-per-known-id. → **Mitigation**: the `children.length > 1` guard skips single-child and leaf nodes, which is most of a typical tree; the work is proportional to what the datasource just delivered, which the hook already iterates twice.
- **[Risk]** D5 changes `setFilter` call _timing and count_ in `useInfiniteTreeNode.ts` — precisely the category the lesson above says must not be trusted on mocked unit tests alone. The round1 early return is removed and the three mechanisms now share one call per pass, which is a behavioral change to the exact code path that broke live before. → **Mitigation**: mandatory live re-verification of all four scenarios (both WC-3564 bugs, the "Expanded bug" 4-tier cascade, and the "Collapsed bug" `startExpanded = false` path) against `~/Documents/_tickets/WC-3564-2` before this change is considered done — not just the new tests passing. Tracked as its own task group.
- **[Risk]** D4's early return on `items === undefined` means the widget renders stale nodes for the duration of a load, where it previously rendered an empty message. If a load never completes, the user sees old data with no indication rather than an empty tree. → **Mitigation**: accepted, and this is the intended behavior — D2's spinner is what indicates the in-flight load, and showing an empty tree mid-refresh was the reported bug.

- **[Risk]** D6 rewrites `setFilter` timing and count a third time — the exact category task 7.1 proved cannot be trusted on mocked unit tests alone, and the category D5's risk entry already flagged. → **Mitigation**: the same mandatory live re-verification, extended with the department-switch scenario that found D6 in the first place (`treenodev2_advanced`, both `startExpanded` modes, at least two consecutive switches). A derivation is easier to reason about than three interacting flags, but that is an argument for reviewability, not a substitute for live proof.
- **[Trade-off]** Under D6's chosen root definition, an orphan (an item whose `parentId` is set but whose parent the datasource does not deliver) is never a requested parent, so it renders at root level with no expand affordance even if it has children. → **Accepted**: the alternative (definition (b)) costs a visible flicker plus a wasted retrieve on every result-set change, to serve a case that is usually a configuration accident. Recorded as a Non-Goal above.
- **[Trade-off]** Immediately after a result-set replacement, rows left over from the previous set (children of the previous set's parents, e.g. `Tablets` under department Finance) render once, inert, and disappear on the following delivery once the filter stops asking for their parents. A one-delivery transient, self-cleaning, and strictly better than today's behaviour where those rows persist for the widget's lifetime.
- **[Risk]** The derived set is recomputed by walking the tree on every delivery, plus a set comparison — O(n) where the previous mechanism was O(1) per already-known id. → **Mitigation**: the same order of work D4a's per-update sort already introduced in the sibling hook, over data the hook already iterates; and it replaces up to three separate `datasource.items` passes (round1, round2, the sweep) with one.
- **[Risk]** Making the tree → filter → tree loop explicit invites an infinite `setFilter` loop if the derivation is ever made to depend on a node's descendants. → **Mitigation**: `desiredParents` membership is defined over ancestry only, which is what makes the loop provably terminating (see D6); a unit test asserts that a repeated identical delivery triggers zero further `setFilter` calls, and the `lastAppliedParentIdsRef` equality guard is the backstop.

## Migration Plan

No data or config migration. `hasChildren` is no longer read by v2 at all, so existing v2 configurations (where it was always hidden/unset anyway) are unaffected; v1 is untouched. Standard widget version bump + changelog entry per repo convention; no feature flag needed since this is a bug fix restoring intended behavior.
