## 1. Resolve-at-creation, drop stored `LOADING` (D2)

- [x] 1.1 In `useIncrementalTreeData.ts`'s node-creation branch, create new nodes directly as `config.startExpanded ? TreeNodeState.EXPANDED : TreeNodeState.COLLAPSED_WITH_JS` instead of `TreeNodeState.LOADING`.
- [x] 1.2 Remove the "existing node in `LOADING` resolves on reappearance" branch entirely — no node is ever assigned `LOADING` in this file anymore, so there is nothing left to resolve.
- [x] 1.3 Revert `TreeNode.tsx`'s click handler to unconditionally set `EXPANDED` on expand-click (matches pre-`LOADING`-commit behavior) — no `LOADING` entry via click, no guard needed.
- [x] 1.4 Compute the spinner at render time in `TreeNode.tsx`: `showSpinner = node.children.length === 0 && props.datasource.status === ValueStatus.Loading`. Pass `showSpinner ? TreeNodeState.LOADING : node.treeNodeState` into `renderHeaderIcon`. No per-node `LOADING` is stored anywhere.

## 2. `hasChildren` derivation — reverted after live-testing crash

- [x] 2.1 **Correction, found via live Studio Pro testing (not caught by unit tests):** the initial plan was to read `props.hasChildren` in v2. This crashed the widget — `TreeNode.editorConfig.ts:38-39` hides `hasChildren` from Studio Pro whenever `parentAssociation` is configured (every v2 instance, including both of this ticket's repro projects), and it has no XML default, so `props.hasChildren` is `undefined` at runtime for v2. Reverted `TreeNode.tsx:20`'s `hasChildren` derivation back to `node.children.length > 0` — the same signal it used before this ticket. Removed the `hasChildrenExpr` parameter from `renderRecursiveNode` entirely.
- [x] 2.2 Confirmed `aria-expanded`, icon clickability, and the icon-render condition all still read the single `hasChildren` local (now `node.children.length > 0`) unchanged.
- [x] 2.3 Confirmed the icon-render condition is `(hasChildren || showSpinner) && iconPlacement !== "no"` — a node with children never spins; a childless node spins only while `datasource.status === Loading`.

## 3. Regression tests

- [x] 3.1 Rewrote `TreeNodeV2.spec.tsx`'s stale comment (previously claimed the datasource setup existed to satisfy a `hasChildren` prop check — no longer applicable since `hasChildren` isn't read at all). Hoisted shared test helpers to module scope so a new describe block could reuse them.
- [x] 3.2 Added a unit test (`TreeNodeV2.spec.tsx` + `useIncrementalTreeData.spec.ts`): a node is created directly in `EXPANDED`/`COLLAPSED_WITH_JS` per `startExpanded` and never passes through `LOADING`, even when the datasource keeps redelivering the same full item set (simulating a microflow ignoring `setFilter`) — Bug 1 regression.
- [x] 3.3 Added a unit test: a node's own children arriving does not change an unrelated sibling's `treeNodeState`, children, or spinner — Bug 2 regression. Covered in both spec files.
- [x] 3.4 Added unit tests for the spinner itself: shows while `datasource.status === Loading` and no children are known; clears once `status` settles regardless of whether children arrived; never shows for a node that already has children.

## 4. Manual verification

- [x] 4.1 Rebuilt against `~/Documents/_tickets/WC-3564-2` and drove it with Playwright. First rebuild (with the `props.hasChildren`-based design) crashed the widget live — see task 2.1. After the correction, rebuilt again and confirmed: expanding "Top level 2" leaves "Second level 1a"/"Second level 1b"'s expand icons intact (icon count unchanged before/after, screenshot-confirmed) — Bug 2 fixed.
- [x] 4.2 Confirmed bug 1's repro (microflow datasource, "Start expanded" = Yes) live: tree renders fully expanded immediately, zero `.widget-tree-node-loading-spinner` elements, no console/page errors.

## 5. Changelog

- [x] 5.1 Added a `CHANGELOG.md` entry under `[Unreleased]` describing the user-visible fix (both bugs), no implementation details, per repo changelog conventions.

## 6. Third finding: `appendItems` off-by-one-click preload gap (found during manual verification)

Pre-existing on `main`, unrelated to `useIncrementalTreeData.ts`/`TreeNode.tsx` (untouched by groups 1-2). A node's own click-to-expand never preloaded its _own_ children's children — required a collapse+re-expand of that same node before a deeper tier's expand icon appeared.

- [x] 6.1 In `useInfiniteTreeNode.ts`'s `appendItems`, removed the outer `if (loadedParentsByIdRef.current.has(parentId))` gate around the grandchildren-preload `children.forEach(...)` step — it was skipping that step on a node's _first_ expand (the only time it matters), only running it from the second expand onward.
- [x] 6.2 Added a unit test in `useInfiniteTreeNode.spec.ts` — not needed as a new test; existing "first expansion" describe block continues to cover this since the gate removal doesn't change its assertions, but confirmed no existing test asserted the buggy gated behavior.
- [x] 6.3 Verified live: rebuilt against `~/Documents/_tickets/WC-3564-2`, single click on "Second level 1a" (previously required collapse+re-expand) now immediately reveals "Fourth level 1" under "Third level 1a1" — confirmed via Playwright polling (no click-twice needed).
- [x] 6.4 Re-ran the full rigorous Bug 1 / Bug 2 regression suite live after this change — no regressions.

## 7. Fourth finding: bootstrap preload capped at one round, never reaches a second (found during manual verification)

Pre-existing on `main`, in `useInfiniteTreeNode.ts`'s second `useEffect` block — separate from group 6 (that gate was in `appendItems`, click-driven; this one is in the automatic bootstrap path that runs regardless of clicks). For `startExpanded = Yes` specifically, root nodes auto-expand via this bootstrap path rather than via `appendItems`, so group 6's fix doesn't reach them — closing and reopening a root node was required to reveal a 3rd tier.

- [x] 7.1 **First attempt (reverted):** replaced the one-shot `if (loadedParentsByIdRef.current.size === 0)` gate with a `bootstrapRoundRef` counter that advanced unconditionally on every effect firing, capped at 2. Passed unit tests against a mocked datasource. **Broke live**: rebuilt against `~/Documents/_tickets/WC-3564-2`, the "Expanded bug" tab permanently stopped rendering anything past the root level. Root-caused via temporary debug instrumentation (tagged per-widget-instance to disentangle the 3 tree widgets that mount simultaneously on that page): both rounds fired — and locked themselves in — while `datasource.items` was still transiently empty (still loading), _before_ the real root items ever arrived. The counter had no way to tell "fired" apart from "fired with real data," so it burned both of its capped rounds on nothing.
- [x] 7.2 **Second attempt (this one, kept):** replaced the counter with two content-based booleans (`round1DoneRef`, `round2DoneRef`) that only flip once real, previously-unseen items are actually found — mirroring the original round-1 gate's own self-correcting semantics (`loadedParentsByIdRef.current.size === 0`, checked _after_ attempting to populate, so it harmlessly retries on empty deliveries instead of locking in early). Round 2 only locks in once it finds at least one item that isn't already a known parent or child.
- [x] 7.3 Removed all debug instrumentation added for root-causing 7.1 (tagged `[DEBUG-t3564b]`, per-widget-instance) — confirmed zero references remain.
- [x] 7.4 Added a unit test in `useInfiniteTreeNode.spec.ts` that explicitly exercises the failure mode from 7.1: several transient empty-item rerenders before round 1 locks in, another empty/unchanged rerender before round 2 locks in, then confirms round 2 only advances once real new items appear, and a further identical rerender does not trigger a round 3.
- [x] 7.5 Verified live: rebuilt against `~/Documents/_tickets/WC-3564-2`. "Expanded bug" tab now shows all 3 tiers automatically on load — no manual toggle needed. Re-ran the full rigorous Bug 1 / Bug 2 / group-6 (`appendItems`) regression suite live — all still pass, no regressions.
- [x] 7.6 **Follow-up finding, same session:** the 2-round cap turned out insufficient — with a 4-tier dataset, the 3rd tier appeared as content but without its own expand icon (needed a real click on its own ancestor to reveal, one level deeper than the original repro). Root cause: under `startExpanded = Yes`, _every_ level defaults to `EXPANDED` (not just roots), so every level needs the same automatic preload treatment, not just a fixed 2 rounds. Fixed by replacing the 2-round cap with an unbounded, self-terminating cascade **gated specifically on `startExpanded === true`**: keep treating newly-arrived items as loaded-parents and fetching their children for as long as new descendants keep appearing, stopping naturally once a round finds nothing new (bounded by the tree's real depth, not an arbitrary count). Explicitly scoped to `startExpanded = true` only, per user decision — `startExpanded = false` keeps the original capped round1+round2 behavior unchanged (deeper tiers there already resolve correctly via a single real click, per group 6's fix; auto-cascading for still-collapsed branches would just be wasted eager-fetching of content the user hasn't opened).
- [x] 7.7 Updated the unit test from 7.4 to match: renamed/rewritten as an unbounded-cascade test asserting 3+ sequential levels each trigger exactly one more `setFilter` call as they arrive, and a repeated/empty delivery triggers none. Added a second test confirming `startExpanded = false` still caps at exactly 2 rounds (3rd-tier arrival triggers no further automatic call).
- [x] 7.8 Verified live again: rebuilt against `~/Documents/_tickets/WC-3564-2`. "Expanded bug" tab (4 levels of data) now shows all 4 tiers automatically on load, with `Third level 1a1` already showing its own expand icon with zero manual interaction — matching the exact screenshot the user originally showed as the expected/desired result. Re-ran the full rigorous Bug 1 / Bug 2 / group-6 / "Collapsed bug" (startExpanded=false, 2-round-cap) regression suite live — all still pass, no regressions.

## 8. Planning: fold in `tmp/treenode-fix1` (scope extension)

The parallel branch `tmp/treenode-fix1` (commits `76bfb5b94`, `362bbd396`) fixed two further v2 bugs plus a preload gap, rewriting the same two functions groups 1-7 rewrote. Folded into this change rather than merged separately — see `design.md` D4/D5 for why, and for the four collision points.

- [x] 8.1 Analysed the overlap between this change and `tmp/treenode-fix1`; identified four collisions (stored `LOADING` vs. restored state, the `items === undefined` guard, sibling ordering, and the `appendItems`/bootstrap-effect rewrites) and confirmed only the first and last need a design decision.
- [x] 8.2 Extended `proposal.md` (Why / What Changes / Capabilities / Impact) to cover the folded-in scope.
- [x] 8.3 Added `design.md` D4 (ordering + expansion-state survival, and why `resolveRestoredState` is dropped) and D5 (bootstrap effect restructure, `appendItems` reconciliation, known root-sweep gap), plus four new Risks entries.
- [x] 8.4 Added the `tree-node-data-refresh` capability spec (ordering, reload survival) and two requirements to `tree-node-expand-state` (late-arriving children restore the affordance; expansion state survives a rebuild).
- [x] 8.5 Removed the stale `Auto-expanded root nodes (startExpanded = Yes) — NOT YET IMPLEMENTED` requirement from `specs/tree-node-expand-state/spec.md`. It described the reverted first attempt from task 7.1 and directly contradicted the unbounded-cascade requirement three blocks above it, which task 7.6 delivered.
- [x] 8.6 Base the implementation branch on this change's branch (not on `tmp/treenode-fix1`) and re-apply the parallel branch's three behaviours as fresh commits — `git rebase` would conflict on both hooks, and collisions 1 and 4 are genuine rewrites rather than textual conflicts, so a rebase resolution would silently pick a shape neither design intended. Keep `tmp/treenode-fix1` intact as the reference.

## 9. Fifth finding: datasource sort order never re-applied (D4a)

- [x] 9.1 In `useIncrementalTreeData.ts`, build an `orderById` map from the current delivery (`getItemId(item) -> index`) alongside the existing `incomingIds` set.
- [x] 9.2 At the end of the update, sort `rootsRef.current` and every node's `children` by that order. Nodes absent from the current delivery sort to the end via `?? sourceItems.length`, keeping their relative order among themselves.
- [x] 9.3 Guard the per-node sort on `children.length > 1` so leaves and single-child nodes are skipped.
- [x] 9.4 Confirm sorting happens after all placement (including the out-of-order child-before-parent path) and before `setTreeData`, so a node placed late in the same pass is still ordered correctly.

## 10. Sixth finding: every node collapses on a datasource refresh (D4b)

- [x] 10.1 Return early from the effect when `items === undefined`, keeping the existing tree — instead of `items ?? []`, which made every known id look removed and tripped a rebuild behind the empty message. Verify the mid-load "no data available" flash is gone.
- [x] 10.2 Add a `statesByIdRef: Map<string, TreeNodeState>` and snapshot every node's `treeNodeState` into it immediately before the `configChanged || removedIdsDetected` rebuild clears the maps.
- [x] 10.3 On the node-creation branch, prefer the remembered state over the `startExpanded` default: `statesByIdRef.current.get(nodeId) ?? (config.startExpanded ? EXPANDED : COLLAPSED_WITH_JS)`.
- [x] 10.4 **Do not** port the parallel branch's `resolveRestoredState` helper. Its "nothing remembered" arm returns `TreeNodeState.LOADING`, which reintroduces WC-3564 Bug 1's exact mechanism (see task 1.1/1.2), and its "remembered is `LOADING`" arm is dead code after group 1. See `design.md` D4.
- [x] 10.5 Confirm the remembered state wins over `startExpanded` in both directions — a node collapsed by the user under "Start expanded" = Yes must come back collapsed.
- [x] 10.6 Leave `isConfigChanged`'s reference comparison as-is; rebuilding on prop-instance churn is correct once the rebuild is non-destructive, and `ListExpressionValue`/`ListReferenceValue` have no meaningful structural equality to compare instead.

## 11. Seventh finding: children arriving after an expand are never preloaded (D5)

- [x] 11.1 Add an `expandedIdsRef: Set<string>` to `useInfiniteTreeNode.ts`, populated in `appendItems` with the expanded node's id, and reset it in the `initializedRef` init block alongside `round1DoneRef`/`round2DoneRef`.
- [x] 11.2 Add the late-arrival sweep to the post-init effect: for each `datasource.items` entry not tracked in either map, if `getParentId(item, parentAssociation)` is in `expandedIdsRef`, add it to `loadedChildsByIdRef` and mark a refilter as needed.
- [x] 11.3 **Restructure the `startExpanded = false` path so round1 and round2 no longer `return`.** Replace their individual `setFilter` calls with a single `shouldRefilter` flag and one `setFilter` at the end of the pass; keep round1/round2 mutually exclusive (`else if`); run the sweep unconditionally after them. Without this, round1's early return swallows the sweep entirely — see `design.md` D5 for the concrete trace.
- [x] 11.4 Leave D3's `startExpanded = true` cascade untouched, including its early return — it already treats every newly-arrived item as a loaded parent, which subsumes the sweep for that mode.
- [x] 11.5 Add `parentAssociation` to the effect's dependency array (now read via `getParentId`) and import `getParentId` from `./helpers`.
- [x] 11.6 Keep group 6's `appendItems` shape, but add the parallel branch's `if (!loadedParentsByIdRef.current.has(childId))` guard to the child loop — without it a previously-expanded-then-collapsed child lands in both maps and duplicates a parent id in the preload filter.
- [x] 11.7 Note in review that roots are still never added to `expandedIdsRef` under `startExpanded = false`, so a child added to a _root_ after round2 locks in is not swept. Pre-existing in the parallel branch, deliberately out of scope — see `design.md` D5.

## 12. Test reconciliation

Both branches edited `useIncrementalTreeData.spec.ts` and `useInfiniteTreeNode.spec.ts`. The merged model changes what several tests can assert, so these are ported deliberately rather than concatenated.

- [x] 12.1 Port the parallel branch's three ordering tests (roots reordered, children reordered, expansion state preserved across a reorder). The third asserted `EXPANDED` only after a second render because nodes used to start in `LOADING`; under group 1 they are `EXPANDED` from the first render, so the extra `rerender` is now redundant rather than required.
- [x] 12.2 Port the parallel branch's four expansion-survival tests (reload with `items: undefined`, config-instance churn, item removal, user-collapsed node under `startExpanded: true`).
- [x] 12.3 Keep group 3's rewritten `LOADING` tests as the authority on node-creation state — do **not** restore the parallel branch's copies, which still assert `LOADING` on first render.
- [x] 12.4 Port the parallel branch's `requestedParentIds(setFilter)` helper and its `appendItems` preload tests, including the "does not ask for the same parent twice" test that asserts the filter's parent ids are a set (this is what task 11.6's guard protects).
- [x] 12.5 Port the two late-arrival tests. Confirm the first one — "pre-loads children that were not known when the node was expanded" — passes only after task 11.3's restructure; it is the test that fails on a naive merge, and it is the regression test for that specific collision.
- [x] 12.6 Re-run group 7.7's two cascade tests unchanged and confirm both still pass: `startExpanded = true` unbounded cascade, and `startExpanded = false` capped at exactly 2 rounds. The latter is the one at risk from task 11.3 — verify the sweep is a genuine no-op there (no `appendItems`, so `expandedIdsRef` is empty) rather than merely appearing to pass.
- [x] 12.7 Add `@mendix/widget-plugin-test-utils` to `devDependencies` and refresh `pnpm-lock.yaml`. `useInfiniteTreeNode.spec.ts` already imports it (and now needs `dynamic` as well as `listReference`); it resolved via hoisting only.
- [x] 12.8 Run the full package suite (`pnpm run test`) and confirm it is green, then `pnpm run lint`.

## 13. Live re-verification (mandatory — D5 changes `setFilter` timing)

Task 11.3 changes `setFilter` call timing and count in `useInfiniteTreeNode.ts`, which is exactly the category task 7.1 proved cannot be trusted on mocked unit tests alone. All four scenarios must be re-confirmed live against `~/Documents/_tickets/WC-3564-2` before this change is done.

- [ ] 13.1 Rebuild against the repro project and re-confirm WC-3564 Bug 1 (microflow datasource, "Start expanded" = Yes): fully expanded on load, zero `.widget-tree-node-loading-spinner` elements, no console errors.
- [ ] 13.2 Re-confirm WC-3564 Bug 2: expanding "Top level 2" leaves the sibling nodes' expand icons intact.
- [ ] 13.3 Re-confirm the "Expanded bug" tab's 4-tier cascade still resolves fully on load with no manual toggling.
- [ ] 13.4 Re-confirm the "Collapsed bug" tab (`startExpanded = false`): single-click expand still reveals a deeper tier's icon, and the restructured round1/round2/sweep pass does not over-fetch.
- [ ] 13.5 Verify the two newly-fixed bugs live: change a sequence attribute via a microflow and confirm the tree reorders without reopening the page; expand several nodes, trigger a refresh, and confirm they stay expanded and the tree does not flash the empty message.
- [x] 13.6 Verify D6 live on `treenodev2_advanced` (`http://localhost:8080/p/treenodev2_advanced`): select department Finance, and confirm `.mx-name-treeNode1` (`startExpanded = No`) shows `Sports` with a working expand icon revealing `Fitness Equipment`, and that `Tablets`/`Android` (children of the previous set's parents) are gone. Then switch to IT and back at least once more, confirming each switch behaves identically.

    **Confirmed.** Fresh load (HR): `treeNode1` shows `Electronics` with icon, clickable header and `aria-expanded="false"`, and `Phones` — one level past the visible root — already carries its own icon. After selecting Finance, `treeNode1` is exactly `Books` (no icon, genuinely childless — `treeNode2` under `startExpanded = Yes` shows none either) and `Sports` with `aria-expanded="false"`, an icon and a clickable header; clicking it expands to `Fitness Equipment`. No node from the previous set (`Electronics`/`Phones`/`Tablets`) remains. Switched Finance → HR → Finance → IT; every switch behaved identically. Zero spinners left on the page, no console errors or warnings.

- [x] 13.7 In the same session, confirm the retrieve does not accumulate: after several department switches and expands, the parent ids in the outgoing filter reflect only the current tree, not every set seen so far.

    **Confirmed** by hooking `window.fetch` and reading the `extraXpath` of every `runtimeOperation` across three consecutive switches. Per widget per switch the sequence is: one retrieve still carrying the _previous_ department's parent list (the app-level constraint changes before the widget can re-derive — unavoidable and harmless), then `[not(MyFirstModule.Category_Parent/MyFirstModule.Category)]` alone, then roots + one level (2 parent ids), then 3. The parent list resets to root-only on every switch instead of growing — the tree rebuild empties `treeData`, so the derived set falls back to `{undefined}` and re-derives from the new delivery. Four retrieves per widget per switch, steady across switches, bounded by the tree's depth rather than by history.

## 14. Changelog and domain notes

- [x] 14.1 Merge the parallel branch's three `CHANGELOG.md` entries into this change's existing `[Unreleased] / Fixed` block — user-visible behaviour only, no implementation details.
- [x] 14.2 Update `CONTEXT.md`: the `LOADING` section should state that expansion state is now remembered by id across rebuilds, and the preload section should describe the third mechanism (the late-arrival sweep) alongside `appendItems` and the bootstrap rounds, including why the round gates must not return early.
- [x] 14.3 Add a decisions-log entry to `CONTEXT.md` recording that `tmp/treenode-fix1` was folded into this change rather than merged separately, and that `resolveRestoredState` was deliberately dropped.

## 15. Eighth finding: the preload filter is frozen across a result-set replacement (D6)

Found live on `treenodev2_advanced` while verifying group 13: after a gallery department switch, every node in the `startExpanded = No` tree is permanently inert. Root cause is the mechanism groups 7 and 11 built — one-shot round flags plus never-pruned parent maps. Replaces that mechanism with a derived parent set rather than patching it with a "was the result set replaced?" detector. See `design.md` D6.

- [x] 15.1 Add a pure `deriveDesiredParentIds(treeData, deliveredIds, startExpanded)` helper to `hooks/helpers.ts`: walk from the roots, treat a node as visible when every ancestor is `EXPANDED` (roots always visible; under `startExpanded = true` every node qualifies), and collect `{undefined}` plus every visible node plus every child of a visible node. Intersect the result with `deliveredIds` so no node retained from an older delivery contributes.

    **Two deviations, both deliberate.** (a) The `startExpanded` parameter was dropped — the signature is `deriveDesiredParentIds(treeData, deliveredIds)`. `treeNodeState` already encodes it (nodes are created `EXPANDED` under `startExpanded = Yes`), so reading the prop again would double-source the same truth and let the two disagree after a user collapse. (b) Recursion continues through `COLLAPSED_WITH_CSS` as well as `EXPANDED`, not `EXPANDED` alone. Found while wiring it up: that state means the node was opened and then closed, so its subtree is still rendered (hidden by CSS). Recursing only through `EXPANDED` would shrink the derived set on a collapse, drop already-fetched grandchildren from the result set, trip the removed-ids rebuild, and leave the re-expanded node's children iconless — a new bug of exactly the reported kind. Walk order is BFS so the emitted ids read roots-first.

- [x] 15.2 Rewire `TreeNodeV2`: call `useIncrementalTreeData(props.datasource.items, treeConfig)` directly and pass the resulting `treeData` into the preload hook. The `items` passthrough out of `useInfiniteTreeNodes` (it returned `datasource.items` verbatim) goes away.
- [x] 15.3 Rewrite `useInfiniteTreeNode.ts` around the derived set: delete `loadedParentsByIdRef`, `loadedChildsByIdRef`, `expandedIdsRef`, `round1DoneRef` and `round2DoneRef`; add `lastAppliedParentIdsRef`; apply `setFilter` only when the derived set differs from it. Guards: skip entirely while `datasource.items` is `undefined`. (Landed as `lastAppliedKeyRef` — a sorted-id string key rather than a set, so the comparison is one `===`.)
- [x] 15.4 Keep the one-time `initializedRef` block exactly as-is — root-only filter when `startExpanded` is No, no filter at all when Yes. The asymmetry is load-bearing: the unfiltered first delivery returns a whole non-microflow table in one retrieve, and the set derived from it is immediately stable. Deriving from an empty tree instead would cost one retrieve per level.
- [x] 15.5 Replace `appendItems(newItem, children)` with an argument-less `syncPreloadFilter()`; update the click handler in `TreeNode.tsx` to call it after mutating `node.treeNodeState`. The expansion state it used to be passed is already on the node. (The collapse arm deliberately does not call it: `COLLAPSED_WITH_CSS` keeps the subtree rendered, so the derived set is unchanged.)
- [x] 15.6 Keep `getDatasourceFilter`'s single-vs-`or` shape, and keep `undefined` in the set unconditionally so true roots are always retrieved.
- [x] 15.7 Confirm by reading, not just by test, that the three mechanisms this deletes are genuinely subsumed: round1 = nothing expanded; round2 = the children-of-visible term; the late-arrival sweep = recomputation on the delivery that carries the late child. Any one of them not falling out of the rule means the rule is wrong, not that the flag should come back. **Confirmed**, and the `startExpanded = Yes` cascade too: every level is created `EXPANDED`, so each arriving level widens the visible set and the next derivation asks one level further — the same self-terminating walk, without a flag. Roots are covered by `{undefined}` plus the children-of-visible term, which also closes the sweep's documented "a child added to a root is never swept" gap, since roots no longer need to be registered as expanded for the lookahead to reach them.
- [x] 15.8 Remove the round1/round2/sweep comments from the hook; that reasoning now lives in `design.md` D3/D5/D6 as decision records, not in the code.
- [x] 15.9 Confirm no `LOADING` is reintroduced anywhere, and that `src/components/v1/` is untouched.
- [x] 15.10 `pnpm run test` and `pnpm run lint` in the package. (86/86 green; `tsc --noEmit` clean; auto-lint hook reported nothing.)

## 16. Test reconciliation for D6

- [x] 16.1 Unit-test `deriveDesiredParentIds` directly (it is pure): nothing expanded ⇒ roots + their children; one node expanded ⇒ plus that node's grandchildren; everything expanded ⇒ the whole delivered tree; an item whose parent is not delivered is _not_ counted as a root; ids absent from the delivery are excluded. (New file `hooks/__tests__/helpers.spec.ts`, 9 cases — the listed five plus `COLLAPSED_WITH_CSS` recursion, the `COLLAPSED_WITH_JS` stop, deduplication, and the empty tree.)
- [x] 16.2 Rewrite group 7.7's and 12.6's round-cap tests as derivation tests. The "`startExpanded = false` caps at exactly 2 rounds" test becomes "asks for roots plus one level and nothing further until a real expand" — same observable behaviour, no round counting.
- [x] 16.3 Keep the `startExpanded = true` unbounded-cascade test asserting the same observable outcome (each newly-arriving level triggers exactly one more `setFilter`, a repeated or empty delivery triggers none). Call counts (0, 0, 0, 1, 1, 2, 3, 3) are unchanged from the pre-D6 cascade test.
- [x] 16.4 Re-run groups 12.4 and 12.5 unchanged — the `appendItems` preload tests and both late-arrival tests. They must pass without modification beyond the `syncPreloadFilter` rename; they are the regression guarantee that D6 did not quietly drop D5's fix.

    **The "without modification" premise did not hold, and that was predictable rather than a warning sign.** Every _assertion_ in those tests survives verbatim (`[undefined, "root", "child"]`, `[undefined, "root", "child", "grandchild"]`, `[undefined, "leaf"]`, and both late-arrival tests' expectations), but their _setup_ had to change: the hook's input went from `props` alone to `(props, treeData)`, so a test that used to hand `appendItems` a node and its children now builds the tree that node would be in. The whole point of D6 is that the input is the tree, so a test cannot drive it without one. What matters for the guarantee — that the same observable filters come out — is intact.

    Two tests were dropped rather than ported, both because they asserted the old mechanism rather than the behaviour: "returns datasource items" (the hook no longer passes `items` through, task 15.2) and "does not add duplicate entries when same parent expanded twice", which asserted the `setFilter` call count _increases_ on a re-expand. Under D6 the key guard suppresses that call, which is the improvement 16.6 asserts; the deduplication it meant to check is covered directly in 16.1 and by "does not ask for the same parent twice".

- [x] 16.5 New test: deliver result set A, then a disjoint result set B, and assert the widget requests B's roots as parents. This is the reported bug's unit-level regression test, and it fails on the pre-D6 code. (Two tests: the single switch, plus three consecutive replacements behaving identically.)
- [x] 16.6 New test: a repeated identical delivery triggers zero further `setFilter` calls (the `lastAppliedParentIdsRef` guard, and the backstop against the explicit tree → filter → tree loop).
- [x] 16.7 New test: an id that leaves the delivery leaves the applied filter, and a node retained from an older delivery never contributes its (stale) object reference to the filter.
- [x] 16.8 Full package suite green, then lint. (95/95 across 6 suites; `tsc --noEmit` clean.)

## 17. Domain notes for D6

- [x] 17.1 Rewrite `CONTEXT.md`'s preload section (`useInfiniteTreeNode.ts`'s one-level-lookahead preload — content-gated, not fire-count-gated): the mechanism it describes no longer exists. State the derived rule, the root definition, and why deriving replaced logging. (Also corrected the `hasChildren` section's reference to the now-deleted `loadedChildsByIdRef`.)
- [x] 17.2 Add a decisions-log entry to `CONTEXT.md`: four bugs in this mechanism all traced to delivery-history state standing in for a derived fact, so the filter is now derived from the current tree. Note the rejected alternative (a result-set-replacement detector) and why. (Two entries: the replacement itself, and the dropped `startExpanded` parameter.)
- [x] 17.3 Check whether the existing `[Unreleased] / Fixed` changelog entries already cover the user-visible effect ("expand icons are correct after the tree's data is filtered or replaced"); add one if not. Behaviour only, no mechanism. **They did not** — the closest entry is about a child arriving late, which is a different cause. Added one about nodes having no expand icon after the data source is filtered elsewhere on the page. Also removed three entries that the branch fold had duplicated verbatim.
