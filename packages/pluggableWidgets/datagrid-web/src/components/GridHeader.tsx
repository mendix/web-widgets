import { createElement, ReactElement, ReactNode, useCallback, useState } from "react";
import { ColumnId, GridColumn } from "../typings/GridColumn";
import { CheckboxColumnHeader } from "./CheckboxColumnHeader";
import { ColumnResizer } from "./ColumnResizer";
import { ColumnSelector } from "./ColumnSelector";
import { Header } from "./Header";
import { HeaderSkeletonLoader } from "./loader/HeaderSkeletonLoader";

type GridHeaderProps = {
    availableColumns: GridColumn[];
    columns: GridColumn[];
    setIsResizing: (status: boolean) => void;
    columnsDraggable: boolean;
    columnsFilterable: boolean;
    columnsHidable: boolean;
    columnsResizable: boolean;
    columnsSortable: boolean;
    columnsSwap: (source: ColumnId, target: [ColumnId, "after" | "before"]) => void;
    filterRenderer: (renderWrapper: (children: ReactNode) => ReactElement, columnIndex: number) => ReactElement;
    headerWrapperRenderer: (columnIndex: number, header: ReactElement) => ReactElement;
    id: string;
    isLoading: boolean;
    preview?: boolean;
};

export function GridHeader({
    availableColumns,
    columns,
    setIsResizing,
    columnsDraggable,
    columnsFilterable,
    columnsHidable,
    columnsResizable,
    columnsSortable,
    columnsSwap,
    filterRenderer,
    headerWrapperRenderer,
    id,
    isLoading,
    preview
}: GridHeaderProps): ReactElement {
    const [dragOver, setDragOver] = useState<[ColumnId, "before" | "after"] | undefined>(undefined);
    const [isDragging, setIsDragging] = useState<[ColumnId | undefined, ColumnId, ColumnId | undefined] | undefined>();

    const renderFilterWrapper = useCallback(
        (children: ReactNode) => (
            <div className="filter" style={{ pointerEvents: isDragging ? "none" : undefined }}>
                {children}
            </div>
        ),
        [isDragging]
    );

    if (isLoading) {
        return <HeaderSkeletonLoader size={columns.length} />;
    }

    return (
        <div className="widget-datagrid-grid-head" role="rowgroup">
            <div key="headers_row" className="tr" role="row">
                <CheckboxColumnHeader key="headers_column_select_all" />
                {columns.map((column, index) =>
                    headerWrapperRenderer(
                        index,
                        <Header
                            key={`${column.columnId}`}
                            className={`align-column-${column.alignment}`}
                            gridId={id}
                            column={column}
                            draggable={columnsDraggable}
                            dropTarget={dragOver}
                            filterable={columnsFilterable}
                            filterWidget={filterRenderer(renderFilterWrapper, column.columnIndex)}
                            hidable={columnsHidable}
                            isDragging={isDragging}
                            preview={preview}
                            resizable={columnsResizable && columns.at(-1) !== column}
                            resizer={
                                <ColumnResizer
                                    onResizeStart={() => setIsResizing(true)}
                                    onResizeEnds={() => setIsResizing(false)}
                                    setColumnWidth={(width: number) => column.setSize(width)}
                                />
                            }
                            swapColumns={columnsSwap}
                            setDropTarget={setDragOver}
                            setIsDragging={setIsDragging}
                            sortable={columnsSortable}
                        />
                    )
                )}
                {columnsHidable && (
                    <ColumnSelector
                        key="headers_column_selector"
                        columns={availableColumns}
                        id={id}
                        visibleLength={columns.length}
                    />
                )}
            </div>
        </div>
    );
}
