import {
    createElement,
    CSSProperties,
    ReactElement,
    ReactNode,
    useEffect,
    useMemo,
    useState,
    useCallback
} from "react";
import { ColumnSelector } from "./ColumnSelector";
import { Header } from "./Header";
import { TableHeader, TableFooter } from "./TableHeaderFooter";
import { PagingPositionEnum } from "../../typings/DatagridProps";
import { Big } from "big.js";
import classNames from "classnames";
import { EditableValue, ObjectItem, ListActionValue } from "mendix";
import { SortingRule, useSettings, ColumnWidthConfig } from "../features/settings";
import { ColumnResizer } from "./ColumnResizer";
import { InfiniteBody } from "@mendix/widget-plugin-grid/components/InfiniteBody";
import { Pagination } from "@mendix/widget-plugin-grid/components/Pagination";
import { ThreeStateCheckBox } from "@mendix/widget-plugin-grid/components/ThreeStateCheckBox";
import { MultiSelectionStatus } from "@mendix/widget-plugin-grid/selection";
import { SelectionMethod } from "../features/selection";
import { StickyHeaderTable } from "./StickyHeaderTable";
import { GridColumn } from "../typings/GridColumn";
import { sortColumns } from "../helpers/utils";
import { CellComponent } from "../../typings/CellComponent";
import { Row } from "./Row";

export interface TableProps<C extends GridColumn, T extends ObjectItem = ObjectItem> {
    CellComponent: CellComponent<C>;
    className: string;
    columns: C[];
    columnsFilterable: boolean;
    columnsSortable: boolean;
    columnsResizable: boolean;
    columnsDraggable: boolean;
    columnsHidable: boolean;
    data: T[];
    emptyPlaceholderRenderer?: (renderWrapper: (children: ReactNode) => ReactElement) => ReactElement;
    filterRenderer: (renderWrapper: (children: ReactNode) => ReactElement, columnIndex: number) => ReactElement;
    gridHeaderWidgets?: ReactNode;
    gridHeaderTitle?: string;
    hasMoreItems: boolean;
    headerWrapperRenderer: (columnIndex: number, header: ReactElement) => ReactElement;
    id?: string;
    numberOfItems?: number;
    paging: boolean;
    page: number;
    pageSize: number;
    pagingPosition: PagingPositionEnum;
    preview?: boolean;
    rowClass?: (item: T) => string;
    setPage?: (computePage: (prevPage: number) => number) => void;
    setSortParameters?: (sort?: SortProperty) => void;
    settings?: EditableValue<string>;
    styles?: CSSProperties;
    valueForSort: (value: T, columnIndex: number) => string | Big | boolean | Date | undefined;
    selectionMethod: SelectionMethod;
    selectionStatus?: MultiSelectionStatus;
    onSelect: (item: T) => void;
    onSelectAll: () => void;
    isSelected: (item: T) => boolean;
    rowAction?: ListActionValue;
}

export interface SortProperty {
    columnIndex: number;
    desc: boolean;
}

export function Table<C extends GridColumn>(props: TableProps<C>): ReactElement {
    const {
        className,
        columns,
        columnsDraggable,
        columnsFilterable,
        columnsHidable,
        columnsResizable,
        columnsSortable,
        data: rows,
        emptyPlaceholderRenderer,
        filterRenderer: filterRendererProp,
        gridHeaderWidgets,
        gridHeaderTitle,
        hasMoreItems,
        headerWrapperRenderer,
        id,
        numberOfItems,
        page,
        pageSize,
        paging,
        pagingPosition,
        preview,
        setPage,
        setSortParameters,
        settings,
        styles,
        selectionStatus,
        selectionMethod,
        onSelect,
        isSelected,
        CellComponent
    } = props;
    const isInfinite = !paging;
    const [isDragging, setIsDragging] = useState(false);
    const [dragOver, setDragOver] = useState("");
    const [columnOrder, setColumnOrder] = useState<number[]>([]);
    const [hiddenColumns, setHiddenColumns] = useState<number[]>(
        columns.flatMap(c => (columnsHidable && c.hidden && !preview ? [c.columnNumber] : []))
    );
    const [sortBy, setSortBy] = useState<SortingRule[]>([]);
    const [columnsWidth, setColumnsWidth] = useState<ColumnWidthConfig>(
        Object.fromEntries(columns.map(c => [c.columnNumber, undefined]))
    );
    const checkboxSelectionOn = selectionMethod === "checkbox";
    const rowClickSelectionOn = selectionMethod === "rowClick";
    const showHeader = !!gridHeaderWidgets || pagingPosition === "top" || pagingPosition === "both";

    const { updateSettings } = useSettings(
        settings,
        columns,
        columnOrder,
        setColumnOrder,
        hiddenColumns,
        setHiddenColumns,
        sortBy,
        setSortBy,
        columnsWidth,
        setColumnsWidth
    );

    useEffect(() => updateSettings(), [columnOrder, hiddenColumns, sortBy, updateSettings]);

    useEffect(() => {
        const [sortProperties] = sortBy;
        if (sortProperties && "id" in sortProperties && "desc" in sortProperties) {
            setSortParameters?.({
                columnIndex: Number(sortProperties.id),
                desc: sortProperties.desc ?? false
            });
        } else {
            setSortParameters?.(undefined);
        }
    }, [sortBy, setSortParameters]);

    const renderFilterWrapper = useCallback(
        (children: ReactNode) => (
            <div className="filter" style={{ pointerEvents: isDragging ? "none" : undefined }}>
                {children}
            </div>
        ),
        [isDragging]
    );

    const visibleColumns = useMemo(() => {
        return columns
            .filter(c => !hiddenColumns.includes(c.columnNumber))
            .sort((a, b) => sortColumns(columnOrder, a, b));
    }, [hiddenColumns, columnOrder, columns]);

    const pagination = paging ? (
        <Pagination
            canNextPage={hasMoreItems}
            canPreviousPage={page !== 0}
            gotoPage={(page: number) => setPage && setPage(() => page)}
            nextPage={() => setPage && setPage(prev => prev + 1)}
            numberOfItems={numberOfItems}
            page={page}
            pageSize={pageSize}
            previousPage={() => setPage && setPage(prev => prev - 1)}
        />
    ) : null;

    const cssGridStyles = useMemo(
        () =>
            gridStyle(visibleColumns, columnsWidth, {
                selectItemColumn: checkboxSelectionOn,
                visibilitySelectorColumn: columnsHidable
            }),
        [columnsWidth, visibleColumns, columnsHidable, checkboxSelectionOn]
    );

    return (
        <div
            className={classNames(className, "widget-datagrid", {
                "widget-datagrid-selection-method-checkbox": checkboxSelectionOn,
                "widget-datagrid-selection-method-click": rowClickSelectionOn
            })}
            style={styles}
        >
            {showHeader && (
                <TableHeader headerTitle={gridHeaderTitle} pagination={pagination} pagingPosition={pagingPosition}>
                    {gridHeaderWidgets}
                </TableHeader>
            )}
            <StickyHeaderTable>
                <InfiniteBody
                    className="table-content"
                    hasMoreItems={hasMoreItems}
                    isInfinite={isInfinite}
                    role="rowgroup"
                    setPage={setPage}
                    style={cssGridStyles}
                >
                    <div key="headers_row" className="tr" role="row">
                        {checkboxSelectionOn && (
                            <div
                                key="headers_column_select_all"
                                className="th widget-datagrid-col-select"
                                role="columnheader"
                            >
                                {selectionStatus && (
                                    <ThreeStateCheckBox value={selectionStatus} onChange={props.onSelectAll} />
                                )}
                            </div>
                        )}
                        {visibleColumns.map((column, index) =>
                            headerWrapperRenderer(
                                index,
                                <Header
                                    key={`${column.columnId}`}
                                    className={`align-column-${column.alignment}`}
                                    column={column}
                                    draggable={columnsDraggable}
                                    dragOver={dragOver}
                                    filterable={columnsFilterable}
                                    filterWidget={filterRendererProp(renderFilterWrapper, column.columnNumber)}
                                    hidable={columnsHidable}
                                    isDragging={isDragging}
                                    preview={preview}
                                    resizable={columnsResizable}
                                    resizer={
                                        <ColumnResizer
                                            onResizeEnds={updateSettings}
                                            setColumnWidth={(width: number) =>
                                                setColumnsWidth(prev => {
                                                    prev[column.columnNumber] = width;
                                                    return { ...prev };
                                                })
                                            }
                                        />
                                    }
                                    setColumnOrder={(newOrder: number[]) => setColumnOrder(newOrder)}
                                    setDragOver={setDragOver}
                                    setIsDragging={setIsDragging}
                                    setSortBy={setSortBy}
                                    sortable={columnsSortable}
                                    sortBy={sortBy}
                                    visibleColumns={visibleColumns}
                                    tableId={`${props.id}`}
                                />
                            )
                        )}
                        {columnsHidable && (
                            <ColumnSelector
                                key="headers_column_selector"
                                columns={columns}
                                hiddenColumns={hiddenColumns}
                                id={id}
                                setHiddenColumns={setHiddenColumns}
                            />
                        )}
                    </div>
                    {rows.map((item, rowIndex) => {
                        return (
                            <Row
                                CellComponent={CellComponent}
                                className={props.rowClass?.(item)}
                                columns={visibleColumns}
                                index={rowIndex}
                                item={item}
                                key={`row_${item.id}`}
                                onSelect={onSelect}
                                rowAction={props.rowAction}
                                selected={isSelected(item)}
                                selectionMethod={selectionMethod}
                                showSelectorCell={columnsHidable}
                            />
                        );
                    })}
                    {(rows.length === 0 || preview) &&
                        emptyPlaceholderRenderer &&
                        emptyPlaceholderRenderer(children => {
                            const colspan = columns.length + (columnsHidable ? 1 : 0) + (checkboxSelectionOn ? 1 : 0);
                            return (
                                <div
                                    key="row-footer"
                                    className={classNames("td", { "td-borders": !preview })}
                                    style={{
                                        gridColumn: `span ${colspan}`
                                    }}
                                >
                                    <div className="empty-placeholder">{children}</div>
                                </div>
                            );
                        })}
                </InfiniteBody>
            </StickyHeaderTable>
            <TableFooter pagination={pagination} pagingPosition={pagingPosition} />
        </div>
    );
}

function gridStyle(columns: GridColumn[], resizeMap: ColumnWidthConfig, optional: OptionalColumns): CSSProperties {
    const columnSizes = columns.map(c => {
        const columnResizedSize = resizeMap[c.columnNumber];
        if (columnResizedSize) {
            return `${columnResizedSize}px`;
        }
        switch (c.width) {
            case "autoFit":
                return "fit-content(100%)";
            case "manual":
                return `${c.weight}fr`;
            default:
                return "1fr";
        }
    });

    const sizes: string[] = [];

    if (optional.selectItemColumn) {
        sizes.push("fit-content(48px)");
    }

    sizes.push(...columnSizes);

    if (optional.visibilitySelectorColumn) {
        sizes.push("fit-content(50px)");
    }

    return {
        gridTemplateColumns: sizes.join(" ")
    };
}

type OptionalColumns = {
    selectItemColumn?: boolean;
    visibilitySelectorColumn?: boolean;
};
