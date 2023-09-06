import { shallow, ShallowWrapper } from "enzyme";
import { createElement } from "react";
import { BasicItemsType, CustomItemsType } from "../../typings/PopupMenuProps";
import { Menu, MenuProps } from "../components/Menu";
import { actionValue, dynamicValue } from "../utils/attrValue";
import { ValueStatus } from "mendix";

jest.useFakeTimers();

const positionObserverValues = { top: 10, bottom: 20, left: 30, height: 1, width: 2 };
const usePositionMock = jest.fn(() => positionObserverValues);
jest.mock("@mendix/widget-plugin-hooks/usePositionObserver", () => ({
    usePositionObserver: () => usePositionMock()
}));

describe("Popup menu", () => {
    const createPopupMenu = (props: MenuProps): ShallowWrapper<MenuProps, {}> => shallow(createElement(Menu, props));
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
        position: "bottom",
        basicItems: [
            basicItemProps,
            { itemType: "divider", caption: dynamicValue("Caption"), styleClass: "defaultStyle" }
        ],
        customItems: [customItemProps],
        anchorElement: document.createElement("div"),
        onItemClick: jest.fn(),
        onCloseRequest: jest.fn()
    };

    it("renders popup menu", () => {
        const popupMenu = createPopupMenu(defaultProps);
        popupMenu.update();

        expect(popupMenu).toMatchSnapshot();
    });

    describe("with basic items", () => {
        it("renders", () => {
            const popupMenu = createPopupMenu(defaultProps);
            expect(popupMenu.find(".popupmenu-basic-item")).toHaveLength(1);
        });

        it("triggers action", () => {
            basicItemProps.action = actionValue();
            const popupMenu = createPopupMenu(defaultProps);
            const preventDefaultAction = jest.fn();
            const stopPropagationAction = jest.fn();
            const event: any = {
                preventDefault: preventDefaultAction,
                stopPropagation: stopPropagationAction,
                target: {}
            };
            popupMenu.find(".popupmenu-basic-item").prop("onClick")!(event);

            expect(stopPropagationAction).toHaveBeenCalled();
            expect(preventDefaultAction).toHaveBeenCalled();
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
            expect(popupMenu.find(".popupmenu-basic-item")).toHaveLength(0);
        });

        it("renders with style Inverse", () => {
            basicItemProps.styleClass = "inverseStyle";
            const popupMenu = createPopupMenu(defaultProps);

            expect(popupMenu.find(".popupmenu-basic-item-inverse")).toHaveLength(1);
        });
        it("renders with style Primary", () => {
            basicItemProps.styleClass = "primaryStyle";
            const popupMenu = createPopupMenu(defaultProps);

            expect(popupMenu.find(".popupmenu-basic-item-primary")).toHaveLength(1);
        });
        it("renders with style Info", () => {
            basicItemProps.styleClass = "infoStyle";
            const popupMenu = createPopupMenu(defaultProps);

            expect(popupMenu.find(".popupmenu-basic-item-info")).toHaveLength(1);
        });
        it("renders with style Success", () => {
            basicItemProps.styleClass = "successStyle";
            const popupMenu = createPopupMenu(defaultProps);

            expect(popupMenu.find(".popupmenu-basic-item-success")).toHaveLength(1);
        });
        it("renders with style Warning", () => {
            basicItemProps.styleClass = "warningStyle";
            const popupMenu = createPopupMenu(defaultProps);

            expect(popupMenu.find(".popupmenu-basic-item-warning")).toHaveLength(1);
        });
        it("renders with style Danger", () => {
            basicItemProps.styleClass = "dangerStyle";
            const popupMenu = createPopupMenu(defaultProps);

            expect(popupMenu.find(".popupmenu-basic-item-danger")).toHaveLength(1);
        });
    });

    describe("with custom items", () => {
        beforeEach(() => {
            defaultProps.advancedMode = true;
        });

        it("renders", () => {
            const popupMenu = createPopupMenu(defaultProps);

            expect(popupMenu.find(".popupmenu-custom-item")).toHaveLength(1);
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
            expect(popupMenu.find(".popupmenu-custom-item")).toHaveLength(0);
        });

        it("triggers action", () => {
            const popupMenu = createPopupMenu(defaultProps);
            const preventDefaultAction = jest.fn();
            const stopPropagationAction = jest.fn();
            const event: any = {
                preventDefault: preventDefaultAction,
                stopPropagation: stopPropagationAction,
                target: {}
            };
            popupMenu.find(".popupmenu-custom-item").prop("onClick")!(event);

            expect(stopPropagationAction).toHaveBeenCalled();
            expect(preventDefaultAction).toHaveBeenCalled();
            expect(defaultProps.onItemClick).toHaveBeenCalledTimes(1);
        });
    });
});
