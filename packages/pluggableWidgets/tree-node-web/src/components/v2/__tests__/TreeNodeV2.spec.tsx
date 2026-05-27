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

describe("TreeNodeV2 - Keyboard Navigation", () => {
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
     * Datasource contains parent + child; parentAssociation links child → parent.
     * This makes node.children.length > 0 so aria-expanded is rendered.
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
