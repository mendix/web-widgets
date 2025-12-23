import classNames from "classnames";
import { KeyboardEvent, ReactElement, ReactNode } from "react";
import { FaArrowsAltV } from "./icons/FaArrowsAltV";
import { FaLongArrowAltDown } from "./icons/FaLongArrowAltDown";
import { FaLongArrowAltUp } from "./icons/FaLongArrowAltUp";
import { DragHandle } from "./DragHandle";
import { useColumn, useDatagridConfig, useHeaderDndVM } from "../model/hooks/injection-hooks";
import { observer } from "mobx-react-lite";
import { SortDirection } from "../typings/sorting";
import { useSortable } from "@dnd-kit/sortable";

interface SortIconProps {
    direction: SortDirection | undefined;
    onToggleSort?: () => void;
    caption?: string;
}

export const ColumnHeader = observer(function ColumnHeader(): ReactElement {
    const { columnsDraggable, columnsSortable } = useDatagridConfig();
    const column = useColumn();
    const { columnId, header, canSort, alignment } = column;
    const caption = header.trim();
    const isDndEnabled = columnsDraggable && column.canDrag;
    const isSortable = columnsSortable && canSort;
    const { attributes, listeners, setActivatorNodeRef } = useSortable({
        id: columnId,
        disabled: !isDndEnabled
    });
    const vm = useHeaderDndVM();

    return (
        <div
            className={classNames("column-header", `align-column-${alignment}`)}
            style={{ pointerEvents: vm.isDragging ? "none" : undefined }}
        >
            {isDndEnabled && (
                <DragHandle setActivatorNodeRef={setActivatorNodeRef} listeners={listeners} attributes={attributes} />
            )}
            <span className="column-caption">{caption.length > 0 ? caption : "\u00a0"}</span>
            {isSortable ? (
                <SortIcon direction={column.sortDir} onToggleSort={() => column.toggleSort()} caption={caption} />
            ) : null}
        </div>
    );
});

function SortIcon({ direction, onToggleSort, caption }: SortIconProps): ReactNode {
    const icon = getIconElement(direction);

    if (!onToggleSort) {
        return icon;
    }

    return (
        <button
            className="sort-button"
            onClick={onToggleSort}
            onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggleSort();
                }
            }}
            aria-label={`Sort by ${caption}`}
        >
            {icon}
        </button>
    );
}

function getIconElement(direction: SortDirection | undefined): ReactNode {
    switch (direction) {
        case "asc":
            return <FaLongArrowAltUp />;
        case "desc":
            return <FaLongArrowAltDown />;
        default:
            return <FaArrowsAltV />;
    }
}
