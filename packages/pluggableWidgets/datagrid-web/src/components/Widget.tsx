import { RefreshIndicator } from "@mendix/widget-plugin-component-kit/RefreshIndicator";
import { Pagination } from "@mendix/widget-plugin-grid/components/Pagination";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { ListActionValue, ObjectItem } from "mendix";
import { observer } from "mobx-react-lite";
import { CSSProperties, Fragment, ReactElement, ReactNode } from "react";
import {
    LoadingTypeEnum,
    PaginationEnum,
    PagingPositionEnum,
    ShowPagingButtonsEnum
} from "../../typings/DatagridProps";

import { EmptyPlaceholder } from "../features/empty-message/EmptyPlaceholder";
import { SelectAllBar } from "../features/select-all/SelectAllBar";
import { SelectionProgressDialog } from "../features/select-all/SelectionProgressDialog";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { useBasicData } from "../model/hooks/injection-hooks";
import { CellComponent, EventsController } from "../typings/CellComponent";
import { ColumnId, GridColumn } from "../typings/GridColumn";
import { ExportWidget } from "./ExportWidget";
import { Grid } from "./Grid";
import { GridBody } from "./GridBody";
import { GridHeader } from "./GridHeader";
import { RowsRenderer } from "./RowsRenderer";
import { WidgetContent } from "./WidgetContent";
import { WidgetFooter } from "./WidgetFooter";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetRoot } from "./WidgetRoot";
import { WidgetTopBar } from "./WidgetTopBar";

export interface WidgetProps<C extends GridColumn, T extends ObjectItem = ObjectItem> {
    CellComponent: CellComponent<C>;
    className: string;
    columnsDraggable: boolean;
    columnsFilterable: boolean;
    columnsHidable: boolean;
    columnsResizable: boolean;
    columnsSortable: boolean;
    data: T[];
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
    setPage?: (computePage: (prevPage: number) => number) => void;
    styles?: CSSProperties;
    rowAction?: ListActionValue;
    showSelectAllToggle?: boolean;
    isFirstLoad: boolean;
    isFetchingNextBatch: boolean;
    loadingType: LoadingTypeEnum;
    columnsLoading: boolean;
    showRefreshIndicator: boolean;

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
    const basicData = useBasicData();
    const selectionEnabled = selectActionHelper.selectionType !== "None";

    return (
        <WidgetRoot
            className={className}
            selectionMethod={selectActionHelper.selectionMethod}
            selection={selectionEnabled}
            style={props.styles}
            exporting={exporting}
        >
            <Main {...props} data={exporting ? [] : props.data} />
            <SelectionProgressDialog />
            {exporting && (
                <ExportWidget
                    alertLabel={basicData.exportDialogLabel ?? "Export progress"}
                    cancelLabel={basicData.cancelExportLabel ?? "Cancel data export"}
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
        CellComponent,
        columnsHidable,
        data: rows,
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
        showRefreshIndicator,
        selectActionHelper,
        setPage,
        visibleColumns
    } = props;

    const basicData = useBasicData();

    const showHeader = !!headerContent;
    const showTopBarPagination = paging && (pagingPosition === "top" || pagingPosition === "both");
    const showFooterPagination = paging && (pagingPosition === "bottom" || pagingPosition === "both");

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
            <WidgetTopBar pagination={showTopBarPagination ? pagination : undefined} />
            {showHeader && <WidgetHeader headerTitle={headerTitle}>{headerContent}</WidgetHeader>}
            <WidgetContent>
                <Grid
                    aria-multiselectable={selectionEnabled ? selectActionHelper.selectionType === "Multi" : undefined}
                    style={cssGridStyles}
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
                    <SelectAllBar />
                    {showRefreshIndicator ? <RefreshIndicator /> : null}
                    <GridBody
                        isFirstLoad={props.isFirstLoad}
                        isFetchingNextBatch={props.isFetchingNextBatch}
                        loadingType={props.loadingType}
                        columnsHidable={columnsHidable}
                        columnsSize={visibleColumns.length}
                        rowsSize={rows.length}
                        pageSize={pageSize}
                        pagination={props.paginationType}
                        hasMoreItems={hasMoreItems}
                        setPage={setPage}
                    >
                        <RowsRenderer
                            preview={props.preview ?? false}
                            interactive={basicData.gridInteractive}
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
                        <EmptyPlaceholder />
                    </GridBody>
                </Grid>
            </WidgetContent>
            <WidgetFooter
                pagination={showFooterPagination ? pagination : undefined}
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
