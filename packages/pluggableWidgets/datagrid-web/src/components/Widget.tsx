import { Pagination } from "@mendix/widget-plugin-grid/components/Pagination";
import { SelectionStatus } from "@mendix/widget-plugin-grid/selection";
import { GridSelectionProps } from "@mendix/widget-plugin-grid/selection/useGridSelectionProps";
import { Big } from "big.js";
import classNames from "classnames";
import { EditableValue, ListActionValue, ObjectItem } from "mendix";
import {
    CSSProperties,
    ReactElement,
    ReactNode,
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import { PagingPositionEnum } from "../../typings/DatagridProps";
import { ColumnWidthConfig, SortingRule, useSettings } from "../features/settings";
import { WidgetPropsProvider } from "../helpers/useWidgetProps";
import { sortColumns } from "../helpers/utils";
import { CellComponent } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { CheckboxColumnHeader } from "./CheckboxColumnHeader";
import { ColumnResizer } from "./ColumnResizer";
import { ColumnSelector } from "./ColumnSelector";
import { Grid } from "./Grid";
import { GridBody } from "./GridBody";
import { Header } from "./Header";
import { Row } from "./Row";
import { WidgetContent } from "./WidgetContent";
import { WidgetFooter } from "./WidgetFooter";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetRoot } from "./WidgetRoot";
import { WidgetTopBar } from "./WidgetTopBar";

export interface WidgetProps<C extends GridColumn, T extends ObjectItem = ObjectItem> {
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
    loadingIndicatorRenderer?: (renderWrapper: (children: ReactNode) => ReactElement | null) => ReactElement | null;
    filterRenderer: (renderWrapper: (children: ReactNode) => ReactElement, columnIndex: number) => ReactElement;
    headerContent?: ReactNode;
    headerTitle?: string;
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
    rowAction?: ListActionValue;
    selectionProps: GridSelectionProps;
    selectionStatus: SelectionStatus;
    showSelectAllToggle?: boolean;
    isLoading?: boolean;
}

export interface SortProperty {
    columnIndex: number;
    desc: boolean;
}

export function Widget<C extends GridColumn>(props: WidgetProps<C>): ReactElement {
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
        loadingIndicatorRenderer,
        isLoading,
        filterRenderer: filterRendererProp,
        headerContent,
        headerTitle,
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
        selectionProps,
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
    const showHeader = !!headerContent;
    const showTopBar = paging && (pagingPosition === "top" || pagingPosition === "both");

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
        const [sortingRule] = sortBy;
        if (sortingRule !== undefined) {
            setSortParameters?.({
                columnIndex: sortingRule.columnNumber,
                desc: sortingRule.desc
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
                selectItemColumn: selectionProps.showCheckboxColumn,
                visibilitySelectorColumn: columnsHidable
            }),
        [columnsWidth, visibleColumns, columnsHidable, selectionProps.showCheckboxColumn]
    );

    return (
        <WidgetPropsProvider value={props}>
            <WidgetRoot
                className={className}
                selectionMethod={selectionProps.selectionMethod}
                selection={selectionProps.selectionType !== "None"}
                style={styles}
            >
                {showTopBar && <WidgetTopBar>{pagination}</WidgetTopBar>}
                {showHeader && <WidgetHeader headerTitle={headerTitle}>{headerContent}</WidgetHeader>}
                <WidgetContent isInfinite={isInfinite} hasMoreItems={hasMoreItems} setPage={setPage}>
                    <Grid aria-multiselectable={selectionProps.multiselectable}>
                        <GridBody style={cssGridStyles}>
                            <div key="headers_row" className="tr" role="row">
                                <CheckboxColumnHeader key="headers_column_select_all" />
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
                                        rowAction={props.rowAction}
                                        showSelectorCell={columnsHidable}
                                    />
                                );
                            })}
                            {!isLoading &&
                                (rows.length === 0 || preview) &&
                                emptyPlaceholderRenderer &&
                                emptyPlaceholderRenderer(children => {
                                    const colspan =
                                        columns.length +
                                        (columnsHidable ? 1 : 0) +
                                        (props.selectionProps.showCheckboxColumn ? 1 : 0);
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
                        </GridBody>
                    </Grid>
                </WidgetContent>
                <WidgetFooter pagination={pagination} pagingPosition={pagingPosition} />
            </WidgetRoot>

            {isLoading && loadingIndicatorRenderer
                ? loadingIndicatorRenderer(children => (
                      <div
                          key="loading-indicator-wrapper"
                          className="loading-indicator-wrapper"
                          style={{
                              gridColumn: `span ${columns.length}`,
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "rgba(255,255,255,0.8)", // Optional: semi-transparent background
                              zIndex: 1000 // Ensure it's above the grid
                          }}
                      >
                          {children}
                      </div>
                  ))
                : null}
        </WidgetPropsProvider>
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
