import { fireEvent, render, RenderResult } from "@testing-library/react";
import { ValueStatus } from "mendix";
import { createElement } from "react";
import { MenuWithContext as Menu } from "./MenuWithContext";
import { BasicItemsType, CustomItemsType } from "../../typings/PopupMenuProps";
import { MenuProps } from "../components/Menu";
import { actionValue, dynamicValue } from "../utils/attrValue";

import "@testing-library/jest-dom";

jest.useFakeTimers();

const positionObserverValues = { top: 10, bottom: 20, left: 30, height: 1, width: 2 };
const usePositionMock = jest.fn(() => positionObserverValues);
jest.mock("@mendix/widget-plugin-hooks/usePositionObserver", () => ({
    usePositionObserver: () => usePositionMock()
}));

describe("Menu", () => {
    const createPopupMenu = (props: MenuProps): RenderResult => render(<Menu {...props} />);
    const basicItemProps: BasicItemsType = {
        itemType: "item",
        caption: dynamicValue("Caption"),
        styleClass: "defaultStyle"
    };
    const customItemProps: CustomItemsType = { content: createElement("div", null, null) };

    const defaultProps: MenuProps = {
        name: "popup-menu",
        class: "mx-popup-menu",
        tabIndex: -1,
        trigger: "onclick",
        menuToggle: false,
        menuTrigger: createElement("button", null, "Trigger"),
        advancedMode: false,
        hoverCloseOn: "onClickOutside",
        position: "bottom",
        basicItems: [
            basicItemProps,
            { itemType: "divider", caption: dynamicValue("Caption"), styleClass: "defaultStyle" }
        ],
        customItems: [customItemProps],
        onItemClick: jest.fn(),
        clippingStrategy: "absolute",
        listRef: { current: [] },
        activeIndex: 0
    };

    it("renders menu", () => {
        const popupMenu = createPopupMenu(defaultProps);
        popupMenu.rerender(<Menu {...defaultProps} />);

        expect(popupMenu.asFragment()).toMatchSnapshot();
    });

    describe("with basic items", () => {
        it("renders", () => {
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;
            popupMenu.rerender(<Menu {...defaultProps} />);

            expect(container.querySelectorAll(".popupmenu-basic-item")).toHaveLength(1);
        });

        it("triggers action", async () => {
            basicItemProps.action = actionValue();
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;

            await fireEvent.click(container.querySelector(".popupmenu-basic-item")!);

            expect(defaultProps.onItemClick).toHaveBeenCalledTimes(1);
        });

        it("renders basic items without hidden items", () => {
            const basicItem: BasicItemsType = {
                ...basicItemProps,
                visible: {
                    value: false,
                    status: ValueStatus.Available
                }
            };

            const popupMenu = createPopupMenu({
                ...defaultProps,
                basicItems: [
                    basicItem,
                    { itemType: "divider", caption: dynamicValue("Caption"), styleClass: "defaultStyle" }
                ]
            });
            const { container } = popupMenu;

            expect(container.querySelectorAll(".popupmenu-basic-item")).toHaveLength(0);
        });

        it("renders with style Inverse", () => {
            basicItemProps.styleClass = "inverseStyle";
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;

            expect(container.querySelectorAll(".popupmenu-basic-item-inverse")).toHaveLength(1);
        });
        it("renders with style Primary", () => {
            basicItemProps.styleClass = "primaryStyle";
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;

            expect(container.querySelectorAll(".popupmenu-basic-item-primary")).toHaveLength(1);
        });
        it("renders with style Info", () => {
            basicItemProps.styleClass = "infoStyle";
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;

            expect(container.querySelectorAll(".popupmenu-basic-item-info")).toHaveLength(1);
        });
        it("renders with style Success", () => {
            basicItemProps.styleClass = "successStyle";
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;

            expect(container.querySelectorAll(".popupmenu-basic-item-success")).toHaveLength(1);
        });
        it("renders with style Warning", () => {
            basicItemProps.styleClass = "warningStyle";
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;

            expect(container.querySelectorAll(".popupmenu-basic-item-warning")).toHaveLength(1);
        });
        it("renders with style Danger", () => {
            basicItemProps.styleClass = "dangerStyle";
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;

            expect(container.querySelectorAll(".popupmenu-basic-item-danger")).toHaveLength(1);
        });

        it("triggers action on Enter key press", async () => {
            basicItemProps.action = actionValue();
            basicItemProps.styleClass = "defaultStyle";
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;
            const firstItem = container.querySelector(".popupmenu-basic-item");

            expect(firstItem).not.toBeNull();
            await fireEvent.keyDown(firstItem!, { key: "Enter" });

            expect(defaultProps.onItemClick).toHaveBeenCalled();
        });

        it("triggers action on Space key press", async () => {
            basicItemProps.action = actionValue();
            basicItemProps.styleClass = "defaultStyle";
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;
            const firstItem = container.querySelector(".popupmenu-basic-item");

            expect(firstItem).not.toBeNull();
            await fireEvent.keyDown(firstItem!, { key: " " });

            expect(defaultProps.onItemClick).toHaveBeenCalled();
        });
    });

    describe("with custom items", () => {
        beforeEach(() => {
            defaultProps.advancedMode = true;
        });

        it("renders", () => {
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;

            expect(container.querySelectorAll(".popupmenu-custom-item")).toHaveLength(1);
        });

        it("renders custom items without hidden items", () => {
            const customItem: CustomItemsType = {
                ...customItemProps,
                visible: {
                    value: false,
                    status: ValueStatus.Available
                }
            };
            const popupMenu = createPopupMenu({
                ...defaultProps,
                customItems: [customItem]
            });
            const { container } = popupMenu;

            expect(container.querySelectorAll(".popupmenu-custom-item")).toHaveLength(0);
        });

        it("triggers action", async () => {
            const popupMenu = createPopupMenu(defaultProps);
            const { container } = popupMenu;

            await fireEvent.click(container.querySelector(".popupmenu-custom-item")!);

            expect(defaultProps.onItemClick).toHaveBeenCalledTimes(1);
        });
    });

    describe("keyboard accessibility - ARIA attributes", () => {
        it("renders first item with tabindex 0 when activeIndex is 0", () => {
            const freshBasicItem: BasicItemsType = {
                itemType: "item",
                caption: dynamicValue("Caption"),
                styleClass: "defaultStyle"
            };
            const testProps = {
                ...defaultProps,
                advancedMode: false, // Explicitly set to false to avoid pollution from previous tests
                basicItems: [freshBasicItem],
                activeIndex: 0
            };
            const popupMenu = createPopupMenu(testProps);
            const { container } = popupMenu;
            popupMenu.rerender(<Menu {...testProps} />);

            const firstItem = container.querySelector(".popupmenu-basic-item");

            expect(firstItem).toHaveAttribute("tabindex", "0");
        });

        it("renders second item with tabindex 0 when activeIndex is 1", () => {
            const testItem1: BasicItemsType = {
                itemType: "item",
                caption: dynamicValue("First"),
                styleClass: "defaultStyle"
            };
            const testItem2: BasicItemsType = {
                itemType: "item",
                caption: dynamicValue("Second"),
                styleClass: "defaultStyle"
            };
            const testProps = {
                ...defaultProps,
                advancedMode: false, // Explicitly set to false
                activeIndex: 1,
                basicItems: [testItem1, testItem2]
            };
            const popupMenu = createPopupMenu(testProps);
            const { container } = popupMenu;
            popupMenu.rerender(<Menu {...testProps} />);

            const items = container.querySelectorAll(".popupmenu-basic-item");

            expect(items[0]).toHaveAttribute("tabindex", "-1");
            expect(items[1]).toHaveAttribute("tabindex", "0");
        });

        it("renders basic menu items with role menuitem", () => {
            const freshBasicItem: BasicItemsType = {
                itemType: "item",
                caption: dynamicValue("Caption"),
                styleClass: "defaultStyle"
            };
            const testProps = {
                ...defaultProps,
                advancedMode: false, // Explicitly set to false
                basicItems: [freshBasicItem]
            };
            const popupMenu = createPopupMenu(testProps);
            const { container } = popupMenu;
            popupMenu.rerender(<Menu {...testProps} />);

            const menuItems = container.querySelectorAll(".popupmenu-basic-item");

            menuItems.forEach(item => {
                expect(item).toHaveAttribute("role", "menuitem");
            });
        });

        it("renders custom menu items with role menuitem", () => {
            const freshCustomItem: CustomItemsType = { content: createElement("div", null, null) };
            const testProps = {
                ...defaultProps,
                advancedMode: true,
                customItems: [freshCustomItem]
            };
            const popupMenu = createPopupMenu(testProps);
            const { container } = popupMenu;
            popupMenu.rerender(<Menu {...testProps} />);

            const menuItems = container.querySelectorAll(".popupmenu-custom-item");

            menuItems.forEach(item => {
                expect(item).toHaveAttribute("role", "menuitem");
            });
        });
    });
});
