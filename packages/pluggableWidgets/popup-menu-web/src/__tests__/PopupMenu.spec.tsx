import { render, RenderResult } from "@testing-library/react";
import { ValueStatus } from "mendix";
import { createElement } from "react";
import { BasicItemsType, CustomItemsType, PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { PopupMenu } from "../components/PopupMenu";
import { dynamicValue } from "../utils/attrValue";

import "@testing-library/jest-dom";

jest.useFakeTimers();

describe("Popup Menu", () => {
    const createPopupMenu = (props: PopupMenuContainerProps): RenderResult => render(<PopupMenu {...props} />);
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
        menuToggle: true,
        menuTrigger: createElement("button", null, "Trigger"),
        advancedMode: false,
        position: "bottom",
        hoverCloseOn: "onHoverLeave",
        basicItems: [
            basicItemProps,
            { itemType: "divider", caption: dynamicValue("Caption"), styleClass: "defaultStyle" }
        ],
        customItems: [customItemProps],
        clippingStrategy: "absolute"
    };

    it("renders popup menu", () => {
        const popupMenu = createPopupMenu(defaultProps);

        expect(popupMenu.asFragment()).toMatchSnapshot();
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
            const { container } = createPopupMenu({
                ...defaultProps,
                customItems: [customItem]
            });
            expect(container.querySelectorAll(".popupmenu-custom-item")).toHaveLength(0);
        });
    });
});
