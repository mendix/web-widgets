import { shallow, ShallowWrapper } from "enzyme";
import { createElement } from "react";
import { BasicItemsType, CustomItemsType, PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { PopupMenu } from "../components/PopupMenu";
import { dynamicValue } from "../utils/attrValue";
import { ValueStatus } from "mendix";

jest.useFakeTimers();

describe("Popup menu", () => {
    const createPopupMenu = (props: PopupMenuContainerProps): ShallowWrapper<PopupMenuContainerProps, {}> =>
        shallow(createElement(PopupMenu, props));
    const basicItemProps: BasicItemsType = {
        itemType: "item",
        caption: dynamicValue("Caption"),
        styleClass: "defaultStyle"
    };
    const customItemProps: CustomItemsType = { content: createElement("div", null, null) };

    const defaultProps: PopupMenuContainerProps = {
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
        customItems: [customItemProps]
    };

    it("renders popup menu", () => {
        const popupMenu = createPopupMenu(defaultProps);

        expect(popupMenu).toMatchSnapshot();
    });

    describe("with custom items", () => {
        beforeEach(() => {
            defaultProps.advancedMode = true;
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
    });
});
