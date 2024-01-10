/* Disable warning that hooks can be used only in components */
/* eslint-disable react-hooks/rules-of-hooks */

import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { GUID, ObjectItem } from "mendix";
import { Selectable } from "mendix/preview/Selectable";
import { ReactElement, ReactNode, createElement, useCallback, useMemo } from "react";
import { ColumnsPreviewType, DatagridPreviewProps } from "typings/DatagridProps";
import { Cell } from "./components/Cell";
import { Widget } from "./components/Widget";
import { ColumnPreview } from "./helpers/ColumnPreview";
import { initColumnsState } from "./features/use-columns-state";
import { useSelectActionHelper } from "./helpers/use-select-action-helper";
import { useFocusTargetController } from "./features/keyboard-navigation/useFocusTargetController";

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
        alignment: "left",
        attribute: "No attribute selected",
        columnClass: "",
        content: { renderer: () => <div />, widgetCount: 0 },
        draggable: false,
        dynamicText: "Dynamic Text",
        filter: { renderer: () => <div />, widgetCount: 0 },
        filterAssociation: "",
        filterAssociationOptionLabel: "",
        filterAssociationOptions: {},
        header: "Column",
        hidable: "no",
        resizable: false,
        showContentAs: "attribute",
        size: 1,
        sortable: false,
        tooltip: "",
        visible: "false",
        width: "autoFill",
        wrapText: false
    }
];

export function preview(props: DatagridPreviewProps): ReactElement {
    const EmptyPlaceholder = props.emptyPlaceholder.renderer;
    const data: ObjectItem[] = Array.from({ length: props.pageSize ?? 5 }).map((_, index) => ({
        id: String(index) as GUID
    }));
    const gridId = useMemo(() => Date.now().toString(), []);
    const previewColumns: ColumnsPreviewType[] = props.columns.length > 0 ? props.columns : initColumns;
    const columnsState = initColumnsState(previewColumns.map((col, index) => new ColumnPreview(col, index, gridId)));
    const pageSize = props.pageSize ?? 5;

    const selectActionHelper = useSelectActionHelper(
        {
            itemSelection: props.itemSelection,
            itemSelectionMethod: props.itemSelectionMethod,
            showSelectAllToggle: props.showSelectAllToggle,
            pageSize
        },
        undefined
    );

    const visibleColumnsCount = selectActionHelper.showCheckboxColumn
        ? columnsState.columnsVisible.length + 1
        : columnsState.columnsVisible.length;

    const focusController = useFocusTargetController({
        rows: data.length,
        columns: visibleColumnsCount,
        pageSize
    });

    const eventsController = { getProps: () => Object.create({}) };

    return (
        <Widget
            CellComponent={Cell}
            className={props.class}
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
            exporting={false}
            filterRenderer={useCallback(
                (renderWrapper, columnIndex) => {
                    const column = props.columns.at(columnIndex);
                    return column?.filter ? (
                        <column.filter.renderer caption="Place filter widget here">
                            {renderWrapper(null)}
                        </column.filter.renderer>
                    ) : (
                        renderWrapper(null)
                    );
                },
                [props.columns]
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
            processedRows={0}
            styles={parseStyle(props.style)}
            setHidden={() => {
                return undefined;
            }}
            setOrder={() => {
                return undefined;
            }}
            valueForSort={useCallback(() => undefined, [])}
            selectionStatus={"none"}
            rowClickable={!!(props.itemSelection !== "None" || props.onClick)}
            selectActionHelper={selectActionHelper}
            cellEventsController={eventsController}
            checkboxEventsController={eventsController}
            focusController={focusController}
        />
    );
}

const selectableWrapperRenderer =
    (columns: ColumnsPreviewType[]) =>
    (columnIndex: number, header: ReactElement): ReactElement => {
        const column = columns.at(columnIndex);

        // We can't use Selectable when there no columns configured yet, so, just show header.
        if (columns === initColumns || column === undefined) {
            return header;
        }

        return (
            <Selectable
                key={column.header || column.attribute}
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
