import { useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ValueStatus } from "mendix";
import { ReactElement, ReactNode, createElement, useCallback, useMemo } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { Cell } from "./components/Cell";
import { Widget } from "./components/Widget";
import { WidgetHeaderContext } from "./components/WidgetHeaderContext";
import { useShowPagination } from "./utils/useShowPagination";
import { useSelectActionHelper } from "./helpers/SelectActionHelper";
import { useClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { useCellEventsController } from "./features/row-interaction/CellEventsController";
import { useCheckboxEventsController } from "./features/row-interaction/CheckboxEventsController";
import { useFocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import { useOnResetFiltersEvent } from "@mendix/widget-plugin-external-events/hooks";
import { IColumnGroupStore } from "./helpers/state/ColumnGroupStore";
import { observer } from "mobx-react-lite";
import { RootGridStore } from "./helpers/state/RootGridStore";
import { useRootStore } from "./helpers/state/useRootStore";
import { useDataExport } from "./features/data-export/useDataExport";
import { ProgressStore } from "./features/data-export/ProgressStore";
import { useRefreshReload } from "./utils/useRefreshReload";
import Big from "big.js";

interface Props extends DatagridContainerProps {
    columnsStore: IColumnGroupStore;
    rootStore: RootGridStore;
    progressStore: ProgressStore;
}

const Container = observer((props: Props): ReactElement => {
    const isInfiniteLoad = props.pagination === "virtualScrolling" || props.pagination === "loadMore";
    const currentPage = props.paginationAttribute?.value
        ? props.paginationAttribute?.value.toNumber()
        : isInfiniteLoad
        ? props.datasource.limit / props.pageSize
        : props.datasource.offset / props.pageSize;

    const { columnsStore, rootStore } = props;

    const items = props.datasource.items ?? [];

    const [exportProgress, abortExport] = useDataExport(props, props.columnsStore, props.progressStore);

    const { isRefreshing } = useRefreshReload({ datasource: props.datasource, refreshInterval: props.refreshInterval });

    const setPage = useCallback(
        (computePage: (prevPage: number) => number) => {
            const newPage = computePage(currentPage);
            props.paginationAttribute?.setValue(new Big(newPage));
            if (isInfiniteLoad) {
                props.datasource.setLimit(newPage * props.pageSize);
            } else {
                props.datasource.setOffset(newPage * props.pageSize);
            }
        },
        [props.datasource, props.pageSize, isInfiniteLoad, currentPage]
    );

    const selectionHelper = useSelectionHelper(props.itemSelection, props.datasource, props.onSelectionChange);

    const selectActionHelper = useSelectActionHelper(props, selectionHelper);

    const clickActionHelper = useClickActionHelper({
        onClickTrigger: props.onClickTrigger,
        onClick: props.onClick
    });
    useOnResetFiltersEvent(rootStore.staticInfo.name, rootStore.staticInfo.filtersChannelName);

    const visibleColumnsCount = selectActionHelper.showCheckboxColumn
        ? columnsStore.visibleColumns.length + 1
        : columnsStore.visibleColumns.length;

    const focusController = useFocusTargetController({
        rows: items.length,
        columns: visibleColumnsCount,
        pageSize: props.pageSize
    });

    const cellEventsController = useCellEventsController(selectActionHelper, clickActionHelper, focusController);

    const checkboxEventsController = useCheckboxEventsController(selectActionHelper, focusController);

    const datasourceIsLoading = useMemo((): boolean => {
        if (exportProgress.exporting) {
            return false;
        }

        if (isRefreshing) {
            return false;
        }

        if (!props.datasource.hasMoreItems) {
            return false;
        }

        return props.datasource.status === ValueStatus.Loading;
    }, [exportProgress, isRefreshing, props.datasource.status, props.datasource.hasMoreItems]);

    const showPagingButtonsOrRows = props.pagination === "buttons" ? props.showPagingButtons : props.showNumberOfRows;

    return (
        <Widget
            className={props.class}
            CellComponent={Cell}
            columnsDraggable={props.columnsDraggable}
            columnsFilterable={props.columnsFilterable}
            columnsHidable={props.columnsHidable}
            columnsResizable={props.columnsResizable}
            columnsSortable={props.columnsSortable}
            data={items}
            emptyPlaceholderRenderer={useCallback(
                (renderWrapper: (children: ReactNode) => ReactElement) =>
                    props.showEmptyPlaceholder === "custom" ? renderWrapper(props.emptyPlaceholder) : <div />,
                [props.emptyPlaceholder, props.showEmptyPlaceholder]
            )}
            filterRenderer={useCallback(
                (renderWrapper, columnIndex) => {
                    const columnFilter = columnsStore.columnFilters[columnIndex];
                    return renderWrapper(columnFilter.renderFilterWidgets());
                },
                [columnsStore.columnFilters]
            )}
            headerTitle={props.filterSectionTitle?.value}
            headerContent={
                props.filtersPlaceholder && (
                    <WidgetHeaderContext selectionHelper={selectionHelper} filtersStore={rootStore.headerFiltersStore}>
                        {props.filtersPlaceholder}
                    </WidgetHeaderContext>
                )
            }
            hasMoreItems={props.paginationAttribute?.value ? true : props.datasource.hasMoreItems ?? false}
            headerWrapperRenderer={useCallback((_columnIndex: number, header: ReactElement) => header, [])}
            id={useMemo(() => `DataGrid${generateUUID()}`, [])}
            numberOfItems={props.datasource.totalCount}
            onExportCancel={abortExport}
            page={currentPage}
            pageSize={props.pageSize}
            paginationType={props.pagination}
            loadMoreButtonCaption={props.loadMoreButtonCaption?.value}
            paging={useShowPagination({
                pagination: props.pagination,
                showPagingButtonsOrRows,
                totalCount: props.datasource.totalCount,
                limit: props.datasource.limit,
                requestTotalCount: props.datasource.requestTotalCount
            })}
            pagingPosition={props.pagingPosition}
            showPagingButtons={props.showPagingButtons}
            rowClass={useCallback((value: any) => props.rowClass?.get(value)?.value ?? "", [props.rowClass])}
            gridInteractive={!!(props.itemSelection || props.onClick)}
            setPage={setPage}
            styles={props.style}
            selectionStatus={selectionHelper?.type === "Multi" ? selectionHelper.selectionStatus : "unknown"}
            exporting={exportProgress.exporting}
            processedRows={exportProgress.loaded}
            exportDialogLabel={props.exportDialogLabel?.value}
            cancelExportLabel={props.cancelExportLabel?.value}
            selectRowLabel={props.selectRowLabel?.value}
            visibleColumns={columnsStore.visibleColumns}
            availableColumns={columnsStore.availableColumns}
            setIsResizing={(status: boolean) => columnsStore.setIsResizing(status)}
            columnsSwap={(moved, [target, placement]) => columnsStore.swapColumns(moved, [target, placement])}
            selectActionHelper={selectActionHelper}
            cellEventsController={cellEventsController}
            checkboxEventsController={checkboxEventsController}
            focusController={focusController}
            isLoading={datasourceIsLoading}
            loadingType={props.loadingType}
            columnsLoading={!columnsStore.loaded}
        />
    );
});

const ContainerWithLoading = observer((props: Props) => {
    if (!props.rootStore.isLoaded) {
        return null;
    }
    return <Container {...props} />;
});

export default function Datagrid(props: DatagridContainerProps): ReactElement | null {
    const rootStore = useRootStore(props);

    return (
        <ContainerWithLoading
            {...props}
            rootStore={rootStore}
            columnsStore={rootStore.columnsStore}
            progressStore={rootStore.progressStore}
        />
    );
}
