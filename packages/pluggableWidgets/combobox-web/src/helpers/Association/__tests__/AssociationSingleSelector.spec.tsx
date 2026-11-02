import { render } from "@testing-library/react";
import { ListValue } from "mendix";
import { dynamic, list, ListValueBuilder, listWidget, ReferenceValueBuilder } from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps } from "../../../../typings/ComboboxProps";
import {
    allItems,
    associationSingleProps,
    captionAttributeId,
    captions,
    itemA,
    itemB,
    itemC,
    itemD
} from "../../__tests__/fixtures";
import { createSelector as createHarness } from "../../__tests__/harness";
import { AssociationSingleSelector } from "../AssociationSingleSelector";

function createSelector(props: ComboboxContainerProps): AssociationSingleSelector {
    return createHarness<AssociationSingleSelector>(props).selector;
}

function unavailableList(): ListValue {
    return new ListValueBuilder().withItems(allItems).isUnavailable().build();
}

describe("AssociationSingleSelector", () => {
    describe("status and value", () => {
        it("exposes the bound value and flags once props are available", () => {
            const selector = createSelector(associationSingleProps({ clearable: true, loadingType: "skeleton" }));

            expect(selector.type).toBe("single");
            expect(selector.status).toBe("available");
            expect(selector.currentId).toBe(itemA.id);
            expect(selector.readOnly).toBe(false);
            expect(selector.clearable).toBe(true);
            expect(selector.validation).toBeUndefined();
        });

        it("exposes no value when the reference is empty", () => {
            const selector = createSelector(associationSingleProps({ attr: new ReferenceValueBuilder().build() }));

            expect(selector.status).toBe("available");
            expect(selector.currentId).toBeNull();
        });

        it("is unavailable while the reference is unavailable", () => {
            const selector = createSelector(
                associationSingleProps({ attr: new ReferenceValueBuilder().withValue(itemA).isUnavailable().build() })
            );

            expect(selector.status).toBe("unavailable");
            // Quirk: the single selector still mirrors the reference id while unavailable
            // (the base class clears it, the subclass overwrites it). Nothing renders in this status.
            expect(selector.currentId).toBe(itemA.id);
            expect(selector.clearable).toBe(false);
        });

        it("is unavailable while the datasource is unavailable", () => {
            const selector = createSelector(associationSingleProps({ ds: unavailableList() }));

            expect(selector.status).toBe("unavailable");
            expect(selector.clearable).toBe(false);
        });

        it("is unavailable when the empty-option text is unavailable or not configured", () => {
            const withUnavailable = createSelector(associationSingleProps({ emptyOptionText: dynamic.unavailable() }));
            expect(withUnavailable.status).toBe("unavailable");

            // Quirk: a missing emptyOptionText makes the whole selector unavailable.
            const withMissing = createSelector(associationSingleProps({ emptyOptionText: undefined }));
            expect(withMissing.status).toBe("unavailable");
        });

        it("reports 'loading' while the reference is loading", () => {
            const selector = createSelector(
                associationSingleProps({ attr: new ReferenceValueBuilder().isLoading().build() })
            );

            expect(selector.status).toBe("loading");
        });

        it("transitions from unavailable to available", () => {
            const { selector, setProps } = createHarness<AssociationSingleSelector>(
                associationSingleProps({ attr: new ReferenceValueBuilder().withValue(itemB).isUnavailable().build() })
            );
            expect(selector.status).toBe("unavailable");

            setProps(associationSingleProps({ attr: new ReferenceValueBuilder().withValue(itemB).build() }));

            expect(selector.status).toBe("available");
            expect(selector.currentId).toBe(itemB.id);
        });

        it("passes read-only and validation through", () => {
            const selector = createSelector(
                associationSingleProps({
                    attr: new ReferenceValueBuilder().withValue(itemA).isReadOnly().withValidation("Required").build()
                })
            );

            expect(selector.readOnly).toBe(true);
            expect(selector.validation).toBe("Required");
        });

        it("writes the selection to the reference", () => {
            const attr = new ReferenceValueBuilder().withValue(itemA).build();
            const selector = createSelector(associationSingleProps({ attr }));

            selector.setValue(itemC.id);
            expect(attr.setValue).toHaveBeenLastCalledWith(itemC);

            selector.setValue(null);
            expect(attr.setValue).toHaveBeenLastCalledWith(undefined);
        });
    });

    describe("captions", () => {
        it("resolves captions through the caption attribute", () => {
            const selector = createSelector(associationSingleProps({ captionType: "attribute" }));

            expect(selector.caption.get(itemB.id)).toBe("Banana");
            expect(selector.caption.get(null)).toBe("Select...");
            expect(selector.caption.get("unknown")).toBe("<...>");
            expect(selector.caption.emptyCaption).toBe("Select...");
        });

        it("resolves captions through the caption expression", () => {
            const selector = createSelector(associationSingleProps({ captionType: "expression" }));

            expect(selector.caption.get(itemB.id)).toBe("expr:Banana");
        });

        it("keeps a caption for a selected item that is not in the datasource page", () => {
            const selector = createSelector(
                associationSingleProps({
                    attr: new ReferenceValueBuilder().withValue(itemD).build(),
                    ds: list([itemA, itemB])
                })
            );

            expect(selector.currentId).toBe(itemD.id);
            expect(selector.options.getAll()).toEqual([itemA.id, itemB.id]);
            expect(selector.caption.get(itemD.id)).toBe("Date");
        });

        it("has no custom content without a custom-content widget", () => {
            const selector = createSelector(associationSingleProps());

            expect(selector.caption.customContent(itemA.id)).toBeUndefined();
            expect(selector.caption.get(itemA.id)).toBe("Apple");
        });

        it.each(["listItem", "yes"] as const)("exposes the custom content for '%s'", customContentType => {
            const selector = createSelector(
                associationSingleProps({
                    optionsSourceAssociationCustomContentType: customContentType,
                    optionsSourceAssociationCustomContent: listWidget(i => <b>{`custom ${captions[i.id]}`}</b>)
                })
            );

            expect(render(<>{selector.caption.customContent(itemA.id)}</>).container.textContent).toBe("custom Apple");
            expect(selector.caption.get(null)).toBe("Select...");
        });
    });

    describe("options and client-side filtering", () => {
        it("lists options in datasource order", () => {
            const selector = createSelector(associationSingleProps());

            expect(selector.options.getAll()).toEqual(allItems.map(i => i.id));
            expect(selector.options.status).toBe("available");
            expect(selector.options.hasMore).toBe(false);
            expect(selector.options.isLoading).toBe(false);
        });

        it.each([
            ["contains", "an", [itemB.id]],
            ["containsExact", "AN", [itemB.id]],
            ["startsWith", "ch", [itemC.id]],
            ["none", "zzz", allItems.map(i => i.id)]
        ] as const)("filters by caption with filterType '%s'", (filterType, term, expected) => {
            const selector = createSelector(associationSingleProps({ filterType }));

            selector.options.setSearchTerm(term);

            expect(selector.options.getAll()).toEqual(expected);
        });

        it("reports the datasource sort order", () => {
            const ds = new ListValueBuilder()
                .withItems(allItems)
                .withSortOrder([[captionAttributeId, "desc"]])
                .build();
            const selector = createSelector(associationSingleProps({ ds }));

            expect(selector.options.sortOrder).toBe("desc");
        });
    });

    describe("datasource limit", () => {
        it("removes the datasource limit when lazy loading is off", () => {
            const ds = list(allItems);
            createSelector(associationSingleProps({ ds, lazyLoading: false }));

            expect(ds.setLimit).toHaveBeenCalledWith(undefined);
        });

        it("requests no items while a datasource without lazy loading is loading", () => {
            const ds = new ListValueBuilder().withItems(allItems).isLoading().build();
            createSelector(associationSingleProps({ ds, lazyLoading: false }));

            expect(ds.setLimit).toHaveBeenCalledWith(0);
        });

        it("limits the datasource to zero items for a read-only control", () => {
            const ds = list(allItems);
            createSelector(
                associationSingleProps({
                    ds,
                    attr: new ReferenceValueBuilder().withValue(itemA).isReadOnly().build()
                })
            );

            expect(ds.setLimit).toHaveBeenCalledWith(0);
        });

        it("keeps the datasource limit when lazy loading is on and the limit is already right", () => {
            const ds = list(allItems);
            createSelector(associationSingleProps({ ds, lazyLoading: true }));

            expect(ds.setLimit).not.toHaveBeenCalled();
        });

        it("keeps the page limit while a lazy datasource is loading, and starts from nothing", () => {
            const loadingPage = new ListValueBuilder().withItems(allItems).withLimit(100).isLoading().build();
            createSelector(associationSingleProps({ ds: loadingPage, lazyLoading: true }));
            expect(loadingPage.setLimit).not.toHaveBeenCalled();

            const unpaged = new ListValueBuilder().withItems(allItems).withLimit(Infinity).isLoading().build();
            createSelector(associationSingleProps({ ds: unpaged, lazyLoading: true }));
            expect(unpaged.setLimit).toHaveBeenCalledWith(0);
        });

        it("filters on the client when captions come from an expression, even with lazy loading on", () => {
            const ds = list(allItems);
            const selector = createSelector(
                associationSingleProps({ ds, lazyLoading: true, captionType: "expression" })
            );

            expect(ds.setLimit).toHaveBeenCalledWith(undefined);
            selector.options.setSearchTerm("an");
            expect(selector.options.getAll()).toEqual([itemB.id]);
        });
    });

    describe("lazy loading", () => {
        function lazyList(limit: number, hasMore: boolean, loading = false): ListValue {
            const builder = new ListValueBuilder().withItems(allItems).withLimit(limit).withHasMore(hasMore);
            return (loading ? builder.isLoading() : builder).build();
        }

        it("loads the next page of 100 and reports loading until the datasource settles", () => {
            const ds = lazyList(100, true);
            const { selector, setProps } = createHarness<AssociationSingleSelector>(
                associationSingleProps({ ds, lazyLoading: true })
            );

            expect(selector.options.hasMore).toBe(true);
            selector.options.loadMore();

            expect(ds.setLimit).toHaveBeenCalledWith(200);
            expect(selector.options.isLoading).toBe(true);

            setProps(associationSingleProps({ ds: lazyList(100, true), lazyLoading: true }));
            expect(selector.options.isLoading).toBe(false);
        });

        it("does nothing on loadMore when there are no more items", () => {
            const ds = lazyList(100, false);
            const selector = createSelector(associationSingleProps({ ds, lazyLoading: true }));

            selector.options.loadMore();

            expect(ds.setLimit).not.toHaveBeenCalled();
        });

        it("reports loading while a lazy datasource is loading", () => {
            const ds = lazyList(100, true, true);
            const selector = createSelector(associationSingleProps({ ds, lazyLoading: true }));

            expect(selector.options.isLoading).toBe(true);
        });

        it("moves the search term to a debounced datasource filter instead of filtering client-side", () => {
            jest.useFakeTimers();
            try {
                const ds = lazyList(100, true);
                const selector = createSelector(associationSingleProps({ ds, lazyLoading: true }));

                selector.options.setSearchTerm("an");
                expect(selector.options.getAll()).toEqual(allItems.map(i => i.id));
                expect(ds.setFilter).not.toHaveBeenCalled();

                jest.advanceTimersByTime(200);
                expect(ds.setFilter).toHaveBeenCalledTimes(1);

                selector.options.setSearchTerm("");
                selector.options.getAll();
                jest.advanceTimersByTime(200);
                expect(ds.setFilter).toHaveBeenCalledTimes(2);
                expect(ds.setFilter).toHaveBeenLastCalledWith(undefined);
            } finally {
                jest.useRealTimers();
            }
        });
    });
});
