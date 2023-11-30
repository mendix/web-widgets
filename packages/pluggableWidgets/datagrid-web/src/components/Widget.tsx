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
import { ColumnsState, DispatchOrderUpdate, DispatchHiddenUpdate } from "../features/use-columns-state";
import { ExportWidget } from "./ExportWidget";
import { KeyNavProvider } from "../features/keyboard-navigation/context";

export interface WidgetProps<C extends GridColumn, T extends ObjectItem = ObjectItem> {
    CellComponent: CellComponent<C>;
    className: string;
    columnsDraggable: boolean;
    columnsFilterable: boolean;
    columnsHidable: boolean;
    columnsResizable: boolean;
    columnsSortable: boolean;
    data: T[];
    emptyPlaceholderRenderer?: (renderWrapper: (children: ReactNode) => ReactElement) => ReactElement;
    exporting: boolean;
    filterRenderer: (renderWrapper: (children: ReactNode) => ReactElement, columnIndex: number) => ReactElement;
    hasMoreItems: boolean;
    headerContent?: ReactNode;
    headerTitle?: string;
    headerWrapperRenderer: (columnIndex: number, header: ReactElement) => ReactElement;
    id?: string;
    numberOfItems?: number;
    onExportCancel?: () => void;
    page: number;
    pageSize: number;
    paging: boolean;
    pagingPosition: PagingPositionEnum;
    preview?: boolean;
    processedRows: number;
    rowClass?: (item: T) => string;
    setPage?: (computePage: (prevPage: number) => number) => void;
    setSortParameters?: (sort?: SortProperty) => void;
    setOrder: DispatchOrderUpdate;
    setHidden: DispatchHiddenUpdate;
    settings?: EditableValue<string>;
    styles?: CSSProperties;
    valueForSort: (value: T, columnIndex: number) => string | Big | boolean | Date | undefined;
    rowAction?: ListActionValue;
    selectionProps: GridSelectionProps;
    selectionStatus: SelectionStatus;
    showSelectAllToggle?: boolean;
    columnsState: ColumnsState;
    exportDialogLabel?: string;
    cancelExportLabel?: string;
    selectRowLabel?: string;
}

export interface SortProperty {
    columnIndex: number;
    desc: boolean;
}

export function Widget<C extends GridColumn>(props: WidgetProps<C>): ReactElement {
    const {
        className,
        columnsDraggable,
        columnsFilterable,
        columnsHidable,
        columnsResizable,
        columnsSortable,
        data: rows,
        emptyPlaceholderRenderer,
        exporting,
        filterRenderer: filterRendererProp,
        headerContent,
        headerTitle,
        hasMoreItems,
        headerWrapperRenderer,
        id,
        numberOfItems,
        onExportCancel,
        page,
        pageSize,
        paging,
        pagingPosition,
        preview,
        processedRows,
        setPage,
        setSortParameters,
        settings,
        styles,
        selectionProps,
        CellComponent
    } = props;
    const { columns, columnsOrder, columnsHidden, columnsVisible, columnsAvailable, visibleLength } =
        props.columnsState;
    const columnsToShow = preview ? columns : columnsVisible;
    const extraColumnsCount = (columnsHidable ? 1 : 0) + (props.selectionProps.showCheckboxColumn ? 1 : 0);
    const keyboardNavColumnsCount = columnsToShow.length + (props.selectionProps.showCheckboxColumn ? 1 : 0);
    const columnsVisibleCount = columnsToShow.length + extraColumnsCount;

    const isInfinite = !paging;
    const [isDragging, setIsDragging] = useState(false);
    const [dragOver, setDragOver] = useState("");
    const [sortBy, setSortBy] = useState<SortingRule[]>([]);
    const [columnsWidth, setColumnsWidth] = useState<ColumnWidthConfig>(
        Object.fromEntries(columns.map(c => [c.columnNumber, undefined]))
    );
    const showHeader = !!headerContent;
    const showTopBar = paging && (pagingPosition === "top" || pagingPosition === "both");

    const { updateSettings } = useSettings(
        settings,
        columns,
        columnsOrder,
        props.setOrder,
        columnsHidden,
        props.setHidden,
        sortBy,
        setSortBy,
        columnsWidth,
        setColumnsWidth
    );

    useEffect(() => updateSettings(), [columnsOrder, columnsHidden, sortBy, updateSettings]);

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
            gridStyle(columnsToShow, columnsWidth, {
                selectItemColumn: selectionProps.showCheckboxColumn,
                visibilitySelectorColumn: columnsHidable
            }),
        [columnsWidth, columnsToShow, columnsHidable, selectionProps.showCheckboxColumn]
    );

    const selectionEnabled = props.selectionProps.selectionType !== "None";

    return (
        <WidgetPropsProvider value={props}>
            <WidgetRoot
                className={className}
                selectionMethod={selectionProps.selectionMethod}
                selection={selectionEnabled}
                style={styles}
                exporting={exporting}
            >
                {showTopBar && <WidgetTopBar>{pagination}</WidgetTopBar>}
                {showHeader && <WidgetHeader headerTitle={headerTitle}>{headerContent}</WidgetHeader>}
                <WidgetContent isInfinite={isInfinite} hasMoreItems={hasMoreItems} setPage={setPage}>
                    <Grid
                        aria-multiselectable={selectionEnabled ? selectionProps.selectionType === "Multi" : undefined}
                    >
                        <GridBody style={cssGridStyles}>
                            <div key="headers_row" className="tr" role="row">
                                <CheckboxColumnHeader key="headers_column_select_all" />
                                {columnsToShow.map((column, index) =>
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
                                            setColumnOrder={(newOrder: number[]) => props.setOrder(newOrder)}
                                            setDragOver={setDragOver}
                                            setIsDragging={setIsDragging}
                                            setSortBy={setSortBy}
                                            sortable={columnsSortable}
                                            sortBy={sortBy}
                                            visibleColumns={columnsVisible}
                                            tableId={`${props.id}`}
                                        />
                                    )
                                )}
                                {columnsHidable && (
                                    <ColumnSelector
                                        key="headers_column_selector"
                                        columns={columnsAvailable}
                                        hiddenColumns={columnsHidden}
                                        id={id}
                                        setHiddenColumns={props.setHidden}
                                        visibleLength={visibleLength}
                                    />
                                )}
                            </div>
                            <KeyNavProvider
                                rows={props.data.length}
                                columns={keyboardNavColumnsCount}
                                pageSize={props.pageSize}
                            >
                                {rows.map((item, rowIndex) => {
                                    return (
                                        <Row
                                            CellComponent={CellComponent}
                                            className={props.rowClass?.(item)}
                                            columns={columnsToShow}
                                            index={rowIndex}
                                            item={item}
                                            key={`row_${item.id}`}
                                            rowAction={props.rowAction}
                                            showSelectorCell={columnsHidable}
                                            preview={preview ?? false}
                                            selectableWrapper={headerWrapperRenderer}
                                        />
                                    );
                                })}
                            </KeyNavProvider>
                            {(rows.length === 0 || preview) &&
                                emptyPlaceholderRenderer &&
                                emptyPlaceholderRenderer(children => (
                                    <div
                                        key="row-footer"
                                        className={classNames("td", { "td-borders": !preview })}
                                        style={{
                                            gridColumn: `span ${columnsVisibleCount}`
                                        }}
                                    >
                                        <div className="empty-placeholder">{children}</div>
                                    </div>
                                ))}
                        </GridBody>
                    </Grid>
                </WidgetContent>
                <WidgetFooter pagination={pagination} pagingPosition={pagingPosition} />
                <ExportWidget
                    alertLabel={props.exportDialogLabel ?? "Export progress"}
                    cancelLabel={props.cancelExportLabel ?? "Cancel data export"}
                    failed={false}
                    onCancel={onExportCancel}
                    open={exporting}
                    progress={processedRows}
                    total={numberOfItems}
                />
            </WidgetRoot>
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
