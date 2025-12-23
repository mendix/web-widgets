import { HeaderDndStore } from "../HeaderDnd.store";
import { HeaderDndViewModel } from "../HeaderDnd.viewModel";
import { ColumnId } from "../../../typings/GridColumn";

function col(id: string, canDrag: boolean): any {
    return { columnId: id as ColumnId, canDrag };
}

describe("HeaderDndViewModel", () => {
    it("does not swap across a non-draggable column barrier", () => {
        const store = new HeaderDndStore();
        const columnsStore: any = {
            visibleColumns: [col("A", true), col("B", false), col("C", true), col("D", true)],
            availableColumns: [col("A", true), col("B", false), col("C", true), col("D", true)],
            swapColumns: jest.fn()
        };

        const vm = new HeaderDndViewModel(store, columnsStore);

        // Try to drag C (right side) over A (left side). With the updated
        // behavior draggable columns may swap across non-draggable columns.
        vm.onDragEnd({ active: { id: "C" }, over: { id: "A" } } as any);

        expect(columnsStore.swapColumns).toHaveBeenCalledTimes(1);
        expect(columnsStore.swapColumns).toHaveBeenCalledWith("C", ["A", "before"]);
    });

    it("allows swapping within the same draggable segment", () => {
        const store = new HeaderDndStore();
        const columnsStore: any = {
            visibleColumns: [col("A", true), col("B", false), col("C", true), col("D", true)],
            availableColumns: [col("A", true), col("B", false), col("C", true), col("D", true)],
            swapColumns: jest.fn()
        };

        const vm = new HeaderDndViewModel(store, columnsStore);

        // Drag D over C (same segment). Should reorder.
        vm.onDragEnd({ active: { id: "D" }, over: { id: "C" } } as any);

        expect(columnsStore.swapColumns).toHaveBeenCalledTimes(1);
        expect(columnsStore.swapColumns).toHaveBeenCalledWith("D", ["C", "before"]);
    });

    it("does not allow dropping onto a non-draggable column", () => {
        const store = new HeaderDndStore();
        const columnsStore: any = {
            visibleColumns: [col("A", true), col("B", false), col("C", true)],
            availableColumns: [col("A", true), col("B", false), col("C", true)],
            swapColumns: jest.fn()
        };

        const vm = new HeaderDndViewModel(store, columnsStore);

        vm.onDragEnd({ active: { id: "C" }, over: { id: "B" } } as any);

        expect(columnsStore.swapColumns).not.toHaveBeenCalled();
    });
});
