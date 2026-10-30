import { FilterTypeEnum } from "../../../typings/ComboboxProps";
import { BaseOptionsProvider } from "../BaseOptionsProvider";
import { CaptionsProvider } from "../types";

const captions: Record<string, string> = {
    a: "Apple pie",
    b: "Banana",
    c: "Pineapple",
    d: "Cherry"
};

const captionsProvider: CaptionsProvider = {
    get: id => (id === null ? "" : captions[id]),
    render: () => null,
    emptyCaption: ""
};

class TestOptionsProvider extends BaseOptionsProvider<string> {
    constructor(filterType: FilterTypeEnum) {
        super(captionsProvider);
        this.filterType = filterType;
        this.options = ["a", "b", "c", "d"];
    }
}

describe("BaseOptionsProvider filtering", () => {
    it.each(["contains", "containsExact", "startsWith", "none"] as const)(
        "returns options in datasource order when the search term is empty (%s)",
        filterType => {
            expect(new TestOptionsProvider(filterType).getAll()).toEqual(["a", "b", "c", "d"]);
        }
    );

    it("'contains' matches any substring and ranks closer matches first", () => {
        const provider = new TestOptionsProvider("contains");
        provider.setSearchTerm("apple");

        expect(provider.getAll()).toEqual(["a", "c"]);
    });

    it("'containsExact' matches substrings only, case-insensitive", () => {
        const provider = new TestOptionsProvider("containsExact");
        provider.setSearchTerm("APPLE");

        expect(provider.getAll()).toEqual(["a", "c"]);
    });

    it("'startsWith' matches word starts only", () => {
        const provider = new TestOptionsProvider("startsWith");
        provider.setSearchTerm("pi");

        // "Pineapple" starts with the term, "Apple pie" only has a word that does, so it ranks lower
        expect(provider.getAll()).toEqual(["c", "a"]);

        provider.setSearchTerm("apple");
        expect(provider.getAll()).toEqual(["a"]);
    });

    it("'none' ignores the search term", () => {
        const provider = new TestOptionsProvider("none");
        provider.setSearchTerm("zzz");

        expect(provider.getAll()).toEqual(["a", "b", "c", "d"]);
    });

    it("returns nothing when nothing matches", () => {
        const provider = new TestOptionsProvider("contains");
        provider.setSearchTerm("zzz");

        expect(provider.getAll()).toEqual([]);
    });
});

describe("BaseOptionsProvider search-term side channel", () => {
    it("calls the registered callback after every search-term change", () => {
        const provider = new TestOptionsProvider("contains");
        const callback = jest.fn();
        provider.onAfterSearchTermChange(callback);

        provider.setSearchTerm("a");
        provider.setSearchTerm("");

        expect(callback).toHaveBeenCalledTimes(2);
        expect(provider.searchTerm).toBe("");
    });

    it("keeps only the last registered callback", () => {
        const provider = new TestOptionsProvider("contains");
        const first = jest.fn();
        const second = jest.fn();
        provider.onAfterSearchTermChange(first);
        provider.onAfterSearchTermChange(second);

        provider.setSearchTerm("a");

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it("has no lazy-loading state by default", () => {
        const provider = new TestOptionsProvider("contains");

        expect(provider.status).toBe("available");
        expect(provider.hasMore).toBe(false);
        expect(provider.isLoading).toBe(false);
        expect(() => provider.loadMore()).not.toThrow();
    });
});
