import { dynamic, list } from "@mendix/widget-plugin-test-utils";
import { GalleryContainerProps } from "../../typings/GalleryProps";

export function mockContainerProps(): GalleryContainerProps {
    return {
        class: "gallery-test-class",
        name: "gallery_1",
        tabIndex: 0,
        datasource: list(20),
        refreshInterval: 0,
        refreshIndicator: false,
        itemSelectionMode: "clear",
        keepSelection: false,
        selectionCountPosition: "bottom",
        desktopItems: 4,
        tabletItems: 3,
        phoneItems: 2,
        pageSize: 10,
        pagination: "buttons",
        showTotalCount: false,
        showPagingButtons: "auto",
        pagingPosition: "bottom",
        showEmptyPlaceholder: "none",
        onClickTrigger: "single",
        stateStorageType: "attribute",
        storeFilters: false,
        storeSort: false,
        useCustomPagination: false,
        selectAllTemplate: dynamic("%d items selected"),
        selectAllText: dynamic("Select all"),
        allSelectedText: dynamic("All items selected")
    };
}
