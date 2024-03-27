import { SelectionMultiValueBuilder, objectItems } from "@mendix/widget-plugin-test-utils";
import { SelectionMultiValue, ObjectItem } from "mendix";
import { MultiSelectionHelper } from "../helpers";

describe("MultiSelectionHelper", () => {
    describe("range selection", () => {
        const x = true;
        const _ = false;
        const numberOfItems = 8;
        let selectionValue: SelectionMultiValue;
        let items: ObjectItem[];
        let helper: MultiSelectionHelper;
        const gridState = (): boolean[] => items.map(item => helper.isSelected(item));

        beforeEach(() => {
            items = objectItems(numberOfItems);
            selectionValue = new SelectionMultiValueBuilder().build();
            helper = new MultiSelectionHelper(selectionValue, items);
        });

        it('selects the range on "selectUpTo" fallowed by "selectUpTo"', () => {
            helper.selectUpTo(items[1], "clear");
            expect(gridState()).toEqual([_, x, _, _, _, _, _, _]);

            helper.selectUpTo(items[3], "clear");
            expect(gridState()).toEqual([_, x, x, x, _, _, _, _]);
        });

        it("preserves the items that were already selected", () => {
            helper.add(items[0]);
            expect(gridState()).toEqual([x, _, _, _, _, _, _, _]);

            helper.add(items[2]);
            expect(gridState()).toEqual([x, _, x, _, _, _, _, _]);

            helper.add(items[4]);
            expect(gridState()).toEqual([x, _, x, _, x, _, _, _]);
        });

        it("selectUpTo creates a new selection of items", () => {
            helper.add(items[0]);
            helper.add(items[4]);
            helper.selectUpTo(items[7], "clear");
            expect(gridState()).toEqual([_, _, _, _, x, x, x, x]);
        });

        it('enlarges the range when "selectUpTo" is called multiple times in a row', () => {
            helper.selectUpTo(items[1], "clear");
            expect(gridState()).toEqual([_, x, _, _, _, _, _, _]);

            helper.selectUpTo(items[2], "clear");
            expect(gridState()).toEqual([_, x, x, _, _, _, _, _]);

            helper.selectUpTo(items[4], "clear");
            expect(gridState()).toEqual([_, x, x, x, x, _, _, _]);

            helper.selectUpTo(items[6], "clear");
            expect(gridState()).toEqual([_, x, x, x, x, x, x, _]);
        });

        it('reduces the range when "selectUpTo" is called multiple times in a row', () => {
            helper.selectUpTo(items[1], "clear");
            expect(gridState()).toEqual([_, x, _, _, _, _, _, _]);

            helper.selectUpTo(items[5], "clear");
            expect(gridState()).toEqual([_, x, x, x, x, x, _, _]);

            helper.selectUpTo(items[3], "clear");
            expect(gridState()).toEqual([_, x, x, x, _, _, _, _]);

            helper.selectUpTo(items[2], "clear");
            expect(gridState()).toEqual([_, x, x, _, _, _, _, _]);
        });

        it("can enlarge the range after reducing it, and vice versa", () => {
            helper.selectUpTo(items[0], "clear");
            expect(gridState()).toEqual([x, _, _, _, _, _, _, _]);

            helper.selectUpTo(items[7], "clear");
            expect(gridState()).toEqual([x, x, x, x, x, x, x, x]);

            helper.selectUpTo(items[4], "clear");
            expect(gridState()).toEqual([x, x, x, x, x, _, _, _]);

            helper.selectUpTo(items[1], "clear");
            expect(gridState()).toEqual([x, x, _, _, _, _, _, _]);

            helper.selectUpTo(items[4], "clear");
            expect(gridState()).toEqual([x, x, x, x, x, _, _, _]);

            helper.selectUpTo(items[2], "clear");
            expect(gridState()).toEqual([x, x, x, _, _, _, _, _]);
        });

        it("can select the items backward", () => {
            helper.selectUpTo(items[7], "clear");
            expect(gridState()).toEqual([_, _, _, _, _, _, _, x]);

            helper.selectUpTo(items[6], "clear");
            expect(gridState()).toEqual([_, _, _, _, _, _, x, x]);

            helper.selectUpTo(items[4], "clear");
            expect(gridState()).toEqual([_, _, _, _, x, x, x, x]);

            helper.selectUpTo(items[6], "clear");
            expect(gridState()).toEqual([_, _, _, _, _, _, x, x]);

            helper.selectUpTo(items[0], "clear");
            expect(gridState()).toEqual([x, x, x, x, x, x, x, x]);
        });

        it('can reverse the range relative to the "starting point"', () => {
            helper.selectUpTo(items[4], "clear");
            expect(gridState()).toEqual([_, _, _, _, x, _, _, _]);

            helper.selectUpTo(items[2], "clear");
            expect(gridState()).toEqual([_, _, x, x, x, _, _, _]);

            helper.selectUpTo(items[7], "clear");
            expect(gridState()).toEqual([_, _, _, _, x, x, x, x]);

            helper.selectUpTo(items[0], "clear");
            expect(gridState()).toEqual([x, x, x, x, x, _, _, _]);
        });

        it('preserves the range when "selectUpTo" is called with same item', () => {
            helper.selectUpTo(items[4], "clear");
            expect(gridState()).toEqual([_, _, _, _, x, _, _, _]);

            helper.selectUpTo(items[4], "clear");
            expect(gridState()).toEqual([_, _, _, _, x, _, _, _]);

            helper.selectUpTo(items[2], "clear");
            expect(gridState()).toEqual([_, _, x, x, x, _, _, _]);

            helper.selectUpTo(items[2], "clear");
            expect(gridState()).toEqual([_, _, x, x, x, _, _, _]);
        });

        it('preserves the range when a new item is added by "add"', () => {
            helper.selectUpTo(items[4], "clear");
            expect(gridState()).toEqual([_, _, _, _, x, _, _, _]);

            helper.selectUpTo(items[6], "clear");
            expect(gridState()).toEqual([_, _, _, _, x, x, x, _]);

            helper.add(items[0]);
            expect(gridState()).toEqual([x, _, _, _, x, x, x, _]);

            helper.add(items[2]);
            expect(gridState()).toEqual([x, _, x, _, x, x, x, _]);
        });

        it('selects the range on "add" followed by "selectUpTo"', () => {
            helper.add(items[3]);
            expect(gridState()).toEqual([_, _, _, x, _, _, _, _]);
            helper.selectUpTo(items[7], "clear");
            expect(gridState()).toEqual([_, _, _, x, x, x, x, x]);
        });

        it('resets the "starting point" when a new item is added by "add"', () => {
            helper.selectUpTo(items[0], "clear");
            expect(gridState()).toEqual([x, _, _, _, _, _, _, _]);

            helper.selectUpTo(items[2], "clear");
            expect(gridState()).toEqual([x, x, x, _, _, _, _, _]);

            helper.add(items[4]);
            expect(gridState()).toEqual([x, x, x, _, x, _, _, _]);

            helper.selectUpTo(items[0], "clear");
            expect(gridState()).toEqual([x, x, x, x, x, _, _, _]);

            helper.selectUpTo(items[7], "clear");
            expect(gridState()).toEqual([_, _, _, _, x, x, x, x]);
        });

        it('unset the "starting point" when an item is removed by "remove"', () => {
            helper.selectUpTo(items[0], "clear");
            expect(gridState()).toEqual([x, _, _, _, _, _, _, _]);

            helper.selectUpTo(items[2], "clear");
            expect(gridState()).toEqual([x, x, x, _, _, _, _, _]);

            helper.remove(items[2]);
            expect(gridState()).toEqual([x, x, _, _, _, _, _, _]);

            helper.selectUpTo(items[5], "clear");
            expect(gridState()).toEqual([x, x, _, _, _, x, _, _]);

            helper.selectUpTo(items[3], "clear");
            expect(gridState()).toEqual([_, _, _, x, x, x, _, _]);
        });

        it("ignores unknown items", () => {
            helper.selectUpTo(items[3], "clear");
            expect(gridState()).toEqual([_, _, _, x, _, _, _, _]);

            helper.selectUpTo(objectItems(1)[0], "clear");
            expect(gridState()).toEqual([_, _, _, x, _, _, _, _]);

            helper.selectUpTo(objectItems(1)[0], "clear");
            expect(gridState()).toEqual([_, _, _, x, _, _, _, _]);

            helper.selectUpTo(items[2], "clear");
            expect(gridState()).toEqual([_, _, x, x, _, _, _, _]);
        });
    });
});
