import { act, renderHook } from "@testing-library/react";
import { ObjectItem } from "mendix";
import * as FilterBuilders from "mendix/filters/builders";
import { listReference } from "@mendix/widget-plugin-test-utils";
import { TreeNodeContainerProps } from "../../../../../typings/TreeNodeProps";
import { TreeNodeState } from "../../../common/TreeNodeState";
import { useInfiniteTreeNodes } from "../useInfiniteTreeNode";
import { TreeNodeV2DataItem } from "../useIncrementalTreeData";

jest.mock("mendix/filters/builders", () => ({
    association: jest.fn(() => "assocExpr"),
    equals: jest.fn((a: unknown, b: unknown) => ({ type: "equals", a, b })),
    literal: jest.fn((v: unknown) => ({ type: "literal", v })),
    or: jest.fn((...args: unknown[]) => ({ type: "or", args }))
}));

function makeItem(id: string): ObjectItem {
    return { id } as ObjectItem;
}

function makeSetFilter(): jest.Mock {
    return jest.fn();
}

/** Ids of the parents the last setFilter call asks children for. undefined means root level. */
function requestedParentIds(setFilter: unknown): Array<string | undefined> {
    const calls = (setFilter as jest.Mock).mock.calls;
    const read = (expression: any): Array<string | undefined> => {
        if (expression?.type === "or") {
            return expression.args.flatMap(read);
        }
        return [expression?.b?.v?.id];
    };
    return read(calls[calls.length - 1][0]);
}

interface NodeSpec {
    id: string;
    state?: TreeNodeState;
    children?: NodeSpec[];
    /**
     * Only for orphans: a node the datasource placed at root level because its parent was not
     * delivered. It renders as a root but is not one.
     */
    orphanOf?: string;
}

/** Builds the shape `useIncrementalTreeData` would have produced for these items. */
function makeTree(specs: NodeSpec[], parentId?: string): TreeNodeV2DataItem[] {
    return specs.map(spec => ({
        children: makeTree(spec.children ?? [], spec.id),
        id: spec.id,
        item: makeItem(spec.id),
        parentId: spec.orphanOf ?? parentId,
        treeNodeState: spec.state ?? TreeNodeState.COLLAPSED_WITH_JS,
        title: spec.id
    }));
}

/** Every item a delivery would carry for the given tree. */
function deliveryFor(nodes: TreeNodeV2DataItem[]): ObjectItem[] {
    return nodes.flatMap(node => [node.item, ...deliveryFor(node.children)]);
}

function makeProps(overrides: Partial<TreeNodeContainerProps> = {}): TreeNodeContainerProps {
    const setFilter = makeSetFilter();
    return {
        datasource: {
            status: "available" as any,
            items: [],
            setFilter,
            offset: 0,
            limit: 100,
            totalCount: 0,
            hasMoreItems: false,
            setLimit: jest.fn(),
            setOffset: jest.fn(),
            requestTotalCount: jest.fn(),
            sortOrder: [],
            filter: undefined,
            setSortOrder: jest.fn(),
            reload: jest.fn()
        } as any,
        parentAssociation: listReference(b => b.withId("assoc_1").build()),
        startExpanded: false,
        class: "",
        headerType: "text",
        headerCaption: undefined,
        headerContent: undefined,
        openNodeOn: "headerClick",
        showIcon: "right",
        animate: false,
        animateIcon: false,
        expandedIcon: undefined,
        collapsedIcon: undefined,
        children: undefined,
        style: undefined,
        tabIndex: 0,
        ...overrides
    } as unknown as TreeNodeContainerProps;
}

/** Renders the hook over a tree and its matching delivery, and syncs once as a click would. */
function renderWithTree(
    specs: NodeSpec[],
    overrides: Partial<TreeNodeContainerProps> = {}
): { props: TreeNodeContainerProps; sync: () => void } {
    const tree = makeTree(specs);
    const base = makeProps(overrides);
    const props = {
        ...base,
        datasource: { ...base.datasource, items: deliveryFor(tree) } as any
    } as TreeNodeContainerProps;

    const { result } = renderHook(() => useInfiniteTreeNodes(props, tree));

    return {
        props,
        sync: () => act(() => result.current.syncPreloadFilter())
    };
}

describe("useInfiniteTreeNodes", () => {
    describe("initialization", () => {
        it("sets filter to root-only (parent = undefined) on first render when startExpanded is false", () => {
            const props = makeProps({ startExpanded: false });
            renderHook(() => useInfiniteTreeNodes(props, []));
            expect(props.datasource.setFilter).toHaveBeenCalledTimes(1);
            // The filter call should use literal(undefined) for root-only query
            expect(FilterBuilders.literal).toHaveBeenCalledWith(undefined);
        });

        it("does not filter on first render when startExpanded is true", () => {
            const props = makeProps({ startExpanded: true });
            renderHook(() => useInfiniteTreeNodes(props, []));
            expect(props.datasource.setFilter).not.toHaveBeenCalled();
        });

        it("does not filter while the datasource is still loading", () => {
            const base = makeProps();
            const props = {
                ...base,
                datasource: { ...base.datasource, items: undefined } as any
            } as TreeNodeContainerProps;

            const { result, rerender } = renderHook(() => useInfiniteTreeNodes(props, []));
            act(() => result.current.syncPreloadFilter());
            rerender();

            // only the initial root-only filter
            expect(props.datasource.setFilter).toHaveBeenCalledTimes(1);
        });
    });

    describe("deriving the parent set — one level past what is rendered", () => {
        it("asks for the children of the expanded node and of its children", () => {
            const { props, sync } = renderWithTree([
                { id: "root", state: TreeNodeState.EXPANDED, children: [{ id: "child" }] }
            ]);

            sync();

            expect(requestedParentIds(props.datasource.setFilter)).toEqual([undefined, "root", "child"]);
        });

        it("keeps pre-loading when a node that was itself a pre-loaded child gets expanded", () => {
            const { props, sync } = renderWithTree([
                {
                    id: "root",
                    state: TreeNodeState.EXPANDED,
                    children: [{ id: "child", state: TreeNodeState.EXPANDED, children: [{ id: "grandchild" }] }]
                }
            ]);

            sync();

            // without the grandchild in the filter, "child"'s children can never report
            // whether they have children of their own
            expect(requestedParentIds(props.datasource.setFilter)).toEqual([undefined, "root", "child", "grandchild"]);
        });

        it("does not ask for the same parent twice", () => {
            const { props, sync } = renderWithTree([
                {
                    id: "root",
                    state: TreeNodeState.EXPANDED,
                    children: [{ id: "child", state: TreeNodeState.EXPANDED, children: [{ id: "grandchild" }] }]
                }
            ]);

            sync();
            sync();
            sync();

            const requested = requestedParentIds(props.datasource.setFilter);
            expect(requested).toEqual([...new Set(requested)]);
        });

        it("asks for the children of a node expanded while it has none yet", () => {
            const { props, sync } = renderWithTree([{ id: "leaf", state: TreeNodeState.EXPANDED }]);

            sync();

            expect(requestedParentIds(props.datasource.setFilter)).toEqual([undefined, "leaf"]);
        });

        it("does not look past a node that was never opened", () => {
            // "second" is one level past the visible root, so it is requested; "third" sits under a
            // node whose body was never rendered, so it is not.
            const { props, sync } = renderWithTree([
                { id: "root", children: [{ id: "second", children: [{ id: "third" }] }] }
            ]);

            sync();

            expect(requestedParentIds(props.datasource.setFilter)).toEqual([undefined, "root", "second"]);
        });

        it("issues no further request when the same set is derived again", () => {
            const { props, sync } = renderWithTree([
                { id: "root", state: TreeNodeState.EXPANDED, children: [{ id: "child" }] }
            ]);

            sync();
            const callCount = (props.datasource.setFilter as jest.Mock).mock.calls.length;
            sync();
            sync();

            expect(props.datasource.setFilter).toHaveBeenCalledTimes(callCount);
        });
    });

    describe("what the derived set deliberately excludes", () => {
        it("does not treat an item whose parent was not delivered as a root", () => {
            // "orphan" renders at root level because its parent is missing from the delivery, but
            // it is not a root, so its children are not requested — see design.md D6.
            const { props, sync } = renderWithTree([
                { id: "root", children: [{ id: "child" }] },
                { id: "orphan", orphanOf: "missing-parent", children: [{ id: "orphanChild" }] }
            ]);

            sync();

            const requested = requestedParentIds(props.datasource.setFilter);
            expect(requested).toEqual([undefined, "root", "child"]);
            expect(requested).not.toContain("orphan");
        });

        it("never puts a node the current delivery did not mention into the filter", () => {
            // The tree keeps nodes a delivery did not carry (data-refresh behaviour); their object
            // reference is from an older delivery and must not be used to request children.
            const tree = makeTree([
                { id: "root", state: TreeNodeState.EXPANDED, children: [{ id: "child" }, { id: "retained" }] }
            ]);
            const base = makeProps();
            const props = {
                ...base,
                datasource: { ...base.datasource, items: [makeItem("root"), makeItem("child")] } as any
            } as TreeNodeContainerProps;

            const { result } = renderHook(() => useInfiniteTreeNodes(props, tree));
            act(() => result.current.syncPreloadFilter());

            expect(requestedParentIds(props.datasource.setFilter)).toEqual([undefined, "root", "child"]);
        });
    });

    describe("collapsing", () => {
        it("keeps asking for a collapsed node's subtree, because it is still rendered", () => {
            // COLLAPSED_WITH_CSS means the node was opened and then closed: its body is still in the
            // DOM, hidden. Dropping its descendants from the filter would remove them from the tree
            // and leave them iconless when it is reopened.
            const { props, sync } = renderWithTree([
                {
                    id: "root",
                    state: TreeNodeState.COLLAPSED_WITH_CSS,
                    children: [{ id: "child", state: TreeNodeState.EXPANDED, children: [{ id: "grandchild" }] }]
                }
            ]);

            sync();

            expect(requestedParentIds(props.datasource.setFilter)).toEqual([undefined, "root", "child", "grandchild"]);
        });

        it("does not re-request anything when a collapsed node is expanded again", () => {
            const { props, sync } = renderWithTree([
                { id: "root", state: TreeNodeState.COLLAPSED_WITH_CSS, children: [{ id: "child" }] }
            ]);

            sync();
            const callCount = (props.datasource.setFilter as jest.Mock).mock.calls.length;

            // re-expanding restores EXPANDED, which the derivation already treated as rendered
            sync();

            expect(props.datasource.setFilter).toHaveBeenCalledTimes(callCount);
        });
    });

    describe("children arriving after the expansion", () => {
        it("pre-loads children that were not known when the node was expanded", () => {
            // node expanded while its children are still in flight, so the tree has none yet
            let tree = makeTree([{ id: "parent", state: TreeNodeState.EXPANDED }]);
            const base = makeProps();
            const setFilter = base.datasource.setFilter;
            const propsFor = (t: TreeNodeV2DataItem[]): TreeNodeContainerProps =>
                ({
                    ...base,
                    datasource: { ...base.datasource, items: deliveryFor(t), setFilter } as any
                }) as TreeNodeContainerProps;

            const { result, rerender } = renderHook(
                ({ t }: { t: TreeNodeV2DataItem[] }) => useInfiniteTreeNodes(propsFor(t), t),
                { initialProps: { t: tree } }
            );

            act(() => result.current.syncPreloadFilter());
            expect(requestedParentIds(setFilter)).toEqual([undefined, "parent"]);

            // the children arrive in a later datasource update
            tree = makeTree([{ id: "parent", state: TreeNodeState.EXPANDED, children: [{ id: "child" }] }]);
            rerender({ t: tree });

            expect(requestedParentIds(setFilter)).toEqual([undefined, "parent", "child"]);
        });

        it("pre-loads a child added to an already expanded node", () => {
            let tree = makeTree([{ id: "parent", state: TreeNodeState.EXPANDED, children: [{ id: "child" }] }]);
            const base = makeProps();
            const setFilter = base.datasource.setFilter;
            const propsFor = (t: TreeNodeV2DataItem[]): TreeNodeContainerProps =>
                ({
                    ...base,
                    datasource: { ...base.datasource, items: deliveryFor(t), setFilter } as any
                }) as TreeNodeContainerProps;

            const { rerender } = renderHook(
                ({ t }: { t: TreeNodeV2DataItem[] }) => useInfiniteTreeNodes(propsFor(t), t),
                { initialProps: { t: tree } }
            );

            // a microflow adds a second child later
            tree = makeTree([
                { id: "parent", state: TreeNodeState.EXPANDED, children: [{ id: "child" }, { id: "added" }] }
            ]);
            rerender({ t: tree });

            expect(requestedParentIds(setFilter)).toContain("added");
        });
    });

    describe("a replaced result set (WC-3564 follow-up)", () => {
        it("asks for the new roots' children after an app-level constraint replaces the result set", () => {
            // A gallery filtering the tree by department swaps the whole result set for a disjoint
            // one. Before this was derived, the filter stayed frozen at the first set's parents and
            // every new node was left with no expand affordance at all.
            let tree = makeTree([{ id: "oldRoot", children: [{ id: "oldChild" }] }]);
            const base = makeProps();
            const setFilter = base.datasource.setFilter;
            const propsFor = (t: TreeNodeV2DataItem[]): TreeNodeContainerProps =>
                ({
                    ...base,
                    datasource: { ...base.datasource, items: deliveryFor(t), setFilter } as any
                }) as TreeNodeContainerProps;

            const { rerender } = renderHook(
                ({ t }: { t: TreeNodeV2DataItem[] }) => useInfiniteTreeNodes(propsFor(t), t),
                { initialProps: { t: tree } }
            );
            rerender({ t: tree });
            expect(requestedParentIds(setFilter)).toEqual([undefined, "oldRoot", "oldChild"]);

            // department switched: an entirely different set of roots, none seen before
            tree = makeTree([{ id: "newRoot", children: [{ id: "newChild" }] }]);
            rerender({ t: tree });

            const requested = requestedParentIds(setFilter);
            expect(requested).toEqual([undefined, "newRoot", "newChild"]);
            expect(requested).not.toContain("oldRoot");
        });

        it("treats a second and third replacement exactly like the first", () => {
            const base = makeProps();
            const setFilter = base.datasource.setFilter;
            const propsFor = (t: TreeNodeV2DataItem[]): TreeNodeContainerProps =>
                ({
                    ...base,
                    datasource: { ...base.datasource, items: deliveryFor(t), setFilter } as any
                }) as TreeNodeContainerProps;

            const { rerender } = renderHook(
                ({ t }: { t: TreeNodeV2DataItem[] }) => useInfiniteTreeNodes(propsFor(t), t),
                { initialProps: { t: makeTree([{ id: "setA", children: [{ id: "childA" }] }]) } }
            );

            for (const name of ["setB", "setC", "setD"]) {
                const tree = makeTree([{ id: name, children: [{ id: `child-${name}` }] }]);
                rerender({ t: tree });
                expect(requestedParentIds(setFilter)).toEqual([undefined, name, `child-${name}`]);
            }
        });
    });

    describe("second render (pre-loading roots' children)", () => {
        it("pre-loads children of root nodes on second datasource render", () => {
            let tree: TreeNodeV2DataItem[] = [];
            const base = makeProps();
            const setFilter = base.datasource.setFilter;
            const propsFor = (t: TreeNodeV2DataItem[]): TreeNodeContainerProps =>
                ({
                    ...base,
                    datasource: { ...base.datasource, items: deliveryFor(t), setFilter } as any
                }) as TreeNodeContainerProps;

            const { rerender } = renderHook(
                ({ t }: { t: TreeNodeV2DataItem[] }) => useInfiniteTreeNodes(propsFor(t), t),
                { initialProps: { t: tree } }
            );

            // Simulate datasource delivering root items
            tree = makeTree([{ id: "root1" }, { id: "root2" }]);
            rerender({ t: tree });

            // setFilter should have been called again to load children of roots
            expect(setFilter).toHaveBeenCalledTimes(2);
        });
    });

    describe("cascading down the tree (WC-3564)", () => {
        function makeCascadeHarness(startExpanded: boolean): {
            setFilter: jest.Mock;
            deliver: (specs: NodeSpec[]) => void;
        } {
            const base = makeProps({ startExpanded });
            const setFilter = base.datasource.setFilter as jest.Mock;
            let tree: TreeNodeV2DataItem[] = [];
            const propsFor = (t: TreeNodeV2DataItem[]): TreeNodeContainerProps =>
                ({
                    ...base,
                    datasource: { ...base.datasource, items: deliveryFor(t), setFilter } as any
                }) as TreeNodeContainerProps;

            const { rerender } = renderHook(
                ({ t }: { t: TreeNodeV2DataItem[] }) => useInfiniteTreeNodes(propsFor(t), t),
                { initialProps: { t: tree } }
            );

            return {
                setFilter,
                deliver: specs => {
                    tree = makeTree(specs);
                    rerender({ t: tree });
                }
            };
        }

        const expanded = TreeNodeState.EXPANDED;

        it("keeps cascading level by level under startExpanded, and stops once nothing new arrives — never locking in on a transient empty delivery", () => {
            const { setFilter, deliver } = makeCascadeHarness(true);
            expect(setFilter).toHaveBeenCalledTimes(0); // startExpanded skips the initial root-only filter

            // Datasource stays empty across a few transient renders (still loading) — must not
            // call setFilter on empty data (this is exactly what broke live testing with a naive
            // fire-count-based cap instead of a content-based one).
            deliver([]);
            deliver([]);
            expect(setFilter).toHaveBeenCalledTimes(0);

            // Real root items arrive — cascades to fetch their children.
            deliver([
                { id: "root1", state: expanded },
                { id: "root2", state: expanded }
            ]);
            expect(setFilter).toHaveBeenCalledTimes(1);

            // An unchanged redelivery of the same roots must not trigger another call.
            deliver([
                { id: "root1", state: expanded },
                { id: "root2", state: expanded }
            ]);
            expect(setFilter).toHaveBeenCalledTimes(1);

            // Second tier arrives — cascades one level further automatically (no click involved).
            deliver([
                { id: "root1", state: expanded, children: [{ id: "second1", state: expanded }] },
                { id: "root2", state: expanded }
            ]);
            expect(setFilter).toHaveBeenCalledTimes(2);

            // Third tier arrives — keeps cascading (this is the exact scenario that was broken:
            // every level defaults to EXPANDED under startExpanded=true, so every level needs its
            // own affordance pre-checked, not just roots + one bonus level).
            deliver([
                {
                    id: "root1",
                    state: expanded,
                    children: [{ id: "second1", state: expanded, children: [{ id: "third1", state: expanded }] }]
                },
                { id: "root2", state: expanded }
            ]);
            expect(setFilter).toHaveBeenCalledTimes(3);

            // Nothing new this time (same set redelivered) — stops here, no further call.
            deliver([
                {
                    id: "root1",
                    state: expanded,
                    children: [{ id: "second1", state: expanded, children: [{ id: "third1", state: expanded }] }]
                },
                { id: "root2", state: expanded }
            ]);
            expect(setFilter).toHaveBeenCalledTimes(3);
        });

        it("stops one level past the roots when startExpanded is false — deeper tiers resolve via a real click", () => {
            const { setFilter, deliver } = makeCascadeHarness(false);
            expect(setFilter).toHaveBeenCalledTimes(1); // initial root-only filter

            deliver([{ id: "root1" }]);
            expect(setFilter).toHaveBeenCalledTimes(2);

            // one level past the visible roots
            deliver([{ id: "root1", children: [{ id: "second1" }] }]);
            expect(setFilter).toHaveBeenCalledTimes(3);

            // Third tier arriving must NOT trigger a further automatic round — unlike
            // startExpanded=true, deeper tiers here only resolve via a real click.
            deliver([{ id: "root1", children: [{ id: "second1", children: [{ id: "third1" }] }] }]);
            expect(setFilter).toHaveBeenCalledTimes(3);
        });
    });
});
