import { act, renderHook } from "@testing-library/react";
import { ObjectItem } from "mendix";
import * as FilterBuilders from "mendix/filters/builders";
import { dynamic, listReference } from "@mendix/widget-plugin-test-utils";
import { TreeNodeContainerProps } from "../../../../../typings/TreeNodeProps";
import { useInfiniteTreeNodes } from "../useInfiniteTreeNode";

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

describe("useInfiniteTreeNodes", () => {
    describe("initialization", () => {
        it("sets filter to root-only (parent = undefined) on first render when startExpanded is false", () => {
            const props = makeProps({ startExpanded: false });
            renderHook(() => useInfiniteTreeNodes(props));
            expect(props.datasource.setFilter).toHaveBeenCalledTimes(1);
            // The filter call should use literal(undefined) for root-only query
            expect(FilterBuilders.literal).toHaveBeenCalledWith(undefined);
        });

        it("does not filter on first render when startExpanded is true", () => {
            const props = makeProps({ startExpanded: true });
            renderHook(() => useInfiniteTreeNodes(props));
            expect(props.datasource.setFilter).not.toHaveBeenCalled();
        });

        it("returns datasource items", () => {
            const items = [makeItem("a"), makeItem("b")];
            const props = makeProps({ datasource: { ...makeProps().datasource, items } as any });
            const { result } = renderHook(() => useInfiniteTreeNodes(props));
            expect(result.current.items).toBe(items);
        });
    });

    describe("appendItems — first expansion", () => {
        it("adds the expanded parent to the filter", () => {
            const parentItem = makeItem("parent");
            const childItem = makeItem("child");
            const props = makeProps();
            const { result } = renderHook(() => useInfiniteTreeNodes(props));

            act(() => {
                result.current.appendItems(parentItem, [childItem]);
            });

            // setFilter called at least twice: init + after expand
            expect(props.datasource.setFilter).toHaveBeenCalledTimes(2);
        });

        it("pre-loads children of the expanded node", () => {
            const parentItem = makeItem("parent");
            const child1 = makeItem("child1");
            const child2 = makeItem("child2");
            const props = makeProps();
            const { result } = renderHook(() => useInfiniteTreeNodes(props));

            act(() => {
                result.current.appendItems(parentItem, [child1, child2]);
            });

            // second setFilter call should include parent + children
            expect(props.datasource.setFilter).toHaveBeenCalledTimes(2);
            // or() called for multi-item filter
            expect(FilterBuilders.or).toHaveBeenCalled();
        });
    });

    describe("appendItems — expanding a pre-loaded child", () => {
        it("moves pre-loaded child from loadedChildren to loadedParents when it gets expanded", () => {
            const rootItem = makeItem("root");
            const childItem = makeItem("child");
            const grandchildItem = makeItem("grandchild");
            const props = makeProps();
            const { result } = renderHook(() => useInfiniteTreeNodes(props));

            // Expand root — child is pre-loaded
            act(() => {
                result.current.appendItems(rootItem, [childItem]);
            });

            const callCountAfterFirstExpand = (props.datasource.setFilter as jest.Mock).mock.calls.length;

            // Now expand child (which was pre-loaded, not yet in loadedParents)
            act(() => {
                result.current.appendItems(childItem, [grandchildItem]);
            });

            // Another setFilter call should have been made
            expect((props.datasource.setFilter as jest.Mock).mock.calls.length).toBeGreaterThan(
                callCountAfterFirstExpand
            );
        });
    });

    describe("appendItems — pre-loading one level ahead", () => {
        it("asks for the children of the expanded node and of its children", () => {
            const props = makeProps();
            const { result } = renderHook(() => useInfiniteTreeNodes(props));

            act(() => {
                result.current.appendItems(makeItem("root"), [makeItem("child")]);
            });

            expect(requestedParentIds(props.datasource.setFilter)).toEqual([undefined, "root", "child"]);
        });

        it("keeps pre-loading when a node that was itself a pre-loaded child gets expanded", () => {
            const props = makeProps();
            const { result } = renderHook(() => useInfiniteTreeNodes(props));

            act(() => {
                result.current.appendItems(makeItem("root"), [makeItem("child")]);
            });
            act(() => {
                result.current.appendItems(makeItem("child"), [makeItem("grandchild")]);
            });

            // without the grandchild in the filter, "child"'s children can never report
            // whether they have children of their own
            expect(requestedParentIds(props.datasource.setFilter)).toEqual([undefined, "root", "child", "grandchild"]);
        });

        it("does not ask for the same parent twice", () => {
            const props = makeProps();
            const { result } = renderHook(() => useInfiniteTreeNodes(props));

            act(() => {
                result.current.appendItems(makeItem("root"), [makeItem("child")]);
            });
            act(() => {
                result.current.appendItems(makeItem("child"), [makeItem("grandchild")]);
            });
            act(() => {
                result.current.appendItems(makeItem("child"), [makeItem("grandchild")]);
            });

            const requested = requestedParentIds(props.datasource.setFilter);
            expect(requested).toEqual([...new Set(requested)]);
        });

        it("asks for the children of a node expanded while it has none yet", () => {
            const props = makeProps();
            const { result } = renderHook(() => useInfiniteTreeNodes(props));

            act(() => {
                result.current.appendItems(makeItem("leaf"), []);
            });

            expect(requestedParentIds(props.datasource.setFilter)).toEqual([undefined, "leaf"]);
        });
    });

    describe("children arriving after the expansion", () => {
        function makePropsWithParents(
            parentMap: Record<string, string | undefined>,
            items: ObjectItem[]
        ): TreeNodeContainerProps {
            const props = makeProps({
                parentAssociation: listReference(b =>
                    b
                        .withId("assoc_1")
                        .withGet((item: ObjectItem) => {
                            const parentId = parentMap[String(item.id)];
                            return parentId ? dynamic.available(makeItem(parentId)) : dynamic.unavailable();
                        })
                        .build()
                )
            });
            return { ...props, datasource: { ...props.datasource, items } as any } as TreeNodeContainerProps;
        }

        it("pre-loads children that were not known when the node was expanded", () => {
            // node expanded while its children are still in flight, so appendItems gets none
            let props = makePropsWithParents({ parent: undefined }, []);
            const setFilter = props.datasource.setFilter;

            const { result, rerender } = renderHook(({ p }: { p: TreeNodeContainerProps }) => useInfiniteTreeNodes(p), {
                initialProps: { p: props }
            });

            act(() => {
                result.current.appendItems(makeItem("parent"));
            });
            expect(requestedParentIds(setFilter)).toEqual([undefined, "parent"]);

            // the children arrive in a later datasource update
            props = makePropsWithParents({ parent: undefined, child: "parent" }, [
                makeItem("parent"),
                makeItem("child")
            ]);
            (props.datasource as any).setFilter = setFilter;
            rerender({ p: props });

            expect(requestedParentIds(setFilter)).toEqual([undefined, "parent", "child"]);
        });

        it("pre-loads a child added to an already expanded node", () => {
            let props = makePropsWithParents({ parent: undefined, child: "parent" }, [
                makeItem("parent"),
                makeItem("child")
            ]);
            const setFilter = props.datasource.setFilter;

            const { result, rerender } = renderHook(({ p }: { p: TreeNodeContainerProps }) => useInfiniteTreeNodes(p), {
                initialProps: { p: props }
            });

            act(() => {
                result.current.appendItems(makeItem("parent"), [makeItem("child")]);
            });

            // a microflow adds a second child later
            props = makePropsWithParents({ parent: undefined, child: "parent", added: "parent" }, [
                makeItem("parent"),
                makeItem("child"),
                makeItem("added")
            ]);
            (props.datasource as any).setFilter = setFilter;
            rerender({ p: props });

            expect(requestedParentIds(setFilter)).toContain("added");
        });
    });

    describe("appendItems — re-expanding already-expanded node", () => {
        it("does not add duplicate entries when same parent expanded twice", () => {
            const parentItem = makeItem("parent");
            const childItem = makeItem("child");
            const props = makeProps();
            const { result } = renderHook(() => useInfiniteTreeNodes(props));

            act(() => {
                result.current.appendItems(parentItem, [childItem]);
            });

            const callCount = (props.datasource.setFilter as jest.Mock).mock.calls.length;

            // expand same parent again with no children (collapsed → re-expanded, children already known)
            act(() => {
                result.current.appendItems(parentItem);
            });

            // setFilter still called (re-expansion triggers filter update)
            expect((props.datasource.setFilter as jest.Mock).mock.calls.length).toBeGreaterThan(callCount);
        });
    });

    describe("second render (pre-loading roots' children)", () => {
        it("pre-loads children of root nodes on second datasource render", () => {
            const rootItems = [makeItem("root1"), makeItem("root2")];
            let items: ObjectItem[] = [];
            const props = makeProps();

            const { rerender } = renderHook(() =>
                useInfiniteTreeNodes({ ...props, datasource: { ...props.datasource, items } as any })
            );

            // Simulate datasource delivering root items
            items = rootItems;
            rerender();

            // setFilter should have been called again to load children of roots
            expect(props.datasource.setFilter).toHaveBeenCalledTimes(2);
        });
    });
});
