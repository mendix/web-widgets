// Disable warning that hooks can be used only in components
/* eslint-disable react-hooks/rules-of-hooks */
import { createElement, ReactElement, useCallback } from "react";
import { ColumnsPreviewType, DatagridPreviewProps } from "../typings/DatagridProps";

import { Table, TableColumn } from "./components/Table";
import { parseStyle } from "@mendix/pluggable-widgets-commons";
import { Selectable } from "mendix/preview/Selectable";
import { ObjectItem, GUID } from "mendix";
import classNames from "classnames";
import { isSortable } from "./features/column";
import { selectionSettings, useOnSelectProps } from "./features/selection";

const dummyColumns: ColumnsPreviewType[] = [
    {
        header: "Column",
        tooltip: "",
        attribute: "[No attribute selected]",
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
    const data: ObjectItem[] = Array.from({ length: props.pageSize ?? 5 }).map((_, index) => ({
        id: String(index) as GUID
    }));
    const columns: ColumnsPreviewType[] = props.columns.length > 0 ? props.columns : dummyColumns;

    const selectableWrapperRenderer = useCallback(
        (columnIndex: number, header: ReactElement) => {
            const column = columns[columnIndex];
            return (
                <Selectable
                    key={`selectable_column_${columnIndex}`}
                    caption={column.header.trim().length > 0 ? column.header : "[Empty caption]"}
                    object={column}
                >
                    {header}
                </Selectable>
            );
        },
        [columns]
    );

    const EmptyPlaceholder = props.emptyPlaceholder.renderer;
    const selectActionProps = useOnSelectProps(undefined);
    const { selectionStatus, selectionMethod } = selectionSettings(props, undefined);
    return (
        <Table
            cellRenderer={useCallback(
                (renderWrapper, _, columnIndex) => {
                    const column = columns[columnIndex];
                    const className = classNames(`align-column-${column.alignment}`, { "wrap-text": column.wrapText });
                    let content;
                    switch (column.showContentAs) {
                        case "attribute":
                            content = renderWrapper(
                                <span className="td-text">
                                    {"["}
                                    {column.attribute.length > 0 ? column.attribute : "No attribute selected"}
                                    {"]"}
                                </span>,
                                className
                            );
                            break;
                        case "dynamicText":
                            content = renderWrapper(<span className="td-text">{column.dynamicText}</span>, className);
                            break;
                        case "customContent":
                            content = (
                                <column.content.renderer>{renderWrapper(null, className)}</column.content.renderer>
                            );
                    }

                    return selectableWrapperRenderer(columnIndex, content);
                },
                [columns, selectableWrapperRenderer]
            )}
            className={props.className}
            columns={transformColumnProps(columns)}
            columnsDraggable={props.columnsDraggable}
            columnsFilterable={props.columnsFilterable}
            columnsHidable={props.columnsHidable}
            columnsResizable={props.columnsResizable}
            columnsSortable={props.columnsSortable}
            data={data}
            emptyPlaceholderRenderer={useCallback(
                renderWrapper => (
                    <EmptyPlaceholder caption="Empty list message: Place widgets here">
                        {renderWrapper(null)}
                    </EmptyPlaceholder>
                ),
                [EmptyPlaceholder]
            )}
            filterRenderer={useCallback(
                (renderWrapper, columnIndex) => {
                    const column = columns[columnIndex];
                    return column.filter ? (
                        <column.filter.renderer caption="Place filter widget here">
                            {renderWrapper(null)}
                        </column.filter.renderer>
                    ) : (
                        renderWrapper(null)
                    );
                },
                [columns]
            )}
            hasMoreItems={false}
            headerFilters={
                <props.filtersPlaceholder.renderer caption="Place widgets like filter widget(s) and action button(s) here">
                    <div />
                </props.filtersPlaceholder.renderer>
            }
            headerWrapperRenderer={selectableWrapperRenderer}
            numberOfItems={5}
            page={0}
            pageSize={props.pageSize ?? 5}
            paging={props.pagination === "buttons"}
            pagingPosition={props.pagingPosition}
            preview
            styles={parseStyle(props.style)}
            valueForSort={useCallback(() => undefined, [])}
            onSelect={selectActionProps.onSelect}
            onSelectAll={selectActionProps.onSelectAll}
            isSelected={selectActionProps.isSelected}
            selectionStatus={selectionStatus}
            selectionMethod={selectionMethod}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/DatagridPreview.scss");
}

function transformColumnProps(props: ColumnsPreviewType[]): TableColumn[] {
    return props.map(prop => ({
        ...prop,
        header: (prop.header?.trim().length ?? 0) === 0 ? "[Empty caption]" : prop.header,
        sortable: isSortable(prop),
        draggable: false,
        resizable: false
    }));
}
