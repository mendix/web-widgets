/* Disable warning that hooks can be used only in components */
/* eslint-disable react-hooks/rules-of-hooks */

import { useGridSelectionProps } from "@mendix/widget-plugin-grid/selection/useGridSelectionProps";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { GUID, ObjectItem } from "mendix";
import { Selectable } from "mendix/preview/Selectable";
import { ReactElement, ReactNode, createElement, useCallback } from "react";
import { ColumnsPreviewType, DatagridPreviewProps } from "typings/DatagridProps";
import { Cell } from "./components/Cell";
import { Widget } from "./components/Widget";
import { ColumnPreview } from "./helpers/ColumnPreview";
import { GridColumn } from "./typings/GridColumn";
import { useColumnsState } from "./features/use-columns-state";

// Fix type definition for Selectable
// TODO: Open PR to fix in appdev.
declare module "mendix/preview/Selectable" {
    interface SelectableProps<T> {
        object: T;
        caption?: string;
        children: ReactNode;
    }
}

const initColumns: ColumnsPreviewType[] = [
    {
        header: "Column",
        tooltip: "",
        attribute: "No attribute selected",
        width: "autoFill",
        columnClass: "",
        filter: { renderer: () => <div />, widgetCount: 0 },
        resizable: false,
        showContentAs: "attribute",
        content: { renderer: () => <div />, widgetCount: 0 },
        dynamicText: "Dynamic Text",
        draggable: false,
        hidable: "no",
        size: 1,
        sortable: false,
        alignment: "left",
        wrapText: false,
        filterAssociation: "",
        filterAssociationOptions: {},
        filterAssociationOptionLabel: ""
    }
];

export function preview(props: DatagridPreviewProps): ReactElement {
    const EmptyPlaceholder = props.emptyPlaceholder.renderer;
    const selectionProps = useGridSelectionProps({
        selection: props.itemSelection,
        helper: undefined,
        selectionMethod: props.itemSelectionMethod,
        showSelectAllToggle: props.showSelectAllToggle
    });
    const data: ObjectItem[] = Array.from({ length: props.pageSize ?? 5 }).map((_, index) => ({
        id: String(index) as GUID
    }));
    const gridId = Date.now().toString();
    const previewColumns: ColumnsPreviewType[] = props.columns.length > 0 ? props.columns : initColumns;
    const columns: GridColumn[] = previewColumns.map((col, index) => new ColumnPreview(col, index, gridId));
    const [columnsState, { setHidden, setOrder }] = useColumnsState();
    return (
        <Widget
            CellComponent={Cell}
            className={props.class}
            columns={columns}
            columnsDraggable={props.columnsDraggable}
            columnsFilterable={props.columnsFilterable}
            columnsHidable={props.columnsHidable}
            columnsResizable={props.columnsResizable}
            columnsSortable={props.columnsSortable}
            columnsState={columnsState}
            data={data}
            emptyPlaceholderRenderer={useCallback(
                (renderWrapper: (children: ReactNode) => ReactElement) => (
                    <EmptyPlaceholder caption="Empty list message: Place widgets here">
                        {renderWrapper(null)}
                    </EmptyPlaceholder>
                ),
                [EmptyPlaceholder]
            )}
            filterRenderer={useCallback(
                (renderWrapper, columnIndex) => {
                    const column = previewColumns[columnIndex];
                    return column.filter ? (
                        <column.filter.renderer caption="Place filter widget here">
                            {renderWrapper(null)}
                        </column.filter.renderer>
                    ) : (
                        renderWrapper(null)
                    );
                },
                [previewColumns]
            )}
            headerContent={
                <props.filtersPlaceholder.renderer caption="Place widgets like filter widget(s) and action button(s) here">
                    <div />
                </props.filtersPlaceholder.renderer>
            }
            hasMoreItems={false}
            headerWrapperRenderer={selectableWrapperRenderer(previewColumns)}
            numberOfItems={5}
            page={0}
            pageSize={props.pageSize ?? 5}
            paging={props.pagination === "buttons"}
            pagingPosition={props.pagingPosition}
            preview
            styles={parseStyle(props.style)}
            setHidden={setHidden}
            setOrder={setOrder}
            valueForSort={useCallback(() => undefined, [])}
            selectionProps={selectionProps}
            selectionStatus={"none"}
        />
    );
}

const selectableWrapperRenderer =
    (columns: ColumnsPreviewType[]) =>
    (columnIndex: number, header: ReactElement): ReactElement => {
        const column = columns[columnIndex];

        // We can't use Selectable when there no columns configured yet, so, just show header.
        if (columns === initColumns) {
            return header;
        }

        return (
            <Selectable
                key={`selectable_column_${columnIndex}`}
                caption={column.header.trim().length > 0 ? column.header : "[Empty caption]"}
                object={column}
            >
                {header}
            </Selectable>
        );
    };

export function getPreviewCss(): string {
    return require("./ui/DatagridPreview.scss");
}
