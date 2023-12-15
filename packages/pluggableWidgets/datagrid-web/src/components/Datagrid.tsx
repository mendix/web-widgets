import {
    FilterState,
    FilterType,
    useFilterContext,
    useMultipleFiltering,
    readInitFilterValues
} from "@mendix/widget-plugin-filtering";
import { useCreateSelectionContextValue, useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { useGridSelectionProps } from "@mendix/widget-plugin-grid/selection/useGridSelectionProps";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { ReactElement, ReactNode, createElement, useCallback, useRef, useState } from "react";
import { DatagridContainerProps } from "../../typings/DatagridProps";
import { Cell } from "./Cell";
import { Widget } from "./Widget";
import { WidgetHeaderContext } from "./WidgetHeaderContext";
import { getColumnAssociationProps } from "../features/column";
import { UpdateDataSourceFn, useDG2ExportApi } from "../features/export";
import { Model } from "../features/model/base";
import { useStoreMap, useUnit } from "effector-react";
import { useViewModel } from "../features/model/use-view-model";
import { Actions } from "../typings/GridModel";

type Props = DatagridContainerProps & {
    model: Model;
    actions: Actions;
};

export default function Datagrid(props: Props): ReactElement {
    const id = useRef(`DataGrid${generateUUID()}`);
    const multipleFilteringState = useMultipleFiltering();
    const { FilterContext } = useFilterContext();
    const { model, actions } = props;

    const viewModel = useViewModel(model);

    const exportColumns = useStoreMap(props.model.visible, visible =>
        visible.map(col => props.columns[col.columnNumber])
    );

    const gridFilter = useUnit(model.filter);

    const [{ items, exporting, processedRows }, { abort }] = useDG2ExportApi({
        columns: exportColumns,
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

    // TODO: Rewrite this logic with single useReducer (or write
    // custom hook that will use useReducer)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const customFiltersState = props.columns.map(() => useState<FilterState>());

    const filters = customFiltersState
        .map(([customFilter]) => customFilter?.getFilterCondition?.())
        .filter((filter): filter is FilterCondition => filter !== undefined)
        .concat(
            // Concatenating multiple filter state
            Object.keys(multipleFilteringState)
                .map((key: FilterType) => multipleFilteringState[key][0]?.getFilterCondition())
                .filter((filter): filter is FilterCondition => filter !== undefined)
        );

    if (filters.length > 0) {
        actions.setFilter(filters.length > 1 ? and(...filters) : filters[0]);
    } else {
        actions.setFilter(undefined);
    }

    const selectionHelper = useSelectionHelper(
        props.itemSelection,
        props.datasource,
        props.onSelectionChange,
        props.pageSize
    );
    const selectionContextValue = useCreateSelectionContextValue(selectionHelper);
    const selectionProps = useGridSelectionProps({
        selection: props.itemSelection,
        selectionMethod: props.itemSelectionMethod,
        helper: selectionHelper,
        showSelectAllToggle: props.showSelectAllToggle
    });

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
                (renderWrapper, column) => {
                    const rawColumn = props.columns[column.columnNumber];
                    const { attribute, filter } = rawColumn;
                    const associationProps = getColumnAssociationProps(rawColumn);

                    const initialFilters = readInitFilterValues(attribute, gridFilter);

                    if (!attribute && !associationProps) {
                        return renderWrapper(filter);
                    }

                    return renderWrapper(
                        <FilterContext.Provider
                            value={{
                                filterDispatcher: state => actions.setColumnFilter([column.columnId, state]),
                                singleAttribute: attribute,
                                singleInitialFilter: initialFilters,
                                associationProperties: associationProps
                            }}
                        >
                            {filter}
                        </FilterContext.Provider>
                    );
                },
                // eslint-disable-next-line react-hooks/exhaustive-deps
                [FilterContext, customFiltersState, props.columns]
            )}
            headerTitle={props.filterSectionTitle?.value}
            headerContent={
                props.filtersPlaceholder && (
                    <WidgetHeaderContext
                        filterList={props.filterList}
                        viewStateFilters={undefined}
                        selectionContextValue={selectionContextValue}
                        state={multipleFilteringState}
                    >
                        {props.filtersPlaceholder}
                    </WidgetHeaderContext>
                )
            }
            hasMoreItems={props.datasource.hasMoreItems ?? false}
            headerWrapperRenderer={useCallback((_columnIndex: number, header: ReactElement) => header, [])}
            id={id.current}
            numberOfItems={props.datasource.totalCount}
            onExportCancel={abort}
            pageSize={props.pageSize}
            paging={props.pagination === "buttons"}
            pagingPosition={props.pagingPosition}
            rowClass={useCallback((value: any) => props.rowClass?.get(value)?.value ?? "", [props.rowClass])}
            styles={props.style}
            rowAction={props.onClick}
            selectionProps={selectionProps}
            selectionStatus={selectionHelper?.type === "Multi" ? selectionHelper.selectionStatus : "unknown"}
            exporting={exporting}
            processedRows={processedRows}
            exportDialogLabel={props.exportDialogLabel?.value}
            cancelExportLabel={props.cancelExportLabel?.value}
            selectRowLabel={props.selectRowLabel?.value}
            actions={props.actions}
            model={viewModel}
        />
    );
}
