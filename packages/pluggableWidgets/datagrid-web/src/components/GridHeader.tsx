import { ReactElement, useState } from "react";
import { useColumnsStore, useDatagridConfig, useGridSizeStore } from "../model/hooks/injection-hooks";
import { ColumnId } from "../typings/GridColumn";
import { CheckboxColumnHeader } from "./CheckboxColumnHeader";
import { ColumnProvider } from "./ColumnProvider";
import { ColumnResizer } from "./ColumnResizer";
import { ColumnSelector } from "./ColumnSelector";
import { Header } from "./Header";
import { HeaderSkeletonLoader } from "./loader/HeaderSkeletonLoader";

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
                {columns.map(column => {
                    const filterMinWidth = columnsStore.columnFilters[column.columnIndex]?.suggestedMinWidth ?? 0;
                    const minWidth = Math.max(50, column.minWidthLimit, filterMinWidth);

                    return (
                        <ColumnProvider column={column} key={`${column.columnId}`}>
                            <Header
                                dropTarget={dragOver}
                                isDragging={isDragging}
                                resizer={
                                    <ColumnResizer
                                        minWidth={minWidth}
                                        onResizeStart={() => columnsStore.setIsResizing(true)}
                                        onResizeEnds={() => columnsStore.setIsResizing(false)}
                                        setColumnWidth={(width: number) => column.setSize(width)}
                                    />
                                }
                                setDropTarget={setDragOver}
                                setIsDragging={setIsDragging}
                            />
                        </ColumnProvider>
                    );
                })}
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
