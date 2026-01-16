import classNames from "classnames";
import { ReactElement } from "react";
import { useColumn, useColumnsStore, useDatagridConfig } from "../model/hooks/injection-hooks";
import { ColumnHeader } from "./ColumnHeader";

/**
 * Drag preview content for column header reordering.
 *
 * Rendered by @dnd-kit DragOverlay in a portal, so we provide the same selector context
 * used by the datagrid SCSS to make it look like a real header.
 */
export function ColumnHeaderDragPreview(): ReactElement {
    const { columnsFilterable, id: gridId } = useDatagridConfig();
    const { columnFilters } = useColumnsStore();
    const column = useColumn();
    const { columnId, columnIndex, header, size } = column;
    const caption = header.trim();

    return (
        <div className="widget-datagrid">
            <div className="widget-datagrid-grid table">
                <div
                    className={classNames("th", "drag-preview")}
                    role="presentation"
                    title={caption}
                    style={size ? { width: `${size}px` } : undefined}
                >
                    <div className={classNames("column-container")} id={`${gridId}-column${columnId}`}>
                        <ColumnHeader />
                        {columnsFilterable && (
                            <div className="filter">{columnFilters[columnIndex]?.renderFilterWidgets()}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
