import { createElement } from "react";
import { ClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { SelectActionHandler, getColumnAndRowBasedOnIndex } from "@mendix/widget-plugin-grid/selection";
import { listAction, objectItems } from "@mendix/widget-plugin-test-utils";
import { render, RenderResult } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { ObjectItem } from "mendix";
import { GalleryProps } from "../components/Gallery";
import { ItemEventsController } from "../features/item-interaction/ItemEventsController";
import { ItemHelper } from "../helpers/ItemHelper";
import { ItemHelperBuilder } from "./builders/ItemHelperBuilder";
import { PositionController } from "@mendix/widget-plugin-grid/keyboard-navigation/PositionController";
import { VirtualGridLayout } from "@mendix/widget-plugin-grid/keyboard-navigation/VirtualGridLayout";

export function setup(jsx: React.ReactElement): { user: UserEvent } & RenderResult {
    return {
        user: userEvent.setup(),
        ...render(jsx)
    };
}

export function mockItemHelperWithAction(execute: () => void): ItemHelper {
    return ItemHelperBuilder.sample(builder =>
        builder.withAction(
            listAction(mockAction => {
                const action = mockAction();
                action.execute = execute;
                return action;
            })
        )
    );
}

type Helpers = {
    selectHelper?: SelectActionHandler;
    actionHelper?: ClickActionHelper;
    focusController?: FocusTargetController;
    itemEventsController?: ItemEventsController;
};

type Mocks = {
    onClick?: ReturnType<typeof listAction>;
};

export function mockProps(params: Helpers & Mocks = {}): GalleryProps<ObjectItem> {
    const {
        onClick = undefined,
        selectHelper = new SelectActionHandler("None", undefined),
        actionHelper = new ClickActionHelper("single", onClick),
        focusController = new FocusTargetController(new PositionController(), new VirtualGridLayout(3, 4, 10)),
        itemEventsController = new ItemEventsController(
            item => ({
                item,
                selectionType: selectHelper.selectionType,
                selectionMode: "clear",
                clickTrigger: "single"
            }),
            selectHelper.onSelect,
            selectHelper.onSelectAll,
            actionHelper.onExecuteAction,
            focusController.dispatch,
            selectHelper.onSelectAdjacent,
            3
        )
    } = params;

    const itemHelper = ItemHelperBuilder.sample(builder => {
        if (onClick) {
            builder.withAction(onClick);
        }
    });

    return {
        hasMoreItems: false,
        page: 0,
        pageSize: 10,
        paging: false,
        phoneItems: 2,
        tabletItems: 3,
        desktopItems: 4,
        className: "my-gallery",
        ariaLabelListBox: "Mock props ListBox aria label",
        headerTitle: "Mock props header aria label",
        items: objectItems(3),
        itemHelper,
        selectHelper,
        showHeader: true,
        header: <input />,
        itemEventsController,
        focusController,
        getPosition: (index: number) => getColumnAndRowBasedOnIndex(3, 3, index)
    };
}
