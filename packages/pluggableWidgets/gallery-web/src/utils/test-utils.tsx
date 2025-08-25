import { ClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { PositionController } from "@mendix/widget-plugin-grid/keyboard-navigation/PositionController";
import { VirtualGridLayout } from "@mendix/widget-plugin-grid/keyboard-navigation/VirtualGridLayout";
import { getColumnAndRowBasedOnIndex, SelectActionHandler } from "@mendix/widget-plugin-grid/selection";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { list, listAction, objectItems } from "@mendix/widget-plugin-test-utils";
import { render, RenderResult } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { ObjectItem } from "mendix";
import { createElement } from "react";
import { GalleryContainerProps } from "../../typings/GalleryProps";
import { GalleryProps } from "../components/Gallery";
import { ItemEventsController } from "../features/item-interaction/ItemEventsController";
import { ItemHelper } from "../helpers/ItemHelper";
import { GalleryContext, GalleryRootScope } from "../helpers/root-context";
import { GalleryStore } from "../stores/GalleryStore";
import { ItemHelperBuilder } from "./builders/ItemHelperBuilder";

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

export function createMockGalleryContext(): GalleryRootScope {
    // Create minimal GalleryContainerProps for the store
    const mockContainerProps: GalleryContainerProps = {
        name: "gallery-test",
        class: "gallery-test-class",
        datasource: list(3),
        itemSelectionMode: "clear",
        desktopItems: 4,
        tabletItems: 3,
        phoneItems: 2,
        pageSize: 10,
        pagination: "buttons",
        showTotalCount: false,
        showPagingButtons: "always",
        pagingPosition: "bottom",
        showEmptyPlaceholder: "none",
        onClickTrigger: "single",
        stateStorageType: "localStorage",
        storeFilters: false,
        storeSort: false,
        refreshIndicator: false,
        keepSelection: false
    };

    // Create a proper gate provider and gate
    const gateProvider = new GateProvider(mockContainerProps);
    const gate = gateProvider.gate;

    // Create real GalleryStore instance
    const mockStore = new GalleryStore({
        gate,
        name: "gallery-test",
        pagination: "buttons",
        showPagingButtons: "always",
        showTotalCount: false,
        pageSize: 10,
        stateStorageType: "localStorage",
        storeFilters: false,
        storeSort: false,
        refreshIndicator: false
    });

    const mockSelectHelper = new SelectActionHandler("None", undefined);

    return {
        rootStore: mockStore,
        selectionHelper: undefined,
        itemSelectHelper: mockSelectHelper,
        selectionCountStore: mockStore.selectionCountStore
    };
}

export function withGalleryContext(component: React.ReactElement, context?: GalleryRootScope): React.ReactElement {
    const contextValue = context || createMockGalleryContext();
    return createElement(GalleryContext.Provider, { value: contextValue }, component);
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
        paging: true,
        paginationType: "buttons",
        showPagingButtons: "always",
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
        getPosition: (index: number) => getColumnAndRowBasedOnIndex(3, 3, index),
        showRefreshIndicator: false
    };
}
