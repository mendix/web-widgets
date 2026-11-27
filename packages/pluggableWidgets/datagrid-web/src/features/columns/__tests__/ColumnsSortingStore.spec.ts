import { ColumnsSortingStore } from "../ColumnsSortingStore";
import { ColumnId } from "../GridColumn";

const a = "0" as ColumnId;
const b = "1" as ColumnId;
const c = "2" as ColumnId;

describe("ColumnsSortingStore", () => {
    it("starts with the initial rules", () => {
        const store = new ColumnsSortingStore([[a, "desc"]]);

        expect(store.rules).toEqual([[a, "desc"]]);
    });

    it("reports no direction for a column that is not sorted", () => {
        const store = new ColumnsSortingStore([[a, "asc"]]);

        expect(store.getDirection(b)).toBeUndefined();
    });

    it("toggles a column asc, then desc, then off", () => {
        const store = new ColumnsSortingStore([]);

        store.toggleSort(a);
        expect(store.getDirection(a)).toEqual(["asc", 1]);

        store.toggleSort(a);
        expect(store.getDirection(a)).toEqual(["desc", 1]);

        store.toggleSort(a);
        expect(store.getDirection(a)).toBeUndefined();
        expect(store.rules).toEqual([]);
    });

    it("reads direction and 1-based weight of each rule in a multi-column sort", () => {
        const store = new ColumnsSortingStore([
            [c, "desc"],
            [a, "asc"]
        ]);

        expect(store.getDirection(c)).toEqual(["desc", 1]);
        expect(store.getDirection(a)).toEqual(["asc", 2]);
        expect(store.getDirection(b)).toBeUndefined();
    });

    it("replaces a multi-column sort with an ascending sort on the toggled column", () => {
        const store = new ColumnsSortingStore([
            [a, "asc"],
            [b, "desc"]
        ]);

        store.toggleSort(b);

        expect(store.rules).toEqual([[b, "asc"]]);
    });

    it("toggles the primary column of a multi-column sort and drops the other rules", () => {
        const store = new ColumnsSortingStore([
            [a, "asc"],
            [b, "desc"]
        ]);

        store.toggleSort(a);

        expect(store.rules).toEqual([[a, "desc"]]);
    });

    it("starts a new ascending sort when another column is toggled", () => {
        const store = new ColumnsSortingStore([[a, "desc"]]);

        store.toggleSort(b);

        expect(store.getDirection(a)).toBeUndefined();
        expect(store.getDirection(b)).toEqual(["asc", 1]);
    });
});
