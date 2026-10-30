import { ListValue } from "mendix";
import { dynamic, list, ListValueBuilder, SelectionMultiValueBuilder } from "@mendix/widget-plugin-test-utils";
import { allItems, captionAttributeId, databaseMultiProps, itemA, itemB, itemC, itemD } from "../../__tests__/fixtures";
import { DatabaseMultiSelectionSelector } from "../DatabaseMultiSelectionSelector";

function createSelector(): DatabaseMultiSelectionSelector {
    return new DatabaseMultiSelectionSelector({ filterInputDebounceInterval: 200 });
}

function sortedList(direction: "asc" | "desc"): ListValue {
    return new ListValueBuilder()
        .withItems(allItems)
        .withSortOrder([[captionAttributeId, direction]])
        .build();
}

describe("DatabaseMultiSelectionSelector", () => {
    it("exposes the selected ids from the selection", () => {
        const selector = createSelector();
        selector.updateProps(
            databaseMultiProps({ selection: new SelectionMultiValueBuilder().withSelected([itemB, itemA]).build() })
        );

        expect(selector.type).toBe("multi");
        expect(selector.status).toBe("available");
        expect(selector.currentId).toEqual([itemB.id, itemA.id]);
        expect(selector.caption.get(itemB.id)).toBe("Banana");
    });

    it("sorts the selected ids by caption following the datasource sort order", () => {
        const selection = new SelectionMultiValueBuilder().withSelected([itemB, itemA]).build();

        const asc = createSelector();
        asc.updateProps(databaseMultiProps({ selection, ds: sortedList("asc"), selectedItemsSorting: "caption" }));
        expect(asc.currentId).toEqual([itemA.id, itemB.id]);

        const desc = createSelector();
        desc.updateProps(databaseMultiProps({ selection, ds: sortedList("desc"), selectedItemsSorting: "caption" }));
        expect(desc.currentId).toEqual([itemB.id, itemA.id]);
    });

    it("writes known ids as objects to the selection", () => {
        const selection = new SelectionMultiValueBuilder().withSelected([itemA]).build();
        const setSelection = jest.spyOn(selection, "setSelection");
        const selector = createSelector();
        selector.updateProps(databaseMultiProps({ selection }));

        selector.setValue([itemA.id, itemB.id]);

        expect(setSelection).toHaveBeenLastCalledWith([itemA, itemB]);
    });

    it("resolves an id that is in the selection but not in the loaded page", () => {
        const selection = new SelectionMultiValueBuilder().withSelected([itemC]).build();
        const setSelection = jest.spyOn(selection, "setSelection");
        const selector = createSelector();
        selector.updateProps(databaseMultiProps({ selection, ds: list([itemA, itemB]) }));

        selector.setValue([itemC.id, itemA.id]);

        expect(setSelection).toHaveBeenLastCalledWith([itemC, itemA]);
    });

    it("drops ids that are known nowhere and warns", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
        try {
            const selection = new SelectionMultiValueBuilder().withSelected([]).build();
            const setSelection = jest.spyOn(selection, "setSelection");
            const selector = createSelector();
            selector.updateProps(databaseMultiProps({ selection }));

            selector.setValue(["nope", itemA.id]);

            expect(setSelection).toHaveBeenLastCalledWith([itemA]);
            expect(warn).toHaveBeenCalledTimes(1);
        } finally {
            warn.mockRestore();
        }
    });

    it("hides selected options in row-click mode only", () => {
        const selection = new SelectionMultiValueBuilder().withSelected([itemA]).build();

        const rowClick = createSelector();
        rowClick.updateProps(databaseMultiProps({ selection, selectionMethod: "rowclick" }));
        expect(rowClick.getOptions()).toEqual([itemB.id, itemC.id, itemD.id]);

        const checkbox = createSelector();
        checkbox.updateProps(databaseMultiProps({ selection, selectionMethod: "checkbox" }));
        expect(checkbox.getOptions()).toEqual(allItems.map(i => i.id));
    });

    it.each([
        ["none", [], "none"],
        ["some", [itemA], "some"],
        ["all", allItems, "all"]
    ] as const)("reports '%s' selected for the select-all checkbox", (_label, selected, expected) => {
        const selector = createSelector();
        selector.updateProps(
            databaseMultiProps({ selection: new SelectionMultiValueBuilder().withSelected([...selected]).build() })
        );

        expect(selector.isOptionsSelected()).toBe(expected);
    });

    it("does not force the boxes style for row click or custom content", () => {
        // Quirk: unlike the association selector, the props value wins over the forcing rule here,
        // because the rule runs before the props are copied.
        const rowClick = createSelector();
        rowClick.updateProps(databaseMultiProps({ selectedItemsStyle: "text", selectionMethod: "rowclick" }));
        rowClick.updateProps(databaseMultiProps({ selectedItemsStyle: "text", selectionMethod: "rowclick" }));
        expect(rowClick.selectedItemsStyle).toBe("text");

        const customContent = createSelector();
        customContent.updateProps(
            databaseMultiProps({ selectedItemsStyle: "text", optionsSourceDatabaseCustomContentType: "yes" })
        );
        customContent.updateProps(
            databaseMultiProps({ selectedItemsStyle: "text", optionsSourceDatabaseCustomContentType: "yes" })
        );
        expect(customContent.selectedItemsStyle).toBe("text");
    });

    it("passes configuration through and keeps the selection across reloads", () => {
        const selection = new SelectionMultiValueBuilder().withSelected([itemA]).build();
        const keep = jest.spyOn(selection, "setKeepSelection");
        const selector = createSelector();
        selector.updateProps(
            databaseMultiProps({
                selection,
                selectAllButton: true,
                selectedItemsSorting: "caption",
                clearable: true,
                optionsSourceDatabaseCustomContentType: "listItem",
                lazyLoading: true,
                loadingType: "skeleton"
            })
        );

        expect(keep).toHaveBeenCalledTimes(1);
        expect(selector.selectAllButton).toBe(true);
        expect(selector.selectedItemsSorting).toBe("caption");
        expect(selector.clearable).toBe(true);
        expect(selector.customContentType).toBe("listItem");
        expect(selector.lazyLoading).toBe(true);
        expect(selector.loadingType).toBe("skeleton");
        expect(selector.readOnly).toBe(false);
    });

    it("removes the datasource limit when lazy loading is off", () => {
        const ds = list(allItems);
        const selector = createSelector();
        selector.updateProps(databaseMultiProps({ ds, lazyLoading: false }));

        expect(ds.setLimit).toHaveBeenCalledWith(undefined);
    });

    it("is unavailable while the datasource or the empty-option text is unavailable", () => {
        const ds = new ListValueBuilder().withItems(allItems).isUnavailable().build();
        const noDatasource = createSelector();
        noDatasource.updateProps(databaseMultiProps({ ds }));
        expect(noDatasource.status).toBe("unavailable");
        expect(noDatasource.currentId).toBeNull();
        expect(noDatasource.clearable).toBe(false);

        const noEmptyText = createSelector();
        noEmptyText.updateProps(databaseMultiProps({ emptyOptionText: dynamic.unavailable() }));
        expect(noEmptyText.status).toBe("unavailable");
    });
});
