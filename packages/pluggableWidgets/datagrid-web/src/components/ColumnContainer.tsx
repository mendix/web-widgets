import classNames from "classnames";
import { ReactElement } from "react";
import { ColumnHeader } from "./ColumnHeader";
import { useColumn, useColumnsStore, useDatagridConfig, useHeaderDragnDropVM } from "../model/hooks/injection-hooks";
import { ColumnResizerProps } from "./ColumnResizer";
import { observer } from "mobx-react-lite";

export interface ColumnContainerProps {
    isLast?: boolean;
    resizer: ReactElement<ColumnResizerProps>;
}

export const ColumnContainer = observer(function ColumnContainer(props: ColumnContainerProps): ReactElement {
    const { columnsFilterable, id: gridId } = useDatagridConfig();
    const { columnFilters } = useColumnsStore();
    const column = useColumn();
    const { canSort, columnId, columnIndex, canResize, sortDir, header } = column;
    const vm = useHeaderDragnDropVM();
    const caption = header.trim();

    return (
        <div
            aria-sort={getAriaSort(canSort, sortDir)}
            className={classNames("th", {
                [`drop-${vm.dropTarget?.[1]}`]: columnId === vm.dropTarget?.[0],
                dragging: columnId === vm.dragging?.[1],
                "dragging-over-self": columnId === vm.dragging?.[1] && !vm.dropTarget
            })}
            role="columnheader"
            style={!canSort ? { cursor: "unset" } : undefined}
            title={caption}
            data-column-id={columnId}
            onDrop={vm.handleOnDrop}
            onDragEnter={vm.handleDragEnter}
            onDragOver={vm.handleDragOver}
        >
            <div className={classNames("column-container")} id={`${gridId}-column${columnId}`}>
                <ColumnHeader />
                {columnsFilterable && (
                    <div className="filter" style={{ pointerEvents: vm.dragging ? "none" : undefined }}>
                        {columnFilters[columnIndex]?.renderFilterWidgets()}
                    </div>
                )}
            </div>
            {canResize ? props.resizer : null}
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
