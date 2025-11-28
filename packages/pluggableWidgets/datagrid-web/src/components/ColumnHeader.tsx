import classNames from "classnames";
import { DragEventHandler, DragEvent, HTMLAttributes, KeyboardEvent, MouseEvent, ReactElement, ReactNode } from "react";
import { FaArrowsAltV } from "./icons/FaArrowsAltV";
import { FaLongArrowAltDown } from "./icons/FaLongArrowAltDown";
import { FaLongArrowAltUp } from "./icons/FaLongArrowAltUp";
import { useColumn, useColumnHeaderVM } from "../model/hooks/injection-hooks";
import { observer } from "mobx-react-lite";

interface DragHandleProps {
    draggable: boolean;
    onDragStart?: DragEventHandler<HTMLSpanElement>;
    onDragEnd?: DragEventHandler<HTMLSpanElement>;
}

export const ColumnHeader = observer(function ColumnHeader(): ReactElement {
    const { header, canSort, alignment, toggleSort } = useColumn();
    const caption = header.trim();
    const sortProps = canSort ? getSortProps(toggleSort) : null;
    const vm = useColumnHeaderVM();

    return (
        <div
            className={classNames("column-header", { clickable: canSort }, `align-column-${alignment}`)}
            style={{ pointerEvents: vm.dragging ? "none" : undefined }}
            {...sortProps}
            aria-label={canSort ? "sort " + caption : caption}
        >
            {vm.isDraggable && (
                <DragHandle draggable={vm.isDraggable} onDragStart={vm.handleDragStart} onDragEnd={vm.handleDragEnd} />
            )}
            <span className="column-caption">{caption.length > 0 ? caption : "\u00a0"}</span>
            {canSort ? <SortIcon /> : null}
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

function getSortProps(toggleSort: () => void): HTMLAttributes<HTMLDivElement> {
    return {
        onClick: () => {
            toggleSort();
        },
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleSort();
            }
        },
        role: "button",
        tabIndex: 0
    };
}
