import { DragEvent } from "react";
import { ColumnHeaderViewModel } from "../ColumnHeader.viewModel";
import { HeaderDragnDropStore } from "../HeaderDragnDrop.store";
import { ColumnId } from "../../../typings/GridColumn";

describe("ColumnHeaderViewModel", () => {
    let dndStore: HeaderDragnDropStore;
    let mockColumnsStore: any;

    beforeEach(() => {
        dndStore = new HeaderDragnDropStore();
        mockColumnsStore = {
            swapColumns: jest.fn()
        };
    });

    describe("when columnsDraggable is false", () => {
        it("returns empty draggableProps", () => {
            const vm = new ColumnHeaderViewModel({
                dndStore,
                columnsStore: mockColumnsStore,
                columnsDraggable: false
            });

            expect(vm.draggableProps).toEqual({});
        });
    });

    describe("when columnsDraggable is true", () => {
        let vm: ColumnHeaderViewModel;

        beforeEach(() => {
            vm = new ColumnHeaderViewModel({
                dndStore,
                columnsStore: mockColumnsStore,
                columnsDraggable: true
            });
        });

        it("returns draggable props with handlers", () => {
            const props = vm.draggableProps;

            expect(props.draggable).toBe(true);
            expect(props.onDragStart).toBeDefined();
            expect(props.onDragOver).toBeDefined();
            expect(props.onDrop).toBeDefined();
            expect(props.onDragEnter).toBeDefined();
            expect(props.onDragEnd).toBeDefined();
        });

        describe("dropTarget", () => {
            it("returns undefined initially", () => {
                expect(vm.dropTarget).toBeUndefined();
            });

            it("returns value from dndStore", () => {
                dndStore.setDragOver(["col1" as ColumnId, "after"]);
                expect(vm.dropTarget).toEqual(["col1", "after"]);
            });
        });

        describe("dragging", () => {
            it("returns undefined initially", () => {
                expect(vm.dragging).toBeUndefined();
            });

            it("returns value from dndStore", () => {
                dndStore.setIsDragging(["col0" as ColumnId, "col1" as ColumnId, "col2" as ColumnId]);
                expect(vm.dragging).toEqual(["col0", "col1", "col2"]);
            });
        });

        describe("handleDragStart", () => {
            it("sets dragging state with column siblings", () => {
                const mockElement = createMockElement("col1", "col0", "col2");
                const event = createMockDragEvent(mockElement);

                vm.draggableProps.onDragStart?.(event);

                expect(dndStore.isDragging).toEqual(["col0", "col1", "col2"]);
            });

            it("handles missing previous sibling", () => {
                const mockElement = createMockElement("col1", undefined, "col2");
                const event = createMockDragEvent(mockElement);

                vm.draggableProps.onDragStart?.(event);

                expect(dndStore.isDragging).toEqual([undefined, "col1", "col2"]);
            });

            it("handles missing next sibling", () => {
                const mockElement = createMockElement("col1", "col0", undefined);
                const event = createMockDragEvent(mockElement);

                vm.draggableProps.onDragStart?.(event);

                expect(dndStore.isDragging).toEqual(["col0", "col1", undefined]);
            });

            it("does nothing when element is not found", () => {
                const event = {
                    target: {
                        closest: jest.fn().mockReturnValue(null)
                    }
                } as any;

                vm.draggableProps.onDragStart?.(event);

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

                vm.draggableProps.onDragOver?.(event);

                expect(dndStore.dragOver).toBeUndefined();
            });

            it("does nothing when columnId is missing", () => {
                const event = createMockDragOverEvent("", 100, 50);

                vm.draggableProps.onDragOver?.(event);

                expect(dndStore.dragOver).toBeUndefined();
            });

            it("clears dropTarget when hovering over self", () => {
                dndStore.setDragOver(["col2" as ColumnId, "after"]);
                const event = createMockDragOverEvent("col1", 100, 50);

                vm.draggableProps.onDragOver?.(event);

                expect(dndStore.dragOver).toBeUndefined();
            });

            it("sets dropTarget to before when hovering over left sibling", () => {
                const event = createMockDragOverEvent("col0", 100, 50);

                vm.draggableProps.onDragOver?.(event);

                expect(dndStore.dragOver).toEqual(["col0", "before"]);
            });

            it("sets dropTarget to after when hovering over right sibling", () => {
                const event = createMockDragOverEvent("col2", 100, 50);

                vm.draggableProps.onDragOver?.(event);

                expect(dndStore.dragOver).toEqual(["col2", "after"]);
            });

            it("sets dropTarget to before when hovering on left side of non-sibling column", () => {
                const event = createMockDragOverEvent("col5", 100, 30);

                vm.draggableProps.onDragOver?.(event);

                expect(dndStore.dragOver).toEqual(["col5", "before"]);
            });

            it("sets dropTarget to after when hovering on right side of non-sibling column", () => {
                const event = createMockDragOverEvent("col5", 100, 70);

                vm.draggableProps.onDragOver?.(event);

                expect(dndStore.dragOver).toEqual(["col5", "after"]);
            });

            it("does not update dropTarget if it hasn't changed", () => {
                dndStore.setDragOver(["col5" as ColumnId, "after"]);
                const setDragOverSpy = jest.spyOn(dndStore, "setDragOver");
                const event = createMockDragOverEvent("col5", 100, 70);

                vm.draggableProps.onDragOver?.(event);

                expect(setDragOverSpy).not.toHaveBeenCalled();
            });

            it("prevents default behavior", () => {
                const event = createMockDragOverEvent("col2", 100, 50);

                vm.draggableProps.onDragOver?.(event);

                expect(event.preventDefault).toHaveBeenCalled();
            });
        });

        describe("handleDragEnter", () => {
            it("prevents default behavior", () => {
                const event = { preventDefault: jest.fn() } as any;

                vm.draggableProps.onDragEnter?.(event);

                expect(event.preventDefault).toHaveBeenCalled();
            });
        });

        describe("handleDragEnd", () => {
            it("clears drag state", () => {
                dndStore.setIsDragging(["col0" as ColumnId, "col1" as ColumnId, "col2" as ColumnId]);
                dndStore.setDragOver(["col2" as ColumnId, "after"]);

                vm.draggableProps.onDragEnd?.({} as any);

                expect(dndStore.isDragging).toBeUndefined();
                expect(dndStore.dragOver).toBeUndefined();
            });
        });

        describe("handleOnDrop", () => {
            it("calls swapColumns with correct parameters", () => {
                dndStore.setIsDragging(["col0" as ColumnId, "col1" as ColumnId, "col2" as ColumnId]);
                dndStore.setDragOver(["col3" as ColumnId, "after"]);

                vm.draggableProps.onDrop?.({} as any);

                expect(mockColumnsStore.swapColumns).toHaveBeenCalledWith("col1", ["col3", "after"]);
            });

            it("clears drag state after drop", () => {
                dndStore.setIsDragging(["col0" as ColumnId, "col1" as ColumnId, "col2" as ColumnId]);
                dndStore.setDragOver(["col3" as ColumnId, "after"]);

                vm.draggableProps.onDrop?.({} as any);

                expect(dndStore.isDragging).toBeUndefined();
                expect(dndStore.dragOver).toBeUndefined();
            });

            it("does not call swapColumns when not dragging", () => {
                dndStore.setDragOver(["col3" as ColumnId, "after"]);

                vm.draggableProps.onDrop?.({} as any);

                expect(mockColumnsStore.swapColumns).not.toHaveBeenCalled();
            });

            it("does not call swapColumns when no dropTarget", () => {
                dndStore.setIsDragging(["col0" as ColumnId, "col1" as ColumnId, "col2" as ColumnId]);

                vm.draggableProps.onDrop?.({} as any);

                expect(mockColumnsStore.swapColumns).not.toHaveBeenCalled();
            });

            it("clears drag state even when drop is invalid", () => {
                dndStore.setIsDragging(["col0" as ColumnId, "col1" as ColumnId, "col2" as ColumnId]);

                vm.draggableProps.onDrop?.({} as any);

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
