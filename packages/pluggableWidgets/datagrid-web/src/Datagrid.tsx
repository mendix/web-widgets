import { useFilterContext } from "@mendix/widget-plugin-filtering";
import { useCreateSelectionContextValue, useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { and } from "mendix/filters/builders";
import { ReactElement, ReactNode, createElement, useCallback, useEffect, useMemo, useState } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { Cell } from "./components/Cell";
import { Widget } from "./components/Widget";
import { WidgetHeaderContext } from "./components/WidgetHeaderContext";
import { UpdateDataSourceFn, useDG2ExportApi } from "./features/export";
import "./ui/Datagrid.scss";
import { useShowPagination } from "./utils/useShowPagination";
import { useSelectActionHelper } from "./helpers/SelectActionHelper";
import { useClickActionHelper } from "./helpers/ClickActionHelper";
import { useCellEventsController } from "./features/row-interaction/CellEventsController";
import { useCheckboxEventsController } from "./features/row-interaction/CheckboxEventsController";
import { useFocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import { useOnResetFiltersEvent } from "@mendix/widget-plugin-external-events/hooks";
import { IColumnsStore } from "./helpers/state/ColumnsStore";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { RootGridStore } from "./helpers/state/RootGridStore";

interface Props extends DatagridContainerProps {
    columnsStore: IColumnsStore;
    rootStore: RootGridStore;
}

const Container = observer((props: Props): ReactElement => {
    const isInfiniteLoad = props.pagination === "virtualScrolling";
    const currentPage = isInfiniteLoad
        ? props.datasource.limit / props.pageSize
        : props.datasource.offset / props.pageSize;

    const { FilterContext } = useFilterContext();
    const { columnsStore, rootStore } = props;

    const [{ items, exporting, processedRows }, { abort }] = useDG2ExportApi({
        columns: useMemo(
            () => columnsStore.visibleColumns.map(column => props.columns[column.columnNumber]),
            [columnsStore.visibleColumns, props.columns]
        ),
        hasMoreItems: props.datasource.hasMoreItems || false,
        items: props.datasource.items,
        name: props.name,
        offset: props.datasource.offset,
        limit: props.datasource.limit,
        updateDataSource: useCallback<UpdateDataSourceFn>(
            ({ offset, limit, reload }) => {
                if (offset != null) {
                    props.datasource?.setOffset(offset);
                }

                if (limit != null) {
                    props.datasource?.setLimit(limit);
                }

                if (reload) {
                    props.datasource.reload();
                }
            },
            [props.datasource]
        )
    });

    useEffect(() => {
        if (props.refreshInterval > 0) {
            setTimeout(() => {
                props.datasource.reload();
            }, props.refreshInterval * 1000);
        }
    }, [props.datasource, props.refreshInterval]);

    const setPage = useCallback(
        (computePage: (prevPage: number) => number) => {
            const newPage = computePage(currentPage);
            if (isInfiniteLoad) {
                props.datasource.setLimit(newPage * props.pageSize);
            } else {
                props.datasource.setOffset(newPage * props.pageSize);
            }
        },
        [props.datasource, props.pageSize, isInfiniteLoad, currentPage]
    );

    const selectionHelper = useSelectionHelper(props.itemSelection, props.datasource, props.onSelectionChange);

    const selectActionHelper = useSelectActionHelper(
        {
            itemSelection: props.itemSelection,
            itemSelectionMethod: props.itemSelectionMethod,
            showSelectAllToggle: props.showSelectAllToggle,
            pageSize: props.pageSize
        },
        selectionHelper
    );

    const clickActionHelper = useClickActionHelper({
        onClickTrigger: props.onClickTrigger,
        onClick: props.onClick
    });
    const filtersChannelName = useMemo(() => `datagrid/${generateUUID()}`, []);
    useOnResetFiltersEvent(props.name, filtersChannelName);

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

    const selectionContextValue = useCreateSelectionContextValue(selectionHelper);

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

                    if (!columnFilter.needsFilterContext) {
                        return renderWrapper(columnFilter.renderFilterWidgets());
                    }

                    return renderWrapper(
                        <FilterContext.Provider
                            value={{
                                eventsChannelName: filtersChannelName,
                                filterDispatcher: prev => {
                                    rootStore.headerFiltersStore.setDirty();
                                    columnFilter.setFilterState(prev);
                                    return prev;
                                },
                                ...columnFilter.getFilterContextProps()
                            }}
                        >
                            {columnFilter.renderFilterWidgets()}
                        </FilterContext.Provider>
                    );
                },
                [FilterContext, columnsStore.availableColumns, rootStore.headerFiltersStore, filtersChannelName]
            )}
            headerTitle={props.filterSectionTitle?.value}
            headerContent={
                props.filtersPlaceholder && (
                    <WidgetHeaderContext
                        selectionContextValue={selectionContextValue}
                        eventsChannelName={filtersChannelName}
                        headerFilterStore={rootStore.headerFiltersStore}
                    >
                        {props.filtersPlaceholder}
                    </WidgetHeaderContext>
                )
            }
            hasMoreItems={props.datasource.hasMoreItems ?? false}
            headerWrapperRenderer={useCallback((_columnIndex: number, header: ReactElement) => header, [])}
            id={useMemo(() => `DataGrid${generateUUID()}`, [])}
            numberOfItems={props.datasource.totalCount}
            onExportCancel={abort}
            page={currentPage}
            pageSize={props.pageSize}
            paging={useShowPagination({
                pagination: props.pagination,
                showPagingButtons: props.showPagingButtons,
                totalCount: props.datasource.totalCount,
                limit: props.datasource.limit
            })}
            pagingPosition={props.pagingPosition}
            rowClass={useCallback((value: any) => props.rowClass?.get(value)?.value ?? "", [props.rowClass])}
            rowClickable={!!(props.itemSelection || props.onClick)}
            setPage={setPage}
            styles={props.style}
            selectionStatus={selectionHelper?.type === "Multi" ? selectionHelper.selectionStatus : "unknown"}
            exporting={exporting}
            processedRows={processedRows}
            exportDialogLabel={props.exportDialogLabel?.value}
            cancelExportLabel={props.cancelExportLabel?.value}
            selectRowLabel={props.selectRowLabel?.value}
            visibleColumns={columnsStore.visibleColumns}
            availableColumns={columnsStore.availableColumns}
            columnsCreateSizeSnapshot={() => columnsStore.createSizeSnapshot()}
            columnsSwap={(a, b) => columnsStore.swapColumns(a, b)}
            selectActionHelper={selectActionHelper}
            cellEventsController={cellEventsController}
            checkboxEventsController={checkboxEventsController}
            focusController={focusController}
        />
    );
});

export default function Datagrid(props: DatagridContainerProps): ReactElement | null {
    const [rootStore] = useState(() => {
        const store = new RootGridStore(props);

        // apply sorting
        autorun(() => {
            props.datasource.setSortOrder(store.sortInstructions);
        });

        // apply filters
        autorun(() => {
            const filters = store.filterConditions;

            if (!filters) {
                // filters are not changes, don't apply them
                return;
            }

            if (filters.length > 0) {
                props.datasource.setFilter(filters.length > 1 ? and(...filters) : filters[0]);
            } else {
                props.datasource.setFilter(undefined);
            }
        });

        return store;
    });

    rootStore.updateProps(props);

    if (!rootStore.isLoaded) {
        return null;
    }

    return <Container {...props} rootStore={rootStore} columnsStore={rootStore.columnsStore} />;
}
