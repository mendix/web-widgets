import { Pagination } from "@mendix/widget-plugin-grid/components/Pagination";
import classNames from "classnames";
import { ListActionValue, ObjectItem } from "mendix";
import { CSSProperties, ReactElement, ReactNode, createElement, useCallback, useState, Fragment } from "react";
import { PagingPositionEnum, PaginationEnum, ShowPagingButtonsEnum } from "../../typings/DatagridProps";
import { CellComponent } from "../typings/CellComponent";
import { ColumnId, GridColumn } from "../typings/GridColumn";
import { CheckboxColumnHeader } from "./CheckboxColumnHeader";
import { ColumnResizer } from "./ColumnResizer";
import { ColumnSelector } from "./ColumnSelector";
import { Grid } from "./Grid";
import { GridBody } from "./GridBody";
import { Header } from "./Header";
import { WidgetContent } from "./WidgetContent";
import { WidgetFooter } from "./WidgetFooter";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetRoot } from "./WidgetRoot";
import { WidgetTopBar } from "./WidgetTopBar";
import { ExportWidget } from "./ExportWidget";
import { observer } from "mobx-react-lite";
import { RowsRenderer } from "./RowsRenderer";
import { useHelpersContext } from "../helpers/helpers-context";

export interface WidgetProps<C extends GridColumn, T extends ObjectItem = ObjectItem> {
    CellComponent: CellComponent<C>;
    className: string;
    columnsDraggable: boolean;
    columnsFilterable: boolean;
    columnsHidable: boolean;
    columnsResizable: boolean;
    columnsSortable: boolean;
    data: T[];
    emptyPlaceholderRenderer?: (renderWrapper: (children: ReactNode) => ReactElement) => ReactElement;
    exporting: boolean;
    filterRenderer: (renderWrapper: (children: ReactNode) => ReactElement, columnIndex: number) => ReactElement;
    hasMoreItems: boolean;
    headerContent?: ReactNode;
    headerTitle?: string;
    headerWrapperRenderer: (columnIndex: number, header: ReactElement) => ReactElement;
    id: string;
    numberOfItems?: number;
    onExportCancel?: () => void;
    page: number;
    paginationType: PaginationEnum;
    loadMoreButtonCaption?: string;
    pageSize: number;
    paging: boolean;
    pagingPosition: PagingPositionEnum;
    showPagingButtons: ShowPagingButtonsEnum;
    preview?: boolean;
    processedRows: number;
    rowClass?: (item: T) => string;
    gridInteractive: boolean;
    setPage?: (computePage: (prevPage: number) => number) => void;
    styles?: CSSProperties;
    rowAction?: ListActionValue;
    showSelectAllToggle?: boolean;
    exportDialogLabel?: string;
    cancelExportLabel?: string;
    selectRowLabel?: string;

    visibleColumns: GridColumn[];
    availableColumns: GridColumn[];

    columnsSwap: (source: ColumnId, target: [ColumnId, "after" | "before"]) => void;
    columnsCreateSizeSnapshot: () => void;
}

export const Widget = observer(<C extends GridColumn>(props: WidgetProps<C>): ReactElement => {
    const { className, exporting, numberOfItems, onExportCancel } = props;

    return (
        <WidgetRoot className={className} style={{}} exporting={exporting}>
            <Main {...props} data={exporting ? [] : props.data} />
            {exporting && (
                <ExportWidget
                    alertLabel={props.exportDialogLabel ?? "Export progress"}
                    cancelLabel={props.cancelExportLabel ?? "Cancel data export"}
                    failed={false}
                    onCancel={onExportCancel}
                    open={exporting}
                    progress={props.processedRows}
                    total={numberOfItems}
                />
            )}
        </WidgetRoot>
    );
});

const Main = observer(<C extends GridColumn>(props: WidgetProps<C>): ReactElement => {
    const {
        availableColumns,
        CellComponent,
        columnsDraggable,
        columnsFilterable,
        columnsHidable,
        columnsResizable,
        columnsSortable,
        data: rows,
        emptyPlaceholderRenderer,
        filterRenderer: filterRendererProp,
        hasMoreItems,
        headerContent,
        headerTitle,
        headerWrapperRenderer,
        id,
        loadMoreButtonCaption,
        numberOfItems,
        page,
        pageSize,
        paginationType,
        paging,
        pagingPosition,
        preview,
        setPage,
        visibleColumns
    } = props;

    const { selectActionHelper } = useHelpersContext();

    const isInfinite = !paging;
    const [isDragging, setIsDragging] = useState<[ColumnId | undefined, ColumnId, ColumnId | undefined] | undefined>();
    const [dragOver, setDragOver] = useState<[ColumnId, "before" | "after"] | undefined>(undefined);
    const showHeader = !!headerContent;
    const showTopBar = paging && (pagingPosition === "top" || pagingPosition === "both");

    const renderFilterWrapper = useCallback(
        (children: ReactNode) => (
            <div className="filter" style={{ pointerEvents: isDragging ? "none" : undefined }}>
                {children}
            </div>
        ),
        [isDragging]
    );

    const pagination = paging ? (
        <Pagination
            canNextPage={hasMoreItems}
            canPreviousPage={page !== 0}
            gotoPage={(page: number) => setPage && setPage(() => page)}
            nextPage={() => setPage && setPage(prev => prev + 1)}
            numberOfItems={numberOfItems}
            page={page}
            pageSize={pageSize}
            showPagingButtons={props.showPagingButtons}
            previousPage={() => setPage && setPage(prev => prev - 1)}
        />
    ) : null;

    const cssGridStyles = gridStyle(visibleColumns, {
        selectItemColumn: selectActionHelper.showCheckboxColumn,
        visibilitySelectorColumn: columnsHidable
    });

    const selectionEnabled = selectActionHelper.selectionType !== "None";

    return (
        <Fragment>
            {showTopBar && <WidgetTopBar>{pagination}</WidgetTopBar>}
            {showHeader && <WidgetHeader headerTitle={headerTitle}>{headerContent}</WidgetHeader>}
            <WidgetContent
                isInfinite={isInfinite}
                hasMoreItems={hasMoreItems}
                setPage={setPage}
                paginationType={paginationType}
            >
                <Grid
                    aria-multiselectable={selectionEnabled ? selectActionHelper.selectionType === "Multi" : undefined}
                >
                    <GridBody style={cssGridStyles}>
                        <div key="headers_row" className="tr" role="row">
                            <CheckboxColumnHeader key="headers_column_select_all" />
                            {visibleColumns.map((column, index) =>
                                headerWrapperRenderer(
                                    index,
                                    <Header
                                        key={`${column.columnId}`}
                                        className={`align-column-${column.alignment}`}
                                        gridId={props.id}
                                        column={column}
                                        draggable={columnsDraggable}
                                        dropTarget={dragOver}
                                        filterable={columnsFilterable}
                                        filterWidget={filterRendererProp(renderFilterWrapper, column.columnIndex)}
                                        hidable={columnsHidable}
                                        isDragging={isDragging}
                                        preview={preview}
                                        resizable={columnsResizable && visibleColumns.at(-1) !== column}
                                        resizer={
                                            <ColumnResizer
                                                onResizeStart={props.columnsCreateSizeSnapshot}
                                                setColumnWidth={(width: number) => column.setSize(width)}
                                            />
                                        }
                                        swapColumns={props.columnsSwap}
                                        setDropTarget={setDragOver}
                                        setIsDragging={setIsDragging}
                                        sortable={columnsSortable}
                                    />
                                )
                            )}
                            {columnsHidable && (
                                <ColumnSelector
                                    key="headers_column_selector"
                                    columns={availableColumns}
                                    id={id}
                                    visibleLength={visibleColumns.length}
                                />
                            )}
                        </div>
                        <RowsRenderer
                            preview={props.preview ?? false}
                            interactive={props.gridInteractive}
                            Cell={CellComponent}
                            columns={visibleColumns}
                            columnsHidable={columnsHidable}
                            rows={rows}
                            rowClass={props.rowClass}
                            selectableWrapper={props.headerWrapperRenderer}
                        />
                        {(rows.length === 0 || preview) &&
                            emptyPlaceholderRenderer &&
                            emptyPlaceholderRenderer(children => (
                                <div
                                    key="row-footer"
                                    className={classNames("td", { "td-borders": !preview })}
                                    style={{
                                        gridColumn: `span ${
                                            visibleColumns.length +
                                            (columnsHidable ? 1 : 0) +
                                            (selectActionHelper.showCheckboxColumn ? 1 : 0)
                                        }`
                                    }}
                                >
                                    <div className="empty-placeholder">{children}</div>
                                </div>
                            ))}
                    </GridBody>
                </Grid>
            </WidgetContent>
            <WidgetFooter
                pagination={pagination}
                pagingPosition={pagingPosition}
                paginationType={paginationType}
                loadMoreButtonCaption={loadMoreButtonCaption}
                hasMoreItems={hasMoreItems}
                setPage={setPage}
            />
        </Fragment>
    );
});

function gridStyle(columns: GridColumn[], optional: OptionalColumns): CSSProperties {
    const columnSizes = columns.map(c => {
        const isLast = columns.at(-1) === c;
        const columnResizedSize = c.size;
        if (columnResizedSize) {
            return isLast ? "minmax(min-content, auto)" : `${columnResizedSize}px`;
        }
        return c.getCssWidth();
    });

    const sizes: string[] = [];

    if (optional.selectItemColumn) {
        sizes.push("48px");
    }

    sizes.push(...columnSizes);

    if (optional.visibilitySelectorColumn) {
        sizes.push("54px");
    }

    return {
        gridTemplateColumns: sizes.join(" ")
    };
}

type OptionalColumns = {
    selectItemColumn?: boolean;
    visibilitySelectorColumn?: boolean;
};
