import { If } from "@mendix/widget-plugin-component-kit/If";
import { Pagination as PagingButtons } from "@mendix/widget-plugin-grid/components/Pagination";
import cn from "classnames";
import { GUID, ObjectItem } from "mendix";
import { Selectable } from "mendix/preview/Selectable";
import { createContext, CSSProperties, PropsWithChildren, ReactElement, ReactNode, useContext } from "react";
import { ColumnsPreviewType, DatagridPreviewProps } from "typings/DatagridProps";
import { FaArrowsAltV } from "./components/icons/FaArrowsAltV";
import { FaEye } from "./components/icons/FaEye";
import { ColumnPreview } from "./helpers/ColumnPreview";
import "./ui/DatagridPreview.scss";

declare module "mendix/preview/Selectable" {
    interface SelectableProps<T> {
        object: T;
        caption?: string;
        children: ReactNode;
    }
}

const defaultColumn: ColumnsPreviewType = {
    alignment: "left",
    attribute: "No attribute selected",
    columnClass: "",
    content: { renderer: () => <div />, widgetCount: 0 },
    draggable: false,
    dynamicText: "Dynamic Text",
    filter: { renderer: () => <div />, widgetCount: 0 },
    header: "Column",
    hidable: "no",
    resizable: false,
    showContentAs: "attribute",
    size: 1,
    sortable: false,
    tooltip: "",
    visible: "true",
    width: "autoFill",
    wrapText: false,
    minWidth: "auto",
    minWidthLimit: 100,
    allowEventPropagation: true,
    exportValue: "",
    exportDateFormat: "",
    exportNumberFormat: "",
    exportType: "default"
};

const initColumns: ColumnsPreviewType[] = [defaultColumn];

const numberOfItems = 3;

const cls = {
    root: "widget-datagrid",
    topBar: "widget-datagrid-top-bar table-header",
    pagingTop: "widget-datagrid-padding-top",
    ptStart: "widget-datagrid-tb-start",
    ptEnd: "widget-datagrid-tb-end",
    header: "widget-datagrid-header header-filters",
    content: "widget-datagrid-content",
    grid: "widget-datagrid-grid table",
    gridHeader: "widget-datagrid-grid-head",
    gridBody: "widget-datagrid-grid-body table-content",
    footer: "widget-datagrid-footer table-footer",
    pb: "widget-datagrid-padding-bottom",
    pbStart: "widget-datagrid-pb-start",
    pbMid: "widget-datagrid-pb-middle",
    pbEnd: "widget-datagrid-pb-end"
};

const PropsCtx = createContext<DatagridPreviewProps>({} as DatagridPreviewProps);

function useProps(): DatagridPreviewProps {
    return useContext(PropsCtx);
}

export function preview(props: DatagridPreviewProps): ReactElement {
    return (
        <PropsCtx.Provider value={props}>
            <WidgetRoot>
                <WidgetTopBar />
                <WidgetHeader />
                <WidgetContent>
                    <Grid>
                        <GridHeader />
                        <GridBody />
                    </Grid>
                </WidgetContent>
                <WidgetFooter />
            </WidgetRoot>
        </PropsCtx.Provider>
    );
}

function WidgetRoot({ children }: PropsWithChildren): ReactElement {
    const props = useProps();
    return (
        <div className={cls.root} style={props.styleObject}>
            {children}
        </div>
    );
}

function WidgetTopBar(): ReactElement {
    return (
        <div className={cls.topBar}>
            <div className={cls.pagingTop}>
                <div className={cls.ptStart}>{useTopCounter() ? <SelectionCounter /> : null}</div>
                <div className={cls.ptEnd}>{usePagingTop() ? <Pagination /> : null}</div>
            </div>
        </div>
    );
}

function WidgetHeader(): ReactNode {
    const { filtersPlaceholder } = useProps();
    return (
        <filtersPlaceholder.renderer caption="Place widgets like filter widget(s) and action button(s) here">
            <div className={cls.header} />
        </filtersPlaceholder.renderer>
    );
}

function WidgetContent({ children }: PropsWithChildren): ReactElement {
    return <div className={cls.content}>{children}</div>;
}

function WidgetFooter(): ReactElement {
    const props = useProps();
    return (
        <div className={cls.footer}>
            <div className={cls.pb}>
                <div className={cls.pbStart}>{useBottomCounter() ? <SelectionCounter /> : null}</div>
                <div className={cls.pbMid}>
                    {props.pagination === "loadMore" ? (
                        <button className="btn btn-primary widget-datagrid-load-more">
                            {props.loadMoreButtonCaption}
                        </button>
                    ) : null}
                </div>
                <div className={cls.pbEnd}>{usePagingBot() ? <Pagination /> : null}</div>
            </div>
        </div>
    );
}

function Grid({ children }: PropsWithChildren): ReactElement {
    return (
        <div className={cls.grid} style={useGridStyle()}>
            {children}
        </div>
    );
}

function GridHeader(): ReactNode {
    const { columnsHidable } = useProps();
    const checkboxColumnVisible = useCheckboxColumn();
    const checkboxVisible = useHeaderCheckbox();
    const columns = useColumns();

    return (
        <div className={cls.gridHeader}>
            <div className="tr">
                <If condition={checkboxColumnVisible}>
                    <div className="th widget-datagrid-col-select" role="columnheader">
                        {checkboxVisible ? <input type="checkbox" /> : null}
                    </div>
                </If>
                {columns.map(column => (
                    <ColumnHeader key={column.header || column.attribute} column={column} />
                ))}
                <If condition={columnsHidable}>
                    <div className="th column-selector" role="columnheader">
                        <div className="column-selector-content">
                            <button className="btn btn-default column-selector-button">
                                <FaEye />
                            </button>
                        </div>
                    </div>
                </If>
            </div>
        </div>
    );
}

function ColumnHeader({ column }: { column: ColumnsPreviewType }): ReactNode {
    const { columnsFilterable, columnsSortable, columnsHidable } = useProps();
    const columnPreview = new ColumnPreview(column, 0);
    const caption = columnPreview.header;
    const canSort = columnsSortable && columnPreview.canSort;
    return (
        <SelectableColumn column={column}>
            <div
                className={cn("th", {
                    "hidden-column-preview":
                        !columnPreview.isAvailable || (columnsHidable && columnPreview.initiallyHidden)
                })}
                role="columnheader"
            >
                <div className="column-container">
                    <div className="column-header">
                        <span>{caption.length > 0 ? caption : "\u00a0"}</span>
                        {canSort && <FaArrowsAltV />}
                    </div>
                    <column.filter.renderer caption="Filter placeholder">
                        <div className="filter" style={columnsFilterable ? undefined : { display: "none" }} />
                    </column.filter.renderer>
                </div>
            </div>
        </SelectableColumn>
    );
}

function GridBody(): ReactElement {
    const data: ObjectItem[] = Array.from({ length: numberOfItems }).map((_, index) => ({
        id: String(index) as GUID
    }));

    return (
        <div className={cls.gridBody}>
            {data.map((item, index) => (
                <PreviewRow key={item.id} first={index === 0} />
            ))}
            <EmptyPlaceholder />
        </div>
    );
}

function PreviewRow({ first }: { first: boolean }): ReactElement {
    const { columnsHidable } = useProps();
    const checkboxColumnVisible = useCheckboxColumn();
    const columns = useColumns();

    return (
        <div className="tr tr-preview">
            <If condition={checkboxColumnVisible}>
                <div
                    className={cn("td widget-datagrid-col-select", {
                        "td-borders": first
                    })}
                    role="gridcell"
                >
                    <input type="checkbox" />
                </div>
            </If>
            {columns.map((column, index, _, colPreview = new ColumnPreview(column, index)) => (
                <SelectableColumn key={colPreview.columnId} column={column}>
                    <div
                        className={cn("td", {
                            "td-borders": first,
                            "hidden-column-preview":
                                !colPreview.isAvailable || (columnsHidable && colPreview.initiallyHidden)
                        })}
                    >
                        {colPreview.renderCellContent(null)}
                    </div>
                </SelectableColumn>
            ))}
            <If condition={columnsHidable}>
                <div
                    className={cn("td column-selector", {
                        "td-borders": first
                    })}
                />
            </If>
        </div>
    );
}

function SelectableColumn({ column, children }: PropsWithChildren<{ column: ColumnsPreviewType }>): ReactNode {
    const selectable = useColumnSelectable();

    if (!selectable) return children;

    return (
        <Selectable key={column.header || column.attribute} caption={column.header} object={column}>
            {children}
        </Selectable>
    );
}

function EmptyPlaceholder(): ReactElement {
    const { emptyPlaceholder } = useProps();
    const { columnsHidable, columns } = useProps();
    const checkboxColumnVisible = useCheckboxColumn();

    return (
        <emptyPlaceholder.renderer caption="Empty list message: Place widgets here">
            <div
                className="td"
                style={{
                    gridColumn: `span ${columns.length + (columnsHidable ? 1 : 0) + (checkboxColumnVisible ? 1 : 0)}`
                }}
            />
        </emptyPlaceholder.renderer>
    );
}

const SelectionCounter = (): ReactNode => {
    const props = useProps();
    return (
        <div className="widget-datagrid-selection-counter">
            <span className="widget-datagrid-selection-text" aria-live="polite" aria-atomic="true">
                {props.selectedCountTemplateSingular}
            </span>
            &nbsp;|&nbsp;
            <button className="widget-datagrid-btn-link">{props.clearSelectionButtonLabel}</button>
        </div>
    );
};

const Pagination = (): ReactNode => {
    const props = useProps();
    return (
        <PagingButtons
            canNextPage
            canPreviousPage
            gotoPage={() => {}}
            nextPage={() => {}}
            numberOfItems={props.pageSize ?? 20}
            page={0}
            pageSize={props.pageSize ?? 10}
            showPagingButtons={"always"}
            previousPage={() => {}}
            pagination={props.pagination}
        />
    );
};

function useColumns(): ColumnsPreviewType[] {
    const { columns } = useProps();
    return columns.length > 0 ? columns : initColumns;
}

function useColumnSelectable(): boolean {
    const { columns } = useProps();
    return columns.length > 0;
}

function useHeaderCheckbox(): boolean {
    const { itemSelection, itemSelectionMethod } = useProps();
    return itemSelection === "Multi" && itemSelectionMethod === "checkbox";
}

function useCheckboxColumn(): boolean {
    const { itemSelection, itemSelectionMethod } = useProps();
    return itemSelection !== "None" && itemSelectionMethod === "checkbox";
}

function useGridStyle(): CSSProperties {
    const props = useProps();
    const columns = props.columns.length > 0 ? props.columns : initColumns;
    const pcs = columns.map((col, idx) => new ColumnPreview(col, idx));
    const columnSizes = pcs.map(c => c.getCssWidth());

    const sizes: string[] = [];

    if (useCheckboxColumn()) {
        sizes.push("48px");
    }

    sizes.push(...columnSizes);

    if (props.columnsHidable) {
        sizes.push("54px");
    }

    return {
        "--widgets-grid-template-columns": sizes.join(" ")
    } as CSSProperties;
}

function useTopCounter(): boolean {
    const { itemSelection, selectionCounterPosition } = useProps();
    return itemSelection === "Multi" && selectionCounterPosition === "top";
}

function useBottomCounter(): boolean {
    const { itemSelection, selectionCounterPosition } = useProps();
    return itemSelection === "Multi" && selectionCounterPosition === "bottom";
}

function usePagingTop(): boolean {
    const props = useProps();
    const visible = props.showNumberOfRows || props.pagination === "buttons";
    return visible && props.pagingPosition !== "bottom";
}

function usePagingBot(): boolean {
    const props = useProps();
    const visible = props.showNumberOfRows || props.pagination === "buttons";
    return visible && props.pagingPosition !== "top";
}
