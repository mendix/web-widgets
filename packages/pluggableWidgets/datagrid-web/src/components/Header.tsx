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
import { ColumnId, GridColumn } from "../typings/GridColumn";
import { ColumnResizerProps } from "./ColumnResizer";
import { SortRule } from "../typings/GridSettings";

export interface HeaderProps {
    className?: string;
    column: GridColumn;
    sortable: boolean;
    resizable: boolean;
    filterable: boolean;
    filterWidget?: ReactNode;
    draggable: boolean;
    dragOver: ColumnId | undefined;
    hidable: boolean;
    isDragging?: boolean;
    preview?: boolean;
    resizer: ReactElement<ColumnResizerProps>;
    setOrder: Dispatch<SetStateAction<ColumnId[]>>;
    setDragOver: Dispatch<SetStateAction<ColumnId>>;
    setIsDragging: Dispatch<SetStateAction<boolean>>;
    setSort: Dispatch<ColumnId>;
    sortRule: SortRule | undefined;
    visibleColumns: GridColumn[];
    gridId: string;
}

export function Header(props: HeaderProps): ReactElement {
    const canSort = props.sortable && props.column.canSort;
    const canDrag = props.draggable && (props.column.canDrag ?? false);
    const draggableProps = useDraggable(canDrag, props.setOrder, props.setDragOver, props.setIsDragging);
    const isSorted = props.sortRule !== undefined;
    const isSortedDesc = props.sortRule?.[1] === "desc";

    const sortIcon = canSort ? (
        isSorted ? (
            isSortedDesc ? (
                <FaLongArrowAltDown />
            ) : (
                <FaLongArrowAltUp />
            )
        ) : (
            <FaArrowsAltV />
        )
    ) : null;

    const caption = props.column.header.trim();

    const onSortBy = (): void => props.setSort(props.column.columnId);

    const sortProps: HTMLAttributes<HTMLDivElement> = {
        onClick: onSortBy,
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSortBy();
            }
        },
        role: "button",
        tabIndex: 0
    };

    return (
        <div
            aria-sort={canSort ? (isSorted ? (isSortedDesc ? "descending" : "ascending") : "none") : undefined}
            className={classNames("th", {
                "hidden-column-preview":
                    props.preview && ((props.hidable && props.column.initiallyHidden) || !props.column.visible)
            })}
            role="columnheader"
            style={!props.sortable || !props.column.canSort ? { cursor: "unset" } : undefined}
            title={caption}
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
                    className={classNames("column-header", canSort ? "clickable" : "", props.className)}
                    style={{ pointerEvents: props.isDragging ? "none" : undefined }}
                    {...(canSort ? sortProps : undefined)}
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
    setColumnOrder: Dispatch<SetStateAction<ColumnId[]>>,
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

            setColumnOrder(prevOrder => {
                const indexA = prevOrder.indexOf(columnA);
                const indexB = prevOrder.indexOf(columnB);

                if (indexA === -1 || indexB === -1) {
                    throw new Error("Unable to find column in the current order array");
                }

                if (indexA !== indexB) {
                    const nextOrder = [...prevOrder];
                    nextOrder[indexA] = columnB;
                    nextOrder[indexB] = columnA;
                    return nextOrder;
                }

                return prevOrder;
            });
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
