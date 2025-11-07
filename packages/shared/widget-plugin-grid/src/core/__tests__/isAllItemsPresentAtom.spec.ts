import { autorun, computed, observable } from "mobx";
import { isAllItemsPresent, isAllItemsPresentAtom } from "../models/datasource.model.js";

import "../../utils/mobx-test-setup.js";

describe("isAllItemsPresent", () => {
    it("returns true when offset is 0 and hasMoreItems is false", () => {
        expect(isAllItemsPresent(0, false)).toBe(true);
    });

    it("returns false when offset is 0 and hasMoreItems is true", () => {
        expect(isAllItemsPresent(0, true)).toBe(false);
    });

    it("returns false when offset is 0 and hasMoreItems is undefined", () => {
        expect(isAllItemsPresent(0, undefined)).toBe(false);
    });

    it("returns false when offset is greater than 0 and hasMoreItems is false", () => {
        expect(isAllItemsPresent(10, false)).toBe(false);
    });

    it("returns false when offset is greater than 0 and hasMoreItems is true", () => {
        expect(isAllItemsPresent(10, true)).toBe(false);
    });

    it("returns false when offset is greater than 0 and hasMoreItems is undefined", () => {
        expect(isAllItemsPresent(10, undefined)).toBe(false);
    });

    it("returns false when offset is negative and hasMoreItems is false", () => {
        expect(isAllItemsPresent(-1, false)).toBe(false);
    });
});

describe("isAllItemsPresentAtom", () => {
    it("reacts to changes in offset and hasMoreItems", () => {
        const offsetState = observable.box(0);
        const hasMoreItemsState = observable.box<boolean | undefined>(false);

        const offsetComputed = computed(() => offsetState.get());
        const hasMoreItemsComputed = computed(() => hasMoreItemsState.get());

        const atom = isAllItemsPresentAtom(offsetComputed, hasMoreItemsComputed);
        const values: boolean[] = [];

        autorun(() => values.push(atom.get()));

        expect(values.at(0)).toBe(true);

        hasMoreItemsState.set(true);
        expect(atom.get()).toBe(false);

        offsetState.set(10);
        expect(atom.get()).toBe(false);

        hasMoreItemsState.set(false);
        expect(atom.get()).toBe(false);

        offsetState.set(0);
        expect(atom.get()).toBe(true);

        hasMoreItemsState.set(undefined);
        expect(atom.get()).toBe(false);

        expect(values).toEqual([true, false, true, false]);
    });
});
