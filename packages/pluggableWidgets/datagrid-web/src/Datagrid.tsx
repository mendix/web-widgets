import { useClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { useFocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import { useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ContainerProvider } from "brandi-react";
import { observer } from "mobx-react-lite";
import { ReactElement, ReactNode, useCallback, useMemo } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { Cell } from "./components/Cell";
import { Widget } from "./components/Widget";
import { WidgetHeaderContext } from "./components/WidgetHeaderContext";
import { useDatagridDepsContainer } from "./Datagrid.depsContainer";
import {
    useColumnsStore,
    useExportProgressService,
    useLoaderViewModel,
    useMainGate,
    usePaginationService
} from "./deps-hooks";
import { useDataExport } from "./features/data-export/useDataExport";
import { useCellEventsController } from "./features/row-interaction/CellEventsController";
import { useCheckboxEventsController } from "./features/row-interaction/CheckboxEventsController";
import { LegacyContext } from "./helpers/root-context";
import { useSelectActionHelper } from "./helpers/SelectActionHelper";
import { useDataGridJSActions } from "./helpers/useDataGridJSActions";

const DatagridRoot = observer((props: DatagridContainerProps): ReactElement => {
    const gate = useMainGate();
    const columnsStore = useColumnsStore();
    const paginationService = usePaginationService();
    const exportProgress = useExportProgressService();
    const loaderVM = useLoaderViewModel();
    const items = gate.props.datasource.items ?? [];

    const [, abortExport] = useDataExport(props, columnsStore, exportProgress);

    const selectionHelper = useSelectionHelper(
        props.itemSelection,
        props.datasource,
        props.onSelectionChange,
        props.keepSelection ? "always keep" : "always clear"
    );

    const selectActionHelper = useSelectActionHelper(props, selectionHelper);

    const clickActionHelper = useClickActionHelper({
        onClickTrigger: props.onClickTrigger,
        onClick: props.onClick
    });

    useDataGridJSActions(selectActionHelper);

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

    return (
        <LegacyContext.Provider
            value={useConst({
                selectionHelper,
                selectActionHelper,
                cellEventsController,
                checkboxEventsController,
                focusController
            })}
        >
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
                        <WidgetHeaderContext selectionHelper={selectionHelper}>
                            {props.filtersPlaceholder}
                        </WidgetHeaderContext>
                    )
                }
                hasMoreItems={props.datasource.hasMoreItems ?? false}
                headerWrapperRenderer={useCallback((_columnIndex: number, header: ReactElement) => header, [])}
                id={useMemo(() => `DataGrid${generateUUID()}`, [])}
                numberOfItems={props.datasource.totalCount}
                onExportCancel={abortExport}
                page={paginationService.currentPage}
                pageSize={props.pageSize}
                paginationType={props.pagination}
                loadMoreButtonCaption={props.loadMoreButtonCaption?.value}
                selectionCountPosition={props.selectionCountPosition}
                paging={paginationService.showPagination}
                pagingPosition={props.pagingPosition}
                showPagingButtons={props.showPagingButtons}
                rowClass={useCallback((value: any) => props.rowClass?.get(value)?.value ?? "", [props.rowClass])}
                setPage={paginationService.setPage}
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
                isFirstLoad={loaderVM.isFirstLoad}
                isFetchingNextBatch={loaderVM.isFetchingNextBatch}
                showRefreshIndicator={loaderVM.showRefreshIndicator}
                loadingType={props.loadingType}
                columnsLoading={!columnsStore.loaded}
            />
        </LegacyContext.Provider>
    );
});

DatagridRoot.displayName = "DatagridComponent";

export default function Datagrid(props: DatagridContainerProps): ReactElement | null {
    const container = useDatagridDepsContainer(props);

    // NOTE: As of version 5 of brandi-react, ContainerProvider clones the container implicitly.
    // Isolated flag ensures that we don't inherit any bindings from parent containers. (Datagrid in Datagrid scenario)
    return (
        <ContainerProvider container={container} isolated>
            <DatagridRoot {...props} />
        </ContainerProvider>
    );
}
