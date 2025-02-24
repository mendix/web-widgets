import { Pagination } from "@mendix/widget-plugin-grid/components/Pagination";
import { SelectionStatus } from "@mendix/widget-plugin-grid/selection";
import classNames from "classnames";
import { ListActionValue, ObjectItem } from "mendix";
import { CSSProperties, ReactElement, ReactNode, createElement, Fragment } from "react";
import {
    PagingPositionEnum,
    PaginationEnum,
    ShowPagingButtonsEnum,
    LoadingTypeEnum
} from "../../typings/DatagridProps";
import { WidgetPropsProvider } from "../helpers/useWidgetProps";
import { CellComponent, EventsController } from "../typings/CellComponent";
import { ColumnId, GridColumn } from "../typings/GridColumn";
import { Grid } from "./Grid";
import { GridBody } from "./GridBody";
import { WidgetContent } from "./WidgetContent";
import { WidgetFooter } from "./WidgetFooter";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetRoot } from "./WidgetRoot";
import { WidgetTopBar } from "./WidgetTopBar";
import { ExportWidget } from "./ExportWidget";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { observer } from "mobx-react-lite";
import { RowsRenderer } from "./RowsRenderer";
import { GridHeader } from "./GridHeader";

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
    selectionStatus: SelectionStatus;
    showSelectAllToggle?: boolean;
    exportDialogLabel?: string;
    cancelExportLabel?: string;
    selectRowLabel?: string;
    isLoading: boolean;
    isFetchingNextBatch: boolean;
    loadingType: LoadingTypeEnum;
    columnsLoading: boolean;

    // Helpers
    cellEventsController: EventsController;
    checkboxEventsController: EventsController;
    selectActionHelper: SelectActionHelper;
    focusController: FocusTargetController;

    visibleColumns: GridColumn[];
    availableColumns: GridColumn[];

    columnsSwap: (source: ColumnId, target: [ColumnId, "after" | "before"]) => void;
    setIsResizing: (status: boolean) => void;
}

export const Widget = observer(<C extends GridColumn>(props: WidgetProps<C>): ReactElement => {
    const { className, exporting, numberOfItems, onExportCancel, selectActionHelper } = props;

    const selectionEnabled = selectActionHelper.selectionType !== "None";

    return (
        <WidgetPropsProvider value={props}>
            <WidgetRoot
                className={className}
                selectionMethod={selectActionHelper.selectionMethod}
                selection={selectionEnabled}
                style={{}}
                exporting={exporting}
            >
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
        </WidgetPropsProvider>
    );
});

const Main = observer(<C extends GridColumn>(props: WidgetProps<C>): ReactElement => {
    const {
        CellComponent,
        columnsHidable,
        data: rows,
        emptyPlaceholderRenderer,
        hasMoreItems,
        headerContent,
        headerTitle,
        loadMoreButtonCaption,
        numberOfItems,
        page,
        pageSize,
        paginationType,
        paging,
        pagingPosition,
        preview,
        selectActionHelper,
        setPage,
        visibleColumns
    } = props;

    const showHeader = !!headerContent;
    const showTopBar = paging && (pagingPosition === "top" || pagingPosition === "both");

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
            pagination={paginationType}
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
            <WidgetContent>
                <Grid
                    aria-multiselectable={selectionEnabled ? selectActionHelper.selectionType === "Multi" : undefined}
                    style={cssGridStyles}
                    setPage={setPage}
                    paginationType={paginationType}
                    hasMoreItems={hasMoreItems}
                >
                    <GridHeader
                        availableColumns={props.availableColumns}
                        columns={visibleColumns}
                        setIsResizing={props.setIsResizing}
                        columnsDraggable={props.columnsDraggable}
                        columnsFilterable={props.columnsFilterable}
                        columnsHidable={props.columnsHidable}
                        columnsResizable={props.columnsResizable}
                        columnsSortable={props.columnsSortable}
                        columnsSwap={props.columnsSwap}
                        filterRenderer={props.filterRenderer}
                        headerWrapperRenderer={props.headerWrapperRenderer}
                        id={props.id}
                        isLoading={props.columnsLoading}
                        preview={props.preview}
                    />
                    <GridBody
                        isLoading={props.isLoading}
                        isFetchingNextBatch={props.isFetchingNextBatch}
                        loadingType={props.loadingType}
                        columnsHidable={columnsHidable}
                        columnsSize={visibleColumns.length}
                        rowsSize={rows.length}
                        pageSize={pageSize}
                    >
                        <RowsRenderer
                            preview={props.preview ?? false}
                            interactive={props.gridInteractive}
                            Cell={CellComponent}
                            columns={visibleColumns}
                            columnsHidable={columnsHidable}
                            rows={rows}
                            rowClass={props.rowClass}
                            selectableWrapper={props.headerWrapperRenderer}
                            selectActionHelper={selectActionHelper}
                            focusController={props.focusController}
                            eventsController={props.cellEventsController}
                            pageSize={props.pageSize}
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
    const columnSizes = columns.map(c => c.getCssWidth());

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
