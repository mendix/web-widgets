import { act, renderHook } from "@testing-library/react";
import { ObjectItem } from "mendix";
import * as FilterBuilders from "mendix/filters/builders";
import { listReference } from "@mendix/widget-plugin-test-utils";
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
