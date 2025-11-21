import classNames from "classnames";
import {
    DragEvent,
    DragEventHandler,
    HTMLAttributes,
    KeyboardEvent,
    MouseEvent,
    ReactElement,
    ReactNode,
    useMemo
} from "react";
import { FaArrowsAltV } from "./icons/FaArrowsAltV";
import { FaLongArrowAltDown } from "./icons/FaLongArrowAltDown";
import { FaLongArrowAltUp } from "./icons/FaLongArrowAltUp";

import ColumnHeader from "./ColumnHeader";

import { useColumn, useColumnsStore, useDatagridConfig, useHeaderDragDrop } from "../model/hooks/injection-hooks";
import { GridColumn } from "../typings/GridColumn";
import { ColumnResizerProps } from "./ColumnResizer";
import { ColumnHeaderViewModel } from "../features/column/ColumnHeader.viewModel";
import { observer } from "mobx-react-lite";

export interface ColumnContainerProps {
    isLast?: boolean;
    resizer: ReactElement<ColumnResizerProps>;
}
interface DragHandleProps {
    draggable: boolean;
    onDragStart?: DragEventHandler<HTMLSpanElement>;
    onDragEnd?: DragEventHandler<HTMLSpanElement>;
}

export const ColumnContainer = observer(function ColumnContainer(props: ColumnContainerProps): ReactElement {
    const { columnsFilterable, id: gridId } = useDatagridConfig();
    const columnsStore = useColumnsStore();
    const column = useColumn();
    const { canDrag, canSort } = column;

    const headerDragDropStore = useHeaderDragDrop();
    const columnHeaderVM = useMemo(
        () =>
            new ColumnHeaderViewModel({
                dndStore: headerDragDropStore,
                columnsStore,
                columnsDraggable: canDrag
            }),
        [headerDragDropStore, columnsStore, canDrag]
    );
    const draggableProps = columnHeaderVM.draggableProps;
    const dropTarget = columnHeaderVM.dropTarget;
    const isDragging = columnHeaderVM.dragging;

    const sortProps = canSort ? getSortProps(column) : null;
    const caption = column.header.trim();

    return (
        <div
            aria-sort={getAriaSort(canSort, column)}
            className={classNames("th", {
                [`drop-${dropTarget?.[1]}`]: column.columnId === dropTarget?.[0],
                dragging: column.columnId === isDragging?.[1],
                "dragging-over-self": column.columnId === isDragging?.[1] && !dropTarget
            })}
            role="columnheader"
            style={!canSort ? { cursor: "unset" } : undefined}
            title={caption}
            data-column-id={column.columnId}
            onDrop={draggableProps.onDrop}
            onDragEnter={draggableProps.onDragEnter}
            onDragOver={draggableProps.onDragOver}
        >
            <div className={classNames("column-container")} id={`${gridId}-column${column.columnId}`}>
                <ColumnHeader
                    sortProps={sortProps}
                    canSort={canSort}
                    caption={caption}
                    isDragging={isDragging}
                    columnAlignment={column.alignment}
                >
                    {draggableProps.draggable && (
                        <DragHandle
                            draggable={draggableProps.draggable}
                            onDragStart={draggableProps.onDragStart}
                            onDragEnd={draggableProps.onDragEnd}
                        />
                    )}
                    <span style={draggableProps.draggable ? { paddingInlineStart: "4px" } : undefined}>
                        {caption.length > 0 ? caption : "\u00a0"}
                    </span>
                    {canSort ? <SortIcon /> : null}
                </ColumnHeader>
                {columnsFilterable && (
                    <div className="filter" style={{ pointerEvents: isDragging ? "none" : undefined }}>
                        {columnsStore.columnFilters[column.columnIndex]?.renderFilterWidgets()}
                    </div>
                )}
            </div>
            {column.canResize ? props.resizer : null}
        </div>
    );
});

function DragHandle({ draggable, onDragStart, onDragEnd }: DragHandleProps): ReactElement {
    const handleMouseDown = (e: MouseEvent<HTMLSpanElement>): void => {
        // Only stop propagation, don't prevent default - we need default for drag to work
        e.stopPropagation();
    };

    const handleClick = (e: MouseEvent<HTMLSpanElement>): void => {
        // Stop click events from bubbling to prevent sorting
        e.stopPropagation();
        e.preventDefault();
    };

    const handleDragStart = (e: DragEvent<HTMLSpanElement>): void => {
        // Don't stop propagation here - let the drag start properly
        if (onDragStart) {
            onDragStart(e);
        }
    };

    const handleDragEnd = (e: DragEvent<HTMLSpanElement>): void => {
        if (onDragEnd) {
            onDragEnd(e);
        }
    };

    return (
        <span
            className="drag-handle"
            draggable={draggable}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
        >
            ⠿
        </span>
    );
}

function SortIcon(): ReactNode {
    const column = useColumn();
    switch (column.sortDir) {
        case "asc":
            return <FaLongArrowAltUp />;
        case "desc":
            return <FaLongArrowAltDown />;
        default:
            return <FaArrowsAltV />;
    }
}

function getAriaSort(canSort: boolean, column: GridColumn): "ascending" | "descending" | "none" | undefined {
    if (!canSort) {
        return undefined;
    }

    switch (column.sortDir) {
        case "asc":
            return "ascending";
        case "desc":
            return "descending";
        default:
            return "none";
    }
}

function getSortProps(column: GridColumn): HTMLAttributes<HTMLDivElement> {
    return {
        onClick: () => {
            column.toggleSort();
        },
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                column.toggleSort();
            }
        },
        role: "button",
        tabIndex: 0
    };
}
