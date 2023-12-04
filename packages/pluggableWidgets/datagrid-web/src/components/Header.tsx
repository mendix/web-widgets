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
import { GridColumn } from "../typings/GridColumn";
import { ColumnResizerProps } from "./ColumnResizer";
import { SortingRule } from "../features/settings";

export interface HeaderProps {
    className?: string;
    column: GridColumn;
    sortable: boolean;
    resizable: boolean;
    filterable: boolean;
    filterWidget?: ReactNode;
    draggable: boolean;
    dragOver: string;
    hidable: boolean;
    isDragging?: boolean;
    preview?: boolean;
    resizer: ReactElement<ColumnResizerProps>;
    setColumnOrder: (updater: number[]) => void;
    setDragOver: Dispatch<SetStateAction<string>>;
    setIsDragging: Dispatch<SetStateAction<boolean>>;
    setSortBy: Dispatch<SetStateAction<SortingRule[]>>;
    sortBy: SortingRule[];
    visibleColumns: GridColumn[];
    tableId: string;
}

export function Header(props: HeaderProps): ReactElement {
    const canSort = props.sortable && props.column.canSort;
    const canDrag = props.draggable && (props.column.canDrag ?? false);
    const draggableProps = useDraggable(canDrag, props.setColumnOrder, props.setDragOver, props.setIsDragging);

    const [sortProperties] = props.sortBy;
    const isSorted = sortProperties && sortProperties.columnNumber === props.column.columnNumber;
    const isSortedDesc = isSorted && sortProperties.desc;

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

    const onSortBy = (): void => {
        /**
         * Always analyse previous values to predict the next
         * 1 - !isSorted turns to asc
         * 2 - isSortedDesc === false && isSorted turns to desc
         * 3 - isSortedDesc === true && isSorted turns to unsorted
         * If multisort is allowed in the future this should be changed to append instead of just return a new array
         */
        if (!isSorted) {
            props.setSortBy([{ columnNumber: props.column.columnNumber, desc: false }]);
        } else if (isSorted && !isSortedDesc) {
            props.setSortBy([{ columnNumber: props.column.columnNumber, desc: true }]);
        } else {
            props.setSortBy([]);
        }
    };

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
                id={props.column.columnId}
                data-column-number={props.column.columnNumber}
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

const DATA_FORMAT_NUM = "application/x-mx-widget-web-datagrid-column-number";
const DATA_FORMAT_ID = "application/x-mx-widget-web-datagrid-column-id";

function useDraggable(
    columnsDraggable: boolean,
    setColumnOrder: (updater: ((columnOrder: number[]) => number[]) | number[]) => void,
    setDragOver: Dispatch<SetStateAction<string>>,
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
            e.dataTransfer.setData(DATA_FORMAT_NUM, getColNum(elt));
            e.dataTransfer.setData(DATA_FORMAT_ID, elt.id);
        },
        [setIsDragging]
    );

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
    }, []);

    const handleDragEnter = useCallback(
        (e: DragEvent<HTMLDivElement>): void => {
            const { id: columnId } = e.target as HTMLDivElement;
            const colDestination = e.dataTransfer.getData(DATA_FORMAT_ID);
            if (columnId !== colDestination) {
                setDragOver(columnId);
            }
        },
        [setDragOver]
    );

    const handleDragEnd = useCallback((): void => {
        setIsDragging(false);
        setDragOver("");
    }, [setDragOver, setIsDragging]);

    const handleOnDrop = useCallback(
        (e: DragEvent<HTMLDivElement>): void => {
            handleDragEnd();
            const columnA = colNumFromString(getColNum(e.target as HTMLDivElement));
            const columnB = colNumFromString(e.dataTransfer.getData(DATA_FORMAT_NUM));

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
function getColNum<T extends HTMLElement>(target: T): string {
    if (!Object.hasOwn(target.dataset, "columnNumber") || target.dataset.columnNumber === undefined) {
        throw new Error("Element is missing data-column-number value");
    }

    return target.dataset.columnNumber;
}

function colNumFromString(data: string): number {
    const num = parseInt(data, 10);

    if (isNaN(num)) {
        throw new Error(`Unable to parse column number: ${data}`);
    }

    return num;
}
