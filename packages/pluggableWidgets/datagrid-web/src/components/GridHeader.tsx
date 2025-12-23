import { ReactElement, useMemo } from "react";
import { useColumnsStore, useDatagridConfig, useGridSizeStore, useHeaderDndVM } from "../model/hooks/injection-hooks";
import { CheckboxColumnHeader } from "./CheckboxColumnHeader";
import { ColumnProvider } from "./ColumnProvider";
import { ColumnResizer } from "./ColumnResizer";
import { ColumnSelector } from "./ColumnSelector";
import { ColumnContainer } from "./ColumnContainer";
import { HeaderSkeletonLoader } from "./loader/HeaderSkeletonLoader";
import { observer } from "mobx-react-lite";
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ColumnHeaderDragPreview } from "./ColumnHeaderDragPreview";

export const GridHeader = observer(function GridHeader(): ReactElement {
    const { columnsHidable, id: gridId } = useDatagridConfig();
    const columnsStore = useColumnsStore();
    const gridSizeStore = useGridSizeStore();
    const columns = columnsStore.visibleColumns;
    const vm = useHeaderDndVM();
    const items = useMemo(() => columns.filter(c => c.canDrag).map(c => c.columnId), [columns]);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    if (!columnsStore.loaded) {
        return <HeaderSkeletonLoader size={columns.length} />;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={vm.collisionDetection}
            onDragStart={vm.onDragStart}
            onDragOver={vm.onDragOver}
            onDragEnd={vm.onDragEnd}
            onDragCancel={vm.onDragCancel}
        >
            <SortableContext items={items} strategy={horizontalListSortingStrategy}>
                <div className="widget-datagrid-grid-head" role="rowgroup" ref={gridSizeStore.gridHeaderRef}>
                    <div key="headers_row" className="tr" role="row">
                        <CheckboxColumnHeader key="headers_column_select_all" />
                        {columns.map(column => (
                            <ColumnProvider column={column} key={`${column.columnId}`}>
                                <ColumnContainer resizer={<ColumnResizer />} />
                            </ColumnProvider>
                        ))}
                        {columnsHidable && (
                            <ColumnSelector
                                key="headers_column_selector"
                                columns={columnsStore.availableColumns}
                                id={gridId}
                                visibleLength={columns.length}
                            />
                        )}
                    </div>
                </div>
            </SortableContext>

            <DragOverlay dropAnimation={null}>
                {vm.activeColumn ? (
                    <ColumnProvider column={vm.activeColumn}>
                        <ColumnHeaderDragPreview />
                    </ColumnProvider>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
});
