## Why

Tree Node v2 stores `LOADING` as a per-node state and resolves it via a broken heuristic: "this node's id reappeared in some later datasource delivery." A microflow datasource — which always redelivers its full flattened result and ignores `setFilter` — breaks that heuristic in two ways (WC-3564): a permanently stuck loading spinner when "Start expanded" is Yes, and a 3rd-tier node silently and permanently losing its expand icon when a sibling is expanded. Both share the same root cause and are fixed by the same change, hence one proposal covering both.

Manual verification of that fix surfaced two further, separate, pre-existing bugs in the same "preload one level ahead of what's expanded" mechanism (`useInfiniteTreeNode.ts`) — unrelated to `LOADING`/`hasChildren`, but bundled into this same change since they were found, understood, and fixed during the same verification pass: a node's first-ever expand didn't preload its own children's children (needed a collapse+re-expand of that same node to reveal a deeper tier), and the automatic root-expansion path for "Start expanded" = Yes had the same gap, recurring at every level. A first attempt at the second fix (a fixed 2-round cap) broke a live repro project and was reverted before being corrected; a second attempt fixed that but, against a deeper (4-tier) dataset, turned out to still be too shallow — every level defaults to expanded under "Start expanded" = Yes, not just roots, so a fixed round count can't be right at all. The final fix replaces the round cap with an unbounded, self-terminating cascade, scoped specifically to "Start expanded" = Yes. See `design.md` D3 for the full story, including the lesson that a fix here needs live verification against a real datasource, not just mocked unit tests.

Separately, a parallel branch (`tmp/treenode-fix1`) fixed two more pre-existing v2 bugs in `useIncrementalTreeData.ts`, both rooted in the same design as the bugs above — the hook builds its node map incrementally and reuses nodes across datasource updates: (a) a node is appended to `rootsRef`/`parent.children` only the first time its id is seen, so a new datasource sort order is never applied until the widget remounts; (b) a refresh throws the tree away and rebuilds it, and rebuilt nodes start collapsed, so every node collapses on refresh (and the tree briefly showed "no data available" while loading, because an undefined `items` was read as "all items removed"). It also extended the `appendItems` preload to cover children that arrive _after_ an expand. That branch is folded into this change rather than merged separately, because it rewrites the exact two functions this change already rewrites — reconciling them is a design decision, not a textual merge. See `design.md` D4 and D5.

## What Changes

- `LOADING` is no longer stored on a node at all. Nodes are created already resolved (`EXPANDED`/`COLLAPSED_WITH_JS` per `startExpanded`); the click-to-expand handler goes back to unconditionally setting `EXPANDED`.
- The spinner becomes a pure render-time decision: shown when a node has no known children yet (`node.children.length === 0`) **and** Mendix's own `datasource.status === ValueStatus.Loading` — a real, first-party "is this actually fetching right now" signal, not per-node bookkeeping.
- Expand-icon visibility for v2 stays derived from `node.children.length > 0` (unchanged from before this ticket) — **not** from the `hasChildren` widget property. `hasChildren` is hidden by Studio Pro and unset at runtime whenever `parentAssociation` is configured, which is every v2 instance; reading it crashes the widget (confirmed live during this change's implementation).
- `useInfiniteTreeNode.ts`'s `appendItems`: removed a gate that skipped preloading a node's grandchildren-existence on its first-ever expand (only ran from the second expand onward).
- `useInfiniteTreeNode.ts`'s bootstrap effect: when "Start expanded" is Yes, the preload now cascades level-by-level for as long as new descendants keep appearing (self-terminating once a level introduces nothing new) — matching every level defaulting to expanded in that mode. When "Start expanded" is No, the original capped round1+round2 behavior is unchanged (deeper tiers stay collapsed by default and already resolve correctly via a single real click).
- `useIncrementalTreeData.ts` re-applies the datasource order to `rootsRef` and to every node's `children` on every update, instead of only capturing order at first-sight of an id.
- `useIncrementalTreeData.ts` returns early when `items` is undefined, keeping the tree it already built while the datasource reloads — instead of reading undefined as an empty list, concluding every item was removed, and rebuilding from scratch behind the empty message.
- `useIncrementalTreeData.ts` remembers each node's expanded/collapsed state by id and restores it when a node is re-created during a rebuild, so the rebuilds this change cannot avoid (config-reference churn, item removal) no longer collapse the tree. The remembered state wins over the `startExpanded` default in both directions.
- `useInfiniteTreeNode.ts` tracks which nodes the user has expanded and preloads children that arrive after that expand — whether they were in flight at expand time or created later — so a node whose children arrive late still gets its expand affordance.
- `useInfiniteTreeNode.ts`'s bootstrap effect is restructured so the round1/round2 gates no longer return early: all three preload mechanisms (roots' children, one level past that, and late-arriving children of expanded nodes) run in the same pass and share a single `setFilter` call. See `design.md` D5 — without this, the round1 gate swallows the late-arrival sweep.
- Update `TreeNodeV2.spec.tsx`, `useIncrementalTreeData.spec.ts`, and `useInfiniteTreeNode.spec.ts` to cover the corrected behavior.
- Add `@mendix/widget-plugin-test-utils` as an explicit devDependency (already imported by `useInfiniteTreeNode.spec.ts`, previously resolved only via hoisting).

## Capabilities

### New Capabilities

- `tree-node-expand-state`: governs how a v2 tree node decides (a) whether it shows an expand affordance at all, (b) whether it shows a spinner in place of that affordance, and (c) whether it is expanded or collapsed — all independent of datasource re-delivery timing or datasource type (microflow vs. non-microflow).
- `tree-node-data-refresh`: governs how the v2 incremental tree map reacts to a datasource update — sibling and root ordering following the current datasource order, and the tree surviving a reload rather than being torn down and rebuilt.

### Modified Capabilities

(none — no existing `openspec/specs/` in this package prior to this change)

## Impact

- `src/components/v2/TreeNode.tsx` — icon-render condition now spinner-vs-chevron based on `datasource.status`; click handler simplified (no `LOADING` entry).
- `src/components/v2/hooks/useIncrementalTreeData.ts` — nodes created pre-resolved; no `LOADING` assignment anywhere in this file; new-node state falls back to a remembered per-id state before the `startExpanded` default; early return while `items` is undefined; datasource order re-applied to roots and to every node's children on every update.
- `src/components/v2/hooks/useInfiniteTreeNode.ts` — `appendItems`'s preload gate removed and its child loop deduplicated against already-known parents; expanded-node ids tracked; bootstrap effect's preload is an unbounded, content-gated cascade when `startExpanded` is Yes, and a restructured (no early return, single `setFilter`) round1 + round2 + late-arrival sweep when it's No.
- `typings/TreeNodeProps.d.ts` — no change.
- `package.json` / `pnpm-lock.yaml` — `@mendix/widget-plugin-test-utils` added as an explicit devDependency.
- `src/components/v2/__tests__/TreeNodeV2.spec.tsx`, `src/components/v2/hooks/__tests__/useIncrementalTreeData.spec.ts`, `src/components/v2/hooks/__tests__/useInfiniteTreeNode.spec.ts` — updated/added regression tests.
- No XML property changes. `hasChildren` remains untouched for v1. The v1 code path is unaffected throughout: it rebuilds from `datasource.items` on every update, so it never exhibited the ordering or expansion-state bugs either.
