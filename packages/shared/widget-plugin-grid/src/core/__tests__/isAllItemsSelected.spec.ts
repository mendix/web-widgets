import { computed, configure, observable } from "mobx";
import { isAllItemsSelected, isAllItemsSelectedAtom } from "../models/selection.model.js";

describe("isAllItemsSelected", () => {
    describe("when selectedCount is -1 (not in multi-selection mode)", () => {
        it("returns false regardless of other parameters", () => {
            expect(isAllItemsSelected(-1, 10, 100, true)).toBe(false);
            expect(isAllItemsSelected(-1, 0, 0, true)).toBe(false);
            expect(isAllItemsSelected(-1, 10, 100, false)).toBe(false);
        });
    });

    describe("when totalCount is -1 and isAllItemsPresent is false", () => {
        it("returns false even when selectedCount equals itemCount", () => {
            expect(isAllItemsSelected(50, 50, -1, false)).toBe(false);
        });

        it("returns false when selectedCount is less than itemCount", () => {
            expect(isAllItemsSelected(25, 50, -1, false)).toBe(false);
        });

        it("returns false when selectedCount is greater than itemCount", () => {
            expect(isAllItemsSelected(75, 50, -1, false)).toBe(false);
        });

        it("returns false even when both selectedCount and itemCount are 0", () => {
            expect(isAllItemsSelected(0, 0, -1, false)).toBe(false);
        });
    });

    describe("edge cases", () => {
        it("returns false when selectedCount is 0 and there are items", () => {
            expect(isAllItemsSelected(0, 10, 100, true)).toBe(false);
        });

        it("handles case where itemCount exceeds totalCount (data inconsistency)", () => {
            expect(isAllItemsSelected(100, 150, 100, true)).toBe(true);
        });

        it("handles negative itemCount edge case", () => {
            expect(isAllItemsSelected(5, -1, 0, true)).toBe(false);
        });

        it("handles negative totalCount edge case", () => {
            expect(isAllItemsSelected(5, 10, -1, true)).toBe(false);
        });
    });
});

describe("isAllItemsSelectedAtom", () => {
    configure({
        enforceActions: "never"
    });

    it("returns true when all items are selected based on totalCount", () => {
        const selectedCount = computed(() => 100);
        const itemCount = computed(() => 50);
        const totalCount = computed(() => 100);
        const isAllItemsPresent = computed(() => true);

        const atom = isAllItemsSelectedAtom(selectedCount, itemCount, totalCount, isAllItemsPresent);
        expect(atom.get()).toBe(true);
    });

    it("returns false when selectedCount is less than totalCount", () => {
        const selectedCount = computed(() => 50);
        const itemCount = computed(() => 50);
        const totalCount = computed(() => 100);
        const isAllItemsPresent = computed(() => true);

        const atom = isAllItemsSelectedAtom(selectedCount, itemCount, totalCount, isAllItemsPresent);
        expect(atom.get()).toBe(false);
    });

    it("returns true when all items selected with isAllItemsPresent", () => {
        const selectedCount = computed(() => 50);
        const itemCount = computed(() => 50);
        const totalCount = computed(() => 0);
        const isAllItemsPresent = computed(() => true);

        const atom = isAllItemsSelectedAtom(selectedCount, itemCount, totalCount, isAllItemsPresent);
        expect(atom.get()).toBe(true);
    });

    it("returns false when selectedCount is -1", () => {
        const selectedCount = computed(() => -1);
        const itemCount = computed(() => 10);
        const totalCount = computed(() => 100);
        const isAllItemsPresent = computed(() => true);

        const atom = isAllItemsSelectedAtom(selectedCount, itemCount, totalCount, isAllItemsPresent);
        expect(atom.get()).toBe(false);
    });

    it("updates reactively when selectedCount changes", () => {
        const selectedCountBox = observable.box(50);
        const itemCount = computed(() => 50);
        const totalCount = computed(() => 100);
        const isAllItemsPresent = computed(() => true);

        const atom = isAllItemsSelectedAtom(selectedCountBox, itemCount, totalCount, isAllItemsPresent);

        expect(atom.get()).toBe(false);

        selectedCountBox.set(100);
        expect(atom.get()).toBe(true);
    });

    it("updates reactively when totalCount changes", () => {
        const totalCountBox = observable.box(100);
        const selectedCount = computed(() => 50);
        const itemCount = computed(() => 50);
        const isAllItemsPresent = computed(() => true);

        const atom = isAllItemsSelectedAtom(selectedCount, itemCount, totalCountBox, isAllItemsPresent);

        expect(atom.get()).toBe(false);

        totalCountBox.set(50);
        expect(atom.get()).toBe(true);
    });
});
