import classNames from "classnames";
import { ReactElement } from "react";
import { ColumnHeader } from "./ColumnHeader";
import { useColumn, useColumnsStore, useDatagridConfig, useHeaderDndVM } from "../model/hooks/injection-hooks";
import { ColumnResizerProps } from "./ColumnResizer";
import { observer } from "mobx-react-lite";
import { DragHandle } from "./DragHandle";
import { useSortable } from "@dnd-kit/sortable";

export interface ColumnContainerProps {
    isLast?: boolean;
    resizer: ReactElement<ColumnResizerProps>;
}

export const ColumnContainer = observer(function ColumnContainer(props: ColumnContainerProps): ReactElement {
    const { columnsFilterable, columnsDraggable, id: gridId } = useDatagridConfig();
    const columnsStore = useColumnsStore();
    const { columnFilters } = columnsStore;
    const column = useColumn();
    const { canSort, columnId, columnIndex, canResize, sortDir, header } = column;
    const caption = header.trim();
    const vm = useHeaderDndVM();
    const isDndEnabled = Boolean(columnsDraggable && column.canDrag);
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: columnId,
        disabled: !isDndEnabled
    });
    const setHeaderRef = (ref: HTMLDivElement | null): void => {
        column.setHeaderElementRef(ref);
        setNodeRef(ref);
    };
    const style = vm.getHeaderCellStyle(columnId, { transform, transition });
    const isLocked = !column.canDrag;

    return (
        <div
            aria-sort={getAriaSort(canSort, sortDir)}
            className={classNames("th", {
                "dragging-over-self": isDragging,
                "locked-drag-active": isLocked && vm.isDragging
            })}
            role="columnheader"
            style={style}
            title={caption}
            ref={setHeaderRef}
            data-column-id={columnId}
        >
            {isDndEnabled && (
                <DragHandle setActivatorNodeRef={setActivatorNodeRef} listeners={listeners} attributes={attributes} />
            )}
            <div className={classNames("column-container")} id={`${gridId}-column${columnId}`}>
                <ColumnHeader />
                {columnsFilterable && (
                    <div className="filter" style={{ pointerEvents: vm.isDragging ? "none" : undefined }}>
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
