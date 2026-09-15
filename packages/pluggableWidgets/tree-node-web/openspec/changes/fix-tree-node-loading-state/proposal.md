## Why

Tree Node v2 stores `LOADING` as a per-node state and resolves it via a broken heuristic: "this node's id reappeared in some later datasource delivery." A microflow datasource — which always redelivers its full flattened result and ignores `setFilter` — breaks that heuristic in two ways (WC-3564): a permanently stuck loading spinner when "Start expanded" is Yes, and a 3rd-tier node silently and permanently losing its expand icon when a sibling is expanded. Both share the same root cause and are fixed by the same change, hence one proposal covering both.

Manual verification of that fix surfaced two further, separate, pre-existing bugs in the same "preload one level ahead of what's expanded" mechanism (`useInfiniteTreeNode.ts`) — unrelated to `LOADING`/`hasChildren`, but bundled into this same change since they were found, understood, and fixed during the same verification pass: a node's first-ever expand didn't preload its own children's children (needed a collapse+re-expand of that same node to reveal a deeper tier), and the automatic root-expansion path for "Start expanded" = Yes had the same gap, recurring at every level. A first attempt at the second fix (a fixed 2-round cap) broke a live repro project and was reverted before being corrected; a second attempt fixed that but, against a deeper (4-tier) dataset, turned out to still be too shallow — every level defaults to expanded under "Start expanded" = Yes, not just roots, so a fixed round count can't be right at all. The final fix replaces the round cap with an unbounded, self-terminating cascade, scoped specifically to "Start expanded" = Yes. See `design.md` D3 for the full story, including the lesson that a fix here needs live verification against a real datasource, not just mocked unit tests.

## What Changes

- `LOADING` is no longer stored on a node at all. Nodes are created already resolved (`EXPANDED`/`COLLAPSED_WITH_JS` per `startExpanded`); the click-to-expand handler goes back to unconditionally setting `EXPANDED`.
- The spinner becomes a pure render-time decision: shown when a node has no known children yet (`node.children.length === 0`) **and** Mendix's own `datasource.status === ValueStatus.Loading` — a real, first-party "is this actually fetching right now" signal, not per-node bookkeeping.
- Expand-icon visibility for v2 stays derived from `node.children.length > 0` (unchanged from before this ticket) — **not** from the `hasChildren` widget property. `hasChildren` is hidden by Studio Pro and unset at runtime whenever `parentAssociation` is configured, which is every v2 instance; reading it crashes the widget (confirmed live during this change's implementation).
- `useInfiniteTreeNode.ts`'s `appendItems`: removed a gate that skipped preloading a node's grandchildren-existence on its first-ever expand (only ran from the second expand onward).
- `useInfiniteTreeNode.ts`'s bootstrap effect: when "Start expanded" is Yes, the preload now cascades level-by-level for as long as new descendants keep appearing (self-terminating once a level introduces nothing new) — matching every level defaulting to expanded in that mode. When "Start expanded" is No, the original capped round1+round2 behavior is unchanged (deeper tiers stay collapsed by default and already resolve correctly via a single real click).
- Update `TreeNodeV2.spec.tsx`, `useIncrementalTreeData.spec.ts`, and `useInfiniteTreeNode.spec.ts` to cover the corrected behavior.

## Capabilities

### New Capabilities

- `tree-node-expand-state`: governs how a v2 tree node decides (a) whether it shows an expand affordance at all, and (b) whether it shows a spinner in place of that affordance, independent of datasource re-delivery timing or datasource type (microflow vs. non-microflow).

### Modified Capabilities

(none — no existing `openspec/specs/` in this package prior to this change)

## Impact

- `src/components/v2/TreeNode.tsx` — icon-render condition now spinner-vs-chevron based on `datasource.status`; click handler simplified (no `LOADING` entry).
- `src/components/v2/hooks/useIncrementalTreeData.ts` — nodes created pre-resolved; no `LOADING` assignment anywhere in this file.
- `src/components/v2/hooks/useInfiniteTreeNode.ts` — `appendItems`'s preload gate removed; bootstrap effect's preload is now an unbounded, content-gated cascade when `startExpanded` is Yes, and unchanged (capped round1+round2) when it's No.
- `typings/TreeNodeProps.d.ts` — no change.
- `src/components/v2/__tests__/TreeNodeV2.spec.tsx`, `src/components/v2/hooks/__tests__/useIncrementalTreeData.spec.ts`, `src/components/v2/hooks/__tests__/useInfiniteTreeNode.spec.ts` — updated/added regression tests.
- No XML property changes. `hasChildren` remains untouched for v1 (unaffected by this change).
