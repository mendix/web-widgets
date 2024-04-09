import {
    createElement,
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
import classNames from "classnames";
import { FaLongArrowAltDown } from "./icons/FaLongArrowAltDown";
import { FaLongArrowAltUp } from "./icons/FaLongArrowAltUp";
import { FaArrowsAltV } from "./icons/FaArrowsAltV";

import { ColumnResizerProps } from "./ColumnResizer";
import { ColumnId, GridColumn } from "../typings/GridColumn";

export interface HeaderProps {
    className?: string;
    gridId: string;
    column: GridColumn;
    sortable: boolean;
    resizable: boolean;
    filterable: boolean;
    hidable: boolean;
    draggable: boolean;
    filterWidget?: ReactNode;
    preview?: boolean;
    resizer: ReactElement<ColumnResizerProps>;
    dropTarget?: [ColumnId, "before" | "after"];
    isDragging?: [ColumnId | undefined, ColumnId, ColumnId | undefined];
    setDropTarget: Dispatch<SetStateAction<[ColumnId, "before" | "after"] | undefined>>;
    setIsDragging: Dispatch<SetStateAction<[ColumnId | undefined, ColumnId, ColumnId | undefined] | undefined>>;
    swapColumns: (source: ColumnId, target: [ColumnId, "before" | "after"]) => void;
}

export function Header(props: HeaderProps): ReactElement {
    const canSort = props.sortable && props.column.canSort;
    const canDrag = props.draggable && (props.column.canDrag ?? false);
    const draggableProps = useDraggable(
        canDrag,
        props.swapColumns,
        props.dropTarget,
        props.setDropTarget,
        props.isDragging,
        props.setIsDragging
    );

    const sortIcon = canSort ? getSortIcon(props.column) : null;
    const sortProps = canSort ? getSortProps(props.column) : null;
    const caption = props.column.header.trim();

    return (
        <div
            aria-sort={getAriaSort(canSort, props.column)}
            className={classNames(
                "th",
                {
                    "hidden-column-preview":
                        props.preview && (!props.column.isAvailable || (props.hidable && props.column.isHidden))
                },
                {
                    [`drop-${props.dropTarget?.[1]}`]: props.column.columnId === props.dropTarget?.[0],
                    dragging: props.column.columnId === props.isDragging?.[1],
                    "dragging-over-self": props.column.columnId === props.isDragging?.[1] && !props.dropTarget
                }
            )}
            role="columnheader"
            style={!canSort ? { cursor: "unset" } : undefined}
            title={caption}
            ref={ref => props.column.setHeaderElementRef(ref)}
            data-column-id={props.column.columnId}
            onDrop={draggableProps.onDrop}
            onDragEnter={draggableProps.onDragEnter}
            onDragOver={draggableProps.onDragOver}
        >
            <div
                className={classNames("column-container")}
                id={`${props.gridId}-column${props.column.columnId}`}
                draggable={draggableProps.draggable}
                onDragStart={draggableProps.onDragStart}
                onDragEnd={draggableProps.onDragEnd}
            >
                <div
                    className={classNames("column-header", { clickable: canSort }, props.className)}
                    style={{ pointerEvents: props.isDragging ? "none" : undefined }}
                    {...sortProps}
                    aria-label={canSort ? "sort " + caption : caption}
                >
                    <span>{caption.length > 0 ? caption : "\u00a0"}</span>
                    {sortIcon}
                </div>
                {props.filterable && props.filterWidget}
            </div>
            {props.resizable && props.column.canResize && props.resizer}
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
