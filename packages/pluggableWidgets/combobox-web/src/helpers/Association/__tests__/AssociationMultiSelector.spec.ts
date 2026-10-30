import { ListValue } from "mendix";
import { list, ReferenceSetValueBuilder } from "@mendix/widget-plugin-test-utils";
import { allItems, associationMultiProps, itemA, itemB, itemC } from "../../__tests__/fixtures";
import { AssociationMultiSelector } from "../AssociationMultiSelector";

function createSelector(): AssociationMultiSelector {
    return new AssociationMultiSelector({ filterInputDebounceInterval: 200 });
}

function sortedList(direction: "asc" | "desc"): ListValue {
    const ds = list(allItems);
    (ds as { sortOrder: unknown }).sortOrder = [["captionAttr", direction]];
    return ds;
}

describe("AssociationMultiSelector", () => {
    it("exposes the selected ids in reference order", () => {
        const selector = createSelector();
        selector.updateProps(
            associationMultiProps({ attr: new ReferenceSetValueBuilder().withValue([itemB, itemA]).build() })
        );

        expect(selector.type).toBe("multi");
        expect(selector.status).toBe("available");
        expect(selector.currentId).toEqual([itemB.id, itemA.id]);
    });

    it("sorts the selected ids by caption following the datasource sort order", () => {
        const attr = new ReferenceSetValueBuilder().withValue([itemB, itemA]).build();

        const asc = createSelector();
        asc.updateProps(associationMultiProps({ attr, ds: sortedList("asc"), selectedItemsSorting: "caption" }));
        expect(asc.currentId).toEqual([itemA.id, itemB.id]);

        const desc = createSelector();
        desc.updateProps(associationMultiProps({ attr, ds: sortedList("desc"), selectedItemsSorting: "caption" }));
        expect(desc.currentId).toEqual([itemB.id, itemA.id]);
    });

    it("sorts descending by caption when the datasource has no sort order", () => {
        // Quirk: sortOrder is undefined without a datasource sort, and only "asc" sorts ascending.
        const selector = createSelector();
        selector.updateProps(
            associationMultiProps({
                attr: new ReferenceSetValueBuilder().withValue([itemA, itemB]).build(),
                selectedItemsSorting: "caption"
            })
        );

        expect(selector.options.sortOrder).toBeUndefined();
        expect(selector.currentId).toEqual([itemB.id, itemA.id]);
    });

    it("writes the selection to the reference set", () => {
        const attr = new ReferenceSetValueBuilder().withValue([itemA]).build();
        const selector = createSelector();
        selector.updateProps(associationMultiProps({ attr }));

        selector.setValue([itemA.id, itemB.id]);
        expect(attr.setValue).toHaveBeenLastCalledWith([itemA, itemB]);

        selector.setValue([]);
        expect(attr.setValue).toHaveBeenLastCalledWith([]);
    });

    it("hides selected options in row-click mode only", () => {
        const attr = new ReferenceSetValueBuilder().withValue([itemA]).build();

        const rowClick = createSelector();
        rowClick.updateProps(associationMultiProps({ attr, selectionMethod: "rowclick" }));
        expect(rowClick.getOptions()).toEqual([itemB.id, itemC.id, allItems[3].id]);

        const checkbox = createSelector();
        checkbox.updateProps(associationMultiProps({ attr, selectionMethod: "checkbox" }));
        expect(checkbox.getOptions()).toEqual(allItems.map(i => i.id));
    });

    it.each([
        ["none", [], "none"],
        ["some", [itemA], "some"],
        ["all", allItems, "all"]
    ] as const)("reports '%s' selected for the select-all checkbox", (_label, selected, expected) => {
        const selector = createSelector();
        selector.updateProps(
            associationMultiProps({ attr: new ReferenceSetValueBuilder().withValue([...selected]).build() })
        );

        expect(selector.isOptionsSelected()).toBe(expected);
    });

    it("reports 'some' when there are no options at all", () => {
        // Quirk: an empty option list with nothing selected reads as "some", not "none".
        const selector = createSelector();
        selector.updateProps(
            associationMultiProps({ attr: new ReferenceSetValueBuilder().withValue([]).build(), ds: list([]) })
        );

        expect(selector.isOptionsSelected()).toBe("some");
    });

    it("forces the boxes style for row click and for custom content", () => {
        const rowClick = createSelector();
        rowClick.updateProps(associationMultiProps({ selectedItemsStyle: "text", selectionMethod: "rowclick" }));
        expect(rowClick.selectedItemsStyle).toBe("boxes");

        const customContent = createSelector();
        customContent.updateProps(
            associationMultiProps({ selectedItemsStyle: "text", optionsSourceAssociationCustomContentType: "yes" })
        );
        expect(customContent.selectedItemsStyle).toBe("boxes");

        const plain = createSelector();
        plain.updateProps(associationMultiProps({ selectedItemsStyle: "text" }));
        expect(plain.selectedItemsStyle).toBe("text");
    });

    it("passes multi-select configuration through", () => {
        const selector = createSelector();
        selector.updateProps(
            associationMultiProps({
                selectAllButton: true,
                selectionMethod: "checkbox",
                selectedItemsSorting: "caption"
            })
        );

        expect(selector.selectAllButton).toBe(true);
        expect(selector.selectionMethod).toBe("checkbox");
        expect(selector.selectedItemsSorting).toBe("caption");
    });

    it("has no selection while the reference set is unavailable", () => {
        const selector = createSelector();
        selector.updateProps(
            associationMultiProps({ attr: new ReferenceSetValueBuilder().withValue([itemA]).isUnavailable().build() })
        );

        expect(selector.status).toBe("unavailable");
        expect(selector.clearable).toBe(false);
        // currentId is recomputed from the (unavailable) reference value after the base class clears it.
        expect(selector.currentId).toEqual([itemA.id]);
    });
});
