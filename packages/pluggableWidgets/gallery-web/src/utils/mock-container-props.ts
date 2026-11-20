import { list } from "@mendix/widget-plugin-test-utils";
import { GalleryContainerProps, Translations } from "../../typings/GalleryProps";

/** English defaults of the Gallery system texts, as declared in Gallery.xml. */
export const defaultSystemTexts: { [K in keyof Translations]: string } = {
    filterSectionTitle: "Filters",
    emptyMessageTitle: "No items",
    ariaLabelListBox: "Gallery"
};

/** Mock of the `texts` prop that the Mendix runtime passes for system texts. */
export function mockTexts(overrides?: Partial<typeof defaultSystemTexts>): GalleryContainerProps["texts"] {
    const texts = { ...defaultSystemTexts, ...overrides };
    return {
        translate: (key, ..._params) => texts[key]
    };
}

export function mockContainerProps(): GalleryContainerProps {
    return {
        class: "gallery-test-class",
        name: "gallery_1",
        texts: mockTexts(),
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
        autoSelect: false,
        loadingType: "spinner"
    };
}
