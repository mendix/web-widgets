import { render } from "@testing-library/react";
import { ListValue } from "mendix";
import { dynamic, list, ListValueBuilder, listWidget, ReferenceValueBuilder } from "@mendix/widget-plugin-test-utils";
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
import { AssociationSingleSelector } from "../AssociationSingleSelector";

function createSelector(): AssociationSingleSelector {
    return new AssociationSingleSelector({ filterInputDebounceInterval: 200 });
}

function unavailableList(): ListValue {
    return new ListValueBuilder().withItems(allItems).isUnavailable().build();
}

describe("AssociationSingleSelector", () => {
    describe("status and value", () => {
        it("exposes the bound value and flags once props are available", () => {
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ clearable: true, loadingType: "skeleton" }));

            expect(selector.type).toBe("single");
            expect(selector.status).toBe("available");
            expect(selector.currentId).toBe(itemA.id);
            expect(selector.readOnly).toBe(false);
            expect(selector.clearable).toBe(true);
            expect(selector.validation).toBeUndefined();
            expect(selector.customContentType).toBe("no");
            expect(selector.loadingType).toBe("skeleton");
        });

        it("exposes no value when the reference is empty", () => {
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ attr: new ReferenceValueBuilder().build() }));

            expect(selector.status).toBe("available");
            expect(selector.currentId).toBeNull();
        });

        it("is unavailable while the reference is unavailable", () => {
            const selector = createSelector();
            selector.updateProps(
                associationSingleProps({ attr: new ReferenceValueBuilder().withValue(itemA).isUnavailable().build() })
            );

            expect(selector.status).toBe("unavailable");
            // Quirk: the single selector still mirrors the reference id while unavailable
            // (the base class clears it, the subclass overwrites it). Nothing renders in this status.
            expect(selector.currentId).toBe(itemA.id);
            expect(selector.clearable).toBe(false);
        });

        it("is unavailable while the datasource is unavailable", () => {
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ ds: unavailableList() }));

            expect(selector.status).toBe("unavailable");
            expect(selector.clearable).toBe(false);
        });

        it("is unavailable when the empty-option text is unavailable or not configured", () => {
            const withUnavailable = createSelector();
            withUnavailable.updateProps(associationSingleProps({ emptyOptionText: dynamic.unavailable() }));
            expect(withUnavailable.status).toBe("unavailable");

            // Quirk: a missing emptyOptionText makes the whole selector unavailable.
            const withMissing = createSelector();
            withMissing.updateProps(associationSingleProps({ emptyOptionText: undefined }));
            expect(withMissing.status).toBe("unavailable");
        });

        it("reports 'loading' while the reference is loading", () => {
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ attr: new ReferenceValueBuilder().isLoading().build() }));

            expect(selector.status).toBe("loading");
        });

        it("transitions from unavailable to available", () => {
            const selector = createSelector();
            selector.updateProps(
                associationSingleProps({ attr: new ReferenceValueBuilder().withValue(itemB).isUnavailable().build() })
            );
            expect(selector.status).toBe("unavailable");

            selector.updateProps(
                associationSingleProps({ attr: new ReferenceValueBuilder().withValue(itemB).build() })
            );

            expect(selector.status).toBe("available");
            expect(selector.currentId).toBe(itemB.id);
        });

        it("passes read-only and validation through", () => {
            const selector = createSelector();
            selector.updateProps(
                associationSingleProps({
                    attr: new ReferenceValueBuilder().withValue(itemA).isReadOnly().withValidation("Required").build()
                })
            );

            expect(selector.readOnly).toBe(true);
            expect(selector.validation).toBe("Required");
        });

        it("writes the selection to the reference", () => {
            const attr = new ReferenceValueBuilder().withValue(itemA).build();
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ attr }));

            selector.setValue(itemC.id);
            expect(attr.setValue).toHaveBeenLastCalledWith(itemC);

            selector.setValue(null);
            expect(attr.setValue).toHaveBeenLastCalledWith(undefined);
        });
    });

    describe("captions", () => {
        it("resolves captions through the caption attribute", () => {
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ captionType: "attribute" }));

            expect(selector.caption.get(itemB.id)).toBe("Banana");
            expect(selector.caption.get(null)).toBe("Select...");
            expect(selector.caption.get("unknown")).toBe("<...>");
            expect(selector.caption.emptyCaption).toBe("Select...");
        });

        it("resolves captions through the caption expression", () => {
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ captionType: "expression" }));

            expect(selector.caption.get(itemB.id)).toBe("expr:Banana");
        });

        it("keeps a caption for a selected item that is not in the datasource page", () => {
            const selector = createSelector();
            selector.updateProps(
                associationSingleProps({
                    attr: new ReferenceValueBuilder().withValue(itemD).build(),
                    ds: list([itemA, itemB])
                })
            );

            expect(selector.currentId).toBe(itemD.id);
            expect(selector.options.getAll()).toEqual([itemA.id, itemB.id]);
            expect(selector.caption.get(itemD.id)).toBe("Date");
        });

        it("renders plain text in every placement without custom content", () => {
            const selector = createSelector();
            selector.updateProps(associationSingleProps());

            const label = render(<>{selector.caption.render(itemA.id, "label")}</>);
            expect(label.container.textContent).toBe("Apple");
            expect(label.container.querySelector(".widget-combobox-caption-text")).not.toBeNull();

            const option = render(<>{selector.caption.render(itemA.id, "options")}</>);
            expect(option.container.textContent).toBe("Apple");
        });

        it("renders custom content in the options only for 'listItem'", () => {
            const selector = createSelector();
            selector.updateProps(
                associationSingleProps({
                    optionsSourceAssociationCustomContentType: "listItem",
                    optionsSourceAssociationCustomContent: listWidget(i => <b>{`custom ${captions[i.id]}`}</b>)
                })
            );

            const label = render(<>{selector.caption.render(itemA.id, "label")}</>);
            expect(label.container.textContent).toBe("Apple");

            const option = render(<>{selector.caption.render(itemA.id, "options")}</>);
            expect(option.container.textContent).toBe("custom Apple");
            expect(option.container.querySelector(".widget-combobox-caption-custom")).not.toBeNull();
        });

        it("renders custom content everywhere for 'yes', except for the empty value", () => {
            const selector = createSelector();
            selector.updateProps(
                associationSingleProps({
                    optionsSourceAssociationCustomContentType: "yes",
                    optionsSourceAssociationCustomContent: listWidget(i => <b>{`custom ${captions[i.id]}`}</b>)
                })
            );

            expect(render(<>{selector.caption.render(itemA.id, "label")}</>).container.textContent).toBe(
                "custom Apple"
            );
            expect(render(<>{selector.caption.render(itemA.id, "options")}</>).container.textContent).toBe(
                "custom Apple"
            );
            expect(render(<>{selector.caption.render(null, "label")}</>).container.textContent).toBe("Select...");
        });
    });

    describe("options and client-side filtering", () => {
        it("lists options in datasource order", () => {
            const selector = createSelector();
            selector.updateProps(associationSingleProps());

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
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ filterType }));

            selector.options.setSearchTerm(term);

            expect(selector.options.getAll()).toEqual(expected);
        });

        it("notifies after a search-term change", () => {
            const selector = createSelector();
            selector.updateProps(associationSingleProps());
            const callback = jest.fn();
            selector.options.onAfterSearchTermChange(callback);

            selector.options.setSearchTerm("a");

            expect(callback).toHaveBeenCalledTimes(1);
            expect(selector.options.searchTerm).toBe("a");
        });

        it("reports the datasource sort order", () => {
            const ds = new ListValueBuilder()
                .withItems(allItems)
                .withSortOrder([[captionAttributeId, "desc"]])
                .build();
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ ds }));

            expect(selector.options.sortOrder).toBe("desc");
        });
    });

    describe("datasource limit", () => {
        it("removes the datasource limit when lazy loading is off", () => {
            const ds = list(allItems);
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ ds, lazyLoading: false }));

            expect(ds.setLimit).toHaveBeenCalledWith(undefined);
            expect(selector.lazyLoading).toBe(false);
        });

        it("limits the datasource to zero items for a read-only control", () => {
            const ds = list(allItems);
            const selector = createSelector();
            selector.updateProps(
                associationSingleProps({
                    ds,
                    attr: new ReferenceValueBuilder().withValue(itemA).isReadOnly().build()
                })
            );

            expect(ds.setLimit).toHaveBeenCalledWith(0);
        });

        it("keeps the datasource limit when lazy loading is on and the limit is already right", () => {
            const ds = list(allItems);
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ ds, lazyLoading: true }));

            expect(selector.lazyLoading).toBe(true);
            expect(ds.setLimit).not.toHaveBeenCalled();
        });

        it("disables lazy loading when captions come from an expression", () => {
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ lazyLoading: true, captionType: "expression" }));

            expect(selector.lazyLoading).toBe(false);
        });
    });

    describe("lazy loading", () => {
        function lazyList(limit: number, hasMore: boolean, loading = false): ListValue {
            const builder = new ListValueBuilder().withItems(allItems).withLimit(limit).withHasMore(hasMore);
            return (loading ? builder.isLoading() : builder).build();
        }

        it("loads the next page of 100 and reports loading until the datasource settles", () => {
            const ds = lazyList(100, true);
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ ds, lazyLoading: true }));

            expect(selector.options.hasMore).toBe(true);
            selector.options.loadMore!();

            expect(ds.setLimit).toHaveBeenCalledWith(200);
            expect(selector.options.isLoading).toBe(true);

            selector.updateProps(associationSingleProps({ ds, lazyLoading: true }));
            expect(selector.options.isLoading).toBe(false);
        });

        it("does nothing on loadMore when there are no more items", () => {
            const ds = lazyList(100, false);
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ ds, lazyLoading: true }));

            selector.options.loadMore!();

            expect(ds.setLimit).not.toHaveBeenCalled();
        });

        it("reports loading while a lazy datasource is loading", () => {
            const ds = lazyList(100, true, true);
            const selector = createSelector();
            selector.updateProps(associationSingleProps({ ds, lazyLoading: true }));

            expect(selector.options.isLoading).toBe(true);
        });

        it("moves the search term to a debounced datasource filter instead of filtering client-side", () => {
            jest.useFakeTimers();
            try {
                const ds = lazyList(100, true);
                const selector = createSelector();
                selector.updateProps(associationSingleProps({ ds, lazyLoading: true }));

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
