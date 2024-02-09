import {
    FilterState,
    FilterType,
    useFilterContext,
    useMultipleFiltering,
    readInitFilterValues
} from "@mendix/widget-plugin-filtering";
import { useCreateSelectionContextValue, useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { ReactElement, ReactNode, createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { Cell } from "./components/Cell";
import { Widget } from "./components/Widget";
import { WidgetHeaderContext } from "./components/WidgetHeaderContext";
import { getColumnAssociationProps } from "./features/column";
import { UpdateDataSourceFn, useDG2ExportApi } from "./features/export";
import { Column } from "./helpers/Column";
import "./ui/Datagrid.scss";
import { StateChangeFx, useGridState } from "./features/model/use-grid-state";
import { useShowPagination } from "./utils/useShowPagination";
import { useModel } from "./features/model/use-model";
import { InitParams } from "./typings/GridModel";
import { useSelectActionHelper } from "./helpers/SelectActionHelper";
import { useClickActionHelper } from "./helpers/ClickActionHelper";
import { useCellEventsController } from "./features/row-interaction/CellEventsController";
import { useCheckboxEventsController } from "./features/row-interaction/CheckboxEventsController";
import { useFocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import { useOnResetFiltersEvent } from "@mendix/widget-plugin-external-events/hooks";

interface Props extends DatagridContainerProps {
    mappedColumns: Column[];
    initParams: InitParams;
    onStateChange: StateChangeFx;
}

function Container(props: Props): ReactElement {
    const isInfiniteLoad = props.pagination === "virtualScrolling";
    const currentPage = isInfiniteLoad
        ? props.datasource.limit / props.pageSize
        : props.datasource.offset / props.pageSize;
    const viewStateFilters = useRef<FilterCondition | undefined>(undefined);
    const [filtered, setFiltered] = useState(false);
    const multipleFilteringState = useMultipleFiltering();
    const { FilterContext } = useFilterContext();

    const [state, actions, { useHeaderRef }] = useGridState(props.initParams, props.mappedColumns, props.onStateChange);

    // this is a temporary solution for enabling columns manage their own state
    props.mappedColumns.forEach(c => c.unstable_setStateAndActions(state, actions));

    const [{ items, exporting, processedRows }, { abort }] = useDG2ExportApi({
        columns: useMemo(
            () => state.visibleColumns.map(column => props.columns[column.columnNumber]),
            [state.visibleColumns, props.columns]
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
        if (props.datasource.filter && !filtered && !viewStateFilters.current) {
            viewStateFilters.current = props.datasource.filter;
        }
    }, [props.datasource, filtered]);

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

    // TODO: Rewrite this logic with single useReducer (or write
    // custom hook that will use useReducer)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const customFiltersState = props.columns.map(() => useState<FilterState>());
    const deps1 = customFiltersState.map(([state]) => state);
    const deps2 = Object.keys(multipleFilteringState).map((key: FilterType) => multipleFilteringState[key][0]);

    const filters = useMemo(() => {
        return customFiltersState
            .map(([customFilter]) => customFilter?.getFilterCondition?.())
            .filter((filter): filter is FilterCondition => filter !== undefined)
            .concat(
                // Concatenating multiple filter state
                Object.keys(multipleFilteringState)
                    .map((key: FilterType) => multipleFilteringState[key][0]?.getFilterCondition())
                    .filter((filter): filter is FilterCondition => filter !== undefined)
            );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps1, ...deps2]);

    useEffect(() => {
        if (filters.length > 0) {
            actions.setFilter(filters.length > 1 ? and(...filters) : filters[0]);
        } else if (filtered) {
            actions.setFilter(undefined);
        } else {
            actions.setFilter(viewStateFilters.current);
        }
    }, [filters, filtered, actions]);

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
        ? state.visibleColumns.length + 1
        : state.visibleColumns.length;

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
                    const column = props.columns[columnIndex];
                    const { attribute, filter } = column;
                    const associationProps = getColumnAssociationProps(column);
                    const [, filterDispatcher] = customFiltersState[columnIndex];
                    const initialFilters = readInitFilterValues(attribute, viewStateFilters.current);

                    if (!attribute && !associationProps) {
                        return renderWrapper(filter);
                    }

                    return renderWrapper(
                        <FilterContext.Provider
                            value={{
                                eventsChannelName: filtersChannelName,
                                filterDispatcher: prev => {
                                    setFiltered(true);
                                    filterDispatcher(prev);
                                    return prev;
                                },
                                singleAttribute: attribute,
                                singleInitialFilter: initialFilters,
                                associationProperties: associationProps
                            }}
                        >
                            {filter}
                        </FilterContext.Provider>
                    );
                },
                [FilterContext, customFiltersState, props.columns, filtersChannelName]
            )}
            headerTitle={props.filterSectionTitle?.value}
            headerContent={
                props.filtersPlaceholder && (
                    <WidgetHeaderContext
                        filterList={props.filterList}
                        setFiltered={setFiltered}
                        viewStateFilters={viewStateFilters.current}
                        selectionContextValue={selectionContextValue}
                        state={multipleFilteringState}
                        eventsChannelName={filtersChannelName}
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
            state={state}
            actions={actions}
            selectActionHelper={selectActionHelper}
            cellEventsController={cellEventsController}
            checkboxEventsController={checkboxEventsController}
            focusController={focusController}
            useHeaderRef={useHeaderRef}
        />
    );
}

export default function Datagrid(props: DatagridContainerProps): ReactElement | null {
    const { initState, columns, stateChangeFx: onStateChange } = useModel(props);

    if (initState.status === "pending") {
        return null;
    }

    return (
        <Container {...props} initParams={initState.initParams} mappedColumns={columns} onStateChange={onStateChange} />
    );
}
