import { ReactElement, useState } from "react";
import { ColumnProvider } from "../features/columns/ColumnProvider";
import { ColumnResizer } from "../features/columns/ColumnResizer";
import { ColumnSelector } from "../features/columns/ColumnSelector";
import { ColumnId } from "../features/columns/GridColumn";
import { Header } from "../features/columns/Header";
import { useColumnsStore, useDatagridConfig, useGridSizeStore } from "../features/core/hooks/injection-hooks";
import { HeaderSkeletonLoader } from "../features/datasource/loader/HeaderSkeletonLoader";
import { CheckboxColumnHeader } from "../features/selection/CheckboxColumnHeader";

export function GridHeader(): ReactElement {
    const { columnsHidable, id: gridId } = useDatagridConfig();
    const columnsStore = useColumnsStore();
    const gridSizeStore = useGridSizeStore();
    const columns = columnsStore.visibleColumns;
    const [dragOver, setDragOver] = useState<[ColumnId, "before" | "after"] | undefined>(undefined);
    const [isDragging, setIsDragging] = useState<[ColumnId | undefined, ColumnId, ColumnId | undefined] | undefined>();

    if (!columnsStore.loaded) {
        return <HeaderSkeletonLoader size={columns.length} />;
    }

    return (
        <div className="widget-datagrid-grid-head" role="rowgroup" ref={gridSizeStore.gridHeaderRef}>
            <div key="headers_row" className="tr" role="row">
                <CheckboxColumnHeader key="headers_column_select_all" />
                {columns.map(column => (
                    <ColumnProvider column={column} key={`${column.columnId}`}>
                        <Header
                            dropTarget={dragOver}
                            isDragging={isDragging}
                            resizer={
                                <ColumnResizer
                                    onResizeStart={() => columnsStore.setIsResizing(true)}
                                    onResizeEnds={() => columnsStore.setIsResizing(false)}
                                    setColumnWidth={(width: number) => column.setSize(width)}
                                />
                            }
                            setDropTarget={setDragOver}
                            setIsDragging={setIsDragging}
                        />
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
    );
}
