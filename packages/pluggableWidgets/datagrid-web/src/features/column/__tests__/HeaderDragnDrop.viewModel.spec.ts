import { DragEvent } from "react";
import { HeaderDragnDropViewModel } from "../HeaderDragnDrop.viewModel";
import { HeaderDragnDropStore } from "../HeaderDragnDrop.store";
import { ColumnId } from "../../../typings/GridColumn";

describe("ColumnHeaderViewModel", () => {
    let dndStore: HeaderDragnDropStore;
    let mockColumnsStore: any;
    let mockColumn: any;

    beforeEach(() => {
        dndStore = new HeaderDragnDropStore();
        mockColumnsStore = {
            swapColumns: jest.fn()
        };
        mockColumn = {
            canDrag: true,
            columnId: "col1" as ColumnId
        };
    });

    describe("when columnsDraggable is false", () => {
        it("is not draggable", () => {
            const vm = new HeaderDragnDropViewModel(
                dndStore,
                mockColumnsStore,
                { columnsDraggable: false },
                mockColumn
            );

            expect(vm.isDraggable).toBe(false);
        });
    });

    describe("when columnsDraggable is true", () => {
        let vm: HeaderDragnDropViewModel;

        beforeEach(() => {
            vm = new HeaderDragnDropViewModel(dndStore, mockColumnsStore, { columnsDraggable: true }, mockColumn);
        });

        it("is draggable", () => {
            expect(vm.isDraggable).toBe(true);
        });

        describe("handleDragStart", () => {
            it("sets dragging state with column siblings", () => {
                const mockElement = createMockElement("col1", "col0", "col2");
                const event = createMockDragEvent(mockElement);

                vm.handleDragStart(event);

                expect(dndStore.isDragging).toEqual(["col0", "col1", "col2"]);
            });

            it("handles missing previous sibling", () => {
                const mockElement = createMockElement("col1", undefined, "col2");
                const event = createMockDragEvent(mockElement);

                vm.handleDragStart(event);

                expect(dndStore.isDragging).toEqual([undefined, "col1", "col2"]);
            });

            it("handles missing next sibling", () => {
                const mockElement = createMockElement("col1", "col0", undefined);
                const event = createMockDragEvent(mockElement);

                vm.handleDragStart(event);

                expect(dndStore.isDragging).toEqual(["col0", "col1", undefined]);
            });

            it("does nothing when element is not found", () => {
                const event = {
                    target: {
                        closest: jest.fn().mockReturnValue(null)
                    }
                } as any;

                vm.handleDragStart(event);

                expect(dndStore.isDragging).toBeUndefined();
            });
        });

        describe("handleDragOver", () => {
            beforeEach(() => {
                dndStore.setIsDragging(["col0" as ColumnId, "col1" as ColumnId, "col2" as ColumnId]);
            });

            it("does nothing when not dragging", () => {
                dndStore.clearDragState();
                const event = createMockDragOverEvent("col2", 100, 50);

                vm.handleDragOver(event);

                expect(dndStore.dragOver).toBeUndefined();
            });

            it("does nothing when columnId is missing", () => {
                const event = createMockDragOverEvent("", 100, 50);

                vm.handleDragOver(event);

                expect(dndStore.dragOver).toBeUndefined();
            });

            it("clears dropTarget when hovering over self", () => {
                dndStore.setDragOver(["col2" as ColumnId, "after"]);
                const event = createMockDragOverEvent("col1", 100, 50);

                vm.handleDragOver(event);

                expect(dndStore.dragOver).toBeUndefined();
            });

            it("sets dropTarget to before when hovering over left sibling", () => {
                const event = createMockDragOverEvent("col0", 100, 50);

                vm.handleDragOver(event);

                expect(dndStore.dragOver).toEqual(["col0", "before"]);
            });

            it("sets dropTarget to after when hovering over right sibling", () => {
                const event = createMockDragOverEvent("col2", 100, 50);

                vm.handleDragOver(event);

                expect(dndStore.dragOver).toEqual(["col2", "after"]);
            });
        });

        describe("handleDragEnter", () => {
            it("prevents default behavior", () => {
                const event = { preventDefault: jest.fn() } as any;

                vm.handleDragEnter(event);

                expect(event.preventDefault).toHaveBeenCalled();
            });
        });

        describe("handleDragEnd", () => {
            it("clears drag state", () => {
                dndStore.setIsDragging(["col0" as ColumnId, "col1" as ColumnId, "col2" as ColumnId]);
                dndStore.setDragOver(["col2" as ColumnId, "after"]);

                vm.handleDragEnd();

                expect(dndStore.isDragging).toBeUndefined();
                expect(dndStore.dragOver).toBeUndefined();
            });
        });

        describe("handleOnDrop", () => {
            it("calls swapColumns with correct parameters", () => {
                dndStore.setIsDragging(["col0" as ColumnId, "col1" as ColumnId, "col2" as ColumnId]);
                dndStore.setDragOver(["col3" as ColumnId, "after"]);

                vm.handleOnDrop({} as any);

                expect(mockColumnsStore.swapColumns).toHaveBeenCalledWith("col1", ["col3", "after"]);
            });

            it("clears drag state after drop", () => {
                dndStore.setIsDragging(["col0" as ColumnId, "col1" as ColumnId, "col2" as ColumnId]);
                dndStore.setDragOver(["col3" as ColumnId, "after"]);

                vm.handleOnDrop({} as any);

                expect(dndStore.isDragging).toBeUndefined();
                expect(dndStore.dragOver).toBeUndefined();
            });
        });
    });
});

// Helper functions to create mock DOM elements and events

function createMockElement(
    columnId: string,
    prevSiblingId: string | undefined,
    nextSiblingId: string | undefined
): HTMLDivElement {
    const element = {
        dataset: { columnId },
        previousElementSibling: prevSiblingId ? { dataset: { columnId: prevSiblingId } } : null,
        nextElementSibling: nextSiblingId ? { dataset: { columnId: nextSiblingId } } : null
    } as any;

    return element;
}

function createMockDragEvent(targetElement: HTMLDivElement): DragEvent<HTMLDivElement> {
    return {
        target: {
            closest: jest.fn().mockReturnValue(targetElement)
        }
    } as any;
}

function createMockDragOverEvent(columnId: string, width: number, clientX: number): DragEvent<HTMLDivElement> {
    return {
        currentTarget: {
            dataset: { columnId },
            getBoundingClientRect: jest.fn().mockReturnValue({ width, left: 0 })
        },
        clientX,
        preventDefault: jest.fn()
    } as any;
}
