import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ListValue, ObjectItem, ListAttributeValue } from "mendix";
import { createElement } from "react";
import { TreeNodeContainerProps } from "../../../../typings/TreeNodeProps";
import { TreeNodeV2 } from "../TreeNode";

describe("TreeNodeV2 - Keyboard Navigation", () => {
    const mockItem = (id: string, name: string): ObjectItem => ({
        id
    });

    const createMockListValue = (items: ObjectItem[]): ListValue => ({
        status: "available" as const,
        items,
        limit: 10,
        offset: 0,
        hasMoreItems: false,
        sortOrder: [],
        setLimit: jest.fn(),
        setOffset: jest.fn(),
        requestTotalCount: jest.fn(),
        totalCount: undefined
    });

    const createMockAttribute = (value: string): ListAttributeValue<string> => ({
        get: () => ({
            status: "available" as const,
            value,
            displayValue: value,
            readOnly: false,
            formatter: {
                format: (val: string) => val,
                withConfig: jest.fn().mockReturnThis()
            },
            setValue: jest.fn(),
            setTextInputValue: jest.fn(),
            setValidator: jest.fn()
        })
    });

    const defaultProps: TreeNodeContainerProps = {
        name: "treeNode",
        class: "",
        tabIndex: 0,
        headerType: "attribute",
        headerCaption: createMockAttribute("Root"),
        items: createMockListValue([mockItem("1", "Root")]),
        showIcon: "right",
        openNodeOn: "headerClick",
        animate: false,
        animateIcon: false,
        startExpanded: false
    };

    it("expands node when Enter key is pressed", () => {
        const items = [mockItem("1", "Parent")];
        const props: TreeNodeContainerProps = {
            ...defaultProps,
            items: createMockListValue(items),
            headerCaption: createMockAttribute("Parent")
        };

        render(createElement(TreeNodeV2, props));
        const treeItem = screen.getByRole("treeitem");

        expect(treeItem).toHaveAttribute("aria-expanded", "false");

        fireEvent.keyDown(treeItem, { key: "Enter" });

        expect(treeItem).toHaveAttribute("aria-expanded", "true");
    });

    it("expands node when Space key is pressed", () => {
        const items = [mockItem("1", "Parent")];
        const props: TreeNodeContainerProps = {
            ...defaultProps,
            items: createMockListValue(items),
            headerCaption: createMockAttribute("Parent")
        };

        render(createElement(TreeNodeV2, props));
        const treeItem = screen.getByRole("treeitem");

        expect(treeItem).toHaveAttribute("aria-expanded", "false");

        fireEvent.keyDown(treeItem, { key: " " });

        expect(treeItem).toHaveAttribute("aria-expanded", "true");
    });

    it("collapses expanded node when Enter key is pressed", () => {
        const items = [mockItem("1", "Parent")];
        const props: TreeNodeContainerProps = {
            ...defaultProps,
            items: createMockListValue(items),
            headerCaption: createMockAttribute("Parent"),
            startExpanded: true
        };

        render(createElement(TreeNodeV2, props));
        const treeItem = screen.getByRole("treeitem");

        expect(treeItem).toHaveAttribute("aria-expanded", "true");

        fireEvent.keyDown(treeItem, { key: "Enter" });

        expect(treeItem).toHaveAttribute("aria-expanded", "false");
    });

    it("expands node when ArrowRight is pressed on collapsed node", () => {
        const items = [mockItem("1", "Parent")];
        const props: TreeNodeContainerProps = {
            ...defaultProps,
            items: createMockListValue(items),
            headerCaption: createMockAttribute("Parent")
        };

        render(createElement(TreeNodeV2, props));
        const treeItem = screen.getByRole("treeitem");

        expect(treeItem).toHaveAttribute("aria-expanded", "false");

        fireEvent.keyDown(treeItem, { key: "ArrowRight" });

        expect(treeItem).toHaveAttribute("aria-expanded", "true");
    });

    it("collapses node when ArrowLeft is pressed on expanded node", () => {
        const items = [mockItem("1", "Parent")];
        const props: TreeNodeContainerProps = {
            ...defaultProps,
            items: createMockListValue(items),
            headerCaption: createMockAttribute("Parent"),
            startExpanded: true
        };

        render(createElement(TreeNodeV2, props));
        const treeItem = screen.getByRole("treeitem");

        expect(treeItem).toHaveAttribute("aria-expanded", "true");

        fireEvent.keyDown(treeItem, { key: "ArrowLeft" });

        expect(treeItem).toHaveAttribute("aria-expanded", "false");
    });

    it("does not respond to keyboard when node has no children", () => {
        const items = [mockItem("1", "Leaf")];
        const props: TreeNodeContainerProps = {
            ...defaultProps,
            items: createMockListValue(items),
            headerCaption: createMockAttribute("Leaf")
        };

        render(createElement(TreeNodeV2, props));
        const treeItem = screen.getByRole("treeitem");

        // Leaf nodes should not have aria-expanded attribute
        expect(treeItem).not.toHaveAttribute("aria-expanded");

        // Pressing keys should not cause errors
        fireEvent.keyDown(treeItem, { key: "Enter" });
        fireEvent.keyDown(treeItem, { key: " " });
        fireEvent.keyDown(treeItem, { key: "ArrowRight" });

        // Should still not have aria-expanded
        expect(treeItem).not.toHaveAttribute("aria-expanded");
    });

    it("prevents default behavior and stops propagation for handled keys", () => {
        const items = [mockItem("1", "Parent")];
        const props: TreeNodeContainerProps = {
            ...defaultProps,
            items: createMockListValue(items),
            headerCaption: createMockAttribute("Parent")
        };

        render(createElement(TreeNodeV2, props));
        const treeItem = screen.getByRole("treeitem");

        const event = {
            key: "Enter",
            currentTarget: treeItem,
            target: treeItem,
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        };

        fireEvent.keyDown(treeItem, event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("ignores keyboard events that bubble from child elements", () => {
        const items = [mockItem("1", "Parent")];
        const props: TreeNodeContainerProps = {
            ...defaultProps,
            items: createMockListValue(items),
            headerCaption: createMockAttribute("Parent"),
            startExpanded: true
        };

        render(createElement(TreeNodeV2, props));
        const treeItems = screen.getAllByRole("treeitem");
        const parentItem = treeItems[0];

        // Simulate a bubbled event from a child element
        const childElement = document.createElement("div");
        parentItem.appendChild(childElement);

        const event = new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true
        });

        Object.defineProperty(event, "currentTarget", {
            writable: false,
            value: parentItem
        });
        Object.defineProperty(event, "target", {
            writable: false,
            value: childElement
        });

        const initialState = parentItem.getAttribute("aria-expanded");
        fireEvent(childElement, event);

        // State should not change because event came from child
        expect(parentItem.getAttribute("aria-expanded")).toBe(initialState);
    });
});
