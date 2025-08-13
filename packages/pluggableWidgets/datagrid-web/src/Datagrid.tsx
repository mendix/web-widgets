import { useOnResetFiltersEvent } from "@mendix/widget-plugin-external-events/hooks";
import { useClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { useFocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import { useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { observer } from "mobx-react-lite";
import { ReactElement, ReactNode, createElement, useCallback, useMemo } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { Cell } from "./components/Cell";
import { Widget } from "./components/Widget";
import { WidgetHeaderContext } from "./components/WidgetHeaderContext";
import { ProgressStore } from "./features/data-export/ProgressStore";
import { useDataExport } from "./features/data-export/useDataExport";
import { useCellEventsController } from "./features/row-interaction/CellEventsController";
import { useCheckboxEventsController } from "./features/row-interaction/CheckboxEventsController";
import { DatagridContext } from "./helpers/root-context";
import { useSelectActionHelper } from "./helpers/SelectActionHelper";
import { IColumnGroupStore } from "./helpers/state/ColumnGroupStore";
import { RootGridStore } from "./helpers/state/RootGridStore";
import { useRootStore } from "./helpers/state/useRootStore";

interface Props extends DatagridContainerProps {
    columnsStore: IColumnGroupStore;
    rootStore: RootGridStore;
    progressStore: ProgressStore;
}

const Container = observer((props: Props): ReactElement => {
    const { columnsStore, rootStore } = props;
    const { paginationCtrl } = rootStore;

    const items = props.datasource.items ?? [];

    const [exportProgress, abortExport] = useDataExport(props, props.columnsStore, props.progressStore);

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

    const ctx = useConst(() => {
        rootStore.basicData.setSelectionHelper(selectionHelper);
        return {
            basicData: rootStore.basicData,
            selectionHelper,
            selectActionHelper,
            cellEventsController,
            checkboxEventsController,
            focusController,
            selectionCountStore: rootStore.selectionCountStore
        };
    });

    return (
        <DatagridContext.Provider value={ctx}>
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
                        <WidgetHeaderContext selectionHelper={selectionHelper} rootStore={rootStore}>
                            {props.filtersPlaceholder}
                        </WidgetHeaderContext>
                    )
                }
                hasMoreItems={props.datasource.hasMoreItems ?? false}
                headerWrapperRenderer={useCallback((_columnIndex: number, header: ReactElement) => header, [])}
                id={useMemo(() => `DataGrid${generateUUID()}`, [])}
                numberOfItems={props.datasource.totalCount}
                onExportCancel={abortExport}
                page={paginationCtrl.currentPage}
                pageSize={props.pageSize}
                paginationType={props.pagination}
                loadMoreButtonCaption={props.loadMoreButtonCaption?.value}
                paging={paginationCtrl.showPagination}
                pagingPosition={props.pagingPosition}
                showPagingButtons={props.showPagingButtons}
                rowClass={useCallback((value: any) => props.rowClass?.get(value)?.value ?? "", [props.rowClass])}
                setPage={paginationCtrl.setPage}
                styles={props.style}
                exporting={exportProgress.exporting}
                processedRows={exportProgress.loaded}
                visibleColumns={columnsStore.visibleColumns}
                availableColumns={columnsStore.availableColumns}
                setIsResizing={(status: boolean) => columnsStore.setIsResizing(status)}
                columnsSwap={(moved, [target, placement]) => columnsStore.swapColumns(moved, [target, placement])}
                selectActionHelper={selectActionHelper}
                cellEventsController={cellEventsController}
                checkboxEventsController={checkboxEventsController}
                focusController={focusController}
                isFirstLoad={rootStore.loaderCtrl.isFirstLoad}
                isFetchingNextBatch={rootStore.loaderCtrl.isFetchingNextBatch}
                showRefreshIndicator={rootStore.loaderCtrl.showRefreshIndicator}
                loadingType={props.loadingType}
                columnsLoading={!columnsStore.loaded}
            />
        </DatagridContext.Provider>
    );
});

Container.displayName = "DatagridComponent";

export default function Datagrid(props: DatagridContainerProps): ReactElement | null {
    const rootStore = useRootStore(props);

    return (
        <Container
            {...props}
            rootStore={rootStore}
            columnsStore={rootStore.columnsStore}
            progressStore={rootStore.exportProgressCtrl}
        />
    );
}
