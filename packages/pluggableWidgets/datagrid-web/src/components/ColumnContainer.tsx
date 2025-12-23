import classNames from "classnames";
import { ReactElement } from "react";
import { ColumnHeader } from "./ColumnHeader";
import { useColumn, useColumnsStore, useDatagridConfig, useHeaderDndVM } from "../model/hooks/injection-hooks";
import { ColumnResizerProps } from "./ColumnResizer";
import { observer } from "mobx-react-lite";
import { useSortable } from "@dnd-kit/sortable";

export interface ColumnContainerProps {
    isLast?: boolean;
    resizer: ReactElement<ColumnResizerProps>;
}

export const ColumnContainer = observer(function ColumnContainer(props: ColumnContainerProps): ReactElement {
    const { columnsFilterable, columnsResizable, columnsSortable, id: gridId } = useDatagridConfig();
    const columnsStore = useColumnsStore();
    const { columnFilters } = columnsStore;
    const column = useColumn();
    const { canSort, columnId, columnIndex, canResize, sortDir, header } = column;
    const isSortable = columnsSortable && canSort;
    const isResizable = columnsResizable && canResize;
    const caption = header.trim();
    const vm = useHeaderDndVM();
    const { setNodeRef, transform, transition, isDragging } = useSortable({
        id: columnId
    });
    const style = vm.getHeaderCellStyle(columnId, { transform, transition });
    const isLocked = !column.canDrag;

    return (
        <div
            aria-sort={getAriaSort(isSortable, sortDir)}
            className={classNames("th", {
                "dragging-over-self": isDragging,
                "locked-drag-active": isLocked && vm.isDragging
            })}
            role="columnheader"
            style={style}
            title={caption}
            ref={setNodeRef}
            data-column-id={columnId}
        >
            <div className={classNames("column-container")} id={`${gridId}-column${columnId}`}>
                <ColumnHeader />
                {columnsFilterable && (
                    <div className="filter" style={{ pointerEvents: vm.isDragging ? "none" : undefined }}>
                        {columnFilters[columnIndex]?.renderFilterWidgets()}
                    </div>
                )}
            </div>
            {isResizable ? props.resizer : null}
        </div>
    );
});

function getAriaSort(canSort: boolean, sortDir: string | undefined): "ascending" | "descending" | "none" | undefined {
    if (!canSort) {
        return undefined;
    }

    switch (sortDir) {
        case "asc":
            return "ascending";
        case "desc":
            return "descending";
        default:
            return "none";
    }
}
