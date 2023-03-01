import {
    createElement,
    CSSProperties,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import { ColumnSelector } from "./ColumnSelector";
import { Header } from "./Header";
import { AlignmentEnum, ColumnsPreviewType, WidthEnum } from "../../typings/DatagridProps";
import { Big } from "big.js";
import classNames from "classnames";
import { EditableValue, ObjectItem } from "mendix";
import { SortingRule, useSettings } from "../features/settings";
import { ColumnResizer } from "./ColumnResizer";
import { InfiniteBody, Pagination } from "@mendix/pluggable-widgets-commons/components/web";

export type TableColumn = Omit<
    ColumnsPreviewType,
    | "attribute"
    | "columnClass"
    | "content"
    | "dynamicText"
    | "filter"
    | "showContentAs"
    | "tooltip"
    | "filterAssociation"
    | "filterAssociationOptions"
    | "filterAssociationOptionLabel"
>;

export type CellRenderer<T extends ObjectItem = ObjectItem> = (
    renderWrapper: (children: ReactNode, className?: string, onClick?: () => void) => ReactElement,
    value: T,
    columnIndex: number
) => ReactElement;

export interface TableProps<T extends ObjectItem> {
    cellRenderer: CellRenderer<T>;
    className: string;
    columns: TableColumn[];
    columnsFilterable: boolean;
    columnsSortable: boolean;
    columnsResizable: boolean;
    columnsDraggable: boolean;
    columnsHidable: boolean;
    data: T[];
    emptyPlaceholderRenderer?: (renderWrapper: (children: ReactNode) => ReactElement) => ReactElement;
    filterRenderer: (renderWrapper: (children: ReactNode) => ReactElement, columnIndex: number) => ReactElement;
    filtersTitle?: string;
    hasMoreItems: boolean;
    headerFilters?: ReactNode;
    headerWrapperRenderer: (columnIndex: number, header: ReactElement) => ReactElement;
    id?: string;
    numberOfItems?: number;
    paging: boolean;
    page: number;
    pageSize: number;
    pagingPosition: string;
    preview?: boolean;
    rowClass?: (value: T) => string;
    setPage?: (computePage: (prevPage: number) => number) => void;
    setSortParameters?: (sort?: { columnIndex: number; desc: boolean }) => void;
    settings?: EditableValue<string>;
    styles?: CSSProperties;
    valueForSort: (value: T, columnIndex: number) => string | Big | boolean | Date | undefined;
}

export interface ColumnWidth {
    [key: string]: number | undefined;
}

export interface ColumnProperty {
    id: string;
    alignment: AlignmentEnum;
    header: string;
    hidden: boolean;
    canHide: boolean;
    canDrag: boolean;
    canResize: boolean;
    canSort: boolean;
    customFilter: ReactNode;
    width: WidthEnum;
    weight: number;
}

export function Table<T extends ObjectItem>(props: TableProps<T>): ReactElement {
    const {
        cellRenderer,
        className,
        columns,
        columnsDraggable,
        columnsFilterable,
        columnsHidable,
        columnsResizable,
        columnsSortable,
        data,
        emptyPlaceholderRenderer,
        filterRenderer: filterRendererProp,
        filtersTitle,
        hasMoreItems,
        headerFilters,
        headerWrapperRenderer,
        id,
        numberOfItems,
        page,
        pageSize,
        paging,
        pagingPosition,
        preview,
        rowClass,
        setPage,
        setSortParameters,
        settings,
        styles
    } = props;
    const isInfinite = !paging;
    const [isDragging, setIsDragging] = useState(false);
    const [dragOver, setDragOver] = useState("");
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>(
        (columns
            .map((c, i) => (columnsHidable && c.hidable === "hidden" && !preview ? i.toString() : undefined))
            .filter(Boolean) as string[]) ?? []
    );
    const [sortBy, setSortBy] = useState<SortingRule[]>([]);
    const [columnsWidth, setColumnsWidth] = useState<ColumnWidth>(
        Object.fromEntries(columns.map((_c, index) => [index.toString(), undefined]))
    );

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

    const filterRenderer = useCallback(
        (children: ReactNode) => (
            <div className="filter" style={{ pointerEvents: isDragging ? "none" : undefined }}>
                {children}
            </div>
        ),
        [isDragging]
    );

    const tableColumns: ColumnProperty[] = useMemo(
        () =>
            columns.map((column, index) => ({
                id: index.toString(),
                accessor: "item",
                alignment: column.alignment,
                header: column.header,
                hidden: column.hidable === "hidden",
                canHide: column.hidable !== "no",
                canDrag: column.draggable,
                canResize: column.resizable,
                canSort: column.sortable,
                customFilter: columnsFilterable ? filterRendererProp(filterRenderer, index) : null,
                width: column.width,
                weight: column.size ?? 1
            })),
        [columns, filterRendererProp, columnsFilterable, filterRenderer]
    );

    const visibleColumns = useMemo(
        () => tableColumns.filter(c => !hiddenColumns.includes(c.id)).sort((a, b) => sortColumns(columnOrder, a, b)),
        [tableColumns, hiddenColumns, columnOrder]
    );

    const renderCell = useCallback(
        (column: ColumnProperty, value: T, rowIndex: number) =>
            visibleColumns.find(c => c.id === column.id) || preview
                ? cellRenderer(
                      (children, className, onClick) => {
                          return (
                              <div
                                  key={`row_${value.id}_cell_${column.id}`}
                                  className={classNames("td", { "td-borders": rowIndex === 0 }, className, {
                                      clickable: !!onClick,
                                      "hidden-column-preview": preview && columnsHidable && column.hidden
                                  })}
                                  onClick={onClick}
                                  onKeyDown={
                                      onClick
                                          ? e => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    onClick();
                                                }
                                            }
                                          : undefined
                                  }
                                  role={onClick ? "button" : "cell"}
                                  tabIndex={onClick ? 0 : undefined}
                              >
                                  {children}
                              </div>
                          );
                      },
                      value,
                      Number(column.id)
                  )
                : null,
        [cellRenderer, columnsHidable, preview, visibleColumns]
    );

    const rows = useMemo(() => data.map(item => ({ item })), [data]);

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

    const cssGridStyles = useMemo(() => {
        const columnSizes = visibleColumns
            .map(c => {
                const columnResizedSize = columnsWidth[c.id];
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
            })
            .join(" ");
        return {
            gridTemplateColumns: columnSizes + (columnsHidable ? " fit-content(50px)" : "")
        };
    }, [columnsWidth, visibleColumns, columnsHidable]);

    return (
        <div className={classNames(className, "widget-datagrid")} style={styles}>
            <div className="table" role="table">
                <div className="table-header" role="rowgroup">
                    {(pagingPosition === "top" || pagingPosition === "both") && pagination}
                </div>
                {headerFilters && (
                    <div className="header-filters" role="rowgroup" aria-label={filtersTitle}>
                        {headerFilters}
                    </div>
                )}
                <InfiniteBody
                    className="table-content"
                    hasMoreItems={hasMoreItems}
                    isInfinite={isInfinite}
                    role="rowgroup"
                    setPage={setPage}
                    style={cssGridStyles}
                >
                    <div className="tr" role="row">
                        {visibleColumns.map(column =>
                            headerWrapperRenderer(
                                Number(column.id),
                                <Header
                                    key={`headers_column_${column.id}`}
                                    className={`align-column-${column.alignment}`}
                                    column={column}
                                    draggable={columnsDraggable}
                                    dragOver={dragOver}
                                    filterable={columnsFilterable}
                                    hidable={columnsHidable}
                                    isDragging={isDragging}
                                    preview={preview}
                                    resizable={columnsResizable}
                                    resizer={
                                        <ColumnResizer
                                            onResizeEnds={updateSettings}
                                            setColumnWidth={(width: number) =>
                                                setColumnsWidth(prev => {
                                                    prev[column.id] = width;
                                                    return { ...prev };
                                                })
                                            }
                                        />
                                    }
                                    setColumnOrder={(newOrder: string[]) => setColumnOrder(newOrder)}
                                    setDragOver={setDragOver}
                                    setIsDragging={setIsDragging}
                                    setSortBy={setSortBy}
                                    sortable={columnsSortable}
                                    sortBy={sortBy}
                                    visibleColumns={visibleColumns}
                                />
                            )
                        )}
                        {columnsHidable && (
                            <ColumnSelector
                                columns={tableColumns}
                                hiddenColumns={hiddenColumns}
                                id={id}
                                setHiddenColumns={setHiddenColumns}
                            />
                        )}
                    </div>
                    {rows.map((row, rowIndex) => {
                        return (
                            <div
                                key={`row_${row.item.id}`}
                                className={classNames("tr", rowClass?.(row.item))}
                                role="row"
                            >
                                {visibleColumns.map(cell => renderCell(cell, row.item, rowIndex))}
                                {columnsHidable && (
                                    <div
                                        aria-hidden
                                        className={classNames("td column-selector", { "td-borders": rowIndex === 0 })}
                                    />
                                )}
                            </div>
                        );
                    })}
                    {(data.length === 0 || preview) &&
                        emptyPlaceholderRenderer &&
                        emptyPlaceholderRenderer(children => (
                            <div
                                className={classNames("td", "td-borders")}
                                style={{
                                    gridColumn: `span ${columns.length + (columnsHidable ? 1 : 0)}`
                                }}
                            >
                                <div className="empty-placeholder">{children}</div>
                            </div>
                        ))}
                </InfiniteBody>
                <div className="table-footer" role="rowgroup">
                    {(pagingPosition === "bottom" || pagingPosition === "both") && pagination}
                </div>
            </div>
        </div>
    );
}

function sortColumns(columnsOrder: string[], columnA: ColumnProperty, columnB: ColumnProperty): number {
    let columnAValue = columnsOrder.findIndex(c => c === columnA.id);
    let columnBValue = columnsOrder.findIndex(c => c === columnB.id);
    if (columnAValue < 0) {
        columnAValue = Number(columnA.id);
    }
    if (columnBValue < 0) {
        columnBValue = Number(columnB.id);
    }
    return columnAValue < columnBValue ? -1 : columnAValue > columnBValue ? 1 : 0;
}
