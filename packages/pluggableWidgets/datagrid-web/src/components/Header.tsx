import {
    createElement,
    Dispatch,
    ReactElement,
    SetStateAction,
    DragEvent,
    DragEventHandler,
    KeyboardEvent,
    useCallback,
    HTMLAttributes,
    ReactNode
} from "react";
import classNames from "classnames";
import { FaLongArrowAltDown } from "./icons/FaLongArrowAltDown";
import { FaLongArrowAltUp } from "./icons/FaLongArrowAltUp";
import { FaArrowsAltV } from "./icons/FaArrowsAltV";

import { ColumnResizerProps } from "./ColumnResizer";
import * as Grid from "../typings/GridModel";
import { ColumnId, GridColumn } from "../typings/GridColumn";
import { HeaderRefHook } from "../features/model/resizing";

export interface HeaderProps {
    className?: string;
    gridId: string;
    column: GridColumn;
    sortable: boolean;
    resizable: boolean;
    filterable: boolean;
    filterWidget?: ReactNode;
    draggable: boolean;
    dragOver?: ColumnId;
    hidable: boolean;
    isDragging?: boolean;
    preview?: boolean;
    resizer: ReactElement<ColumnResizerProps>;
    swapColumns: Grid.Actions["swap"];
    setDragOver: Dispatch<SetStateAction<ColumnId | undefined>>;
    setIsDragging: Dispatch<SetStateAction<boolean>>;
    useHeaderRef?: HeaderRefHook<HTMLDivElement>;
}

export function Header(props: HeaderProps): ReactElement {
    const canSort = props.sortable && props.column.canSort;
    const canDrag = props.draggable && (props.column.canDrag ?? false);
    const draggableProps = useDraggable(canDrag, props.swapColumns, props.setDragOver, props.setIsDragging);

    const sortIcon = canSort ? getSortIcon(props.column) : null;
    const sortProps = canSort ? getSortProps(props.column) : null;
    const caption = props.column.header.trim();

    return (
        <div
            aria-sort={getAriaSort(canSort, props.column)}
            className={classNames("th", {
                "hidden-column-preview":
                    props.preview && (!props.column.isAvailable || (props.hidable && props.column.isHidden))
            })}
            role="columnheader"
            style={!canSort ? { cursor: "unset" } : undefined}
            title={caption}
            ref={props.useHeaderRef?.(props.column.columnId)}
        >
            <div
                className={classNames("column-container", {
                    dragging: canDrag && props.column.columnId === props.dragOver
                })}
                id={`${props.gridId}-column${props.column.columnId}`}
                data-column-id={props.column.columnId}
                {...draggableProps}
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

const DATA_FORMAT_ID = "application/x-mx-widget-web-datagrid-column-id";

function useDraggable(
    columnsDraggable: boolean,
    setColumnOrder: Grid.Actions["swap"],
    setDragOver: Dispatch<SetStateAction<ColumnId | undefined>>,
    setIsDragging: Dispatch<SetStateAction<boolean>>
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
            setIsDragging(true);
            const elt = e.target as HTMLDivElement;
            e.dataTransfer.setData(DATA_FORMAT_ID, elt.dataset.columnId ?? "");
        },
        [setIsDragging]
    );

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
    }, []);

    const handleDragEnter = useCallback(
        (e: DragEvent<HTMLDivElement>): void => {
            const {
                dataset: { columnId }
            } = e.target as HTMLDivElement;
            const colDestination = e.dataTransfer.getData(DATA_FORMAT_ID);
            if (columnId !== colDestination) {
                setDragOver(columnId as ColumnId);
            }
        },
        [setDragOver]
    );

    const handleDragEnd = useCallback((): void => {
        setIsDragging(false);
        setDragOver(undefined);
    }, [setDragOver, setIsDragging]);

    const handleOnDrop = useCallback(
        (e: DragEvent<HTMLDivElement>): void => {
            handleDragEnd();
            const columnA = (e.target as HTMLDivElement).dataset.columnId as ColumnId;
            const columnB = e.dataTransfer.getData(DATA_FORMAT_ID) as ColumnId;

            setColumnOrder([columnA, columnB]);
        },
        [handleDragEnd, setColumnOrder]
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
