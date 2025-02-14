/* Disable warning that hooks can be used only in components */
/* eslint-disable react-hooks/rules-of-hooks */

import { enableStaticRendering } from "mobx-react-lite";
enableStaticRendering(true);

import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { GUID, ObjectItem } from "mendix";
import { Selectable } from "mendix/preview/Selectable";
import { ReactElement, ReactNode, createElement, useCallback, useMemo } from "react";
import { ColumnsPreviewType, DatagridPreviewProps } from "typings/DatagridProps";
import { Cell } from "./components/Cell";
import { Widget } from "./components/Widget";
import { ColumnPreview } from "./helpers/ColumnPreview";
import { useSelectActionHelper } from "./helpers/SelectActionHelper";
import { useFocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import "./ui/DatagridPreview.scss";

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
        filterAssociationOptionLabelAttr: "",
        filterAssociationOptions: {},
        filterCaptionType: "expression",
        header: "Column",
        hidable: "no",
        resizable: false,
        showContentAs: "attribute",
        size: 1,
        sortable: false,
        tooltip: "",
        visible: "true",
        width: "autoFill",
        wrapText: false,
        minWidth: "auto",
        minWidthLimit: 100,
        allowEventPropagation: true,
        exportValue: "",
        fetchOptionsLazy: true
    }
];

const numberOfItems = 3;

export function preview(props: DatagridPreviewProps): ReactElement {
    const EmptyPlaceholder = props.emptyPlaceholder.renderer;
    const data: ObjectItem[] = Array.from({ length: numberOfItems }).map((_, index) => ({
        id: String(index) as GUID
    }));
    const gridId = useMemo(() => Date.now().toString(), []);
    const previewColumns: ColumnsPreviewType[] = props.columns.length > 0 ? props.columns : initColumns;
    const columns = previewColumns.map((col, index) => new ColumnPreview(col, index));
    const noop = (..._: unknown[]): void => {
        //
    };
    const pageSize = props.pageSize ?? 5;

    const selectActionHelper = useSelectActionHelper(props, undefined);

    const visibleColumnsCount = selectActionHelper.showCheckboxColumn ? columns.length + 1 : columns.length;

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
            visibleColumns={columns}
            availableColumns={[]}
            columnsSwap={noop}
            setIsResizing={noop}
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
            numberOfItems={props.pageSize ?? numberOfItems}
            page={0}
            paginationType={props.pagination}
            pageSize={props.pageSize ?? numberOfItems}
            showPagingButtons={props.showPagingButtons}
            loadMoreButtonCaption={props.loadMoreButtonCaption}
            paging={props.pagination === "buttons" || props.showNumberOfRows}
            pagingPosition={props.pagingPosition}
            preview
            processedRows={0}
            styles={parseStyle(props.style)}
            selectionStatus={"none"}
            id={gridId}
            gridInteractive={!!(props.itemSelection !== "None" || props.onClick)}
            selectActionHelper={selectActionHelper}
            cellEventsController={eventsController}
            checkboxEventsController={eventsController}
            focusController={focusController}
            isLoading={false}
            isFetchingNextBatch={false}
            loadingType="spinner"
            columnsLoading={false}
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
