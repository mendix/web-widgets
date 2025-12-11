import classNames from "classnames";
import { HTMLAttributes, KeyboardEvent, ReactElement, ReactNode } from "react";
import { DragHandle } from "./DragHandle";
import { FaArrowsAltV } from "./icons/FaArrowsAltV";
import { FaLongArrowAltDown } from "./icons/FaLongArrowAltDown";
import { FaLongArrowAltUp } from "./icons/FaLongArrowAltUp";
import { useColumn, useHeaderDragnDropVM } from "../model/hooks/injection-hooks";
import { observer } from "mobx-react-lite";
import { SortDirection } from "../typings/sorting";

interface SortIconProps {
    direction: SortDirection | undefined;
}

export const ColumnHeader = observer(function ColumnHeader(): ReactElement {
    const column = useColumn();
    const { header, canSort, alignment } = column;
    const caption = header.trim();
    const sortProps = canSort ? getSortProps(() => column.toggleSort()) : null;
    const vm = useHeaderDragnDropVM();

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
            {canSort ? <SortIcon direction={column.sortDir} /> : null}
        </div>
    );
});

function SortIcon({ direction }: SortIconProps): ReactNode {
    switch (direction) {
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
