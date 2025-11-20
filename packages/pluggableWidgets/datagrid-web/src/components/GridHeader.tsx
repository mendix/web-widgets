import { ReactElement } from "react";
import { useColumnsStore, useDatagridConfig, useGridSizeStore } from "../model/hooks/injection-hooks";
import { CheckboxColumnHeader } from "./CheckboxColumnHeader";
import { ColumnProvider } from "./ColumnProvider";
import { ColumnResizer } from "./ColumnResizer";
import { ColumnSelector } from "./ColumnSelector";
import { ColumnContainer } from "./ColumnContainer";
import { HeaderSkeletonLoader } from "./loader/HeaderSkeletonLoader";

export function GridHeader(): ReactElement {
    const { columnsHidable, id: gridId } = useDatagridConfig();
    const columnsStore = useColumnsStore();
    const gridSizeStore = useGridSizeStore();
    const columns = columnsStore.visibleColumns;

    if (!columnsStore.loaded) {
        return <HeaderSkeletonLoader size={columns.length} />;
    }

    return (
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
    );
}
