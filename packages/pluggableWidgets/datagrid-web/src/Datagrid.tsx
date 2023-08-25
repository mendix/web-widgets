import { createElement, ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColumnsType, DatagridContainerProps } from "../typings/DatagridProps";
import { ObjectItem } from "mendix";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { Table, TableColumn, SortProperty } from "./components/Table";
import {
    FilterFunction,
    FilterType,
    generateUUID,
    useFilterContext,
    useMultipleFiltering
} from "@mendix/pluggable-widgets-commons/components/web";
import {
    getGlobalSelectionContext,
    isAvailable,
    useCreateSelectionContextValue,
    useSelectionHelper
} from "@mendix/pluggable-widgets-commons";
import { extractFilters } from "./features/filters";
import { useCellRenderer } from "./features/cell";
import { getColumnAssociationProps, isSortable } from "./features/column";
import { selectionSettings, useOnSelectProps } from "./features/selection";
import "./ui/Datagrid.scss";
import { DATAGRID_DATA_EXPORT, DataGridName, Message, useDG2ExportApi } from "./features/export";

export default function Datagrid(props: DatagridContainerProps): ReactElement {
    const id = useRef(`DataGrid${generateUUID()}`);

    const [sortParameters, setSortParameters] = useState<SortProperty | undefined>(undefined);
    const isInfiniteLoad = props.pagination === "virtualScrolling";
    const currentPage = isInfiniteLoad
        ? props.datasource.limit / props.pageSize
        : props.datasource.offset / props.pageSize;
    const viewStateFilters = useRef<FilterCondition | undefined>(undefined);
    const [filtered, setFiltered] = useState(false);
    const multipleFilteringState = useMultipleFiltering();
    const { FilterContext } = useFilterContext();
    const SelectionContext = getGlobalSelectionContext();
    const cellRenderer = useCellRenderer({ columns: props.columns, onClick: props.onClick });
    const [memoizedItems, setItems] = useState<ObjectItem[]>([]);

    const { started } = useDG2ExportApi({
        columns: props.columns,
        datasource: props.datasource,
        name: props.name,
        pageSize: props.pageSize
    });

    useEffect(() => {
        if (memoizedItems.length === 0 && props.datasource.items) {
            setItems(props.datasource.items);
        }
    }, [props.datasource.items]);

    useEffect(() => {
        setTimeout(() => {
            dumpDataFromDataGridToConsole(props.name);
        }, 50);
    }, []);

    useEffect(() => {
        props.datasource.requestTotalCount(!isInfiniteLoad);
        if (props.datasource.limit === Number.POSITIVE_INFINITY) {
            props.datasource.setLimit(props.pageSize);
        }
    }, [props.datasource, props.pageSize]);

    useEffect(() => {
        if (props.datasource.filter && !filtered && !viewStateFilters.current) {
            viewStateFilters.current = props.datasource.filter;
        }
    }, [props.datasource, props.configurationAttribute, filtered]);

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
    const customFiltersState = props.columns.map(() => useState<FilterFunction>());

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
        props.datasource.setFilter(filters.length > 1 ? and(...filters) : filters[0]);
    } else if (filtered) {
        props.datasource.setFilter(undefined);
    } else {
        props.datasource.setFilter(viewStateFilters.current);
    }

    if (sortParameters) {
        props.datasource.setSortOrder([
            [props.columns[sortParameters.columnIndex].attribute!.id, sortParameters.desc ? "desc" : "asc"]
        ]);
    } else {
        props.datasource.setSortOrder(undefined);
    }

    const columns = useMemo(() => transformColumnProps(props.columns), [props.columns]);

    /**
     * Multiple filtering properties
     */
    const filterList = useMemo(
        () => props.filterList.reduce((filters, { filter }) => ({ ...filters, [filter.id]: filter }), {}),
        [props.filterList]
    );
    const multipleInitialFilters = useMemo(
        () =>
            props.filterList.reduce(
                (filters, { filter }) => ({
                    ...filters,
                    [filter.id]: extractFilters(filter, viewStateFilters.current)
                }),
                {}
            ),
        [props.filterList]
    );

    const selection = useSelectionHelper(props.itemSelection, props.datasource, props.onSelectionChange);
    const selectActionProps = useOnSelectProps(selection);
    const { selectionStatus, selectionMethod } = selectionSettings(props, selection);

    const selectionContextValue = useCreateSelectionContextValue(selection);

    return (
        <Table
            cellRenderer={cellRenderer}
            className={props.class}
            columns={columns}
            columnsDraggable={props.columnsDraggable}
            columnsFilterable={props.columnsFilterable}
            columnsHidable={props.columnsHidable}
            columnsResizable={props.columnsResizable}
            columnsSortable={props.columnsSortable}
            data={started || props.datasource.offset > 0 ? memoizedItems : props.datasource.items ?? []}
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
                    const initialFilters = extractFilters(attribute, viewStateFilters.current);

                    if (!attribute && !associationProps) {
                        return renderWrapper(filter);
                    }

                    return renderWrapper(
                        <FilterContext.Provider
                            value={{
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
                [FilterContext, customFiltersState, props.columns]
            )}
            gridHeaderTitle={props.filterSectionTitle?.value}
            gridHeaderWidgets={useMemo(
                () => (
                    <FilterContext.Provider
                        value={{
                            filterDispatcher: prev => {
                                if (prev.filterType) {
                                    const [, filterDispatcher] = multipleFilteringState[prev.filterType];
                                    filterDispatcher(prev);
                                    setFiltered(true);
                                }
                                return prev;
                            },
                            multipleAttributes: filterList,
                            multipleInitialFilters
                        }}
                    >
                        <SelectionContext.Provider value={selectionContextValue}>
                            {props.filtersPlaceholder}
                        </SelectionContext.Provider>
                    </FilterContext.Provider>
                ),
                [FilterContext, filterList, multipleInitialFilters, props.filtersPlaceholder, multipleFilteringState]
            )}
            hasMoreItems={props.datasource.hasMoreItems ?? false}
            headerWrapperRenderer={useCallback((_columnIndex: number, header: ReactElement) => header, [])}
            id={id.current}
            isSelected={selectActionProps.isSelected}
            numberOfItems={props.datasource.totalCount}
            onSelect={selectActionProps.onSelect}
            onSelectAll={selectActionProps.onSelectAll}
            page={currentPage}
            pageSize={props.pageSize}
            paging={props.pagination === "buttons"}
            pagingPosition={props.pagingPosition}
            rowClass={useCallback((value: any) => props.rowClass?.get(value)?.value ?? "", [props.rowClass])}
            selectionMethod={selectionMethod}
            selectionStatus={selectionStatus}
            setPage={setPage}
            setSortParameters={setSortParameters}
            settings={props.configurationAttribute}
            styles={props.style}
            valueForSort={useCallback(
                (value, columnIndex) => {
                    const column = props.columns[columnIndex];
                    return column.attribute ? column.attribute.get(value).value : "";
                },
                [props.columns]
            )}
        />
    );
}

function transformColumnProps(props: ColumnsType[]): TableColumn[] {
    return props.map(prop => ({
        ...prop,
        header: prop.header && isAvailable(prop.header) ? prop.header.value ?? "" : "",
        sortable: isSortable(prop)
    }));
}

function dumpDataFromDataGridToConsole(name: DataGridName) {
    console.info("You asked to dump data from: ", name);
    const stream = window[DATAGRID_DATA_EXPORT][name].create();
    console.info("Got data export stream instance, attaching processing function");
    stream.process((msg: Message) => {
        if (!msg) {
            return;
        }

        switch (msg.type) {
            case "columns":
                console.info("_____Table_Header_______");
                console.info(msg.payload.map(v => `${v.name} (${v.type})`).join(" | "));
                console.info("_____End_Table_Header_______");

                console.info("_____Table_Body_______");
                break;
            case "data":
                msg.payload.forEach(item => {
                    console.info(item.join(" | "));
                });
                break;
            case "end":
                console.info("_____End_Table_Body_______");
                console.info("We are done with the data dump!");
                break;
        }
    });
    console.info("let's start dumping some data");
    stream.start();
}
