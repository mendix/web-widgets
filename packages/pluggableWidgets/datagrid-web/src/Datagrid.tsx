import { useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { useGridSelectionProps } from "@mendix/widget-plugin-grid/selection/useGridSelectionProps";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ReactElement, ReactNode, createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { Cell } from "./components/Cell";
import { SortProperty, Widget } from "./components/Widget";
import { UpdateDataSourceFn, useDG2ExportApi } from "./features/export";
import { Column } from "./helpers/Column";
import "./ui/Datagrid.scss";
import { useColumnsState } from "./features/use-columns-state";
import { useFiltering } from "./features/filtering/useFiltering";

export default function Datagrid(props: DatagridContainerProps): ReactElement {
    const id = useRef(`DataGrid${generateUUID()}`);
    const [filterRenderer, HeaderContextProvider] = useFiltering(props);

    const [sortParameters, setSortParameters] = useState<SortProperty | undefined>(undefined);
    const isInfiniteLoad = props.pagination === "virtualScrolling";
    const currentPage = isInfiniteLoad
        ? props.datasource.limit / props.pageSize
        : props.datasource.offset / props.pageSize;

    const columns = useMemo(
        () => props.columns.map((col, index) => new Column(col, index, id.current)),
        [props.columns]
    );

    const [columnsState, { setHidden, setOrder }] = useColumnsState(columns);

    const [{ items, exporting, processedRows }, { abort }] = useDG2ExportApi({
        columns: columnsState.columnsVisible.map(column => props.columns[column.columnNumber]),
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
        props.datasource.requestTotalCount(!isInfiniteLoad);
        if (props.datasource.limit === Number.POSITIVE_INFINITY) {
            props.datasource.setLimit(props.pageSize);
        }
    }, [props.datasource, props.pageSize, isInfiniteLoad]);

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

    if (sortParameters) {
        props.datasource.setSortOrder([
            [props.columns[sortParameters.columnIndex].attribute!.id, sortParameters.desc ? "desc" : "asc"]
        ]);
    } else {
        props.datasource.setSortOrder(undefined);
    }

    const selectionHelper = useSelectionHelper(props.itemSelection, props.datasource, props.onSelectionChange);
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
            columnsState={columnsState}
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
            filterRenderer={filterRenderer}
            headerTitle={props.filterSectionTitle?.value}
            headerContent={
                props.filtersPlaceholder && <HeaderContextProvider>{props.filtersPlaceholder}</HeaderContextProvider>
            }
            hasMoreItems={props.datasource.hasMoreItems ?? false}
            headerWrapperRenderer={useCallback((_columnIndex: number, header: ReactElement) => header, [])}
            id={id.current}
            numberOfItems={props.datasource.totalCount}
            onExportCancel={abort}
            page={currentPage}
            pageSize={props.pageSize}
            paging={props.pagination === "buttons"}
            pagingPosition={props.pagingPosition}
            rowClass={useCallback((value: any) => props.rowClass?.get(value)?.value ?? "", [props.rowClass])}
            setPage={setPage}
            setSortParameters={setSortParameters}
            setOrder={setOrder}
            setHidden={setHidden}
            settings={props.configurationAttribute}
            styles={props.style}
            valueForSort={useCallback(
                (value, columnIndex) => {
                    const column = props.columns[columnIndex];
                    return column.attribute ? column.attribute.get(value).value : "";
                },
                [props.columns]
            )}
            rowAction={props.onClick}
            selectionProps={selectionProps}
            selectionStatus={selectionHelper?.type === "Multi" ? selectionHelper.selectionStatus : "unknown"}
            exporting={exporting}
            processedRows={processedRows}
            exportDialogLabel={props.exportDialogLabel?.value}
            cancelExportLabel={props.cancelExportLabel?.value}
        />
    );
}
