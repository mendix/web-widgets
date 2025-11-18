import classNames from "classnames";
import {
    Dispatch,
    DragEvent,
    DragEventHandler,
    HTMLAttributes,
    KeyboardEvent,
    ReactElement,
    ReactNode,
    SetStateAction,
    useCallback
} from "react";
import { FaArrowsAltV } from "./icons/FaArrowsAltV";
import { FaLongArrowAltDown } from "./icons/FaLongArrowAltDown";
import { FaLongArrowAltUp } from "./icons/FaLongArrowAltUp";

import { useColumn, useColumnsStore, useDatagridConfig } from "../model/hooks/injection-hooks";
import { ColumnId, GridColumn } from "../typings/GridColumn";
import { ColumnResizerProps } from "./ColumnResizer";

export interface HeaderProps {
    isLast?: boolean;
    resizer: ReactElement<ColumnResizerProps>;

    dropTarget?: [ColumnId, "before" | "after"];
    isDragging?: [ColumnId | undefined, ColumnId, ColumnId | undefined];
    setDropTarget: Dispatch<SetStateAction<[ColumnId, "before" | "after"] | undefined>>;
    setIsDragging: Dispatch<SetStateAction<[ColumnId | undefined, ColumnId, ColumnId | undefined] | undefined>>;
}

export function Header(props: HeaderProps): ReactElement {
    const { columnsFilterable, id: gridId } = useDatagridConfig();
    const columnsStore = useColumnsStore();
    const column = useColumn();
    const { canDrag, canSort } = column;

    const draggableProps = useDraggable(
        canDrag,
        columnsStore.swapColumns.bind(columnsStore),
        props.dropTarget,
        props.setDropTarget,
        props.isDragging,
        props.setIsDragging
    );

    const sortIcon = canSort ? getSortIcon(column) : null;
    const sortProps = canSort ? getSortProps(column) : null;
    const caption = column.header.trim();

    return (
        <div
            aria-sort={getAriaSort(canSort, column)}
            className={classNames("th", {
                [`drop-${props.dropTarget?.[1]}`]: column.columnId === props.dropTarget?.[0],
                dragging: column.columnId === props.isDragging?.[1],
                "dragging-over-self": column.columnId === props.isDragging?.[1] && !props.dropTarget
            })}
            role="columnheader"
            style={!canSort ? { cursor: "unset" } : undefined}
            title={caption}
            ref={ref => column.setHeaderElementRef(ref)}
            data-column-id={column.columnId}
            onDrop={draggableProps.onDrop}
            onDragEnter={draggableProps.onDragEnter}
            onDragOver={draggableProps.onDragOver}
        >
            <div
                className={classNames("column-container")}
                id={`${gridId}-column${column.columnId}`}
                draggable={draggableProps.draggable}
                onDragStart={draggableProps.onDragStart}
                onDragEnd={draggableProps.onDragEnd}
            >
                <div
                    className={classNames("column-header", { clickable: canSort }, `align-column-${column.alignment}`)}
                    style={{ pointerEvents: props.isDragging ? "none" : undefined }}
                    {...sortProps}
                    aria-label={canSort ? "sort " + caption : caption}
                >
                    <span>{caption.length > 0 ? caption : "\u00a0"}</span>
                    {sortIcon}
                </div>
                {columnsFilterable && (
                    <div className="filter" style={{ pointerEvents: props.isDragging ? "none" : undefined }}>
                        {columnsStore.columnFilters[column.columnIndex]?.renderFilterWidgets()}
                    </div>
                )}
            </div>
            {column.canResize ? props.resizer : null}
        </div>
    );
}

function useDraggable(
    columnsDraggable: boolean,
    setColumnOrder: (source: ColumnId, target: [ColumnId, "after" | "before"]) => void,
    dropTarget: [ColumnId, "before" | "after"] | undefined,
    setDropTarget: Dispatch<SetStateAction<[ColumnId, "before" | "after"] | undefined>>,
    dragging: [ColumnId | undefined, ColumnId, ColumnId | undefined] | undefined,
    setDragging: Dispatch<SetStateAction<[ColumnId | undefined, ColumnId, ColumnId | undefined] | undefined>>
): {
    draggable?: boolean;
    onDragStart?: DragEventHandler;
    onDragOver?: DragEventHandler;
    onDrop?: DragEventHandler;
    onDragEnter?: DragEventHandler;
    onDragEnd?: DragEventHandler;
} {
    const handleDragStart = useCallback(
        (e: DragEvent<HTMLDivElement>): void => {
            const elt = (e.target as HTMLDivElement).closest(".th") as HTMLDivElement;
            const columnId = elt.dataset.columnId ?? "";

            const columnAtTheLeft = (elt.previousElementSibling as HTMLDivElement)?.dataset?.columnId as ColumnId;
            const columnAtTheRight = (elt.nextElementSibling as HTMLDivElement)?.dataset?.columnId as ColumnId;

            setDragging([columnAtTheLeft, columnId as ColumnId, columnAtTheRight]);
        },
        [setDragging]
    );

    const handleDragOver = useCallback(
        (e: DragEvent<HTMLDivElement>): void => {
            if (!dragging) {
                return;
            }
            const columnId = (e.currentTarget as HTMLDivElement).dataset.columnId as ColumnId;
            if (!columnId) {
                return;
            }
            e.preventDefault();

            const [leftSiblingColumnId, draggingColumnId, rightSiblingColumnId] = dragging;

            if (columnId === draggingColumnId) {
                // hover on itself place, no highlight
                if (dropTarget !== undefined) {
                    setDropTarget(undefined);
                }
                return;
            }

            let isAfter: boolean;

            if (columnId === leftSiblingColumnId) {
                isAfter = false;
            } else if (columnId === rightSiblingColumnId) {
                isAfter = true;
            } else {
                // check position in element
                const rect = e.currentTarget.getBoundingClientRect();
                isAfter = rect.width / 2 + (dropTarget?.[1] === "after" ? -10 : 10) < e.clientX - rect.left;
            }

            const newPosition = isAfter ? "after" : "before";

            if (columnId !== dropTarget?.[0] || newPosition !== dropTarget?.[1]) {
                setDropTarget([columnId, newPosition]);
            }
        },
        [dragging, dropTarget, setDropTarget]
    );

    const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
    }, []);

    const handleDragEnd = useCallback((): void => {
        setDragging(undefined);
        setDropTarget(undefined);
    }, [setDropTarget, setDragging]);

    const handleOnDrop = useCallback(
        (_e: DragEvent<HTMLDivElement>): void => {
            handleDragEnd();
            if (!dragging || !dropTarget) {
                return;
            }

            setColumnOrder(dragging[1], dropTarget);
        },
        [handleDragEnd, setColumnOrder, dragging, dropTarget]
    );

    return columnsDraggable
        ? {
              draggable: true,
              onDragStart: handleDragStart,
              onDragOver: handleDragOver,
              onDrop: handleOnDrop,
              onDragEnter: handleDragEnter,
              onDragEnd: handleDragEnd
          }
        : {};
}

function getSortIcon(column: GridColumn): ReactNode {
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
