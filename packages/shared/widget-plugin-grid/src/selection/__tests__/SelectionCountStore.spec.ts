import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { SelectionMultiValueBuilder, SelectionSingleValueBuilder, objectItems } from "@mendix/widget-plugin-test-utils";
import { SelectionMultiValue, SelectionSingleValue } from "mendix";
import { SelectionCountStore } from "../stores/SelectionCountStore";

type Props = {
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
};

const createMinimalMockProps = (overrides: Props = {}): Props => ({ ...overrides });

describe("SelectionCountStore", () => {
    let gateProvider: GateProvider<Props>;
    let selectionCountStore: SelectionCountStore;

    beforeEach(() => {
        const mockProps = createMinimalMockProps();
        gateProvider = new GateProvider(mockProps);
        selectionCountStore = new SelectionCountStore(gateProvider.gate);
    });

    describe("when itemSelection is undefined", () => {
        it("should return 0 selected items", () => {
            const props = createMinimalMockProps({ itemSelection: undefined });
            gateProvider.setProps(props);

            expect(selectionCountStore.selectedCount).toBe(0);
        });
    });

    describe("when itemSelection is single selection", () => {
        it("should return 0 when no item is selected", () => {
            const singleSelection = new SelectionSingleValueBuilder().build();
            const props = createMinimalMockProps({ itemSelection: singleSelection });
            gateProvider.setProps(props);

            expect(selectionCountStore.selectedCount).toBe(0);
        });

        it("should return 1 when one item is selected", () => {
            const items = objectItems(3);
            const singleSelection = new SelectionSingleValueBuilder().withSelected(items[0]).build();
            const props = createMinimalMockProps({ itemSelection: singleSelection });
            gateProvider.setProps(props);

            expect(selectionCountStore.selectedCount).toBe(1);
        });
    });

    describe("when itemSelection is multi selection", () => {
        it("should return 0 when no items are selected", () => {
            const multiSelection = new SelectionMultiValueBuilder().build();
            const props = createMinimalMockProps({ itemSelection: multiSelection });
            gateProvider.setProps(props);

            expect(selectionCountStore.selectedCount).toBe(0);
        });

        it("should return correct count when multiple items are selected", () => {
            const items = objectItems(5);
            const selectedItems = [items[0], items[2], items[4]];
            const multiSelection = new SelectionMultiValueBuilder().withSelected(selectedItems).build();
            const props = createMinimalMockProps({ itemSelection: multiSelection });
            gateProvider.setProps(props);

            expect(selectionCountStore.selectedCount).toBe(3);
        });

        it("should return correct count when all items are selected", () => {
            const items = objectItems(4);
            const multiSelection = new SelectionMultiValueBuilder().withSelected(items).build();
            const props = createMinimalMockProps({ itemSelection: multiSelection });
            gateProvider.setProps(props);

            expect(selectionCountStore.selectedCount).toBe(4);
        });

        it("should reactively update when selection changes", () => {
            const items = objectItems(3);
            const multiSelection = new SelectionMultiValueBuilder().build();
            const props = createMinimalMockProps({ itemSelection: multiSelection });
            gateProvider.setProps(props);

            // Initially no items selected
            expect(selectionCountStore.selectedCount).toBe(0);

            // Select one item
            multiSelection.setSelection([items[0]]);
            expect(selectionCountStore.selectedCount).toBe(1);

            // Select two more items
            multiSelection.setSelection([items[0], items[1], items[2]]);
            expect(selectionCountStore.selectedCount).toBe(3);

            // Clear selection
            multiSelection.setSelection([]);
            expect(selectionCountStore.selectedCount).toBe(0);
        });
    });
});
