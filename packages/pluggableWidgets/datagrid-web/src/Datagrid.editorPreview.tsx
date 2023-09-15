/* Disable warning that hooks can be used only in components */
/* eslint-disable react-hooks/rules-of-hooks */

// import { createElement, ReactElement, ReactNode, useCallback } from "react";
// import { ColumnsPreviewType, DatagridPreviewProps } from "../typings/DatagridProps";
import { createElement, ReactElement, ReactNode, useCallback } from "react";
import { Table } from "./components/Table";
import { ColumnsPreviewType, DatagridPreviewProps } from "typings/DatagridProps";

// import { Table, TableColumn } from "./components/Table";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { Selectable } from "mendix/preview/Selectable";
import { ObjectItem, GUID } from "mendix";
// import classNames from "classnames";
// import { isSortable } from "./features/column";
import { selectionSettings, useOnSelectProps } from "./features/selection";
import { PreviewCell } from "./components/PreviewCell";
import { fromColumnsPreviewType } from "./models/GridColumn";

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

// export function preview(props: DatagridPreviewProps): ReactElement {
//     const data: ObjectItem[] = Array.from({ length: props.pageSize ?? 5 }).map((_, index) => ({
//         id: String(index) as GUID
//     }));
//     const columns: ColumnsPreviewType[] = props.columns.length > 0 ? props.columns : dummyColumns;

//     const selectableWrapperRenderer = useCallback(
//         (columnIndex: number, header: ReactElement) => {
//             const column = columns[columnIndex];

//             // We can't use Selectable when there no columns configured yet, so, just show header.
//             if (columns === dummyColumns) {
//                 return header;
//             }

//             return (
//                 <Selectable
//                     key={`selectable_column_${columnIndex}`}
//                     caption={column.header.trim().length > 0 ? column.header : "[Empty caption]"}
//                     object={column}
//                 >
//                     {header}
//                 </Selectable>
//             );
//         },
//         [columns]
//     );

//     const selectActionProps = useOnSelectProps(undefined);
//     const { selectionStatus, selectionMethod } = selectionSettings(props, undefined);
//     return (
//         <Table
//             cellRenderer={useCallback(
//                 (renderWrapper, _, columnIndex) => {
//                     const column = columns[columnIndex];
//                     const className = classNames(`align-column-${column.alignment}`, { "wrap-text": column.wrapText });
//                     let content;

//                     return selectableWrapperRenderer(columnIndex, content);
//                 },
//                 [columns, selectableWrapperRenderer]
//             )}
//             className={props.class}
//             columns={transformColumnProps(columns)}
// columnsDraggable={props.columnsDraggable}
// columnsFilterable={props.columnsFilterable}
// columnsHidable={props.columnsHidable}
// columnsResizable={props.columnsResizable}
// columnsSortable={props.columnsSortable}
//             data={data}

//             filterRenderer={useCallback(
//                 (renderWrapper, columnIndex) => {
//                     const column = columns[columnIndex];
//                     return column.filter ? (
//                         <column.filter.renderer caption="Place filter widget here">
//                             {renderWrapper(null)}
//                         </column.filter.renderer>
//                     ) : (
//                         renderWrapper(null)
//                     );
//                 },
//                 [columns]
//             )}
//             hasMoreItems={false}

//             headerWrapperRenderer={selectableWrapperRenderer}

//         />
//     );
// }
export function preview(props: DatagridPreviewProps): ReactElement {
    const EmptyPlaceholder = props.emptyPlaceholder.renderer;
    const selectActionProps = useOnSelectProps(undefined);
    const { selectionStatus, selectionMethod } = selectionSettings(props, undefined);
    const data: ObjectItem[] = Array.from({ length: props.pageSize ?? 5 }).map((_, index) => ({
        id: String(index) as GUID
    }));
    const columns: ColumnsPreviewType[] = props.columns.length > 0 ? props.columns : initColumns;
    return (
        <Table
            CellComponent={PreviewCell}
            className={props.class}
            columns={columns}
            columnsDraggable={props.columnsDraggable}
            columnsFilterable={props.columnsFilterable}
            columnsHidable={props.columnsHidable}
            columnsResizable={props.columnsResizable}
            columnsSortable={props.columnsSortable}
            data={data}
            emptyPlaceholderRenderer={useCallback(
                (renderWrapper: (children: ReactNode) => ReactElement) => (
                    <EmptyPlaceholder caption="Empty list message: Place widgets here">
                        {renderWrapper(null)}
                    </EmptyPlaceholder>
                ),
                [EmptyPlaceholder]
            )}
            filterRenderer={(_x: unknown, _y: unknown) => <span></span>}
            gridColumns={props.columns.map(fromColumnsPreviewType)}
            gridHeaderWidgets={
                <props.filtersPlaceholder.renderer caption="Place widgets like filter widget(s) and action button(s) here">
                    <div />
                </props.filtersPlaceholder.renderer>
            }
            hasMoreItems={false}
            headerWrapperRenderer={selectableWrapperRenderer(columns)}
            isSelected={selectActionProps.isSelected}
            numberOfItems={5}
            onSelect={selectActionProps.onSelect}
            onSelectAll={selectActionProps.onSelectAll}
            page={0}
            pageSize={props.pageSize ?? 5}
            paging={props.pagination === "buttons"}
            pagingPosition={props.pagingPosition}
            preview
            selectionMethod={selectionMethod}
            selectionStatus={selectionStatus}
            styles={parseStyle(props.style)}
            valueForSort={useCallback(() => undefined, [])}
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

// function transformColumnProps(props: ColumnsPreviewType[]): TableColumn[] {
//     return props.map(prop => ({
//         ...prop,
//         header: (prop.header?.trim().length ?? 0) === 0 ? "[Empty caption]" : prop.header,
//         sortable: isSortable(prop),
//         draggable: false,
//         resizable: false
//     }));
// }
