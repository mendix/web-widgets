import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
    DynamicValue,
    GUID,
    ListExpressionValue,
    ListReferenceValue,
    ListValue,
    ObjectItem,
    ValueStatus
} from "mendix";
import { createElement } from "react";
import { TreeNodeContainerProps } from "../../../../typings/TreeNodeProps";
import { TreeNodeV2 } from "../TreeNode";

jest.mock("mendix/filters/builders", () => ({
    association: jest.fn(() => "assocExpr"),
    equals: jest.fn((a: unknown, b: unknown) => ({ type: "equals", a, b })),
    literal: jest.fn((v: unknown) => ({ type: "literal", v })),
    or: jest.fn((...args: unknown[]) => ({ type: "or", args }))
}));

const makeItem = (id: string): ObjectItem => ({ id: id as GUID });

const makeListValue = (items: ObjectItem[]): ListValue =>
    ({
        status: ValueStatus.Available,
        items,
        limit: 100,
        offset: 0,
        hasMoreItems: false,
        sortOrder: [],
        filter: undefined,
        setLimit: jest.fn(),
        setOffset: jest.fn(),
        setSortOrder: jest.fn(),
        requestTotalCount: jest.fn(),
        setFilter: jest.fn(),
        reload: jest.fn(),
        totalCount: undefined
    }) as unknown as ListValue;

const makeExpression = (value: string): ListExpressionValue<string> => ({
    get: (): DynamicValue<string> => ({ status: ValueStatus.Available, value })
});

const makeBoolExpression = (value: boolean): ListExpressionValue<boolean> => ({
    get: (): DynamicValue<boolean> => ({ status: ValueStatus.Available, value })
});

/**
 * Creates a ListReferenceValue mock where childId → parentId, all others → undefined.
 */
const makeParentAssociation = (childId: string, parentId: string): ListReferenceValue =>
    ({
        id: "parentAssoc",
        type: "Reference",
        get: (item: ObjectItem): DynamicValue<ObjectItem> => {
            if (String(item.id) === childId) {
                return { status: ValueStatus.Available, value: makeItem(parentId) };
            }
            return { status: ValueStatus.Available, value: undefined as unknown as ObjectItem };
        }
    }) as unknown as ListReferenceValue;

/**
 * Default props for tests that need a node with children.
 * `hasChildren` (not the datasource) is what drives aria-expanded; the
 * datasource's parent + child items exist so the expanded body actually renders content.
 */
const makeDefaultProps = (startExpanded = false): TreeNodeContainerProps => ({
    name: "treeNode",
    class: "",
    tabIndex: 0,
    advancedMode: false,
    datasource: makeListValue([makeItem("1"), makeItem("2")]),
    parentAssociation: makeParentAssociation("2", "1"),
    headerType: "text",
    headerCaption: makeExpression("Node"),
    hasChildren: makeBoolExpression(true),
    showIcon: "right",
    openNodeOn: "headerClick",
    animate: false,
    animateIcon: false,
    startExpanded
});

describe("TreeNodeV2 - Keyboard Navigation", () => {
    it("expands node when Enter key is pressed", () => {
        render(createElement(TreeNodeV2, makeDefaultProps(false)));
        const treeItem = screen.getAllByRole("treeitem")[0];

        expect(treeItem).toHaveAttribute("aria-expanded", "false");

        fireEvent.keyDown(treeItem, { key: "Enter" });

        expect(treeItem).toHaveAttribute("aria-expanded", "true");
    });

    it("expands node when Space key is pressed", () => {
        render(createElement(TreeNodeV2, makeDefaultProps(false)));
        const treeItem = screen.getAllByRole("treeitem")[0];

        expect(treeItem).toHaveAttribute("aria-expanded", "false");

        fireEvent.keyDown(treeItem, { key: " " });

        expect(treeItem).toHaveAttribute("aria-expanded", "true");
    });

    it("collapses expanded node when Enter key is pressed", () => {
        render(createElement(TreeNodeV2, makeDefaultProps(false)));
        const treeItem = screen.getAllByRole("treeitem")[0];

        // Expand first
        fireEvent.keyDown(treeItem, { key: "Enter" });
        expect(treeItem).toHaveAttribute("aria-expanded", "true");

        // Then collapse
        fireEvent.keyDown(treeItem, { key: "Enter" });
        expect(treeItem).toHaveAttribute("aria-expanded", "false");
    });

    it("expands node when ArrowRight is pressed on collapsed node", () => {
        render(createElement(TreeNodeV2, makeDefaultProps(false)));
        const treeItem = screen.getAllByRole("treeitem")[0];

        expect(treeItem).toHaveAttribute("aria-expanded", "false");

        fireEvent.keyDown(treeItem, { key: "ArrowRight" });

        expect(treeItem).toHaveAttribute("aria-expanded", "true");
    });

    it("collapses node when ArrowLeft is pressed on expanded node", () => {
        render(createElement(TreeNodeV2, makeDefaultProps(false)));
        const treeItem = screen.getAllByRole("treeitem")[0];

        // Expand first via ArrowRight
        fireEvent.keyDown(treeItem, { key: "ArrowRight" });
        expect(treeItem).toHaveAttribute("aria-expanded", "true");

        // Then collapse
        fireEvent.keyDown(treeItem, { key: "ArrowLeft" });
        expect(treeItem).toHaveAttribute("aria-expanded", "false");
    });

    it("does not respond to keyboard when node has no children", () => {
        const props: TreeNodeContainerProps = {
            ...makeDefaultProps(false),
            datasource: makeListValue([makeItem("1")]),
            parentAssociation: makeParentAssociation("__none__", "__none__"),
            hasChildren: makeBoolExpression(false)
        };

        render(createElement(TreeNodeV2, props));
        const treeItem = screen.getByRole("treeitem");

        expect(treeItem).not.toHaveAttribute("aria-expanded");

        fireEvent.keyDown(treeItem, { key: "Enter" });
        fireEvent.keyDown(treeItem, { key: " " });
        fireEvent.keyDown(treeItem, { key: "ArrowRight" });

        expect(treeItem).not.toHaveAttribute("aria-expanded");
    });

    it("prevents default behavior and stops propagation for handled keys", () => {
        render(createElement(TreeNodeV2, makeDefaultProps(false)));
        const treeItem = screen.getAllByRole("treeitem")[0];

        const preventDefaultSpy = jest.spyOn(Event.prototype, "preventDefault");
        const stopPropagationSpy = jest.spyOn(Event.prototype, "stopPropagation");

        fireEvent.keyDown(treeItem, { key: "Enter" });

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(stopPropagationSpy).toHaveBeenCalled();

        preventDefaultSpy.mockRestore();
        stopPropagationSpy.mockRestore();
    });

    it("ignores keyboard events that bubble from child elements", () => {
        render(createElement(TreeNodeV2, makeDefaultProps(true)));
        const treeItems = screen.getAllByRole("treeitem");
        const parentItem = treeItems[0];

        const childElement = document.createElement("div");
        parentItem.appendChild(childElement);

        const event = new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true
        });

        Object.defineProperty(event, "currentTarget", { writable: false, value: parentItem });
        Object.defineProperty(event, "target", { writable: false, value: childElement });

        const initialState = parentItem.getAttribute("aria-expanded");
        fireEvent(childElement, event);

        expect(parentItem.getAttribute("aria-expanded")).toBe(initialState);
    });
});

describe("TreeNodeV2 - Loading state (WC-3564 regressions)", () => {
    const spinner = (container: HTMLElement): Element | null =>
        container.querySelector(".widget-tree-node-loading-spinner");

    const makeListValueWithStatus = (items: ObjectItem[], status: ValueStatus): ListValue =>
        ({ ...makeListValue(items), status }) as unknown as ListValue;

    it("never shows a stuck spinner, even when the datasource keeps redelivering the same full item set (Bug 1)", () => {
        // "1" genuinely has a child ("2"), so its expand affordance should resolve immediately, not depend on a later delivery.
        const props: TreeNodeContainerProps = {
            ...makeDefaultProps(true),
            datasource: makeListValue([makeItem("1"), makeItem("2")]),
            parentAssociation: makeParentAssociation("2", "1")
        };

        const { container, rerender } = render(createElement(TreeNodeV2, props));
        expect(spinner(container)).toBeNull();
        expect(screen.getAllByRole("treeitem")[0]).toHaveAttribute("aria-expanded", "true");

        // Simulate a microflow datasource ignoring setFilter and redelivering
        // the exact same full result on a later render (new array reference).
        rerender(
            createElement(TreeNodeV2, {
                ...props,
                datasource: makeListValue([makeItem("1"), makeItem("2")])
            })
        );

        expect(spinner(container)).toBeNull();
        expect(screen.getAllByRole("treeitem")[0]).toHaveAttribute("aria-expanded", "true");
    });

    it("shows a spinner while the datasource is actually loading and no children are known yet", () => {
        const noParent = makeParentAssociation("__none__", "__none__");
        const props: TreeNodeContainerProps = {
            ...makeDefaultProps(false),
            datasource: makeListValueWithStatus([makeItem("1")], ValueStatus.Loading),
            parentAssociation: noParent
        };

        const { container } = render(createElement(TreeNodeV2, props));
        expect(spinner(container)).not.toBeNull();
        expect(screen.getByRole("treeitem")).not.toHaveAttribute("aria-expanded");
    });

    it("clears the spinner once the datasource settles, even if it turns out the node has no children", () => {
        const noParent = makeParentAssociation("__none__", "__none__");
        const props: TreeNodeContainerProps = {
            ...makeDefaultProps(false),
            datasource: makeListValueWithStatus([makeItem("1")], ValueStatus.Loading),
            parentAssociation: noParent
        };

        const { container, rerender } = render(createElement(TreeNodeV2, props));
        expect(spinner(container)).not.toBeNull();

        rerender(
            createElement(TreeNodeV2, {
                ...props,
                datasource: makeListValueWithStatus([makeItem("1")], ValueStatus.Available)
            })
        );

        expect(spinner(container)).toBeNull();
        expect(screen.getByRole("treeitem")).not.toHaveAttribute("aria-expanded");
    });

    it("resolving one node's children does not affect an unrelated sibling's spinner or state (Bug 2)", () => {
        const parentAssociation = makeParentAssociation("C", "A");
        const props: TreeNodeContainerProps = {
            ...makeDefaultProps(false),
            datasource: makeListValueWithStatus([makeItem("A"), makeItem("B")], ValueStatus.Loading),
            parentAssociation
        };

        const { container, rerender } = render(createElement(TreeNodeV2, props));
        const [nodeA, nodeB] = screen.getAllByRole("treeitem");
        expect(nodeA).not.toHaveAttribute("aria-expanded");
        expect(nodeB).not.toHaveAttribute("aria-expanded");
        // Both spin while nothing is known yet and the datasource is loading.
        expect(container.querySelectorAll(".widget-tree-node-loading-spinner")).toHaveLength(2);

        // The datasource settles, delivering a child for A only. B was never involved.
        rerender(
            createElement(TreeNodeV2, {
                ...props,
                datasource: makeListValueWithStatus(
                    [makeItem("A"), makeItem("B"), makeItem("C")],
                    ValueStatus.Available
                )
            })
        );

        const [nodeAAfter, nodeBAfter] = screen.getAllByRole("treeitem");
        expect(nodeAAfter).toHaveAttribute("aria-expanded", "false");
        expect(nodeAAfter.querySelector(".widget-tree-node-branch-header-icon-container")).not.toBeNull();
        // B has no children and the datasource is no longer loading — no icon, no spinner, untouched by A's resolution.
        expect(nodeBAfter).not.toHaveAttribute("aria-expanded");
        expect(nodeBAfter.querySelector(".widget-tree-node-branch-header-icon-container")).toBeNull();
        expect(container.querySelectorAll(".widget-tree-node-loading-spinner")).toHaveLength(0);
    });
});
